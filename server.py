import os, string, time, base64, hmac, urllib
from hashlib import sha1
from random import SystemRandom
import subprocess as sp

from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, login_required, SQLAlchemyUserDatastore
from flaskext.kvsession import KVSessionExtension
from werkzeug.utils import secure_filename

from simplekv.memory import DictStore
import httplib2
import httplib
from apiclient.discovery import build
from apiclient.http import MediaFileUpload
from apiclient.errors import HttpError
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError


from models import db, User, Role

rand = SystemRandom()
app = Flask(__name__)
app.config.from_pyfile("settings.py")
db.init_app(app)

store = DictStore()
KVSessionExtension(store, app)

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

# Explicitly tell the underlying HTTP transport library not to retry, since
# we are handling retry logic ourselves.
httplib2.RETRIES = 1

# Maximum number of times to retry before giving up.
MAX_RETRIES = 10

# Always retry when these exceptions are raised.
RETRIABLE_EXCEPTIONS = (httplib2.HttpLib2Error, IOError, httplib.NotConnected,
  httplib.IncompleteRead, httplib.ImproperConnectionState,
  httplib.CannotSendRequest, httplib.CannotSendHeader,
  httplib.ResponseNotReady, httplib.BadStatusLine)

# Always retry when an apiclient.errors.HttpError with one of these status
# codes is raised.
RETRIABLE_STATUS_CODES = [500, 502, 503, 504]

def resumable_upload(insert_request, title):
    app.logger.info("Started uploading processed file %s", title)
    response = None
    error = None
    retry = 0
    while response is None:
        try:
            status, response = insert_request.next_chunk()
            if "id" in response:
                return "%s (video id: %s) was successfully uploaded." % (title, response["id"])
            else:
                return "The upload failed with an unexpected response: %s" % (response,)
        except HttpError, e:
            if e.resp.status in RETRIABLE_STATUS_CODES:
                error = "A retriable HTTP error %d occurred:\n%s" % (e.resp.status, e.content)
            else:
                raise
        except RETRIABLE_EXCEPTIONS, e:
            error = "A retriable error occurred: %s" % e
    if error is not None:
        print error
        retry += 1
        if retry > MAX_RETRIES:
            return "MAX_RETRIES"
        max_sleep = 2 ** retry
        sleep_seconds = rand.random() * max_sleep
        print "Sleeping %f seconds and then retrying..." % sleep_seconds
        time.sleep(sleep_seconds)


app.config["UPLOAD_FOLDER"] = ""
# These are the extension that we are accepting to be uploaded
app.config["ALLOWED_EXTENSIONS"] = set(["wmv", "mov", "avi", "mpg", "mpeg", "flv"])

# For a given file, return whether it"s an allowed type or not
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1] in app.config["ALLOWED_EXTENSIONS"]


if os.environ.get("HEROKU") is not None:
  import logging
  stream_handler = logging.StreamHandler()
  app.logger.addHandler(stream_handler)
  app.logger.setLevel(logging.INFO)
  app.logger.info("starting app")

flow = OAuth2WebServerFlow(client_id=app.config["GOOGLE_CLIENT_ID"],
                           client_secret=app.config["GOOGLE_CLIENT_SECRET"],
                           scope=app.config["GOOGLE_API_SCOPE"])
user_info_service = build("oauth2", "v2")
youtube_service = build("youtube", "v3")
    
def get_auth_http():
    credentials = session["credentials"]
    return credentials.authorize(httplib2.Http())

# Views
@app.route("/")
def index():
    if "credentials" in session:
        result = youtube_service.channels().list(part="snippet", mine="true").execute(http=get_auth_http())
        return render_template("index.html", channels=result["items"][0])
    return redirect(url_for("google_login"))


@app.route("/login/google")
def google_login():
    # CSRF
    session["state"] = "".join(rand.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
    flow.redirect_uri=url_for("authorized", _external=True)
    auth_uri = flow.step1_get_authorize_url()
    return redirect(auth_uri + "&state=%s" % (session["state"],))


@app.route("/sign-s3/")
def sign_s3():
    AWS_ACCESS_KEY = app.config["AWS_ACCESS_KEY_ID"]
    AWS_SECRET_KEY = app.config["AWS_SECRET_ACCESS_KEY"]
    S3_BUCKET = app.config["S3_BUCKET"]

    object_name = request.args.get("s3_object_name")
    mime_type = request.args.get("s3_object_type")

    expires = int(time.time()+10)
    amz_headers = "x-amz-acl:public-read"

    put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, object_name)

    signature = base64.encodestring(hmac.new(AWS_SECRET_KEY, put_request, sha1).digest())
    signature = urllib.quote_plus(signature.strip())

    url = "https://%s.s3.amazonaws.com/%s" % (S3_BUCKET, object_name)

    return jsonify({
        "signed_request": "%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s" % (url, AWS_ACCESS_KEY, expires, signature),
         "url": url
      })


@app.route("/upload-video", methods=["POST"])
def upload():
    file = request.files["file"]
    # Check if the file is one of the allowed types/extensions
    if not file or not allowed_file(file.filename):
        return "wrong file format. Supportet formats %s" % app.config["ALLOWED_EXTENSIONS"]
    # Make the filename safe, remove unsupported chars
    filename = secure_filename(file.filename)
    # Move the file form the temporal folder to
    # the upload folder we setup
    app.logger.info("Uploaded %s", filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)
    base, ext = os.path.splitext(filename)
    output_path = os.path.join("%s_out%s" % (base, ext))
    code = sp.call(["ffmpeg", "-i", file_path, "-i", "http://s3-us-west-2.amazonaws.com/test.co/jingiel_bacterion_v2.mp3",
     "-map", "0:1", "-map", "1:0", "-codec", "copy", "-y", output_path])
    if code:
        return "error"
    insert_request = youtube_service.videos().insert(
        part="snippet,status",
        body=dict(
          snippet=dict(
            title=filename,
            description="Trailer. Music provided by soundly.io",
            tags=["soundly"],
            categoryId="20" # seems to be gaming
          ),
          status = dict(
            privacyStatus="unlisted"
          )
        ),
        media_body=MediaFileUpload(output_path, chunksize=-1, resumable=True)
    )
    insert_request.http = get_auth_http()
    res = resumable_upload(insert_request, filename)
    return "Video is publish as unlisted:  %s" % (res,)     


@app.route("/login/google/oauthcallback")
def authorized():
    # CSRF
    if request.args["state"] != session["state"]:
        abort(400)
    del session["state"]
    code = request.args.get("code")
    if not code:
        abort(403)
    try:
        credentials = flow.step2_exchange(code)
    except FlowExchangeError:
        abort(400)
    g_user_id = credentials.id_token["sub"]
    user = user_datastore.find_user(google_user_id=g_user_id)
    if not user:
        http = credentials.authorize(httplib2.Http())
        result = user_info_service.userinfo().get().execute(http=http)
        user = user_datastore.create_user(email=result["email"], active=True)
        user.google_user_id = g_user_id
        user.profile_url = result.get("link")
        user.image_url = result.get("picture")
        user.refresh_token = credentials.refresh_token
        db.session.commit()
    # refresh token is send only once, need to for auto token refreshing
    credentials.refresh_token = user.refresh_token
    session["credentials"] = credentials
    return redirect(url_for("index"))


if __name__ == "__main__":
    if os.environ.get("DEBUG") is not None:
        app.config["DEBUG"] = True
    app.run()

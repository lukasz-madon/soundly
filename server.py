import os, string, time, base64, hmac
from hashlib import sha1
from random import SystemRandom
from urllib import quote

from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, login_required, SQLAlchemyUserDatastore
from flaskext.kvsession import KVSessionExtension
from simplekv.memory import DictStore
import httplib2
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import FlowExchangeError
from rq import Queue

from worker import conn
from models import db, User, Role
from youtube_utils import process_video_request, youtube_service

rand = SystemRandom()
app = Flask(__name__)
app.config.from_pyfile("settings.py")
db.init_app(app)

store = DictStore()
KVSessionExtension(store, app)

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
# security = Security(app, user_datastore)

worker_queue = Queue(connection=conn)

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
    
def get_auth_http():
    credentials = session["credentials"]
    print credentials.__dict__
    return credentials.authorize(httplib2.Http())

# Views
@app.route("/")
def index():
    if "credentials" in session:
        result = youtube_service.channels().list(part="snippet", mine="true").execute(http=get_auth_http())
        return render_template("index.html", channels=result["items"][0])
    return redirect(url_for("home"))

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/faq")
def faq():
    return render_template("faq.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/home")
def home():
    return render_template("landing-beta-white.html")


@app.route("/login/google")
def google_login():
    # CSRF
    session["state"] = "".join(rand.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
    flow.redirect_uri=url_for("authorized", _external=True)
    auth_uri = flow.step1_get_authorize_url()
    return redirect(auth_uri + "&state=%s" % (session["state"],))


@app.route("/logout")
def logout():
    # TODO add proper auth handling. This is temp
    session.pop("credentials", None)
    return redirect(url_for("index"))


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


@app.route("/sign-s3/")
def sign_s3():
    AWS_ACCESS_KEY = app.config["AWS_ACCESS_KEY_ID"]
    AWS_SECRET_KEY = app.config["AWS_SECRET_ACCESS_KEY"]
    S3_BUCKET = app.config["S3_BUCKET"]

    object_name = request.args.get("s3_object_name").encode('ascii', 'ignore')  # remove spaces, + etc.  forward slash and unicode?
    mime_type = request.args.get("s3_object_type")

    expires = int(time.time()) + 60  # 60 sec for starting request should be enough 
    amz_headers = "x-amz-acl:public-read"  # TODO public -> private view of the files or just add 24h expiry 

    put_request = "PUT\n\n%s\n%d\n%s\n/%s/%s" % (mime_type, expires, amz_headers, S3_BUCKET, object_name)
    signature = base64.encodestring(hmac.new(AWS_SECRET_KEY, put_request, sha1).digest())
    signature = quote(signature.strip()).replace("/", "%2F")
    app.logger.info("signing for %s with signature %s", put_request, signature)
    url = "https://%s.s3.amazonaws.com/%s" % (S3_BUCKET, object_name)

    return jsonify({
        "signed_request": "%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s" % (url, AWS_ACCESS_KEY, expires, signature),
         "url": url
      })


@app.route("/process-video", methods=["POST"])
def process_video():
    json = request.json
    if not json:
        abort(400)
    #TODO: solve https problem for ffmpeg (ffmpeg -protocols). Tried --enable-openssl, --enable-gpl
    # possible solution is to create custom buildpack and compile with-openssl or diff ssl lib. 
    video_url = request.json["video_url"].replace("https", "http", 1)  # temp fix
    music_url = request.json["music_url"]
    app.logger.info("processing request: %s", request.json)
    worker_queue.enqueue(process_video_request, session["credentials"], video_url, music_url)
     # Check if the file is one of the allowed types/extensions
    # if not file or not allowed_file(file.filename):
    #     return jsonify({"error": "wrong file format. Supported formats %s" % app.config["ALLOWED_EXTENSIONS"]}), 400
    # TODO check bad chars, never trust user input

    return jsonify({ "message": "background job is on!" })    


if __name__ == "__main__":
    if os.environ.get("DEBUG") is not None:
        app.config["DEBUG"] = True
    app.run()

import os, string, time, base64, hmac
from hashlib import sha1
from random import SystemRandom
from urllib import quote

from flask import Flask, render_template, request, url_for, redirect, session, jsonify, g, flash, abort
from flask.ext.wtf import Form
from flask.ext.sqlalchemy import SQLAlchemy
from flaskext.kvsession import KVSessionExtension
from wtforms import TextField, TextAreaField, PasswordField, SubmitField
from simplekv.memory import DictStore
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import FlowExchangeError
from rq import Queue
import httplib2

from worker import conn
from models import db, User, Music, Video
from youtube_utils import process_video_request, youtube_service
from utils import detect_default_email, auth_required

rand = SystemRandom()
app = Flask(__name__)
app.config.from_pyfile("settings.py")
db.init_app(app)

store = DictStore()
KVSessionExtension(store, app)

worker_queue = Queue(connection=conn)

# # These are the extension that we are accepting to be uploaded
# app.config["ALLOWED_EXTENSIONS"] = set(["wmv", "mov", "avi", "mpg", "mpeg", "flv"])

# # For a given file, return whether it"s an allowed type or not
# def allowed_file(filename):
#     return "." in filename and filename.rsplit(".", 1)[1] in app.config["ALLOWED_EXTENSIONS"]


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

class EmailForm(Form):
    email = TextField("Email")
    submit = SubmitField("Submit")

### Views ###
@app.route("/")
@auth_required
def index():
    detect_default_email()
    # result = youtube_service.channels().list(part="snippet", mine="true").execute(http=get_auth_http())
    return render_template("index.html", music=Music.query.all())

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

@app.route("/landing-beta")
def landing():
    return render_template("landing-beta-white.html")

@app.route("/home")
def home():
    return render_template("landing-beta.html")

@app.route("/dashboard")
@auth_required
def dashboard():
    return render_template("dashboard.html", videos=g.user.videos)

@app.route("/profile", methods = ["POST", "GET"])
@auth_required
def profile():
    form = EmailForm()
    if form.validate_on_submit():
        g.user.email = form.email.data
        db.session.add(g.user)
        db.session.commit()
        flash("email was changed", "success")
    return render_template("profile.html", form=form)


@app.route("/login/google")
def google_login():
    # CSRF
    session["state"] = "".join(rand.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
    flow.redirect_uri=url_for("authorized", _external=True)
    auth_uri = flow.step1_get_authorize_url()
    return redirect(auth_uri + "&state=%s" % (session["state"],))


@app.route("/logout")
@auth_required
def logout():
    session.pop("credentials", None)
    return redirect(url_for("index"))


@app.route("/login/google/oauthcallback")
def authorized():
    # CSRF
    try:
        if request.args["state"] != session["state"]:
            abort(400)
    except KeyError:
        abort(401)
    session.pop("state", None)
    code = request.args.get("code")
    if not code:
        abort(403)
    try:
        credentials = flow.step2_exchange(code)
    except FlowExchangeError:
        abort(400)
    g_user_id = credentials.id_token["sub"]
    user = User.query.filter_by(google_user_id=g_user_id).first()
    if not user:
        http = credentials.authorize(httplib2.Http())
        result = user_info_service.userinfo().get().execute(http=http)
        user = User(email=result["email"], name=result.get("name"))
        user.google_user_id = g_user_id
        user.profile_url = result.get("link")
        user.image_url = result.get("picture")
        user.refresh_token = credentials.refresh_token
        db.session.add(user)
        db.session.commit()
    # refresh token is send only once, needed for auto token refreshing
    credentials.refresh_token = user.refresh_token
    session["credentials"] = credentials
    return redirect(url_for("index"))


@app.route("/sign-s3/")
@auth_required
def sign_s3():
    # TODO validate user input. Is object_name not too long?
    AWS_ACCESS_KEY = app.config["AWS_ACCESS_KEY_ID"]
    AWS_SECRET_KEY = app.config["AWS_SECRET_ACCESS_KEY"]
    S3_BUCKET = app.config["S3_BUCKET"]
    # object name on S3 are unicode but hmac don't like it. Possbile bug?
    object_name = quote(request.args.get("s3_object_name").encode('ascii', 'ignore'))
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
@auth_required
def process_video():
    json = request.json
    if not json:
        abort(400)
    # TODO: solve https problem for ffmpeg (ffmpeg -protocols). Tried --enable-openssl, --enable-gpl
    # possible solution is to create custom buildpack and compile with-openssl or diff ssl lib. 
    video_url = request.json["video_url"].replace("https", "http", 1)  # temp fix
    music_id = int(request.json["music_id"])
    music_url = request.json["music_url"]
    title = request.json["title"]
    description = request.json["description"]
    tags = ["soundly.io"]
    categoryId = 20
    privacyStatus = request.json["privacy_status"]
    override_audio = request.json["override_audio"]    
    app.logger.info("processing request: %s", request.json)
    worker_queue.enqueue(process_video_request, session["credentials"], video_url, music_url, music_id, g.user.id,
        title, description, tags, categoryId, privacyStatus, override_audio)
    # Check if the file is one of the allowed types/extensions
    # if not file or not allowed_file(file.filename):
    #     return jsonify({"error": "wrong file format. Supported formats %s" % app.config["ALLOWED_EXTENSIONS"]}), 400
    # TODO check bad chars, never trust user input
    return jsonify({ "message": "background job is on!" })    


if __name__ == "__main__":
    if os.environ.get("DEBUG") is not None:
        app.config["DEBUG"] = True
    app.run()

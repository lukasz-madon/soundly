import os
import string
import time
import base64
import hmac
from hashlib import sha1
from random import SystemRandom
from urllib import quote

from flask import (Flask, render_template, request, url_for, redirect,
                   session, jsonify, g, flash, abort)
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.admin import Admin
from flaskext.kvsession import KVSessionExtension

from simplekv.memory import DictStore
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import FlowExchangeError
from rq import Queue
import httplib2

from worker import conn
from models import db, User, Music, Video
from admin import AdminModelView
from youtube_utils import process_video_request, youtube_service, VideoMeta
from utils import detect_default_email, auth_required
from forms import EmailForm, flash_errors


rand = SystemRandom()
app = Flask(__name__)
app.config.from_pyfile("settings.py")
db.init_app(app)

store = DictStore()
KVSessionExtension(store, app)

worker_queue = Queue(connection=conn)

if os.environ.get("HEROKU") is not None:
    import logging
    stream_handler = logging.StreamHandler()
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info("starting app")

if os.environ.get("DEBUG", False):
    app.config["DEBUG"] = True

flow = OAuth2WebServerFlow(client_id=app.config["GOOGLE_CLIENT_ID"],
                           client_secret=app.config["GOOGLE_CLIENT_SECRET"],
                           scope=app.config["GOOGLE_API_SCOPE"])
user_info_service = build("oauth2", "v2")

admin = Admin(app)
admin.add_view(AdminModelView(User, db.session))
admin.add_view(AdminModelView(Music, db.session))
admin.add_view(AdminModelView(Video, db.session))


# Views
@app.route("/")
@auth_required
def index():
    detect_default_email()
    # TODO remove http call from index
    auth_http = session["credentials"].authorize(httplib2.Http())
    channel_result = youtube_service.channels().list(
        part="contentDetails",
        mine="true").execute(
        http=auth_http)
    if len(channel_result["items"]) > 1:
        app.logger.info(
            "More than 1 channel for %s user %s",
            user.id,
            channel_result)

    uploads_list_id = channel_result["items"][0][
        "contentDetails"]["relatedPlaylists"]["uploads"]
    playlistitems_list_request = youtube_service.playlistItems().list(
        playlistId=uploads_list_id,
        part="snippet,status",
        maxResults=10
    )
    playlistitems_list_response = playlistitems_list_request.execute(
        http=auth_http)
    playlist = (item for item in playlistitems_list_response[
                "items"] if item["status"]["privacyStatus"] != "private")

    videos = []
    for video in playlist:
        title = video["snippet"]["title"].replace("\n", " ")
        description = video["snippet"]["description"].replace("\n", " ")
        if "http://soundly.io" not in description:
            description += " Music provided by http://soundly.io"
        youtube_id = video["snippet"]["resourceId"]["videoId"]
        privacy_status = video["status"]["privacyStatus"]
        videos.append(
            VideoMeta(
                youtube_id,
                title,
                description,
                privacy_status))
    if not videos:
        # add video of tutorial?
        flash(
            "You have no Youtube videos. Upload as unlisted video using "
            "<a class='white' href='https://www.youtube.com/'>youtube.com</a>.",
            "warning")
    return render_template(
        "index.html",
        ALGOLIASEARCH_APPLICATION_ID=app.config["ALGOLIASEARCH_APPLICATION_ID"],
        ALGOLIASEARCH_API_KEY_SEARCH=app.config["ALGOLIASEARCH_API_KEY_SEARCH"],
        videos=videos)


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
def landing_beta():
    return render_template("landing-beta-white.html")


@app.route("/landing-page")
def landing():
    return render_template("landing.html")


@app.route("/home")
def home():
    return render_template("landing-beta.html")


@app.route("/dashboard")
@auth_required
def dashboard():
    return render_template("dashboard.html", videos=g.user.videos)


@app.route("/profile", methods=["POST", "GET"])
@auth_required
def profile():
    form = EmailForm()
    if form.validate_on_submit():
        g.user.email = form.email.data
        db.session.add(g.user)
        db.session.commit()
        flash("Email was changed", "success")
        return redirect(url_for("index"))
    else:
        flash_errors(form)
    form.email.data = g.user.email
    return render_template("profile.html", form=form)


@app.route("/login/google")
def google_login():
    # CSRF
    session["state"] = "".join(
        rand.choice(
            string.ascii_uppercase +
            string.digits) for x in xrange(32))
    flow.redirect_uri = url_for("authorized", _external=True)
    auth_uri = flow.step1_get_authorize_url()
    return redirect(auth_uri + "&state=%s" % (session["state"],))


@app.route("/logout")
@auth_required
def logout():
    session.pop("credentials", None)
    return redirect(url_for("index"))


@app.route("/login/google/oauthcallback")
def authorized():
    # There is a possible race condition when user click two times too
    # fast or two different
    # TODO check if already authorized
    try:
        if request.args["state"] != session["state"]:
            app.logger.error(
                "possible CSRF. Request token is different than session token")
            abort(400)
    except KeyError:
        # TODO incorrect error handling? Sometime code/state is wrong
        app.logger.error("no CSRF token")
        app.logger.error(request)
        app.logger.error(session.get("credentials"))
        abort(401)
    finally:
        session.pop("state", None)
    code = request.args.get("code")
    if not code:
        app.logger.error("Google API did not return code")
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
    app.logger.info("User %s is authenticated", user.id)
    return redirect(url_for("index"))


@app.route("/process-video", methods=["POST"])
@auth_required
def process_video():
    json = request.json
    if not json:
        abort(400)
    # TODO: VALIDATION!!!
    video_id = request.json["video_id"]
    music_id = int(request.json["music_id"])
    music_url = request.json["music_url"]
    title = request.json["title"]
    description = request.json["description"]
    tags = ["soundly.io"]
    categoryId = 20  # gaming? not sure if this still works
    privacyStatus = request.json["privacy_status"]
    # this will change when % volume will be implemented
    audio_volume = float(request.json["audio_volume"])
    music_volume = float(request.json["music_volume"])

    app.logger.info("User %s processing request: %s", g.user.id, request.json)
    worker_queue.enqueue(
        process_video_request,
        session["credentials"],
        video_id,
        music_url,
        music_id,
        g.user.id,
        title,
        description,
        tags,
        categoryId,
        privacyStatus,
        audio_volume,
        music_volume)
    # Check if the file is one of the allowed types/extensions
    # if not file or not allowed_file(file.filename):
    #     return jsonify({"error": "wrong file format.
    # Supported formats %s" % app.config["ALLOWED_EXTENSIONS"]}), 400
    # TODO check bad chars, never trust user input
    return jsonify({"message": "background job is on!"})


if __name__ == "__main__":
    app.run()

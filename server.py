import os

from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, login_required, SQLAlchemyUserDatastore
from flask_oauthlib.client import OAuth
from flaskext.kvsession import KVSessionExtension
from simplekv.memory import DictStore


from models import db, User, Role


app = Flask(__name__)
app.config.from_pyfile("settings.py")
db.init_app(app)
# See the simplekv documentation for details
store = DictStore()
# This will replace the app's session handling
KVSessionExtension(store, app)

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

oauth = OAuth(app)

if os.environ.get("HEROKU") is not None:
  import logging
  stream_handler = logging.StreamHandler()
  app.logger.addHandler(stream_handler)
  app.logger.setLevel(logging.INFO)
  app.logger.info("starting app")

google = oauth.remote_app(
	"google",
	consumer_key=app.config["GOOGLE_CLIENT_ID"],
	consumer_secret=app.config["GOOGLE_CLIENT_SECRET"],
	request_token_params={
		"scope": app.config["GOOGLE_API_SCOPE"]
	},
	base_url="https://www.googleapis.com/oauth2/v1/",
	request_token_url=None,
	access_token_method="POST",
	access_token_url="https://accounts.google.com/o/oauth2/token",
	authorize_url="https://accounts.google.com/o/oauth2/auth",
)
 #@login_required
# Views
@app.route("/")
def index():
	if "google_token" in session:
		channels_data = google.get("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true").data
		print channels_data
		channels = [c["id"] for c in channels_data["items"]]
		return render_template("index.html", channels=channels)
	return redirect(url_for("google_login"))


@app.route("/login/google")
def google_login():
	return google.authorize(callback=url_for("authorized", _external=True))


@app.route("/login/google/oauthcallback")
@google.authorized_handler
def authorized(resp):
	if resp is None:
		return "Access denied: reason=%s error=%s" % (
			request.args["error_reason"],
			request.args["error_description"]
		)
	print resp
	session["google_token"] = (resp["access_token"], "")
	data = google.get("userinfo").data
	email = data["email"]
	user = user_datastore.find_user(email=email)
	if not user:
		user = user_datastore.create_user(email=email, active=True)
		user.google_user_id = data["id"]
		user.profile_url = data.get("profile_url", "")
		user.image_url = data.get("image_url", "")
		db.session.commit()
	return redirect(url_for("index"))

@google.tokengetter
def get_google_oauth_token():
	return session.get("google_token")


if __name__ == "__main__":
	if os.environ.get("DEBUG") is not None:
		app.config["DEBUG"] = True
	app.run()

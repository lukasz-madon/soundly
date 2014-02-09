import os
import string
from random import SystemRandom

from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, login_required, SQLAlchemyUserDatastore
from flaskext.kvsession import KVSessionExtension

from simplekv.memory import DictStore
import httplib2
from apiclient.discovery import build
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
						   
# TODO: we need freaking madafacking refresh token cuz this last only an hour
# Views
@app.route("/")
def index():
	if "credentials" in session:
		credentials = session["credentials"]
		http = credentials.authorize(httplib2.Http())
		result = youtube_service.channels().list(part="snippet", mine="true").execute(http=http)
		return render_template("index.html", channels=result["items"][0])
	return redirect(url_for("google_login"))


@app.route("/login/google")
def google_login():
	# CSRF
	session["state"] = "".join(rand.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
	flow.redirect_uri=url_for("authorized", _external=True)
	auth_uri = flow.step1_get_authorize_url()
	return redirect(auth_uri + "&state=%s" % (session["state"],))


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
	g_user_id = credentials.id_token['sub']
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

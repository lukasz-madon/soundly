import os

SECRET_KEY = os.environ["FLASK_SECRET_KEY"]
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://dbuser:P@ssw0rd@localhost/localdb"
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
CSRF_ENABLED = True
GOOGLE_API_SCOPE = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube"


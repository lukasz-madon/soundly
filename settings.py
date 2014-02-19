import os

SECRET_KEY = os.environ["FLASK_SECRET_KEY"]
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql+psycopg2://dbuser:P@ssw0rd@localhost/localdb")  
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
CSRF_ENABLED = True
GOOGLE_API_SCOPE = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload"
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", os.getenv("MY_AWS_ACCESS_KEY_ID"))
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", os.getenv("MY_AWS_SECRET_ACCESS_KEY"))
S3_BUCKET = os.environ["S3_BUCKET"]

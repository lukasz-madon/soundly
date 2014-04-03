import datetime

from flask.ext.sqlalchemy import SQLAlchemy

ROLE_USER = 0
ROLE_ADMIN = 1
db = SQLAlchemy()


class ModelMixin(object):
  def __repr__(self):
    return unicode(self.__dict__)


class User(db.Model, ModelMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    google_user_id = db.Column(db.String(64), unique=True, index=True)
    name = db.Column(db.Unicode(64))
    email = db.Column(db.String(128))
    active = db.Column(db.Boolean(), default=True)
    role = db.Column(db.SmallInteger, default = ROLE_USER)
    profile_url = db.Column(db.String(256))
    image_url = db.Column(db.String(256))
    created_on = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    refresh_token = db.Column(db.String(64))


class Music(db.Model, ModelMixin):
    __tablename__ = "music"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode(128))
    artist = db.Column(db.Unicode(128))
    url = db.Column(db.String(256))

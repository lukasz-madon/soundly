import datetime

from flask.ext.sqlalchemy import SQLAlchemy

ROLE_USER = 0
ROLE_MUSIC_OWNER = 1
ROLE_ADMIN = 2
db = SQLAlchemy()


class ModelMixin(object):
    def __repr__(self):
        return unicode(self.to_dict)

    @property
    def to_dict(self):
        return dict((col, getattr(self, col)) for col in self.__table__.columns.keys())


class User(db.Model, ModelMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    google_user_id = db.Column(db.String(64), unique=True, index=True)
    name = db.Column(db.Unicode(64))
    email = db.Column(db.String(64))
    active = db.Column(db.Boolean(), default=True)
    role = db.Column(db.SmallInteger, default=ROLE_USER)
    profile_url = db.Column(db.String(128))
    image_url = db.Column(db.String(128))
    created_on = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    refresh_token = db.Column(db.String(64))
    videos = db.relationship("Video", backref="user", lazy="dynamic")

    @property
    def is_admin(self):
        return self.role == ROLE_ADMIN

    @property
    def is_music_owner(self):
        return self.role == ROLE_MUSIC_OWNER


class Music(db.Model, ModelMixin):
    __tablename__ = "music"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode(64))
    url = db.Column(db.String(128))
    video_id = db.Column(db.Integer, db.ForeignKey("videos.id"))
    artist_id = db.Column(db.Integer, db.ForeignKey("artists.id"))
    category = db.Column(db.Unicode(64))
    tag = db.Column(db.Unicode(20))


class Artist(db.Model, ModelMixin):
    __tablename__ = "artists"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(64))
    music = db.relationship("Music", backref="artist")


class Video(db.Model, ModelMixin):
    __tablename__ = "videos"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode(128))
    url = db.Column(db.String(64))
    views = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    music = db.relationship("Music", backref="video")

import datetime

from flask.ext.sqlalchemy import SQLAlchemy
# from flask.ext.security import UserMixin, RoleMixin


db = SQLAlchemy()

roles_users = db.Table("roles_users",
        db.Column("user_id", db.Integer(), db.ForeignKey("users.id")),
        db.Column("role_id", db.Integer(), db.ForeignKey("roles.id")))

class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    google_user_id = db.Column(db.String(255), unique=True, index=True)
    email = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship("Role", secondary=roles_users, backref=db.backref("users", lazy="dynamic"))
    profile_url = db.Column(db.String(512))
    image_url = db.Column(db.String(512))
    created_on = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    refresh_token = db.Column(db.String(64))

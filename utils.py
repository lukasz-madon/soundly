## common utils
from functools import wraps

from flask import url_for, redirect, session, g, flash

from models import User


def auth_required(f):
  @wraps(f)
  def wrapper(*args, **kwargs):
    user = get_auth_user()
    if user:
        g.user = user
    else:
        return redirect(url_for("home"))
    return f(*args, **kwargs)
  return wrapper


def get_auth_user():
    try:
        if "credentials" in session:
            g_user_id = session["credentials"].id_token["sub"]
            return User.query.filter_by(google_user_id=g_user_id).first()
    except:
        return None
    
# def get_auth_http():
#     credentials = session["credentials"]
#     return credentials.authorize(httplib2.Http())


def detect_default_email():
    """flashes user about default email that is caused be youtube and G+ mess.
    youtube id has been merged with google id and youtube users that are not linked to gmail
    have @pages.plusgoogle.com email.
    requires auth_requred()
    """
    if "@pages.plusgoogle.com" in g.user.email:
        flash("""Your email %s. is default.
         Click your name in the navigation bar to change it.""" %(g.user.email,), "warning") 


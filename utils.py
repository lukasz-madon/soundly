## common utils
from functools import wraps

from flask import url_for, redirect, session, g, flash

from models import User


def auth_required(f):
  @wraps(f)
  def wrapper(*args, **kwargs):
    if "credentials" in session:
        g_user_id = session["credentials"].id_token["sub"]
        user = User.query.filter_by(google_user_id=g_user_id).first()
        if user:
            g.user = user
        else:
            return redirect(url_for("home"))
    else:
        return redirect(url_for("home"))
    return f(*args, **kwargs)
  return wrapper

    
# def get_auth_http():
#     credentials = session["credentials"]
#     return credentials.authorize(httplib2.Http())


def detect_default_email():
    """flashes user abour default email that is caused be youtube and G+ mess.
    youtube id has been merged with google and youtube users that are not linked to gmail
    have @pages.plusgoogle.com email.
    requires auth_requred()
    """
    if "@pages.plusgoogle.com" in g.user.email:
        flash("""Your email address is %s. This maybe a default email.
         Click your name in the upper right corner to change it.""" %(g.user.email,), "warning") 
from flask import flash

from flask.ext.wtf import Form
from wtforms import TextField, SubmitField
from wtforms.validators import Email, Required


def flash_errors(form):
    """Flashes form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text,
                error
            ), "danger")


class EmailForm(Form):
    email = TextField("Email", validators=[Required(), Email()])
    submit = SubmitField("Submit")

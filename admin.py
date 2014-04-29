from flask import g
from flask.ext.admin import expose
from flask.ext.admin.contrib.sqla import ModelView

from utils import get_auth_user


class AdminModelView(ModelView):
    def is_accessible(self):
        self.user = get_auth_user()
        return self.user is not None
        

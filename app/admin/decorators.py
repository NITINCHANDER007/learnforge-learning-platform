"""
admin/decorators.py

A small decorator restricting a route to logged-in admins. Built on top
of Flask-Login's current_user rather than a separate permissions
library — with exactly two roles (student/admin), a one-line check is
simpler and clearer than adding a dependency for it.
"""

from functools import wraps

from flask import abort
from flask_login import current_user, login_required


def admin_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapped(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return view_func(*args, **kwargs)
    return wrapped

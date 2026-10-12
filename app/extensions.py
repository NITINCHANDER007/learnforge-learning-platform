"""
extensions.py

Flask extension instances live here, not inside app/__init__.py. Models
need to import `db` to define tables; blueprints need to import
`login_manager` to protect routes. If those instances were created
inside create_app(), importing them from models/blueprints would create
a circular import (app/__init__.py imports the blueprint, the blueprint
imports back from app/__init__.py). Creating them here, then calling
.init_app(app) inside the factory, avoids that entirely — a standard
Flask pattern once an app grows past a single file.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_wtf import CSRFProtect

db = SQLAlchemy()
migrate = Migrate()
csrf = CSRFProtect()

login_manager = LoginManager()
# Where Flask-Login redirects an unauthenticated user who hits a
# @login_required route. This blueprint/route is created in Milestone 2 —
# referencing it now is safe, since Flask-Login only resolves this string
# to an endpoint at request time, not at import time.
login_manager.login_view = "auth.login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "info"

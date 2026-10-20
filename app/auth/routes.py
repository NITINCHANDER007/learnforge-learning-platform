"""
auth/routes.py

Registration, login, and logout. Every new account defaults to the
"student" role (set on the User model) — an account only becomes an
admin via a deliberate action in the admin dashboard (Milestone 4),
never through self-registration.
"""

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.auth.forms import ForgotPasswordForm, LoginForm, RegistrationForm, ResetPasswordForm
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


def _get_serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="password-reset-salt")


def generate_reset_token(user_id):
    return _get_serializer().dumps(user_id)


def verify_reset_token(token, max_age=3600):
    try:
        user_id = _get_serializer().loads(token, max_age=max_age)
        return user_id
    except (BadSignature, SignatureExpired):
        return None


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(name=form.name.data.strip(), email=form.email.data.lower().strip())
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        flash("Welcome to LearnForge!", "success")
        return redirect(url_for("main.home"))

    return render_template("auth/register.html", form=form)


import time
from collections import defaultdict

_FAILED_LOGINS = defaultdict(list)
LOCKOUT_ATTEMPTS = 5
LOCKOUT_WINDOW_SECONDS = 900  # 15 minutes


def _is_locked_out(key):
    now = time.time()
    attempts = [t for t in _FAILED_LOGINS[key] if now - t < LOCKOUT_WINDOW_SECONDS]
    _FAILED_LOGINS[key] = attempts
    return len(attempts) >= LOCKOUT_ATTEMPTS


def _record_failed_login(key):
    _FAILED_LOGINS[key].append(time.time())


def _clear_failed_logins(key):
    if key in _FAILED_LOGINS:
        del _FAILED_LOGINS[key]


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data.lower().strip()
        client_key = f"{request.remote_addr}:{email}"

        if _is_locked_out(client_key):
            flash("Too many failed login attempts. Please wait 15 minutes before trying again.", "error")
            return render_template("auth/login.html", form=form), 429

        user = User.query.filter_by(email=email).first()

        if user and not user.is_active:
            flash("Your account has been deactivated. Please contact support.", "error")
            return render_template("auth/login.html", form=form)

        if user and user.check_password(form.password.data):
            _clear_failed_logins(client_key)
            login_user(user)
            # "next" preserves where an unauthenticated user was trying to
            # go before Flask-Login redirected them here (see login_view
            # in extensions.py) — send them on there after logging in.
            next_page = request.args.get("next")
            return redirect(next_page or url_for("main.home"))

        _record_failed_login(client_key)
        flash("Invalid email or password.", "error")

    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("main.home"))


@auth_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    form = ForgotPasswordForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.lower().strip()).first()
        if user and user.is_active:
            token = generate_reset_token(user.id)
            reset_url = url_for("auth.reset_password", token=token, _external=True)
            current_app.logger.info(f"Password reset link for {user.email}: {reset_url}")
            flash("If an account exists with that email, a password reset link has been generated. Check console or email.", "info")
        else:
            flash("If an account exists with that email, a password reset link has been generated.", "info")
        return redirect(url_for("auth.login"))

    return render_template("auth/forgot_password.html", form=form)


@auth_bp.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    user_id = verify_reset_token(token)
    if not user_id:
        flash("The password reset link is invalid or has expired.", "error")
        return redirect(url_for("auth.forgot_password"))

    user = User.query.get(user_id)
    if not user or not user.is_active:
        flash("User not found or account deactivated.", "error")
        return redirect(url_for("auth.login"))

    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash("Your password has been reset. You can now log in.", "success")
        return redirect(url_for("auth.login"))

    return render_template("auth/reset_password.html", form=form)


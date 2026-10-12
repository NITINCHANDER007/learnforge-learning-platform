"""
cli.py

Custom Flask CLI commands, registered in the app factory. The one that
matters most: create-admin (aliased as seed-admin). Self-registration
(auth/routes.py) always creates a "student" account by design — an
account only becomes an admin through a deliberate action. For the
very first admin (before any admin dashboard exists to promote
someone), that action is this command.

Usage (after `flask db upgrade` has created the tables):
    flask create-admin
    flask seed-admin      (identical command, alias)
"""

import click
from flask.cli import with_appcontext

from app.extensions import db
from app.models.user import User


def _create_or_promote_admin(name, email, password):
    """
    Shared logic for create-admin / seed-admin.

    Calls db.create_all() first as a safety net — if migrations were
    never run (e.g. a fresh clone where `flask db upgrade` was skipped
    or failed), this still creates every table from the current models
    so the command works regardless. It's a no-op against tables that
    already exist, so this is always safe to call.
    """
    db.create_all()

    email = email.lower().strip()
    existing = User.query.filter_by(email=email).first()

    if existing:
        existing.role = "admin"
        db.session.commit()
        click.echo(f"Existing user {email} promoted to admin.")
        return

    user = User(name=name.strip(), email=email, role="admin")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    click.echo(f"Admin account created for {email}.")


@click.command("create-admin")
@click.option("--name", prompt="Admin Name")
@click.option("--email", prompt="Admin Email")
@click.option("--password", prompt="Admin Password", hide_input=True, confirmation_prompt=True)
@with_appcontext
def create_admin(name, email, password):
    """Create an admin user, or promote an existing account to admin."""
    _create_or_promote_admin(name, email, password)


@click.command("seed-admin")
@click.option("--name", prompt="Admin Name")
@click.option("--email", prompt="Admin Email")
@click.option("--password", prompt="Admin Password", hide_input=True, confirmation_prompt=True)
@with_appcontext
def seed_admin(name, email, password):
    """Alias for create-admin — identical behavior, different name."""
    _create_or_promote_admin(name, email, password)


def register_cli(app):
    app.cli.add_command(create_admin)
    app.cli.add_command(seed_admin)

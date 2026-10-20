from flask import Flask

from app.config import Config
from app.extensions import csrf, db, login_manager, migrate


def create_app():
    """
    Application factory.

    Why a factory instead of just `app = Flask(__name__)` at the top of a file?
    - It lets us create multiple instances of the app with different configs
      (e.g. one for tests, one for production) without them interfering.
    - It avoids circular imports: routes can safely import from this package
      because the app object doesn't exist yet at import time, only when
      create_app() is actually called.
    This is the standard pattern for any Flask app expected to grow past a
    single file.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Each extension is created once in extensions.py, then bound to this
    # specific app instance here — the same pattern that lets the factory
    # support multiple independent app instances (e.g. for tests).
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)

    # Importing models here (rather than at module load time) ensures
    # every model's table is registered with SQLAlchemy before anything
    # tries to query the database or generate a migration.
    from app import models  # noqa: F401

    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"db.create_all() warning: {e}")

    # Blueprints are Flask's way of grouping related routes together.
    # Registering here (not at import time) is what avoids circular imports.
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    from app.dashboard.routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    from app.admin.routes import admin_bp
    app.register_blueprint(admin_bp)

    from app.uploads.routes import uploads_bp
    app.register_blueprint(uploads_bp)

    from app.cli import register_cli
    register_cli(app)

    # Context processors and security hardening
    from flask import render_template
    from app.services.content_loader import list_subjects

    SUBJECT_ICONS = {
        "python": "🐍", "sql": "🗄️", "html": "🌐", "css": "🎨",
        "javascript": "⚡", "flask": "🌶️", "pandas": "🐼", "numpy": "🔢",
        "machine-learning": "🤖", "data-visualization": "📊", "power-bi": "📈",
        "excel": "📑", "web-scraping": "🕷️", "file-handling": "📁",
    }

    @app.context_processor
    def inject_globals():
        return {
            "subjects": list_subjects(),
            "subject_icons": SUBJECT_ICONS,
        }

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    @app.errorhandler(403)
    def forbidden(e):
        return render_template("errors/403.html"), 403

    @app.errorhandler(404)
    def not_found(e):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def server_error(e):
        return render_template("errors/500.html"), 500

    return app

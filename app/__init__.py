from flask import Flask

from app.config import Config


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

    # Blueprints are Flask's way of grouping related routes together.
    # Registering here (not at import time) is what avoids circular imports.
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    return app

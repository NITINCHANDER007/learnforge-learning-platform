"""
run.py - Local development runner for DataDrix
"""
import os
import sys

from app import create_app
from app.extensions import db

app = create_app()

if __name__ == "__main__":
    # Ensure tables exist even if migration was skipped
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database check warning: {e}")

    # Configurable host, port, and debug state
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() in ("true", "1", "yes")
    if app.config.get("IS_PRODUCTION"):
        debug = False

    banner = f"""
=============================================================
   [DataDrix] Development Server Active
   URL:         http://{host}:{port}
   Debug Mode:  {'ON (auto-reload active)' if debug else 'OFF'}
   Subjects:    14 | Lessons: 166 (Markdown-powered)
   Admin Login: admin@datadrix.com / adminpassword123
=============================================================
"""
    print(banner)

    app.run(host=host, port=port, debug=debug)

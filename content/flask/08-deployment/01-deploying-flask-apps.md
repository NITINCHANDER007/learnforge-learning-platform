---
title: Deploying Flask Apps
---


Flask's built-in development server (`app.run()`) is explicitly not meant for production — it's single-threaded and shows detailed error pages, which is a security risk publicly.

## Production setup

1. Install a real WSGI server: `pip install gunicorn`
2. Run with: `gunicorn app:app`
3. Set `debug=False` (or don't pass `debug=True` at all) in production
4. Use environment variables for secrets — never hardcode a `secret_key` or database password in your code

```bash
gunicorn --bind 0.0.0.0:8000 app:app
```

> **Note:** Most cloud platforms (Render, Heroku, Railway) expect this exact pattern — a `gunicorn` start command pointing at your Flask app object.


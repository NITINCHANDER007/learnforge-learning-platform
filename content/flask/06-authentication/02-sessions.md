---
title: Sessions
---


A session lets the server "remember" a logged-in user across multiple requests, using a secure cookie.

```python
from flask import session

app.secret_key = "a-secret-key"   # required for sessions to work

@app.route("/login", methods=["POST"])
def login():
    session["username"] = request.form["username"]
    return "Logged in!"

@app.route("/dashboard")
def dashboard():
    if "username" not in session:
        return "Please log in.", 401
    return f"Welcome back, {session['username']}!"
```

> **Note:** `app.secret_key` is what Flask uses to cryptographically sign session cookies — keep it secret and never commit a real one to a public repository.


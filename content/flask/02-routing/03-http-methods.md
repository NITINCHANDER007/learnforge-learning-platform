---
title: HTTP Methods
---


Routes can respond to different HTTP methods — most commonly `GET` (retrieving data) and `POST` (submitting data).

```python
from flask import request

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        return f"Welcome, {username}!"
    return "Please log in."
```

By default, a route only accepts `GET` unless you list other methods explicitly.

**Common mistake:** forgetting `methods=["POST"]` on a route meant to handle form submissions, resulting in a "405 Method Not Allowed" error.


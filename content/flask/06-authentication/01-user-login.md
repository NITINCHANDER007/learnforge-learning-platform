---
title: User Login
---


A basic login flow checks submitted credentials against stored (hashed) data.

```python
from werkzeug.security import check_password_hash

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        return "Logged in!"
    return "Invalid credentials.", 401
```

> **⚠️ Critical note:** Never store plain-text passwords. Always hash them (`generate_password_hash` on signup, `check_password_hash` on login) — storing plain passwords is one of the most serious security mistakes an application can make.


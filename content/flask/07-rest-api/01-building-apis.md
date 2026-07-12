---
title: Building APIs
---


A REST API returns data (usually JSON) instead of full HTML pages, so other programs can consume it.

```python
from flask import jsonify

@app.route("/api/users")
def get_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username} for u in users])
```

Combined with different HTTP methods, this is the foundation of a full API:

```python
@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()
    new_user = User(username=data["username"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"id": new_user.id}), 201
```


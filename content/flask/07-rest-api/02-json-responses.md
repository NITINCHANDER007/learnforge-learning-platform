---
title: JSON Responses
---


`jsonify()` converts Python data (dicts, lists) into a proper JSON HTTP response, with the correct `Content-Type` header set automatically.

```python
@app.route("/api/status")
def status():
    return jsonify({"status": "ok", "version": "1.0"})
```

Setting a specific HTTP status code alongside JSON:

```python
@app.route("/api/users/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username})
```

**Common mistake:** returning a plain Python dictionary directly without `jsonify()` in older Flask versions — always use `jsonify()` for reliable, correct JSON responses.


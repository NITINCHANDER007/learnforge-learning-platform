---
title: Handling Forms
---


```html
<form method="POST" action="/submit">
    <input type="text" name="username">
    <button type="submit">Send</button>
</form>
```

```python
@app.route("/submit", methods=["POST"])
def submit():
    username = request.form["username"]
    return f"Received: {username}"
```

`request.form` is a dictionary-like object containing every submitted field, keyed by the input's `name` attribute.

> **Note:** `request.form["username"]` raises an error if the field is missing — use `request.form.get("username")` for a safer lookup that returns `None` instead.


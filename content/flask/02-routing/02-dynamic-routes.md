---
title: Dynamic Routes
---


Dynamic routes capture part of the URL as a variable, passed straight into your view function.

```python
@app.route("/user/<username>")
def show_user(username):
    return f"Profile page for {username}"

@app.route("/post/<int:post_id>")
def show_post(post_id):
    return f"Post number {post_id}"
```

`<username>` captures any text; `<int:post_id>` captures only integers and converts it to a Python `int` automatically.

> **Note:** Visiting `/post/abc` when the route expects `<int:post_id>` returns a 404 — Flask won't match the route at all if the type doesn't fit.


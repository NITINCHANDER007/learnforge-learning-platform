---
title: Form Validation
---


Never trust data submitted by a user — always validate it server-side, even if you also validate in the browser.

```python
@app.route("/submit", methods=["POST"])
def submit():
    username = request.form.get("username", "").strip()
    if not username:
        return "Username is required.", 400
    if len(username) < 3:
        return "Username too short.", 400
    return f"Welcome, {username}!"
```

For anything beyond simple checks, the **Flask-WTF** extension provides structured form validation with reusable rules.

**Common mistake:** relying only on HTML's `required` attribute — it's easy to bypass (e.g. by disabling JavaScript or calling the endpoint directly), so server-side validation is essential.


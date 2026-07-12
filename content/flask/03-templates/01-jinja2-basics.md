---
title: Jinja2 Basics
---


Jinja2 is Flask's templating language — it lets you insert Python-like logic directly into HTML files.

```python
@app.route("/hello/<name>")
def hello(name):
    return render_template("hello.html", name=name)
```

```html
<!-- templates/hello.html -->
<h1>Hello, {{ name }}!</h1>
{% if name == "admin" %}
    <p>Welcome back, admin.</p>
{% endif %}
```

`{{ }}` outputs a value; `{% %}` runs logic (if statements, loops) without printing anything itself.

> **Note:** Template files must live in a folder literally named `templates/` — Flask looks there automatically.


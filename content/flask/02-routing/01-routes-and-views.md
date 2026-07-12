---
title: Routes and Views
---


A route connects a URL path to a Python function (called a **view function**), which returns what the browser should display.

```python
@app.route("/about")
def about():
    return "This is the about page."

@app.route("/contact")
def contact():
    return "Contact us at hello@example.com"
```

Each `@app.route(...)` maps one URL to one function. Flask checks incoming requests against every registered route to find a match.

**Common mistake:** defining two routes with the identical path — Flask will raise an error at startup rather than silently picking one.


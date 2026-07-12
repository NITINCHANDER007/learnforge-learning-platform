---
title: What is Flask?
---


Flask is a lightweight Python web framework — it handles the "plumbing" of a web app (routing URLs, handling requests) while staying small and easy to understand.

Unlike bigger frameworks (like Django), Flask gives you the basics and lets you add only what you need — a database, authentication, etc. — as separate pieces.

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Flask!"
```

> **Note:** Flask is called a "micro-framework" — not because it's less powerful, but because it doesn't force a particular project structure or set of tools on you.

**Common mistake:** expecting Flask to include a database or login system out of the box — those are added via extensions (e.g. Flask-SQLAlchemy) as needed, not built in.


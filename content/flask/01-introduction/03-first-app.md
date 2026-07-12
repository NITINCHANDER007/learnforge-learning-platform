---
title: Your First Flask App
---


```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Welcome to my first Flask app!"

if __name__ == "__main__":
    app.run(debug=True)
```

Run it with `python app.py`, then visit `http://127.0.0.1:5000` in your browser.

- `@app.route("/")` connects a URL to a function — this pairing is called a **route**
- `debug=True` auto-reloads the server on code changes and shows detailed error pages — turn this **off** in production

> **Note:** The function name (`home`) doesn't have to match the URL — Flask only cares about the string inside `@app.route(...)`.


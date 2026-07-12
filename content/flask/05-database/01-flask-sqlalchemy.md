---
title: Flask-SQLAlchemy
---


Flask-SQLAlchemy lets you work with a database using Python classes instead of raw SQL.

```python
from flask_sqlalchemy import SQLAlchemy

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)

with app.app_context():
    db.create_all()
```

Each class (`User`) maps to a database table; each attribute (`id`, `username`) maps to a column.

> **Note:** `db.create_all()` only creates tables that don't already exist — it won't update an existing table's structure if you change the model later (that needs a migration tool like Flask-Migrate).


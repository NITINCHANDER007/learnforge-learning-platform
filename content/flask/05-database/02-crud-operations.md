---
title: CRUD Operations
---


CRUD = Create, Read, Update, Delete — the four basic database operations, using the `User` model from the previous lesson.

```python
# Create
new_user = User(username="ada")
db.session.add(new_user)
db.session.commit()

# Read
user = User.query.filter_by(username="ada").first()

# Update
user.username = "ada_lovelace"
db.session.commit()

# Delete
db.session.delete(user)
db.session.commit()
```

> **Note:** Changes only take effect after `db.session.commit()` — forgetting it is one of the most common Flask-SQLAlchemy bugs, since the code runs without errors but nothing actually saves.


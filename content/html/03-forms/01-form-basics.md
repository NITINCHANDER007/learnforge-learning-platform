---
title: Form Basics
---


```html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    <button type="submit">Submit</button>
</form>
```

`action` is where the form data is sent; `method` is usually `GET` (data in the URL) or `POST` (data in the request body, more common for forms that change data).

> **Note:** `<label for="name">` linked to `<input id="name">` lets clicking the label text focus the input — a small but genuine accessibility improvement.


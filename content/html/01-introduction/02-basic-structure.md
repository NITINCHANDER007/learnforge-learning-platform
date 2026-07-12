---
title: Basic Structure
---


Every HTML page follows the same skeleton:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

- `<!DOCTYPE html>` tells the browser this is a modern HTML document
- `<head>` holds metadata (page title, linked CSS files) — nothing in it is visible on the page itself
- `<body>` holds everything actually shown to the visitor

**Common mistake:** forgetting to close tags (`<p>text</p>`, not just `<p>text`) — most browsers tolerate this, but it can cause unpredictable layout issues.


---
title: Adding JS to HTML
---


```html
<script>
    console.log("Inline script");
</script>

<script src="script.js"></script>
```

An external `.js` file (the second option) is preferred for real projects — same reasoning as external CSS: one file, reusable across pages, easier to maintain.

> **Tip:** Place `<script>` tags just before the closing `</body>` tag, so the page's HTML loads and displays first, before JavaScript runs.


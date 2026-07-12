---
title: Ways to Add CSS
---


```html
<!-- Inline (avoid for real projects — hard to maintain) -->
<h1 style="color: blue;">Title</h1>

<!-- Internal (in the <head>) -->
<style>
    h1 { color: blue; }
</style>

<!-- External (best practice) -->
<link rel="stylesheet" href="styles.css">
```

An external stylesheet is the standard, maintainable approach — one file, linked from every page, so a style change applies everywhere at once.


---
title: Semantic Elements
---


Semantic elements describe their *meaning*, not just their appearance — this helps browsers, screen readers, and search engines understand your page structure.

```html
<header>Site navigation and logo</header>
<nav>Main menu links</nav>
<main>
    <article>A blog post</article>
</main>
<footer>Copyright info</footer>
```

Compare this to using generic `<div>` for everything — `<div class="header">` *looks* the same visually, but tells assistive technology and search engines nothing about what that content actually is.


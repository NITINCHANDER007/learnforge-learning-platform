---
title: Basic Selectors
---


```css
p { color: black; }              /* every <p> */
.highlight { background: yellow; } /* every element with class="highlight" */
#main-title { font-size: 40px; }   /* the one element with id="main-title" */
```

Classes (`.name`) can be reused on many elements; IDs (`#name`) should be unique to one element per page.

**Common mistake:** using an ID when you actually need to style multiple elements — use a class instead, since IDs are meant to be unique.


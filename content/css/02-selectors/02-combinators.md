---
title: Combinators
---


```css
div p { color: red; }        /* any <p> inside a <div>, at any depth */
div > p { color: blue; }     /* only <p> that is a DIRECT child of <div> */
h1 + p { color: green; }     /* the <p> immediately after an <h1> */
```

The space (descendant), `>` (direct child), and `+` (immediately following sibling) combinators let you target elements based on their position relative to others, not just their own tag/class/id.


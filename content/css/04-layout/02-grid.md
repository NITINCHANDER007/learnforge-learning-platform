---
title: Grid
---


CSS Grid arranges items in a full two-dimensional grid — rows *and* columns at once.

```css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
}
```

`1fr 1fr 1fr` creates three equal-width columns that share the available space. Grid is the better choice over Flexbox specifically when you need to control both rows and columns together (like a photo gallery or dashboard layout).


---
title: Flexbox
---


Flexbox arranges items in a single row or column, distributing space between them.

```css
.container {
    display: flex;
    justify-content: space-between;   /* horizontal spacing */
    align-items: center;               /* vertical alignment */
    gap: 16px;
}
```

`justify-content` controls spacing along the main axis (horizontal, by default); `align-items` controls alignment on the cross axis (vertical, by default). Flexbox is the standard tool for navbars, card rows, and any one-dimensional layout.


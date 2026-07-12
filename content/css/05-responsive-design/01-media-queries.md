---
title: Media Queries
---


Media queries apply different CSS depending on screen size, making a layout responsive.

```css
.sidebar {
    width: 300px;
}

@media (max-width: 768px) {
    .sidebar {
        width: 100%;   /* full width on small screens */
    }
}
```

`max-width: 768px` means "apply these styles only when the viewport is 768px wide or narrower" — the standard way mobile-friendly layouts are built with pure CSS.


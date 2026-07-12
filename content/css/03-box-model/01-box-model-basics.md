---
title: Box Model Basics
---


Every HTML element is a rectangular box made of four layers, from inside out: **content → padding → border → margin**.

```css
div {
    width: 200px;
    padding: 20px;    /* space inside the border */
    border: 2px solid black;
    margin: 10px;      /* space outside the border */
}
```

> **Note:** By default, `width: 200px` only sets the *content* width — padding and border add extra size on top of that. Setting `box-sizing: border-box;` makes `width` include padding and border instead, which is far more predictable and is used in almost every modern CSS reset.


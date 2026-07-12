---
title: Event Listeners
---


```javascript
const button = document.querySelector("button");

button.addEventListener("click", function () {
    console.log("Button was clicked!");
});
```

`addEventListener` runs a function whenever a specific event happens (`click`, `submit`, `keydown`, and many others) — this is the core mechanism behind virtually all interactive webpages.

> **Note:** Always attach event listeners **after** the element exists in the DOM — a script running before the HTML has loaded won't find the element yet.


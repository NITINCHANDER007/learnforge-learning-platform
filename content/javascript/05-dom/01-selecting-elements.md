---
title: Selecting Elements
---


The DOM (Document Object Model) is JavaScript's representation of the HTML page, letting you read and change it dynamically.

```javascript
const title = document.querySelector("h1");
const allParagraphs = document.querySelectorAll("p");

title.textContent = "New Title";
title.style.color = "blue";
```

`querySelector` returns the *first* matching element; `querySelectorAll` returns *every* matching element as a list you can loop through.


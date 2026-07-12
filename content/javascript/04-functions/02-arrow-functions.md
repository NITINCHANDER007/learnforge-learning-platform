---
title: Arrow Functions
---


```javascript
function square(x) {
    return x * x;
}

const squareArrow = (x) => x * x;   // same thing, shorter syntax

const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
console.log(doubled);   // [2, 4, 6]
```

Arrow functions are especially common as short, inline functions passed to array methods like `.map()`, `.filter()`, and `.forEach()`.


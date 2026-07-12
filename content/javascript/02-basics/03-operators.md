---
title: Operators
---


```javascript
console.log(10 + 3);    // 13
console.log(10 === 10); // true — strict equality (checks type AND value)
console.log(10 == "10"); // true — loose equality (converts types first)
console.log(10 !== 5);   // true
```

> **Note:** Always prefer `===` and `!==` (strict) over `==` and `!=` (loose) — loose equality's automatic type conversion causes subtle, hard-to-spot bugs.

**Common mistake:** relying on `==` and being surprised when `"0" == false` evaluates to `true` due to type coercion.


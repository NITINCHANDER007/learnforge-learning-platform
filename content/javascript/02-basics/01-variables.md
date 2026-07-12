---
title: Variables
---


```javascript
let age = 25;        // can be reassigned later
const name = "Ada";  // cannot be reassigned
var old = "avoid";    // outdated — avoid in modern code
```

Use `const` by default; switch to `let` only when you genuinely need to reassign the variable later. Avoid `var` entirely in modern JavaScript — it has confusing scoping rules that `let`/`const` fix.


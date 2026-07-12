---
title: Loops
---


```javascript
for (let i = 0; i < 5; i++) {
    console.log(i);   // 0, 1, 2, 3, 4
}

let fruits = ["apple", "banana"];
for (const fruit of fruits) {
    console.log(fruit);
}

let count = 0;
while (count < 3) {
    console.log(count);
    count++;
}
```

`for...of` is the modern way to loop through an array's values directly, without manually managing an index.


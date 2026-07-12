---
title: Tuples
---


A tuple is like a list, but **immutable** — once created, it can't be changed.

```python
point = (4, 5)
print(point[0])   # 4
```

## Why use a tuple instead of a list?

- Signals "this data shouldn't change" — protects against accidental edits
- Slightly faster than lists
- Can be used as dictionary keys (lists cannot)

```python
coordinates = {(0, 0): "origin", (1, 1): "diagonal point"}
```

## Tuples are immutable

```python
point = (4, 5)
point[0] = 10   # ❌ TypeError — tuples can't be modified
```

## Unpacking a tuple

```python
point = (4, 5)
x, y = point
print(x, y)   # 4 5
```

This pattern is used constantly in real code, e.g. when a function returns multiple values.

> **Note:** A single-item tuple needs a trailing comma: `(5,)` — not `(5)`, which is just the number 5 in parentheses.

## Common mistake

Forgetting the trailing comma for a one-element tuple, and ending up with a plain number instead of a tuple.

## Interview tip

Know both differences by heart: **mutability** (lists change, tuples don't) and **use as dict keys** (only tuples can be used, because dict keys must be immutable/hashable).

## Practice question

What will `type((5))` return — a tuple or an int? *(Answer: `int` — you need `(5,)` with a comma to make it a tuple.)*


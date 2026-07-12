---
title: Sets
---


A set stores **unique** values, in no particular order.

```python
numbers = {1, 2, 3, 2, 1}
print(numbers)   # {1, 2, 3} — duplicates are automatically removed
```

## Why use a set?

- Automatically removes duplicates
- Very fast membership checks (`in`)
- Supports mathematical set operations

```python
a = {1, 2, 3}
b = {2, 3, 4}

print(a | b)   # {1, 2, 3, 4}  — union (all items from both)
print(a & b)   # {2, 3}        — intersection (items in both)
print(a - b)   # {1}           — difference (in a, not in b)
```

## Common use: removing duplicates from a list

```python
numbers = [1, 2, 2, 3, 3, 3]
unique = list(set(numbers))
print(unique)   # [1, 2, 3]  (order not guaranteed)
```

> **Note:** Sets are unordered — don't rely on the items staying in any particular sequence, and you can't access items by index (`my_set[0]` doesn't work).

## Common mistake

Trying to index into a set like a list:

```python
s = {1, 2, 3}
print(s[0])   # ❌ TypeError — sets don't support indexing
```

## Interview tip

"Remove duplicates from a list" is an extremely common interview task, and `list(set(my_list))` is the one-line answer — just mention that it doesn't preserve original order (if order matters, a different approach is needed, like looping and checking membership).

## Practice question

What does `{1, 2, 3} & {3, 4, 5}` return? *(Answer: `{3}` — the only shared item.)*


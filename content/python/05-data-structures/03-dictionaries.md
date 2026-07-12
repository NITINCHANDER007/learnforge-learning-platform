---
title: Dictionaries
---


A dictionary stores data as **key-value pairs** — instead of finding items by position (like a list), you find them by name.

```python
student = {
    "name": "Ada",
    "age": 30,
    "is_active": True
}

print(student["name"])   # Ada
```

## Common dictionary operations

```python
student["age"] = 31              # update a value
student["email"] = "ada@x.com"   # add a new key
del student["is_active"]         # remove a key

print(student.get("phone", "N/A"))  # safely get a key that might not exist
```

## Looping through a dictionary

```python
for key, value in student.items():
    print(key, "->", value)
```

> **Note:** `dict["missing_key"]` raises an error if the key doesn't exist. `dict.get("missing_key")` returns `None` instead — much safer when you're not sure a key exists.

## Common mistake

```python
student["email"]   # ❌ KeyError if "email" doesn't exist
student.get("email")   # ✅ returns None instead of crashing
```

## Interview tip

Dictionaries are one of the most-used data structures in real interviews (especially for counting things). Classic pattern — counting word frequency:

```python
text = "the cat sat on the mat"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)
```

## Mini quiz

1. What does `dict.get("x")` return if `"x"` isn't in the dictionary? *(Answer: `None`)*
2. Can dictionary keys be lists? *(Answer: No — keys must be immutable, like strings, numbers, or tuples.)*


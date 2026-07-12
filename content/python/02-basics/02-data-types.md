---
title: Data Types
---


Every value in Python has a type. The type tells Python what kind of data it's dealing with, and what you can do with it.

## The main built-in types

| Type | Example | Meaning |
|---|---|---|
| `int` | `25` | whole numbers |
| `float` | `3.14` | decimal numbers |
| `str` | `"hello"` | text |
| `bool` | `True` / `False` | yes/no values |

## Checking a type

```python
age = 25
print(type(age))   # <class 'int'>

price = 9.99
print(type(price)) # <class 'float'>

name = "Sam"
print(type(name))  # <class 'str'>
```

## Converting between types

```python
age_text = "25"
age_number = int(age_text)   # converts "25" (str) to 25 (int)

score = 90
score_text = str(score)      # converts 90 (int) to "90" (str)
```

> **Note:** `int("25")` works, but `int("twenty five")` will crash — Python can't convert words into numbers.

## Common mistake

Trying to add a number and text directly:

```python
age = 25
print("Age: " + age)        # ❌ Error — can't join str and int with +
print("Age: " + str(age))   # ✅ Correct — convert age to a string first
```

## Interview tip

Be ready to explain the difference between `int` and `float` in one sentence: *`int` has no decimal point, `float` does — even `5.0` is a float.*

## Practice question

What type is the result of `10 / 2` in Python 3? *(Answer: `float` — `5.0`, not `5`. Division `/` always returns a float in Python 3, even if the numbers divide evenly.)*


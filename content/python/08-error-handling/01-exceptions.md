---
title: Exceptions
---


An exception is an error that happens while your program is running. If not handled, it crashes the program.

```python
number = int("not a number")   # ValueError — crashes here
print("This line never runs")
```

## Common built-in exceptions

| Exception | When it happens |
|---|---|
| `ValueError` | wrong type of value, e.g. `int("abc")` |
| `TypeError` | wrong type used in an operation |
| `ZeroDivisionError` | dividing by zero |
| `FileNotFoundError` | trying to open a file that doesn't exist |
| `KeyError` | accessing a missing dictionary key |
| `IndexError` | accessing a list index that doesn't exist |

## Why exceptions matter

Without handling them, one bad input can crash your entire program. The next lesson covers how to handle them gracefully.

> **Note:** Exceptions are Python's way of telling you *exactly* what went wrong and where — reading the error message carefully (especially the last line) usually tells you the fix.

## Common mistake

Ignoring the exact wording of an error message and guessing at the fix instead of reading it. Python's error messages are usually specific and genuinely helpful.

## Interview tip

Be ready to name a few common exception types from memory (see the table above) — it's a frequent quick-check question.

## Practice question

What kind of exception does `10 / 0` raise? *(Answer: `ZeroDivisionError`)*


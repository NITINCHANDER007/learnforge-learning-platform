---
title: Try and Except
---


`try`/`except` lets you handle errors gracefully instead of letting the program crash.

```python
try:
    number = int(input("Enter a number: "))
    print(100 / number)
except ValueError:
    print("That wasn't a valid number.")
except ZeroDivisionError:
    print("Can't divide by zero.")
```

Python tries the `try` block first. If an error matching one of the `except` clauses happens, that block runs instead of crashing the program.

## else and finally

```python
try:
    result = 10 / 2
except ZeroDivisionError:
    print("Error!")
else:
    print("No errors — result is", result)   # runs only if no exception happened
finally:
    print("This always runs")   # runs no matter what
```

- `else` runs only if the `try` block succeeded with no errors
- `finally` runs **always** — useful for cleanup (like closing a file)

> **Note:** Catch specific exceptions (`ValueError`, `ZeroDivisionError`) rather than a bare `except:`, which silently swallows *every* error — including ones you didn't expect and would want to know about.

## Common mistake

```python
try:
    risky_code()
except:              # ❌ catches everything, hides real bugs
    pass
```

## Interview tip

A strong interview answer mentions catching **specific** exceptions rather than using a bare `except:` — it shows awareness of writing maintainable, debuggable code.

## Mini quiz

1. Which block always runs, error or not? *(Answer: `finally`)*
2. Which block runs only if there was no error? *(Answer: `else`)*


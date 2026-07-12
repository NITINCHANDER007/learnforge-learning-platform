---
title: Arguments and Return Values
---


Functions can accept input (arguments) and give back output (a return value).

## return vs print

```python
def add(a, b):
    return a + b

result = add(3, 4)
print(result)   # 7
```

`return` sends a value **back** to wherever the function was called, so you can store it or use it later. `print()` just displays something on screen — it doesn't give you a usable value.

## Default arguments

```python
def greet(name="friend"):
    print(f"Hello, {name}!")

greet()          # Hello, friend!
greet("Ada")     # Hello, Ada!
```

## Multiple return values

```python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 1, 9, 2])
print(low, high)   # 1 9
```

> **Note:** Once `return` runs, the function stops immediately — any code after it in that function won't run.

## Common mistake

```python
def add(a, b):
    print(a + b)   # prints, but doesn't return anything

result = add(3, 4)
print(result)   # None — because add() didn't use `return`
```

This is one of the most common beginner confusions: **`print()` inside a function is not the same as `return`.**

## Interview tip

Be ready to explain: *a function without an explicit `return` statement returns `None` by default.*

## Mini quiz

1. What does a function return if it has no `return` statement? *(Answer: `None`)*
2. What happens to code written after a `return` statement inside the same function? *(Answer: it never runs)*


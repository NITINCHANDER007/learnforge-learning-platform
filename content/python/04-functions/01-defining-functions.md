---
title: Defining Functions
---


A function is a named, reusable block of code. Instead of repeating the same lines everywhere, you write them once and "call" the function whenever needed.

## Defining and calling a function

```python
def greet():
    print("Hello!")

greet()   # calling the function — prints "Hello!"
```

## Why use functions?

- Avoid repeating code (DRY: **D**on't **R**epeat **Y**ourself)
- Break a big problem into small, named pieces
- Easier to test and fix — one function, one job

## A function with parameters

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Ada")     # Hello, Ada!
greet("Linus")   # Hello, Linus!
```

`name` is a **parameter** — a placeholder for whatever value gets passed in when the function is called.

> **Note:** The function body must be indented, exactly like `if` and loops.

## Common mistake

Forgetting to actually **call** the function:

```python
def greet():
    print("Hello!")

greet   # ❌ does nothing — this refers to the function, doesn't run it
greet() # ✅ correct — the () actually calls it
```

## Interview tip

A common interview ask: *"Why are functions important?"* Good answer: reusability, readability, and easier debugging — you can test one function in isolation instead of an entire program.

## Practice question

Write a function called `square` that takes a number and prints its square.
```python
def square(n):
    print(n * n)

square(4)   # should print 16
```


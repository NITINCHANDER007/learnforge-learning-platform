---
title: Operators
---


Operators let you do things with values — math, comparisons, and logic.

## Arithmetic operators

```python
print(10 + 3)   # 13  addition
print(10 - 3)   # 7   subtraction
print(10 * 3)   # 30  multiplication
print(10 / 3)   # 3.333...  division (always returns a float)
print(10 // 3)  # 3   floor division (drops the decimal)
print(10 % 3)   # 1   modulus (the remainder)
print(10 ** 2)  # 100 exponent (10 to the power of 2)
```

## Comparison operators

These return `True` or `False`.

```python
print(5 == 5)   # True  — equal to
print(5 != 3)   # True  — not equal to
print(5 > 3)    # True  — greater than
print(5 < 3)    # False — less than
```

## Logical operators

```python
print(True and False)  # False — both must be True
print(True or False)   # True  — at least one must be True
print(not True)        # False — flips the value
```

> **Note:** `%` (modulus) is extremely useful for checking even/odd numbers: `number % 2 == 0` means the number is even.

## Common mistake

Mixing up `=` and `==` — covered in Variables, but it's worth repeating because it's the single most common beginner bug.

## Interview tip

A very common interview question: *"How do you check if a number is even?"*
```python
if number % 2 == 0:
    print("Even")
```

## Practice question

What does `17 % 5` evaluate to? *(Answer: 2 — 17 divided by 5 is 3 remainder 2.)*


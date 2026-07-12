---
title: Variables
---


A variable is a name that stores a value, so you can use that value later without retyping it.

## Creating a variable

```python
age = 25
name = "Meera"
is_student = True
```

Think of a variable like a labeled box. `age` is the label; `25` is what's inside the box.

## Rules for naming variables

- Must start with a letter or underscore (`_`), not a number
- Can contain letters, numbers, and underscores
- Cannot use Python keywords like `print`, `if`, `for`
- Case-sensitive: `age` and `Age` are different variables

```python
user_name = "ok"    # ✅ valid
2nd_place = "bad"   # ❌ invalid — starts with a number
```

## Reassigning variables

```python
score = 10
score = 20   # score is now 20, the old value is gone
```

> **Note:** Python doesn't need you to declare a type. `age = 25` just works — no `int age = 25;` like in some other languages.

## Common mistake

Confusing `=` (assignment) with `==` (comparison). `=` stores a value; `==` checks if two things are equal.

```python
x = 5     # assigns 5 to x
x == 5    # checks: is x equal to 5? (returns True or False)
```

## Interview tip

A classic interview question: *"Is Python statically or dynamically typed?"* Answer: **dynamically typed** — a variable's type is decided at runtime and can even change (though it's not usually good practice to change a variable's type mid-program).

## Mini quiz

1. Which of these is a valid variable name — `1data`, `data_1`, `data-1`?
   *(Answer: `data_1`)*
2. What does `x = 5` followed by `x = x + 1` leave `x` equal to?
   *(Answer: 6)*


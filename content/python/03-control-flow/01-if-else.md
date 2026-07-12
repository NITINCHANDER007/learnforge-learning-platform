---
title: If Else
---


`if` statements let your program make decisions.

```python
age = 20

if age >= 18:
    print("You can vote.")
else:
    print("Too young to vote.")
```

## Multiple conditions with elif

```python
marks = 75

if marks >= 90:
    print("Grade A")
elif marks >= 75:
    print("Grade B")
elif marks >= 50:
    print("Grade C")
else:
    print("Fail")
```

Python checks conditions **top to bottom** and stops at the first one that's `True`.

## Indentation matters

Python uses indentation (spaces) instead of `{ }` to group code. Everything indented under `if` belongs to that `if` block.

```python
if True:
    print("This runs")   # 4 spaces of indentation
print("This always runs")  # not indented — outside the if block
```

> **Note:** Mixing tabs and spaces causes errors. Stick to 4 spaces consistently (most editors do this automatically).

## Common mistake

Forgetting the colon `:` at the end of the `if` line — a very frequent beginner typo.

```python
if age >= 18   # ❌ missing colon
if age >= 18:  # ✅ correct
```

## Interview tip

Know the difference between `elif` and writing separate `if` statements. With `elif`, only **one** branch runs. With separate `if` statements, **every** condition is checked independently, even if an earlier one was `True`.

## Practice question

What does this print if `marks = 80`? *(Answer: `Grade B` — 80 is not ≥ 90, but it is ≥ 75.)*


---
title: Loops
---


Loops let you repeat code without rewriting it.

## for loops

Used when you know how many times to repeat, or want to go through a collection:

```python
for i in range(5):
    print(i)
# prints 0, 1, 2, 3, 4
```

```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

## while loops

Used when you repeat **until a condition becomes False**:

```python
count = 0
while count < 5:
    print(count)
    count += 1   # same as count = count + 1
```

> **Note:** `range(5)` produces `0, 1, 2, 3, 4` — five numbers, **not including** 5. This trips up a lot of beginners.

## break and continue

```python
for i in range(10):
    if i == 5:
        break        # stops the loop completely
    print(i)

for i in range(5):
    if i == 2:
        continue     # skips just this one iteration
    print(i)
```

## Common mistake

Forgetting to update the loop variable in a `while` loop, causing an **infinite loop**:

```python
count = 0
while count < 5:
    print(count)
    # forgot count += 1 — this never stops!
```

## Interview tip

`for` loops are generally preferred when the number of iterations is known in advance (or you're iterating over a collection). `while` loops are better when you're waiting for a condition to change (like user input, or a search).

## Mini quiz

1. How many times does `for i in range(3):` run? *(Answer: 3 times — i = 0, 1, 2)*
2. What's the risk with `while` loops specifically? *(Answer: infinite loops, if the condition never becomes False)*


---
title: Lists
---


A list stores multiple values in one variable, in order.

```python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])     # apple
print(fruits[-1])    # cherry (last item)
```

## Common list operations

```python
fruits.append("mango")       # adds to the end
fruits.remove("banana")      # removes by value
fruits.insert(1, "kiwi")     # inserts at a specific position
print(len(fruits))           # number of items
print("apple" in fruits)     # True — checks membership
```

## Looping through a list

```python
for fruit in fruits:
    print(fruit)
```

## List slicing

```python
numbers = [10, 20, 30, 40, 50]
print(numbers[1:3])   # [20, 30]
print(numbers[:2])    # [10, 20]
print(numbers[::-1])  # [50, 40, 30, 20, 10] — reversed
```

> **Note:** Lists are **mutable** — unlike strings, you can change items in place: `fruits[0] = "orange"` works fine.

## Common mistake

```python
fruits = ["apple", "banana"]
print(fruits[5])   # ❌ IndexError — no item at index 5
```

Always make sure the index exists before accessing it.

## Interview tip

A frequent question: *"What's the difference between a list and a tuple?"* Short answer: lists are mutable (changeable), tuples are not. That single fact answers most follow-up questions too.

## Mini quiz

1. What does `[1, 2, 3][-1]` return? *(Answer: 3)*
2. Are lists ordered? *(Answer: yes — items keep their insertion order)*


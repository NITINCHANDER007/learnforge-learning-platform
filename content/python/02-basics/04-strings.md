---
title: Strings
---


A string is text, wrapped in quotes.

```python
name = "Python"
greeting = 'Hello'   # single or double quotes both work
```

## Common string operations

```python
name = "python"
print(name.upper())        # PYTHON
print(name.capitalize())   # Python
print(len(name))           # 6 — number of characters
print(name[0])             # p — first character (indexing starts at 0)
print(name[-1])            # n — last character
```

## Joining strings

```python
first = "Ada"
last = "Lovelace"
full = first + " " + last
print(full)   # Ada Lovelace
```

A cleaner way — **f-strings** (formatted strings):

```python
age = 30
print(f"Ada is {age} years old.")   # Ada is 30 years old.
```

## Slicing strings

```python
word = "Python"
print(word[0:3])   # Pyt  — characters from index 0 up to (not including) 3
print(word[3:])    # hon  — everything from index 3 onward
```

> **Note:** Strings are **immutable** — you can't change a character in place. `word[0] = "J"` will raise an error. You have to build a new string instead.

## Common mistake

Forgetting that indexing starts at **0**, not 1. `word[1]` gives the *second* character, not the first.

## Interview tip

f-strings (`f"..."`) are the modern, preferred way to format strings in Python. Mentioning them shows you know current best practice, not just older syntax like `.format()` or `%`.

## Mini quiz

1. What does `"hello"[1:4]` return? *(Answer: `"ell"`)*
2. Are Python strings mutable or immutable? *(Answer: immutable)*


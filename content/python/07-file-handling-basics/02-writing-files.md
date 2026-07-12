---
title: Writing Files
---


Writing to a file works very similarly to reading.

```python
with open("output.txt", "w") as file:
    file.write("Hello, file!")
```

## "w" vs "a"

```python
with open("log.txt", "w") as file:
    file.write("First line\n")   # "w" — overwrites the whole file every time

with open("log.txt", "a") as file:
    file.write("Another line\n")  # "a" — adds to the end without deleting existing content
```

> **Note:** `"w"` mode **erases the entire file first** if it already exists — even if you only write one line. Use `"a"` if you want to keep existing content.

## Writing multiple lines

```python
lines = ["apple\n", "banana\n", "cherry\n"]
with open("fruits.txt", "w") as file:
    file.writelines(lines)
```

## Common mistake

Forgetting `\n` between lines — without it, everything gets written on a single line with no separation.

```python
file.write("apple")
file.write("banana")   # results in "applebanana" — no line break
```

## Interview tip

Know the three main modes cold: `"r"` (read), `"w"` (write/overwrite), `"a"` (append). This is a very common quick-fire interview question.

## Mini quiz

1. Which mode erases existing file content before writing? *(Answer: `"w"`)*
2. Which mode adds new content without deleting what's already there? *(Answer: `"a"`)*


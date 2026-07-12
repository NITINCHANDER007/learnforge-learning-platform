---
title: Reading Files
---


Python can open and read files stored on your computer.

```python
file = open("notes.txt", "r")
content = file.read()
print(content)
file.close()
```

## The better way — using `with`

```python
with open("notes.txt", "r") as file:
    content = file.read()
    print(content)
# file is automatically closed here, even if an error occurs
```

`with` is strongly preferred because it **guarantees the file gets closed**, even if something goes wrong while reading it.

## Reading line by line

```python
with open("notes.txt", "r") as file:
    for line in file:
        print(line.strip())   # .strip() removes the trailing newline
```

## Common file modes

| Mode | Meaning |
|---|---|
| `"r"` | read (default) |
| `"w"` | write (overwrites the whole file!) |
| `"a"` | append (adds to the end) |

> **Note:** If the file doesn't exist, `open("notes.txt", "r")` raises a `FileNotFoundError`. Always make sure the path is correct.

## Common mistake

Forgetting to close a file when not using `with` — this can cause data loss or file-locking issues, especially in longer programs.

## Interview tip

Always mention `with` when discussing file handling in an interview — it signals you know current best practice, not just the old `open()`/`close()` pattern.

## Practice question

What does `.strip()` do when reading lines from a file? *(Answer: removes leading/trailing whitespace, including the newline character at the end of each line.)*


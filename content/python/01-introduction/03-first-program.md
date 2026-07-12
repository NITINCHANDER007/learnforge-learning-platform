---
title: Your First Program
---


Let's write and run a real Python file, not just a single line.

## Step 1: Create a file

Create a new file called `hello.py`. The `.py` extension tells your computer "this is a Python file."

## Step 2: Write some code

```python
name = "Ada"
print("Hello,", name)
print("Welcome to Python!")
```

## Step 3: Run it

In your terminal, navigate to the folder containing `hello.py` and run:

```bash
python hello.py
```

Output:
```
Hello, Ada
Welcome to Python!
```

## What just happened?

- `name = "Ada"` stored the text `"Ada"` in a variable called `name`
- `print()` displayed text to the screen
- Python ran the file **top to bottom**, one line at a time

> **Note:** `print()` with a comma automatically adds a space between items.

## Common mistake

Saving the file without the `.py` extension. Python needs that extension to recognize it as a Python program.

## Practice question

What would happen if you swapped the two `print()` lines? *(Answer: the output order would swap too — Python runs code top to bottom.)*


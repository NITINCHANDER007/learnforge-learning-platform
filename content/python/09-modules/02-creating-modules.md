---
title: Creating Modules
---


You can turn your own Python file into a reusable module — any `.py` file is already a module.

## Step 1: Create a module

`math_utils.py`:
```python
def add(a, b):
    return a + b

def square(n):
    return n * n
```

## Step 2: Use it from another file

`main.py` (in the same folder):
```python
import math_utils

print(math_utils.add(2, 3))      # 5
print(math_utils.square(4))      # 16
```

## The `if __name__ == "__main__":` pattern

```python
def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(2, 3))   # only runs when this file is run directly,
                        # not when it's imported by another file
```

This lets a file work both as a reusable module **and** as a standalone script, without the test/demo code running unexpectedly when someone else imports it.

> **Note:** Python looks for imported modules in the same folder first, then in its installed packages — so `math_utils.py` needs to sit alongside `main.py` for a simple `import math_utils` to work.

## Common mistake

Naming your own file the same as a built-in module (e.g. `math.py`) — this can silently break your imports.

## Interview tip

The `if __name__ == "__main__":` pattern comes up often in interviews and real codebases — know what it does and why it's useful (see above).

## Practice question

Where does Python look first when you write `import math_utils`? *(Answer: the same folder as the file doing the importing.)*


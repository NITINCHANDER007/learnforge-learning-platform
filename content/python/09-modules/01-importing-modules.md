---
title: Importing Modules
---


A module is a file containing Python code that you can reuse in other files. Python comes with many built-in modules ready to use.

```python
import math

print(math.sqrt(16))   # 4.0
print(math.pi)          # 3.14159...
```

## Different ways to import

```python
import math
print(math.sqrt(16))

from math import sqrt
print(sqrt(16))          # no need for "math." prefix

from math import sqrt as square_root
print(square_root(16))   # renamed on import
```

## Useful built-in modules

| Module | What it's for |
|---|---|
| `math` | mathematical functions |
| `random` | random numbers |
| `datetime` | dates and times |
| `os` | interacting with the operating system |

```python
import random
print(random.randint(1, 10))   # random number between 1 and 10
```

> **Note:** Installing **third-party** modules (like `pandas` or `requests`, which aren't built in) uses `pip install package_name` in your terminal first, before you can `import` them.

## Common mistake

Trying to `import` a package that isn't installed yet, and getting a `ModuleNotFoundError`. The fix is `pip install <package_name>`, not a code change.

## Interview tip

Know the difference between `import math` and `from math import sqrt` — the second lets you call `sqrt()` directly, without the `math.` prefix, but it also means you have less clarity about where `sqrt` came from in a large file.

## Practice question

What does `pip install` do? *(Answer: downloads and installs a third-party Python package so it can be imported.)*


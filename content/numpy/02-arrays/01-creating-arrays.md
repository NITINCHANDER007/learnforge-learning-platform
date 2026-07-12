---
title: Creating Arrays
---


```python
import numpy as np

a = np.array([1, 2, 3])
zeros = np.zeros(5)              # [0. 0. 0. 0. 0.]
ones = np.ones((2, 3))            # 2x3 array of ones
sequence = np.arange(0, 10, 2)    # [0 2 4 6 8]
even_spread = np.linspace(0, 1, 5)  # 5 evenly spaced numbers between 0 and 1
```

> **Note:** All elements in a NumPy array share the **same data type** (unlike a Python list, which can mix types) — this uniformity is exactly what makes NumPy fast.


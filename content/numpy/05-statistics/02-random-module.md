---
title: The Random Module
---


```python
import numpy as np

np.random.seed(42)              # makes randomness reproducible
print(np.random.rand(3))         # 3 random floats between 0 and 1
print(np.random.randint(1, 10, size=5))   # 5 random integers from 1-9
```

> **Note:** `np.random.seed()` is essential for reproducible experiments — without it, running the same code twice gives different random results, which makes debugging and sharing results much harder.


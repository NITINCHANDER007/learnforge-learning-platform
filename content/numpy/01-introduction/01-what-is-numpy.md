---
title: What is NumPy?
---


NumPy (Numerical Python) is the foundation of Python's data science ecosystem — it provides fast, memory-efficient arrays for numerical work. Pandas, scikit-learn, and most ML libraries are built on top of it.

```python
import numpy as np

arr = np.array([1, 2, 3, 4])
print(arr * 2)   # [2 4 6 8] — applies to every element at once
```

> **Note:** NumPy operations are implemented in C under the hood, making them dramatically faster than the equivalent plain Python loop over a list.


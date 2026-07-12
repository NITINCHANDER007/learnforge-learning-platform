---
title: Broadcasting
---


Broadcasting lets NumPy apply an operation between arrays of **different shapes**, without manually resizing either one.

```python
arr = np.array([1, 2, 3])
print(arr + 10)          # [11 12 13] — 10 is "broadcast" to every element

matrix = np.array([[1, 2, 3], [4, 5, 6]])
row = np.array([10, 20, 30])
print(matrix + row)       # row is added to every row of the matrix
```

> **Note:** Broadcasting has specific compatibility rules (shapes must align or be 1 in the differing dimension) — mismatched shapes raise a clear `ValueError` rather than silently doing something unexpected.


---
title: Array Slicing
---


```python
arr = np.array([10, 20, 30, 40, 50])
print(arr[1:4])     # [20 30 40]
print(arr[:3])       # [10 20 30]

matrix = np.array([[1, 2, 3], [4, 5, 6]])
print(matrix[:, 1])   # [2 5] — every row, column 1
print(matrix[0, :])   # [1 2 3] — row 0, every column
```

> **Note:** NumPy slices are **views**, not copies — modifying a slice can change the original array. Use `.copy()` if you need an independent copy.


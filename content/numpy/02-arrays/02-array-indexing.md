---
title: Array Indexing
---


```python
arr = np.array([10, 20, 30, 40])
print(arr[0])     # 10
print(arr[-1])    # 40

matrix = np.array([[1, 2], [3, 4]])
print(matrix[0, 1])   # 2 — row 0, column 1
print(matrix[1])       # [3 4] — entire row 1
```

2D indexing uses `array[row, column]` — a single comma-separated index, rather than `array[row][column]` (which also works, but is less idiomatic NumPy).


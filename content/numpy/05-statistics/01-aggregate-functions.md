---
title: Aggregate Functions
---


```python
arr = np.array([4, 8, 15, 16, 23, 42])

print(arr.sum())    # 108
print(arr.mean())   # 18.0
print(arr.max())    # 42
print(arr.min())    # 4
print(arr.std())    # standard deviation

matrix = np.array([[1, 2], [3, 4]])
print(matrix.sum(axis=0))   # sum down each column: [4 6]
print(matrix.sum(axis=1))   # sum across each row: [3 7]
```

`axis=0` operates down columns, `axis=1` operates across rows — this trips up almost everyone at first, so it's worth testing on a small example until it clicks.


---
title: Reshaping
---


```python
arr = np.arange(6)         # [0 1 2 3 4 5]
reshaped = arr.reshape(2, 3)
print(reshaped)
# [[0 1 2]
#  [3 4 5]]

flat = reshaped.flatten()   # back to 1D: [0 1 2 3 4 5]
```

The total number of elements must stay the same — `reshape(2, 3)` only works on an array with exactly 6 elements.


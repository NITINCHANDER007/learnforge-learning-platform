---
title: Stacking and Splitting
---


```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(np.vstack([a, b]))   # stack vertically (as rows)
print(np.hstack([a, b]))   # stack horizontally (concatenate)

arr = np.array([1, 2, 3, 4, 5, 6])
parts = np.split(arr, 3)    # split into 3 equal parts
```

Useful for combining separate datasets, or splitting one array into training/testing chunks for machine learning.


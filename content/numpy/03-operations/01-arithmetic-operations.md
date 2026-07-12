---
title: Arithmetic Operations
---


```python
a = np.array([1, 2, 3])
b = np.array([10, 20, 30])

print(a + b)   # [11 22 33]
print(a * b)   # [10 40 90]
print(b / a)   # [10. 10. 10.]
print(a ** 2)  # [1 4 9]
```

These are all **element-wise** — each position is combined with the matching position in the other array, no manual loop needed.

**Common mistake:** trying to do this same math with plain Python lists — `[1,2,3] * 2` repeats the list (`[1,2,3,1,2,3]`) instead of multiplying each number, which is a frequent source of confusion for beginners moving from lists to arrays.


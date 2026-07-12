---
title: GroupBy
---


```python
df.groupby("department")["salary"].mean()

df.groupby("department").agg({
    "salary": "mean",
    "age": "max"
})
```

`groupby` follows the classic "split, apply, combine" pattern: split the data into groups, apply a calculation to each, then combine the results into one output — the same underlying idea as SQL's `GROUP BY`.


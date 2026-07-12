---
title: Merging and Joining
---


```python
merged = pd.merge(employees, departments, on="dept_id", how="inner")

merged_left = pd.merge(employees, departments, on="dept_id", how="left")
```

`how` works exactly like SQL joins: `"inner"` keeps only matching rows, `"left"` keeps all rows from the first DataFrame even without a match.


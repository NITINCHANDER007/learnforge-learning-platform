---
title: Pivot Tables
---


```python
pivot = df.pivot_table(
    values="salary",
    index="department",
    columns="year",
    aggfunc="mean"
)
```

This reshapes data — turning unique values from one column (`year`) into new columns, with `salary` averages filling the grid. Same concept as an Excel pivot table.


---
title: Filtering
---


```python
adults = df[df["age"] >= 18]

sales_team = df[(df["department"] == "Sales") & (df["salary"] > 50000)]
```

> **Note:** Use `&` and `|` for combining conditions in pandas (not Python's `and`/`or`), and wrap each condition in parentheses — `df[df["age"] >= 18 & df["dept"] == "Sales"]` without parentheses will raise an error.


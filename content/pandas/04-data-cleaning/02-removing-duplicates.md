---
title: Removing Duplicates
---


```python
print(df.duplicated().sum())   # count duplicate rows

df_unique = df.drop_duplicates()

df_unique = df.drop_duplicates(subset=["email"])   # duplicates based on one column only
```

**Common mistake:** assuming `drop_duplicates()` only checks the first column — by default it checks **all** columns; a row must match exactly across every column to count as a duplicate, unless you specify `subset`.


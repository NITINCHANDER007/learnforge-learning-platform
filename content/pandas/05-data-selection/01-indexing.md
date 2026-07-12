---
title: Indexing
---


```python
df.loc[0]              # row by label/index value
df.iloc[0]              # row by integer position

df.loc[0, "name"]       # specific cell, by label
df.iloc[0:3]             # first 3 rows, by position
```

`loc` is **label-based** (uses the actual index values); `iloc` is **position-based** (uses 0, 1, 2... regardless of the actual index labels). This distinction trips up almost every pandas beginner at least once.


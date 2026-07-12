---
title: DataFrames
---


A DataFrame is a full table — multiple Series (columns) sharing one index.

```python
import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Sam", "Max"],
    "age": [30, 25, 35]
})

print(df.head())     # first 5 rows
print(df.shape)       # (rows, columns)
print(df.columns)     # column names
print(df.dtypes)      # data type of each column
```

**Common mistake:** confusing `df["age"]` (returns a Series — one column) with `df[["age"]]` (returns a DataFrame — one column, but still table-shaped). The double brackets matter.


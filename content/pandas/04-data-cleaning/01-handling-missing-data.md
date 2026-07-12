---
title: Handling Missing Data
---


Real data almost always has gaps. Pandas represents missing values as `NaN`.

```python
print(df.isnull().sum())          # count missing values per column

df_clean = df.dropna()            # remove rows with any missing value
df_filled = df.fillna(0)          # replace missing values with 0
df["age"] = df["age"].fillna(df["age"].mean())   # fill with the column's average
```

> **Note:** `dropna()` can silently remove a lot of data if many rows have at least one missing value — always check `df.shape` before and after to see the impact.


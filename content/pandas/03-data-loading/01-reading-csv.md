---
title: Reading CSV Files
---


```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.head())
```

Common useful options:
```python
df = pd.read_csv("data.csv", usecols=["name", "age"])   # only load specific columns
df = pd.read_csv("data.csv", nrows=100)                  # only first 100 rows — good for previewing huge files
```

> **Note:** `read_csv` assumes the first row is a header by default — pass `header=None` if your file has no header row.


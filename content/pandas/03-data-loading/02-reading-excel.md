---
title: Reading Excel Files
---


```python
import pandas as pd

df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
```

Reading multiple sheets at once:
```python
sheets = pd.read_excel("data.xlsx", sheet_name=None)   # dict of {sheet_name: DataFrame}
print(sheets["Sheet1"].head())
```

> **Note:** `read_excel` requires the `openpyxl` package installed (`pip install openpyxl`) for `.xlsx` files.


---
title: Reading JSON Files
---


```python
import pandas as pd

df = pd.read_json("data.json")
print(df.head())
```

Converting a DataFrame back to JSON:
```python
df.to_json("output.json", orient="records")
```

`orient="records"` produces a list of `{column: value}` objects — the most common, readable JSON shape for tabular data.


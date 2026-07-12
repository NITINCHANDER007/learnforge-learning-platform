---
title: Series
---


A Series is a single labeled column of data — like one column from a spreadsheet.

```python
import pandas as pd

ages = pd.Series([25, 30, 35], index=["Sam", "Ada", "Max"])
print(ages)
print(ages["Ada"])   # 30
```

Every Series has an **index** (the labels) alongside the actual values — by default the index is just 0, 1, 2..., but it can be set to anything meaningful, like names.


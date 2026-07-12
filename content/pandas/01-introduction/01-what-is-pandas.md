---
title: What is Pandas?
---


Pandas is Python's most-used library for working with tabular data (rows and columns) — think of it as a programmable spreadsheet.

```python
import pandas as pd

data = {"name": ["Ada", "Sam"], "age": [30, 25]}
df = pd.DataFrame(data)
print(df)
```

The two core structures are the **Series** (a single column) and the **DataFrame** (a full table of rows and columns) — covered in the next lesson.

> **Note:** `import pandas as pd` is the universal convention — you'll see `pd.` in essentially every pandas codebase.


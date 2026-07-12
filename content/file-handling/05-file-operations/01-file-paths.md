---
title: File Paths
---


```python
from pathlib import Path

path = Path("data") / "reports" / "2024.csv"
print(path)                # data/reports/2024.csv (cross-platform correct)
print(path.exists())        # True/False
print(path.name)            # 2024.csv
print(path.parent)          # data/reports
```

`pathlib` is the modern, preferred way to build file paths — it automatically handles the slash-direction differences between Windows and Mac/Linux, which manually-built path strings often get wrong.


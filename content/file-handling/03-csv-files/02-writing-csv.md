---
title: Writing CSV
---


```python
import csv

rows = [["name", "age"], ["Ada", 30], ["Sam", 25]]

with open("output.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerows(rows)
```

> **Note:** Always pass `newline=""` when opening a file for CSV writing on Windows — without it, you can end up with extra blank lines between rows.


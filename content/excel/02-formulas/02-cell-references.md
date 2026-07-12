---
title: Cell References
---


```
=A1          relative reference — shifts when copied to another cell
=$A$1        absolute reference — never shifts when copied
=$A1         mixed — column locked, row shifts
```

Dragging a formula with `=A1` down a column changes to `=A2`, `=A3`, etc. Dragging one with `=$A$1` keeps referencing the exact same cell — essential when a formula needs to always reference one fixed value, like a tax rate in a single cell.

**Common mistake:** copying a formula down a column intending to always reference one fixed cell, but forgetting the `$` — the reference silently shifts and produces wrong numbers.


---
title: Lookup Functions
---


```
=VLOOKUP(A1, B1:D10, 2, FALSE)
```

Looks for the value in `A1` within the first column of `B1:D10`, and returns the value from the 2nd column of that matching row. `FALSE` means an exact match is required.

The modern replacement, more flexible and increasingly preferred:
```
=XLOOKUP(A1, B1:B10, D1:D10)
```

> **Note:** `VLOOKUP` can only look **rightward** from its search column. `XLOOKUP` has no such restriction — it's the better default choice in recent Excel versions.


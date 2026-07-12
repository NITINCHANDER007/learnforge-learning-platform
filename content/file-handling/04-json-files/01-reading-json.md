---
title: Reading JSON
---


```python
import json

with open("data.json", "r") as file:
    data = json.load(file)
    print(data["name"])
```

`json.load()` reads directly from a file object; `json.loads()` (with an "s") parses a JSON **string** you already have in memory — a subtle but common source of confusion.


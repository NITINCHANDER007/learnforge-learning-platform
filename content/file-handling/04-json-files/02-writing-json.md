---
title: Writing JSON
---


```python
import json

data = {"name": "Ada", "age": 30}

with open("output.json", "w") as file:
    json.dump(data, file, indent=4)
```

`indent=4` makes the output file human-readable, with nested structure visually indented — omit it for a more compact file if readability doesn't matter.


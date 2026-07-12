---
title: Directory Operations
---


```python
from pathlib import Path

Path("new_folder").mkdir(exist_ok=True)   # create a folder, no error if it exists

for file in Path("data").iterdir():
    print(file)              # list everything in a folder

for file in Path("data").glob("*.csv"):
    print(file)              # only .csv files
```

`exist_ok=True` prevents an error if the folder is already there — a small detail that avoids a very common crash when re-running a script.


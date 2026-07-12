---
title: Reading Text Files
---


```python
with open("notes.txt", "r") as file:
    content = file.read()
    print(content)

with open("notes.txt", "r") as file:
    for line in file:
        print(line.strip())
```

Always use `with open(...)` — it automatically closes the file when done, even if an error happens partway through.


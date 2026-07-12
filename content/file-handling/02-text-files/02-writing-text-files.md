---
title: Writing Text Files
---


```python
with open("output.txt", "w") as file:
    file.write("Hello, file!\n")

with open("log.txt", "a") as file:
    file.write("New log entry\n")
```

`"w"` overwrites the entire file; `"a"` appends without deleting existing content — mixing these up is a very common mistake.


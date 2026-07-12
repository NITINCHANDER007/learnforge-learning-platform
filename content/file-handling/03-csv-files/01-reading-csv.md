---
title: Reading CSV
---


```python
import csv

with open("data.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)   # each row is a list of strings

with open("data.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(row["name"], row["age"])   # access by column name
```

`csv.DictReader` is usually more convenient — it uses the header row automatically as keys.


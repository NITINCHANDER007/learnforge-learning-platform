---
title: Bar Charts
---


```python
import matplotlib.pyplot as plt

departments = ["Sales", "Engineering", "Marketing"]
headcount = [12, 25, 8]

plt.bar(departments, headcount)
plt.title("Headcount by Department")
plt.show()
```

Bar charts compare quantities across **categories** — use them instead of a line chart whenever the x-axis isn't a continuous scale like time.


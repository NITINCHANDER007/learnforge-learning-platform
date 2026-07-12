---
title: Line Charts
---


```python
import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5]
sales = [100, 120, 90, 140, 160]

plt.plot(days, sales)
plt.title("Sales Over Time")
plt.xlabel("Day")
plt.ylabel("Sales")
plt.show()
```

Line charts are the natural choice for showing a trend over a continuous variable, most commonly time.


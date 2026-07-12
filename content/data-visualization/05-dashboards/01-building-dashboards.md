---
title: Building Dashboards
---


A dashboard combines multiple charts into one view, usually to track key metrics at a glance.

```python
fig, axes = plt.subplots(2, 2, figsize=(10, 8))

axes[0, 0].plot(days, sales)
axes[0, 0].set_title("Sales Trend")

axes[0, 1].bar(departments, headcount)
axes[0, 1].set_title("Headcount")

plt.tight_layout()
plt.show()
```

`plt.subplots(2, 2)` creates a 2x2 grid of charts sharing one figure — `tight_layout()` prevents titles and labels from overlapping between them.


---
title: Plotting with Pandas
---


Pandas has built-in, quick charting powered by matplotlib.

```python
import matplotlib.pyplot as plt

df["salary"].plot(kind="hist")
plt.show()

df.groupby("department")["salary"].mean().plot(kind="bar")
plt.show()
```

> **Note:** This is meant for **quick exploration** while analyzing data — for polished, presentation-ready charts, use matplotlib or seaborn directly (see the Data Visualization subject).


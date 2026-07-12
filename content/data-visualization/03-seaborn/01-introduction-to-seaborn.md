---
title: Introduction to Seaborn
---


Seaborn is built on top of Matplotlib and produces attractive statistical charts with much less code.

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.scatterplot(x="hours_studied", y="score", data=df)
plt.show()
```

> **Note:** Seaborn works especially well directly with pandas DataFrames — you pass column names as strings and the DataFrame itself, rather than raw lists.


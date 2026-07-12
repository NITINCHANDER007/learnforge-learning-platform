---
title: Scatter Plots
---


```python
import matplotlib.pyplot as plt

hours_studied = [1, 2, 3, 4, 5]
test_scores = [50, 55, 65, 70, 90]

plt.scatter(hours_studied, test_scores)
plt.xlabel("Hours Studied")
plt.ylabel("Test Score")
plt.show()
```

Scatter plots reveal the **relationship** between two numeric variables — useful for spotting correlation before running any formal statistics.


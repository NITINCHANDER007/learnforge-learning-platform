---
title: Statistical Plots
---


```python
import seaborn as sns

sns.histplot(df["age"], bins=20)          # distribution of one variable
sns.boxplot(x="department", y="salary", data=df)   # spread + outliers per category
sns.heatmap(df.corr(), annot=True)         # correlation between all numeric columns
```

A **boxplot** is especially useful for spotting outliers at a glance; a **heatmap** of `df.corr()` is one of the fastest ways to see which variables move together.


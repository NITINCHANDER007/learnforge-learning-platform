---
title: Train/Test Split
---


```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

You train a model on the **training set**, then evaluate it on the **test set** it has never seen — this reveals whether the model actually generalizes, or has simply memorized the training data.

> **Note:** `random_state=42` makes the split reproducible — running the same code again gives the exact same split.


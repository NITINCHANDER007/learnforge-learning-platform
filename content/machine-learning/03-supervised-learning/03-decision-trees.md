---
title: Decision Trees
---


A decision tree makes predictions by asking a series of yes/no questions about the data, splitting it step by step until it reaches a final answer.

```python
from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(max_depth=5)
model.fit(X_train, y_train)
```

> **Note:** `max_depth` limits how many questions deep the tree can go — without a limit, trees tend to **overfit**, memorizing the training data instead of learning general patterns.


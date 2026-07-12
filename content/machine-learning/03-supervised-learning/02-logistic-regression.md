---
title: Logistic Regression
---


Despite the name, logistic regression is used for **classification** (predicting a category, like spam/not-spam), not predicting a continuous number.

```python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

It outputs a probability between 0 and 1, then applies a threshold (usually 0.5) to decide the final class.


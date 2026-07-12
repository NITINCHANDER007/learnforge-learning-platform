---
title: Linear Regression
---


Predicts a **continuous number** (like a price) based on one or more input features, by fitting a straight line (or plane, in higher dimensions) through the data.

```python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

Linear regression is simple and highly interpretable — often the right first model to try, even before more complex algorithms.


---
title: Feature Scaling
---


Many ML algorithms perform poorly when input features are on very different scales (e.g. `age` in tens, `income` in tens of thousands).

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

`StandardScaler` transforms each feature to have a mean of 0 and standard deviation of 1, putting every feature on comparable footing.

> **Note:** Fit the scaler only on training data, then apply (`transform`, not `fit_transform`) the same scaler to test data — fitting on the full dataset leaks information from the test set into training.


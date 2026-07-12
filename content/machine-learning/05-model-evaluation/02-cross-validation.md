---
title: Cross-Validation
---


A single train/test split can be lucky or unlucky. Cross-validation splits the data multiple ways and averages the results, for a more reliable estimate of model performance.

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5)
print(scores.mean())
```

`cv=5` means the data is split 5 different ways ("5-fold"), the model is trained and tested 5 times, and the results are averaged.


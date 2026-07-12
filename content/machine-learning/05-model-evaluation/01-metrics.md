---
title: Evaluation Metrics
---


```python
from sklearn.metrics import accuracy_score, precision_score, recall_score

accuracy_score(y_test, predictions)
precision_score(y_test, predictions)
recall_score(y_test, predictions)
```

- **Accuracy** — percent of predictions that were correct
- **Precision** — of everything predicted positive, how much actually was
- **Recall** — of everything actually positive, how much did the model catch

> **Note:** Accuracy alone can be misleading on imbalanced data (e.g. 99% of emails aren't spam) — precision and recall paint a fuller picture.


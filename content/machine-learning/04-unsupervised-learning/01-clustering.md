---
title: Clustering
---


Clustering groups similar data points together, with no predefined labels — the algorithm discovers the groups itself.

```python
from sklearn.cluster import KMeans

model = KMeans(n_clusters=3, random_state=42)
model.fit(X)
labels = model.labels_
```

Common use case: segmenting customers into groups based on purchasing behavior, without knowing the groups in advance.


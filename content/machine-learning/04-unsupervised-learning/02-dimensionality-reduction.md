---
title: Dimensionality Reduction
---


When you have many features (columns), it's often useful to reduce them to a smaller number while keeping most of the important information — both for visualization and to speed up other algorithms.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)
```

PCA (Principal Component Analysis) is the most common technique — it's especially handy for visualizing high-dimensional data in a simple 2D scatter plot.


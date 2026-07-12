---
title: Mini Project
---


Put it all together: predict whether a customer will churn (leave), using a small labeled dataset.

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

df = pd.read_csv("customers.csv")
X = df[["age", "monthly_spend", "support_tickets"]]
y = df["churned"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LogisticRegression()
model.fit(X_train_scaled, y_train)

predictions = model.predict(X_test_scaled)
print("Accuracy:", accuracy_score(y_test, predictions))
```

This mirrors the shape of most real supervised learning projects: load data → split → scale → train → evaluate.


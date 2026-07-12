---
title: Extracting Data
---


```python
links = soup.find_all("a")
for link in links:
    print(link.get("href"))

prices = soup.find_all("span", class_="price")
for price in prices:
    print(price.text.strip())
```

`find_all()` returns every matching element; `find()` returns only the first match. Filtering by `class_` (note the trailing underscore — `class` alone is a reserved Python word) is one of the most common ways to target specific data.


---
title: Handling Pagination
---


Many sites split data across multiple pages — scraping all of it means looping through page numbers.

```python
all_data = []
for page in range(1, 6):
    url = f"https://example.com/products?page={page}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    # extract data from this page into all_data
```

> **Tip:** Add `time.sleep(1)` between requests to avoid overwhelming the server — both a courtesy and often a requirement to avoid being blocked.


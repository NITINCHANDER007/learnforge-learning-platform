---
title: Making HTTP Requests
---


The `requests` library fetches a webpage's raw HTML.

```python
import requests

response = requests.get("https://example.com")
print(response.status_code)   # 200 means success
print(response.text[:200])     # first 200 characters of the HTML
```

> **Note:** Always check `response.status_code` before processing the result — `404` means "not found," `403` often means the site is blocking automated requests.


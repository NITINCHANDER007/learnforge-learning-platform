---
title: Parsing HTML
---


BeautifulSoup turns raw HTML text into a navigable structure you can search.

```python
from bs4 import BeautifulSoup
import requests

response = requests.get("https://example.com")
soup = BeautifulSoup(response.text, "html.parser")

print(soup.title.text)          # the page's <title> text
print(soup.find("h1").text)      # the first <h1> element's text
```


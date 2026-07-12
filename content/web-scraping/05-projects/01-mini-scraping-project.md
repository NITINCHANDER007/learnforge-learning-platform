---
title: Mini Scraping Project
---


Combine what you've learned into a small script that scrapes book titles and prices from a page, and saves them to a CSV.

```python
import requests, csv
from bs4 import BeautifulSoup

response = requests.get("https://example.com/books")
soup = BeautifulSoup(response.text, "html.parser")

books = []
for item in soup.find_all("div", class_="book"):
    title = item.find("h2").text.strip()
    price = item.find("span", class_="price").text.strip()
    books.append([title, price])

with open("books.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Title", "Price"])
    writer.writerows(books)
```

This pattern — request, parse, extract, save — is the shape of the vast majority of real scraping scripts.


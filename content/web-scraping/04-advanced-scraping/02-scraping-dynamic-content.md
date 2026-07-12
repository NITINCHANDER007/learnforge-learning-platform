---
title: Scraping Dynamic Content
---


`requests` only sees a page's initial HTML — content loaded afterward by JavaScript won't appear in `response.text`.

For JavaScript-rendered pages, you need a tool that actually runs a browser, such as **Selenium** or **Playwright**:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com")
    content = page.content()   # fully rendered HTML, including JS-loaded content
    browser.close()
```

This is slower than plain `requests`, so use it only when the data genuinely requires JavaScript to appear.


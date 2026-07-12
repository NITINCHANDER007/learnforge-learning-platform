---
title: Template Inheritance
---


Instead of repeating the same navbar and layout in every HTML file, define a base template once and extend it.

```html
<!-- base.html -->
<html>
<body>
    <nav>My Site</nav>
    {% block content %}{% endblock %}
</body>
</html>
```

```html
<!-- home.html -->
{% extends "base.html" %}
{% block content %}
    <h1>Welcome home!</h1>
{% endblock %}
```

`home.html` inherits everything from `base.html`, only filling in the `content` block — this avoids duplicating the layout across every page.

**Common mistake:** forgetting `{% extends %}` must be the very first line of the child template.


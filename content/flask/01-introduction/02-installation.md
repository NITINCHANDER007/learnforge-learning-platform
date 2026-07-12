---
title: Installation
---


Install Flask using pip, Python's package manager:

```bash
pip install flask
```

Verify it worked:

```bash
python3 -c "import flask; print(flask.__version__)"
```

> **Tip:** Use a **virtual environment** (`python -m venv venv`) for each project, so different projects' package versions don't conflict with each other.

**Common mistake:** installing Flask globally instead of inside a virtual environment — this works fine for one small project, but causes version conflicts once you have multiple projects with different requirements.


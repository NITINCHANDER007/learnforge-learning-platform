---
title: Installation
---


To practice SQL, you need a database engine running on your computer.

## Easiest option for beginners: SQLite

SQLite needs no installation or server setup — it's a single file. Many tools (including Python) support it out of the box.

```bash
python3
>>> import sqlite3
>>> conn = sqlite3.connect("test.db")
```

## For real-world practice: PostgreSQL or MySQL

1. Download **PostgreSQL** (postgresql.org) or **MySQL** (mysql.com)
2. Install with the default settings
3. Use a GUI tool like **DBeaver** or **pgAdmin** to run queries visually, without memorizing terminal commands

## Checking it worked (PostgreSQL example)

```bash
psql --version
```

> **Note:** For learning core SQL syntax, it barely matters which database you use — the differences only show up in advanced, database-specific features.

## Common mistake

Trying to learn SQL syntax and database server setup at the same time. If setup feels overwhelming, start with SQLite (zero setup) or a browser-based SQL playground instead.

## Tip

Several free websites let you run SQL queries directly in the browser, with no installation at all — great for pure practice before worrying about real installation.

## Practice question

Which database engine requires no server setup at all? *(Answer: SQLite)*


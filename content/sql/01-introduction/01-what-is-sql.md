---
title: What is SQL?
---


SQL (Structured Query Language) is how you talk to a database — you use it to ask for data, add data, change data, or delete data.

## Why learn SQL?

- Almost every application stores data in a database somewhere
- It's used across data analysis, backend development, and data science
- The core concepts barely change between databases (MySQL, PostgreSQL, SQLite, SQL Server)

## A tiny taste

```sql
SELECT name, age FROM users;
```

This asks the database: "give me the `name` and `age` columns from the `users` table."

> **Note:** SQL keywords like `SELECT` are traditionally written in UPPERCASE by convention — not required, but it makes queries much easier to read.

## Common mistake

Forgetting the semicolon `;` at the end of a statement — some tools require it, and it's good habit regardless.

## Interview tip

A common opener: *"What does SQL stand for, and what is it used for?"* Answer: **S**tructured **Q**uery **L**anguage — used to manage and query relational databases.

## Practice question

What does `SELECT * FROM users;` mean? *(Answer: get every column from every row in the `users` table — `*` means "all columns.")*


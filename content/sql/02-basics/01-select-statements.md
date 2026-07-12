---
title: SELECT Statements
---


`SELECT` is the most-used SQL command — it retrieves data from a table.

## Basic syntax

```sql
SELECT column1, column2 FROM table_name;
```

## Selecting all columns

```sql
SELECT * FROM employees;
```

## Selecting specific columns

```sql
SELECT first_name, salary FROM employees;
```

## Renaming columns in the output (aliases)

```sql
SELECT first_name AS name, salary AS pay FROM employees;
```

`AS` doesn't change the actual column name in the table — just how it's labeled in the results.

## Removing duplicates

```sql
SELECT DISTINCT department FROM employees;
```

Returns each unique department only once, even if many employees share one.

> **Note:** `SELECT *` is handy while exploring, but in real applications it's better to name exact columns — it's faster and clearer about exactly what data you're using.

## Common mistake

Forgetting that column names with spaces need quotes or brackets, e.g. `SELECT "first name" FROM employees;` — much easier to avoid spaces in column names entirely.

## Interview tip

Know `DISTINCT` cold — "how do you get unique values from a column?" is an extremely common quick question.

## Practice question

Write a query to get unique job titles from a `jobs` table.
```sql
SELECT DISTINCT job_title FROM jobs;
```


---
title: Aggregate Functions
---


Aggregate functions calculate a single value from many rows.

```sql
SELECT COUNT(*) FROM employees;          -- total number of rows
SELECT AVG(salary) FROM employees;       -- average salary
SELECT SUM(salary) FROM employees;       -- total of all salaries
SELECT MAX(salary) FROM employees;       -- highest salary
SELECT MIN(salary) FROM employees;       -- lowest salary
```

## Combining with GROUP BY

```sql
SELECT department, MAX(salary) AS top_salary
FROM employees
GROUP BY department;
```

## COUNT(*) vs COUNT(column)

```sql
SELECT COUNT(*) FROM employees;           -- counts all rows, including NULLs
SELECT COUNT(email) FROM employees;       -- counts only rows where email is NOT NULL
```

This is a subtle but real difference — `COUNT(column)` skips `NULL` values in that specific column, while `COUNT(*)` counts every row regardless.

> **Note:** Aggregate functions ignore `NULL` values (except `COUNT(*)`) — `AVG(salary)` averages only the rows that actually have a salary value.

## Common mistake

Assuming `COUNT(*)` and `COUNT(column)` always give the same result — they differ whenever that column contains `NULL` values.

## Interview tip

Know all five aggregate functions from memory (`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`) — they're the foundation of almost every real-world reporting query.

## Practice question

Write a query to find the average price of products in each category.
```sql
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category;
```


---
title: ORDER BY
---


`ORDER BY` sorts your query results.

```sql
SELECT * FROM employees ORDER BY salary;          -- ascending (default)
SELECT * FROM employees ORDER BY salary DESC;      -- descending
```

## Sorting by multiple columns

```sql
SELECT * FROM employees
ORDER BY department ASC, salary DESC;
```

This sorts by `department` first; within each department, employees are then sorted by `salary` from highest to lowest.

## Combining with WHERE

```sql
SELECT * FROM employees
WHERE department = 'Sales'
ORDER BY salary DESC;
```

> **Note:** `WHERE` always comes before `ORDER BY` in a query — SQL has a required clause order, and this is one of the most common places beginners get it wrong.

## Common mistake

```sql
SELECT * FROM employees ORDER BY salary DESC WHERE department = 'Sales';  -- ❌ wrong order
SELECT * FROM employees WHERE department = 'Sales' ORDER BY salary DESC; -- ✅ correct
```

## Interview tip

Memorize SQL's clause order: `SELECT → FROM → WHERE → GROUP BY → ORDER BY`. Getting this order right (both in real queries and when explaining it out loud) is a strong, simple signal of SQL fluency.

## Practice question

Write a query to list products by price, most expensive first.
```sql
SELECT * FROM products ORDER BY price DESC;
```


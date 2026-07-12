---
title: GROUP BY
---


`GROUP BY` groups rows that share a value, so you can calculate something for each group.

```sql
SELECT department, COUNT(*) FROM employees
GROUP BY department;
```

This answers: "how many employees are in each department?" — one row per department, with a count.

## GROUP BY with other aggregates

```sql
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
```

## Filtering groups with HAVING

```sql
SELECT department, COUNT(*) AS emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;
```

`WHERE` filters individual **rows** before grouping; `HAVING` filters **groups** after grouping. This distinction is one of the most important (and most-tested) SQL concepts.

> **Note:** Every column you `SELECT` that isn't inside an aggregate function (`COUNT`, `AVG`, etc.) must appear in the `GROUP BY` clause — otherwise the database won't know which value to show for that group.

## Common mistake

Using `WHERE` to filter on an aggregate result:

```sql
SELECT department, COUNT(*) FROM employees
WHERE COUNT(*) > 5    -- ❌ Error — WHERE can't use aggregate functions
GROUP BY department;

SELECT department, COUNT(*) FROM employees
GROUP BY department
HAVING COUNT(*) > 5;  -- ✅ correct
```

## Interview tip

Be ready to explain the `WHERE` vs `HAVING` difference in one sentence — it's one of the most commonly asked SQL interview questions of all.

## Mini quiz

1. Which clause filters rows before grouping? *(Answer: `WHERE`)*
2. Which clause filters groups after grouping? *(Answer: `HAVING`)*


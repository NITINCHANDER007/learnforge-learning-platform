---
title: Writing Subqueries
---


A subquery is a query nested inside another query — used when you need the result of one query to answer another.

## Subquery in a WHERE clause

```sql
SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

This finds every employee earning more than the **average** salary — the inner query calculates the average first, then the outer query uses it.

## Subquery with IN

```sql
SELECT name FROM employees
WHERE dept_id IN (
    SELECT id FROM departments WHERE dept_name = 'Sales'
);
```

## Subquery in the FROM clause

```sql
SELECT dept_id, AVG(salary) AS avg_salary
FROM (
    SELECT * FROM employees WHERE salary > 30000
) AS filtered_employees
GROUP BY dept_id;
```

Here, the subquery acts as a temporary, filtered table that the outer query then aggregates.

> **Note:** Subqueries run **first**, from the inside out — the database evaluates the innermost query, then uses that result in the outer query.

## Common mistake

Writing an overly complex subquery when a simple `JOIN` would be clearer and often faster. Subqueries are great for "compare against a single calculated value" (like an average) — for combining full tables of related data, a `JOIN` is usually the better tool.

## Interview tip

Be ready to write the "employees earning above the average salary" query from memory — it's one of the most frequently asked SQL interview questions, and demonstrates subqueries cleanly.

## Practice question

Write a query to find products priced above the average product price.
```sql
SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products);
```


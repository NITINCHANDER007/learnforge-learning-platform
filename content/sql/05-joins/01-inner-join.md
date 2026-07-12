---
title: Inner Join
---


Real data usually lives across multiple related tables. `JOIN` combines rows from two tables based on a shared column.

## Example setup

```
employees table:           departments table:
id | name  | dept_id       id | dept_name
1  | Ada   | 10             10 | Engineering
2  | Sam   | 20             20 | Sales
```

## INNER JOIN

```sql
SELECT employees.name, departments.dept_name
FROM employees
INNER JOIN departments
    ON employees.dept_id = departments.id;
```

Result: only employees that have a **matching** department show up. If an employee's `dept_id` doesn't match any row in `departments`, that employee is excluded entirely.

## Using table aliases (very common in real queries)

```sql
SELECT e.name, d.dept_name
FROM employees AS e
INNER JOIN departments AS d
    ON e.dept_id = d.id;
```

Aliases (`e`, `d`) keep long queries readable, especially with multiple joins.

> **Note:** `INNER JOIN` is the default kind of join — plain `JOIN` in most databases means the same thing as `INNER JOIN`.

## Common mistake

Forgetting the `ON` clause — without it, you get a **cross join** (every row combined with every other row), which usually isn't what you meant and can produce a huge, wrong result.

## Interview tip

"Explain a JOIN in your own words" is a nearly universal SQL interview question. Simple answer: *it combines rows from two tables where a specified condition matches.*

## Practice question

Using the tables above, what would `INNER JOIN` return if an employee's `dept_id` didn't match any department? *(Answer: that employee wouldn't appear in the results at all.)*


---
title: Outer Joins
---


Unlike `INNER JOIN`, outer joins keep rows even when there's no match on the other side.

## LEFT JOIN

```sql
SELECT e.name, d.dept_name
FROM employees AS e
LEFT JOIN departments AS d
    ON e.dept_id = d.id;
```

Keeps **every** employee, even ones with no matching department — `dept_name` shows as `NULL` for those.

## RIGHT JOIN

```sql
SELECT e.name, d.dept_name
FROM employees AS e
RIGHT JOIN departments AS d
    ON e.dept_id = d.id;
```

Keeps every department, even ones with no employees assigned.

## Quick way to remember

- `LEFT JOIN` → keep everything from the **left** (first-listed) table
- `RIGHT JOIN` → keep everything from the **right** (second-listed) table
- `INNER JOIN` → keep only rows that match in **both**

> **Note:** `RIGHT JOIN` is used far less often in practice — most people just rewrite the query with `LEFT JOIN` and swap the table order, since it's easier to read consistently.

## Common mistake

Using `LEFT JOIN` but then filtering with a `WHERE` clause on the right-hand table's column in a way that accidentally turns it back into an `INNER JOIN`:

```sql
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.dept_name = 'Sales';   -- ⚠️ this drops all the unmatched (NULL) rows anyway
```

## Interview tip

Be ready to explain `LEFT JOIN` vs `INNER JOIN` with a concrete example — e.g. "find all employees, including ones not yet assigned to a department" is a LEFT JOIN use case; "find only employees who have a department" is an INNER JOIN.

## Mini quiz

1. Which join keeps unmatched rows from the first table? *(Answer: `LEFT JOIN`)*
2. Which join type is used less often in practice, and why? *(Answer: `RIGHT JOIN` — people usually reorder tables and use `LEFT JOIN` instead, for consistency.)*


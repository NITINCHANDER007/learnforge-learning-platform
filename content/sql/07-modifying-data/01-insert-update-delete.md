---
title: INSERT, UPDATE, DELETE
---


So far we've only read data. These three commands change it.

## INSERT — adding new rows

```sql
INSERT INTO employees (name, department, salary)
VALUES ('Ada', 'Engineering', 65000);
```

## UPDATE — changing existing rows

```sql
UPDATE employees
SET salary = 70000
WHERE name = 'Ada';
```

## DELETE — removing rows

```sql
DELETE FROM employees
WHERE name = 'Ada';
```

> **⚠️ Critical note:** `UPDATE` and `DELETE` **without a `WHERE` clause affect every single row in the table.** This is one of the most damaging mistakes possible in SQL — always double-check your `WHERE` clause before running either command, especially on a real/production database.

```sql
UPDATE employees SET salary = 70000;   -- ⚠️ changes EVERY employee's salary!
DELETE FROM employees;                  -- ⚠️ deletes EVERY row in the table!
```

## Safer practice

Before running an `UPDATE` or `DELETE`, run the equivalent `SELECT` with the same `WHERE` clause first, to see exactly which rows will be affected:

```sql
SELECT * FROM employees WHERE name = 'Ada';   -- check first
DELETE FROM employees WHERE name = 'Ada';     -- then delete
```

## Common mistake

Running `DELETE FROM table_name;` intending to delete one row, but forgetting the `WHERE` clause — this deletes the entire table's data.

## Interview tip

Interviewers sometimes specifically ask about this danger — mentioning the "run a `SELECT` with the same `WHERE` clause first" habit is a strong, practical answer that shows real-world caution, not just textbook knowledge.

## Mini quiz

1. What happens if you run `UPDATE employees SET salary = 0;` with no `WHERE` clause? *(Answer: every employee's salary is set to 0.)*
2. What's a safe habit before running a real `DELETE`? *(Answer: run the equivalent `SELECT` with the same `WHERE` clause first, to confirm exactly which rows are affected.)*


---
title: The WHERE Clause
---


`WHERE` filters rows — it returns only the rows matching a condition.

```sql
SELECT * FROM employees WHERE department = 'Sales';
```

## Comparison operators

```sql
SELECT * FROM employees WHERE salary > 50000;
SELECT * FROM employees WHERE salary >= 50000;
SELECT * FROM employees WHERE department != 'Sales';
```

## Combining conditions

```sql
SELECT * FROM employees
WHERE department = 'Sales' AND salary > 50000;

SELECT * FROM employees
WHERE department = 'Sales' OR department = 'Marketing';
```

## Useful WHERE patterns

```sql
SELECT * FROM employees WHERE department IN ('Sales', 'Marketing');
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 60000;
SELECT * FROM employees WHERE name LIKE 'A%';        -- starts with A
SELECT * FROM employees WHERE email IS NULL;          -- missing values
```

> **Note:** Text values go in single quotes (`'Sales'`), numbers don't (`50000`).

## Common mistake

Using `=` to check for missing values instead of `IS NULL`:

```sql
WHERE email = NULL      -- ❌ never works, NULL isn't a normal value
WHERE email IS NULL     -- ✅ correct way to check for missing data
```

## Interview tip

`IN`, `BETWEEN`, and `LIKE` come up constantly in real queries and interviews — know all three from memory, not just plain `=` comparisons.

## Mini quiz

1. What does `LIKE 'A%'` match? *(Answer: any text starting with "A")*
2. How do you correctly check for a missing/NULL value? *(Answer: `IS NULL`, not `= NULL`)*


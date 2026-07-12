---
title: LIMIT
---


`LIMIT` restricts how many rows come back — useful for previewing data or building "top N" queries.

```sql
SELECT * FROM employees LIMIT 5;   -- only the first 5 rows
```

## A very common real pattern: "Top N"

```sql
SELECT * FROM employees
ORDER BY salary DESC
LIMIT 5;    -- the 5 highest-paid employees
```

## Skipping rows with OFFSET (for pagination)

```sql
SELECT * FROM employees
ORDER BY id
LIMIT 10 OFFSET 20;   -- skip the first 20 rows, then return the next 10
```

This is exactly how "page 3 of results" works in most applications.

> **Note:** Without `ORDER BY`, `LIMIT` returns an unpredictable set of rows — always pair `LIMIT` with `ORDER BY` when the specific rows matter (which is almost always).

## Common mistake

Using `LIMIT` without `ORDER BY` and assuming you'll always get "the first rows" — databases don't guarantee row order unless you explicitly sort.

## Interview tip

"How would you get the top 3 highest-paid employees?" is a very common SQL interview question — the answer is exactly the `ORDER BY ... LIMIT` pattern above. Have it memorized.

## Practice question

Write a query returning the 3 cheapest products.
```sql
SELECT * FROM products ORDER BY price ASC LIMIT 3;
```


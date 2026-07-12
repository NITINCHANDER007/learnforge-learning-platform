---
title: Relationships
---


When you load multiple tables, Power BI needs to know how they relate — similar to a SQL join, but defined visually rather than written as a query.

In the **Model view**, drag a field from one table onto the matching field in another to create a relationship (e.g. `Orders.customer_id` → `Customers.id`).

> **Note:** A correctly modeled relationship lets you build a single visual using fields from multiple tables at once — get this step wrong and your numbers will be silently incorrect.


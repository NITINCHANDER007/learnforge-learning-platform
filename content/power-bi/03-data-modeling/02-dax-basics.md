---
title: DAX Basics
---


DAX (Data Analysis Expressions) is Power BI's formula language, used for calculated columns and measures.

```
Total Sales = SUM(Orders[amount])

Sales Last Year = CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR(Calendar[Date])
)
```

A **measure** (like `Total Sales`) calculates dynamically based on whatever filters are currently applied on the report page — it's not a fixed, pre-computed number.


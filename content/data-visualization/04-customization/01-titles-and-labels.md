---
title: Titles and Labels
---


```python
plt.plot(days, sales)
plt.title("Weekly Sales", fontsize=14)
plt.xlabel("Day of Week")
plt.ylabel("Sales ($)")
plt.legend(["2024 Sales"])
plt.grid(True)
plt.show()
```

A chart without clear titles and axis labels is genuinely hard for anyone but you to interpret — always label both axes, even for "quick" exploratory charts you think no one else will see.


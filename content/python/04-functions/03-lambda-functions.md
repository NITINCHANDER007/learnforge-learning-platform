---
title: Lambda Functions
---


A lambda is a small, unnamed (anonymous) function written in a single line. It's used when you need a quick, throwaway function.

## Regular function vs lambda

```python
def square(x):
    return x * x

square_lambda = lambda x: x * x

print(square(5))         # 25
print(square_lambda(5))  # 25
```

Same result, different syntax. `lambda x: x * x` means "given `x`, return `x * x`" — no `def`, no `return` keyword needed.

## Where lambdas are commonly used

```python
numbers = [5, 2, 8, 1]
numbers.sort(key=lambda n: -n)   # sort descending
print(numbers)   # [8, 5, 2, 1]

# with map() — apply a function to every item
squared = list(map(lambda x: x * x, [1, 2, 3]))
print(squared)   # [1, 4, 9]
```

> **Note:** Lambdas can only contain a single expression — no multiple lines, no `if`/`else` blocks with statements (though a one-line conditional expression is allowed: `lambda x: "even" if x % 2 == 0 else "odd"`).

## Common mistake

Overusing lambdas for anything complex, which hurts readability. If a function needs more than one line of logic, write a regular `def` function instead.

## Interview tip

Interviewers often ask *"When would you use a lambda instead of a regular function?"* Good answer: for short, throwaway functions — especially as an argument to another function like `sort()`, `map()`, or `filter()` — not for anything with real logic or that you'll reuse elsewhere.

## Practice question

Write a lambda that returns `True` if a number is even.
```python
is_even = lambda n: n % 2 == 0
print(is_even(4))   # True
```


---
title: Polymorphism
---


Polymorphism means "many forms" — different classes can respond to the same method call in their own way.

```python
class Cat:
    def speak(self):
        print("Meow")

class Dog:
    def speak(self):
        print("Woof")

animals = [Cat(), Dog()]

for animal in animals:
    animal.speak()   # Meow, then Woof
```

Notice: the loop calls `.speak()` the exact same way for both objects, but each one behaves differently. That's polymorphism — the calling code doesn't need to know or care which specific class it's dealing with.

## Why it's useful

You can write code that works with **any** object that has a `.speak()` method, without needing to check its exact type first:

```python
def make_it_speak(animal):
    animal.speak()   # works for Cat, Dog, or any future class with speak()
```

> **Note:** Polymorphism works naturally with inheritance (method overriding, from the previous lesson) — that's actually the most common way it shows up in real code.

## Common mistake

Writing lots of `if isinstance(animal, Cat): ... elif isinstance(animal, Dog): ...` checks instead of just letting polymorphism handle it. If every class has the same method name, you usually don't need to check types at all.

## Interview tip

Interviewers like this question: *"What is polymorphism, and why is it useful?"* Good answer: it lets you write flexible code that works with multiple types through a shared interface — you add new classes without changing the code that uses them.

## Practice question

If you added a `class Bird` with its own `speak()` method to the `animals` list above, would the `for` loop need to change? *(Answer: No — that's the whole point of polymorphism.)*


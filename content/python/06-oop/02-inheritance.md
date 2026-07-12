---
title: Inheritance
---


Inheritance lets one class reuse the code of another class, and add or change behavior.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(f"{self.name} makes a sound")

class Dog(Animal):
    def speak(self):
        print(f"{self.name} barks")

a = Animal("Generic Animal")
d = Dog("Rex")

a.speak()   # Generic Animal makes a sound
d.speak()   # Rex barks
```

`Dog` **inherits** from `Animal` — it automatically gets `__init__` for free, and **overrides** `speak()` with its own version.

## Using the parent's version too

```python
class Dog(Animal):
    def speak(self):
        super().speak()          # call the parent's version first
        print(f"{self.name} also barks")
```

`super()` refers to the parent class, letting you extend behavior instead of fully replacing it.

> **Note:** Inheritance models an "is-a" relationship — a `Dog` **is an** `Animal`. If that relationship doesn't make logical sense, inheritance is probably the wrong tool.

## Common mistake

Overusing inheritance for things that aren't really related, just to "reuse code." If two classes don't have a genuine is-a relationship, prefer composition (one class containing another) instead.

## Interview tip

A common question: *"What is method overriding?"* Answer: when a child class defines a method with the same name as a parent class's method, replacing (or extending, via `super()`) its behavior.

## Mini quiz

1. What keyword lets a child class call its parent's method? *(Answer: `super()`)*
2. If `Dog` doesn't define its own `__init__`, whose `__init__` does it use? *(Answer: the parent `Animal` class's `__init__`)*


---
title: Classes and Objects
---


A class is a blueprint for creating objects. An object is a specific instance built from that blueprint.

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print(f"{self.name} says Woof!")

my_dog = Dog("Rex", 3)
my_dog.bark()   # Rex says Woof!
```

## Breaking it down

- `class Dog:` defines the blueprint
- `__init__` is a special method that runs automatically when you create a new object — it sets up the object's starting data
- `self` refers to "this specific object" — every method needs it as the first parameter
- `my_dog = Dog("Rex", 3)` creates an **instance** (an actual object) from the `Dog` class

## Why use classes?

Real-world things often have both **data** (name, age) and **behavior** (bark). Classes let you bundle both together, instead of managing separate variables and functions.

> **Note:** `self` isn't a Python keyword — it's just a convention (you could technically name it anything), but every Python developer uses `self`, so you should too.

## Common mistake

Forgetting `self` as the first parameter in a method:

```python
class Dog:
    def bark():        # ❌ missing self — will error when called
        print("Woof!")
```

## Interview tip

Be ready to explain `__init__` in one sentence: *it's the constructor — it runs automatically when an object is created, and sets up the object's initial data.*

## Practice question

Create a `Car` class with a `model` attribute and a `drive()` method that prints `"Driving the <model>"`.
```python
class Car:
    def __init__(self, model):
        self.model = model

    def drive(self):
        print(f"Driving the {self.model}")
```


---
title: Mini Project
---


Time to combine everything from this course into one small, real program: a simple **To-Do List** running in the terminal.

## The goal

Build a program that lets a user add tasks, view tasks, and mark tasks as done — using variables, loops, functions, lists, dictionaries, and error handling, all together.

```python
tasks = []

def show_tasks():
    if not tasks:
        print("No tasks yet.")
        return
    for i, task in enumerate(tasks):
        status = "✅" if task["done"] else "❌"
        print(f"{i}. {status} {task['title']}")

def add_task(title):
    tasks.append({"title": title, "done": False})

def complete_task(index):
    try:
        tasks[index]["done"] = True
    except IndexError:
        print("No task at that number.")

while True:
    print("\n1. Add task  2. Show tasks  3. Complete task  4. Quit")
    choice = input("Choose an option: ")

    if choice == "1":
        title = input("Task title: ")
        add_task(title)
    elif choice == "2":
        show_tasks()
    elif choice == "3":
        show_tasks()
        index = int(input("Task number to complete: "))
        complete_task(index)
    elif choice == "4":
        break
    else:
        print("Invalid option, try again.")
```

## What this project practices

- **Functions** — each action (`show_tasks`, `add_task`, `complete_task`) is its own function
- **Lists and dictionaries** — each task is a dictionary; all tasks live in a list
- **Loops** — the `while True:` loop keeps the program running until the user quits
- **Error handling** — `try`/`except` prevents a crash if the user enters an invalid task number

## Ideas to extend it yourself

- Save tasks to a file (using file handling) so they persist after the program closes
- Add a "delete task" option
- Add due dates using the `datetime` module

> **Tip:** Building small real projects like this — not just isolated exercises — is exactly what cements a language in your memory. Try extending this one before moving on.


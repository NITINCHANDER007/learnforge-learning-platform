"""
nav_engine.py

Computes Previous/Next navigation, current position, and total lesson
count for a lesson — derived entirely from the subject tree that
build_subject_tree() already produces for the sidebar.

This module is deliberately UI-independent: it never imports Flask,
never touches the filesystem, and never knows templates exist. It takes
a subject tree in and returns plain data out. That's what makes the
sidebar and the navigation engine impossible to drift out of sync —
they're two views over the exact same source of truth, never two
separate orderings that happen to agree.
"""


def build_nav_map(subject_tree):
    """
    Flatten a subject tree's sections into one ordered lesson sequence,
    then build a lookup of each lesson's previous/next neighbors,
    position, and the subject's total lesson count.

    Flattening this way (rather than treating each section separately)
    is what makes navigation continue naturally across section
    boundaries — the last lesson of one section simply points at the
    first lesson of the next, with no special-case code required.

    Returns a dict keyed by lesson slug:
        {"previous": lesson_or_None, "next": lesson_or_None,
         "position": int, "total": int}
    Returns {} if the subject has no lessons.
    """
    flat_lessons = [
        lesson
        for section in subject_tree["sections"]
        for lesson in section["lessons"]
    ]
    total = len(flat_lessons)

    nav_map = {}
    for index, lesson in enumerate(flat_lessons):
        nav_map[lesson["slug"]] = {
            "previous": flat_lessons[index - 1] if index > 0 else None,
            "next": flat_lessons[index + 1] if index < total - 1 else None,
            "position": index + 1,
            "total": total,
        }

    return nav_map


def get_lesson_nav(subject_tree, lesson_slug):
    """
    Convenience wrapper: build the nav map for a subject and return the
    entry for one specific lesson.

    Returns None if the lesson isn't found in the tree (the caller
    already validated the lesson exists via load_lesson() before this
    is called, so None here would indicate an unexpected inconsistency
    rather than an expected "not found" case).
    """
    nav_map = build_nav_map(subject_tree)
    return nav_map.get(lesson_slug)

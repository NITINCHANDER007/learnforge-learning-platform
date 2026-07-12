# LearnForge — Content Authoring Guide

This guide explains how to add and manage content on LearnForge without touching any application code. Everything below only involves editing files inside the `content/` folder.

## 1. How content works (the big picture)

LearnForge reads its entire site structure — subjects, sections, lessons, their order, and Previous/Next navigation — directly from the `content/` folder on every page load. There is no database and no admin panel. You manage the whole site with a text editor.

```
content/
└── python/                  ← a subject
    ├── subject.json           {"title": "Python"}
    └── 02-basics/            ← a section
        ├── section.json        {"title": "Basics"}
        └── 01-variables.md    ← a lesson
```

## 2. How to add a new subject

1. Create a folder inside `content/`, e.g. `content/javascript/`
2. Add a `subject.json` file inside it:
   ```json
   { "title": "JavaScript" }
   ```
3. Done — it appears in the top navigation automatically, sorted alphabetically.

A folder with no `subject.json` is ignored, so you can prepare a subject in advance without it going live.

## 3. How to add a section

1. Inside a subject folder, create a folder with a two-digit number prefix, e.g. `03-control-flow` — the number controls its position in the sidebar.
2. Add a `section.json` file inside it:
   ```json
   { "title": "Control Flow" }
   ```

A section with no lesson files is skipped entirely (no empty heading shown).

## 4. How to add a lesson

1. Inside a section folder, create a `.md` file with a two-digit number prefix, e.g. `03-loops.md`.
2. Start the file with a frontmatter block, then your content:
   ```markdown
   ---
   title: Loops
   ---

   Your lesson content goes here, written in Markdown.
   ```
3. Save. The lesson appears in the sidebar, gets its own URL (e.g. `/python/loops`), and is wired into Previous/Next automatically.

**Important:** the part of the filename after the number becomes the lesson's URL slug. Avoid renaming it once a lesson is live.

## 5. How lesson ordering works

Order is controlled entirely by the number prefix on folder and file names:

```
02-basics/
    01-variables.md      ← shown first
    02-data-types.md     ← shown second
    03-operators.md      ← shown third
```

To reorder, rename the number prefixes. To insert a lesson between two existing ones, renumber the surrounding files. Sections order the same way, using their folder name's prefix.

## 6. How Previous/Next updates automatically

You never edit Previous/Next links directly — they aren't stored anywhere. On every lesson page load, LearnForge:

1. Reads every section in the current subject, in order
2. Reads every lesson in each section, in order
3. Flattens all of it into one ordered list
4. Finds the current lesson's position in that list
5. Shows whatever comes immediately before/after it

This means navigation flows correctly **across sections** too — the last lesson of "Basics" automatically points to the first lesson of "Control Flow," with zero configuration. Add, remove, rename, or reorder a lesson, and every Previous/Next link updates itself on the next page load.

## 7. How Markdown works (quick reference)

```markdown
## Heading 2            → a section within the lesson
### Heading 3           → a sub-section

**bold text**
*italic text*

- bullet point
- another bullet

1. numbered step
2. another step

> A blockquote — good for callout notes or tips.

| Column A | Column B |
|----------|----------|
| value    | value    |

Inline code: `like_this()`
```

A fenced code block, optionally with a language name for readability:

````markdown
```python
def greet(name):
    return f"Hello, {name}!"
```
````

A plain link: `[link text](https://example.com)`

## 8. How to add images

1. Create an `images/` folder next to your lesson files:
   ```
   content/python/02-basics/images/variables-diagram.png
   ```
2. Reference it with a relative path:
   ```markdown
   ![A diagram showing variable assignment](images/variables-diagram.png)
   ```

Always write a meaningful description in the square brackets — that's the image's alt text, important for accessibility and for readers whose images fail to load.

## 9. How to embed YouTube videos

Markdown has no native video embed. The simplest approach that works everywhere is a plain link on its own line:

```markdown
Watch this concept explained on video:
[Watch on YouTube](https://www.youtube.com/watch?v=VIDEO_ID)
```

Raw HTML `<iframe>` embeds are **not** currently supported by the content pipeline — pasting one into a `.md` file won't render as a player. A true inline embedded player would need a small, deliberate template change; treat that as a feature request rather than something to work around in content files.

## 10. How to add downloadable files

1. Create a `files/` folder next to your lesson:
   ```
   content/python/10-projects/files/starter-code.zip
   ```
2. Link to it like any other link:
   ```markdown
   [Download the starter project](files/starter-code.zip)
   ```

Keep downloadable files reasonably small — they're served as static files, not through any upload system.

## Quick checklist for every new lesson

- [ ] File is inside the correct section folder
- [ ] Filename has a two-digit number prefix for ordering
- [ ] File starts with a `--- title: ... ---` frontmatter block
- [ ] Content is valid Markdown
- [ ] Any images/files referenced use the correct relative path
- [ ] Saved with a `.md` extension

That's the entire content workflow — no code, no database, no deployment step required to publish a change.

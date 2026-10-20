/**
 * lesson.js
 *
 * Loaded only on lesson pages (see lesson.html's {% block scripts %}).
 * Self-contained pieces, each independent of the others:
 *   1. Reading progress bar
 *   2. Copy-to-clipboard buttons + language label on code blocks
 *   3. Sticky table of contents, built from the rendered lesson body
 *   4. Scroll-spy active-heading highlight in that TOC
 *   5. Reading time estimate (word count / 200wpm)
 *
 * This is a deliberate, scoped exception to the zero-JavaScript approach
 * used everywhere else in LearnForge (sidebar collapse, mobile menu).
 * None of these features have a reliable pure-CSS equivalent: scroll
 * position, clipboard access, and intersection tracking are browser
 * APIs only JS can reach, and both the TOC and reading time need to
 * read already-rendered HTML, since content_loader.py's Markdown
 * pipeline (left untouched) doesn't label headings or count words.
 */
(function () {
    "use strict";

    /* ---------- 1. Reading progress bar ---------- */
    function initReadingProgress() {
        var bar = document.getElementById("reading-progress-bar");
        var body = document.getElementById("lesson-body");
        if (!bar || !body) return;

        function update() {
            var rect = body.getBoundingClientRect();
            var total = rect.height - window.innerHeight;
            if (total <= 0) {
                bar.style.width = "100%";
                return;
            }
            var scrolled = Math.min(Math.max(-rect.top, 0), total);
            bar.style.width = (scrolled / total * 100) + "%";
        }

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    }

    /* ---------- 2. Copy-to-clipboard + language label on code blocks ---------- */
    function initCodeBlocks() {
        var blocks = document.querySelectorAll("#lesson-body pre");
        blocks.forEach(function (pre) {
            pre.style.position = "relative";

            // python-markdown's fenced_code extension adds a
            // "language-python" (etc.) class to the <code> element when
            // a lesson author writes ```python — reading that back out
            // lets us show a small label, entirely from data that's
            // already there, no Markdown pipeline change needed.
            var code = pre.querySelector("code");
            var langClass = code && Array.prototype.find.call(
                code.classList, function (c) { return c.indexOf("language-") === 0; }
            );
            if (langClass) {
                var label = document.createElement("span");
                label.className = "code-lang-label";
                label.textContent = langClass.replace("language-", "");
                pre.appendChild(label);
            }

            var actionGroup = document.createElement("div");
            actionGroup.className = "code-action-group";

            var runBtn = document.createElement("a");
            runBtn.className = "code-run-btn";
            runBtn.textContent = "▶ Run";
            runBtn.title = "Run this code in LearnForge Playground";
            var snippet = code ? code.textContent : pre.textContent;
            runBtn.href = "/playground?code=" + encodeURIComponent(snippet);
            runBtn.target = "_blank";
            actionGroup.appendChild(runBtn);

            actionGroup.appendChild(button);
            pre.appendChild(actionGroup);
        });
    }

    /* ---------- 3 & 4. Table of contents + scroll-spy highlight ---------- */
    function initTableOfContents() {
        var body = document.getElementById("lesson-body");
        var tocAside = document.getElementById("lesson-toc");
        var tocNav = document.getElementById("lesson-toc-nav");
        if (!body || !tocAside || !tocNav) return;

        var headings = body.querySelectorAll("h2, h3");
        if (headings.length < 2) {
            // Not enough structure in this lesson to make a TOC worth
            // showing — hide the rail entirely rather than show an
            // almost-empty one.
            tocAside.style.display = "none";
            return;
        }

        var usedIds = {};
        var linksByHeadingId = {};

        headings.forEach(function (heading) {
            if (!heading.id) {
                var base = heading.textContent
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-");
                var id = base;
                var counter = 1;
                while (usedIds[id]) {
                    id = base + "-" + counter;
                    counter++;
                }
                usedIds[id] = true;
                heading.id = id;
            }

            var link = document.createElement("a");
            link.href = "#" + heading.id;
            link.textContent = heading.textContent;
            link.className = "lesson-toc__link lesson-toc__link--" + heading.tagName.toLowerCase();
            tocNav.appendChild(link);
            linksByHeadingId[heading.id] = link;
        });

        // Scroll-spy: highlight whichever heading is currently nearest
        // the top of the viewport. IntersectionObserver is the standard
        // browser API for this — far cheaper than a manual scroll
        // listener recalculating positions on every frame.
        if ("IntersectionObserver" in window) {
            var activeLink = null;
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var link = linksByHeadingId[entry.target.id];
                    if (!link) return;
                    if (activeLink) activeLink.classList.remove("lesson-toc__link--active");
                    link.classList.add("lesson-toc__link--active");
                    activeLink = link;
                });
            }, { rootMargin: "0px 0px -70% 0px", threshold: 0 });

            headings.forEach(function (heading) {
                observer.observe(heading);
            });
        }
    }

    /* ---------- 5. Reading time estimate ---------- */
    function initReadingTime() {
        var body = document.getElementById("lesson-body");
        var meta = document.getElementById("lesson-reading-time");
        if (!body || !meta) return;

        var wordCount = body.textContent.trim().split(/\s+/).filter(Boolean).length;
        var minutes = Math.max(1, Math.round(wordCount / 200));
        meta.textContent = minutes + " min read";
        meta.hidden = false;
    }

    /* ---------- 6. Interactive Knowledge Check Quiz ---------- */
    function initLessonQuiz() {
        var container = document.getElementById("quiz-container");
        var scoreIndicator = document.getElementById("quiz-score-indicator");
        if (!container) return;

        var lessonTitle = container.getAttribute("data-title") || "this topic";
        var subjectSlug = container.getAttribute("data-subject") || "general";

        var questionBank = {
            python: [
                {
                    q: "What is the primary benefit of Python's clean, high-level syntax?",
                    options: [
                        "It maximizes developer productivity and readability",
                        "It prevents all logical runtime errors automatically",
                        "It eliminates the need for unit testing"
                    ],
                    correct: 0,
                    explanation: "Python prioritizes clean, expressive code so engineers can write maintainable applications quickly."
                },
                {
                    q: "Which keyword is used to handle exceptions gracefully in Python?",
                    options: ["catch", "except", "rescue"],
                    correct: 1,
                    explanation: "Python uses try/except blocks to catch and handle runtime exceptions."
                }
            ],
            sql: [
                {
                    q: "Which SQL clause is used to filter records before any GROUP BY grouping occurs?",
                    options: ["HAVING", "WHERE", "ORDER BY"],
                    correct: 1,
                    explanation: "WHERE filters rows before aggregation; HAVING filters after grouping."
                },
                {
                    q: "What uniquely identifies every individual row in a relational database table?",
                    options: ["Primary Key", "Foreign Key", "Unique Index"],
                    correct: 0,
                    explanation: "A Primary Key enforces entity integrity and uniqueness for table records."
                }
            ],
            "file-handling": [
                {
                    q: "Why is 'with open(...)' the recommended practice for opening files in Python?",
                    options: [
                        "It acts as a context manager that guarantees the file is closed even on errors",
                        "It automatically rewrites files into binary format",
                        "It locks the filesystem preventing all other processes"
                    ],
                    correct: 0,
                    explanation: "The with statement automatically cleans up and closes files properly."
                },
                {
                    q: "Which mode should you use to append new records without deleting existing file content?",
                    options: ["'w'", "'a'", "'r+'"],
                    correct: 1,
                    explanation: "'a' opens the file for writing and appends content at the end without truncating."
                }
            ],
            general: [
                {
                    q: "What is the recommended approach when implementing concepts from " + lessonTitle + "?",
                    options: [
                        "Write clean modular code and verify with tests incrementally",
                        "Combine all logic into a single monolithic function",
                        "Omit comments and edge-case validation"
                    ],
                    correct: 0,
                    explanation: "Modular, well-tested code is easier to maintain, scale, and debug."
                },
                {
                    q: "When debugging an issue in " + lessonTitle + ", what is the best first step?",
                    options: [
                        "Check error logs and trace data flow step-by-step",
                        "Reinstall the operating system",
                        "Disable all error handling completely"
                    ],
                    correct: 0,
                    explanation: "Inspecting stack traces and input values isolates the root cause rapidly."
                }
            ]
        };

        var questions = questionBank[subjectSlug] || questionBank.general;
        var answeredCount = 0;
        var correctCount = 0;

        function renderQuiz() {
            container.innerHTML = "";
            answeredCount = 0;
            correctCount = 0;
            if (scoreIndicator) scoreIndicator.textContent = "";

            questions.forEach(function (item, qIndex) {
                var card = document.createElement("div");
                card.className = "quiz-question-card";

                var qTitle = document.createElement("div");
                qTitle.className = "quiz-question-text";
                qTitle.textContent = (qIndex + 1) + ". " + item.q;
                card.appendChild(qTitle);

                var optionsList = document.createElement("div");
                optionsList.className = "quiz-options-list";

                item.options.forEach(function (optText, optIndex) {
                    var btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "quiz-option-btn";
                    btn.textContent = optText;

                    btn.addEventListener("click", function () {
                        var allBtns = optionsList.querySelectorAll(".quiz-option-btn");
                        allBtns.forEach(function (b) { b.disabled = true; });

                        var feedback = document.createElement("div");
                        feedback.className = "quiz-feedback";

                        if (optIndex === item.correct) {
                            btn.classList.add("quiz-correct");
                            feedback.classList.add("quiz-feedback--correct");
                            feedback.innerHTML = "<strong>✓ Correct!</strong> " + item.explanation;
                            correctCount++;
                        } else {
                            btn.classList.add("quiz-incorrect");
                            allBtns[item.correct].classList.add("quiz-correct");
                            feedback.classList.add("quiz-feedback--incorrect");
                            feedback.innerHTML = "<strong>✗ Incorrect.</strong> " + item.explanation;
                        }
                        card.appendChild(feedback);

                        answeredCount++;
                        if (scoreIndicator) {
                            scoreIndicator.textContent = "Score: " + correctCount + "/" + questions.length;
                        }

                        if (answeredCount === questions.length) {
                            var retryBtn = document.createElement("button");
                            retryBtn.type = "button";
                            retryBtn.className = "btn btn-secondary";
                            retryBtn.style.marginTop = "12px";
                            retryBtn.style.fontSize = "13px";
                            retryBtn.textContent = "🔄 Retake Quiz";
                            retryBtn.addEventListener("click", renderQuiz);
                            container.appendChild(retryBtn);
                        }
                    });

                    optionsList.appendChild(btn);
                });

                card.appendChild(optionsList);
                container.appendChild(card);
            });
        }

        renderQuiz();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initReadingProgress();
        initCodeBlocks();
        initTableOfContents();
        initReadingTime();
        initLessonQuiz();
    });
})();

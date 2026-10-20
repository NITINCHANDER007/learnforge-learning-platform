/**
 * main.js - LearnForge global scripts
 * Handles theme toggling, live keyboard-accessible search, and counter animations.
 */
(function () {
    "use strict";

    /* ---------- Theme Toggle ---------- */
    function initTheme() {
        const toggleBtn = document.getElementById("theme-toggle");
        if (!toggleBtn) return;

        function updateToggleIcon() {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            toggleBtn.textContent = currentTheme === "dark" ? "☀️" : "🌙";
            toggleBtn.setAttribute(
                "aria-label",
                currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        updateToggleIcon();

        toggleBtn.addEventListener("click", function () {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateToggleIcon();
        });
    }

    /* ---------- Live Search & Keyboard Shortcuts ---------- */
    function initSearch() {
        const input = document.getElementById("global-search-input");
        const dropdown = document.getElementById("search-dropdown-menu");
        if (!input || !dropdown) return;

        let debounceTimer = null;
        let selectedIndex = -1;

        // Shortcut: '/' or 'Ctrl+K' / 'Cmd+K' to focus search
        document.addEventListener("keydown", function (e) {
            const isEditing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
                              document.activeElement.isContentEditable;

            if (e.key === "/" && !isEditing) {
                e.preventDefault();
                input.focus();
                input.select();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });

        // Search input event
        input.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            const query = input.value.trim();

            if (!query) {
                dropdown.style.display = "none";
                dropdown.innerHTML = "";
                selectedIndex = -1;
                return;
            }

            debounceTimer = setTimeout(function () {
                fetch("/api/search?q=" + encodeURIComponent(query))
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        renderResults(data.results || [], query);
                    })
                    .catch(function () {
                        dropdown.style.display = "none";
                    });
            }, 200);
        });

        function renderResults(results, query) {
            selectedIndex = -1;
            if (!results.length) {
                dropdown.innerHTML = '<div style="padding: 10px; font-size: 13px; color: var(--color-text-secondary); text-align: center;">No lessons found</div>';
                dropdown.style.display = "block";
                return;
            }

            let html = "";
            results.slice(0, 7).forEach(function (r, i) {
                html += '<a href="' + r.url + '" class="search-dropdown__item" data-index="' + i + '">' +
                        '<span class="search-dropdown__item-subject">' + escapeHtml(r.subject_title) + '</span>' +
                        '<span class="search-dropdown__item-title">' + escapeHtml(r.lesson_title) + '</span>' +
                        '<span class="search-dropdown__item-snippet">' + escapeHtml(r.snippet) + '</span>' +
                        '</a>';
            });
            html += '<div style="border-top: 1px solid var(--color-border); padding: 6px 12px; margin-top: 4px; font-size: 11px; color: var(--color-text-secondary); text-align: right;">' +
                    '<a href="/search?q=' + encodeURIComponent(query) + '" style="color: var(--color-accent); text-decoration: none;">View all results &rarr;</a></div>';

            dropdown.innerHTML = html;
            dropdown.style.display = "block";
        }

        function escapeHtml(str) {
            const div = document.createElement("div");
            div.textContent = str || "";
            return div.innerHTML;
        }

        // Keyboard navigation in search dropdown
        input.addEventListener("keydown", function (e) {
            const items = dropdown.querySelectorAll(".search-dropdown__item");
            if (!items.length || dropdown.style.display === "none") return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection(items);
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (e.key === "Escape") {
                dropdown.style.display = "none";
            }
        });

        function updateSelection(items) {
            items.forEach(function (item, idx) {
                if (idx === selectedIndex) {
                    item.classList.add("selected");
                    item.scrollIntoView({ block: "nearest" });
                } else {
                    item.classList.remove("selected");
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });
    }

    /* ---------- Animated Stat Counters ---------- */
    function initCounters() {
        const counters = document.querySelectorAll("[data-counter]");
        if (!counters.length) return;

        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return; // Keep initial static server-rendered values
        }

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        counters.forEach(function (counter) {
            observer.observe(counter);
        });

        function animateCounter(el) {
            const target = parseInt(el.getAttribute("data-target"), 10);
            if (isNaN(target)) return;
            const suffix = el.getAttribute("data-suffix") || "";
            const duration = 800; // ms
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutQuad
                const ease = progress * (2 - progress);
                const currentVal = Math.floor(ease * target);

                el.textContent = currentVal + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target + suffix;
                }
            }

            requestAnimationFrame(update);
        }
    }

    /* ---------- Initialize on DOM Ready ---------- */
    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initSearch();
        initCounters();
    });
})();

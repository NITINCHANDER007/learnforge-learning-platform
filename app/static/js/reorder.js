/**
 * reorder.js
 *
 * Powers the admin drag-and-drop reorder pages (subjects, sections,
 * lessons — one shared template, admin/reorder.html). Uses the native
 * HTML5 Drag and Drop API, no external sortable-list library needed.
 *
 * This is admin-only tooling, not part of the public site — consistent
 * with how lesson.js is the one other deliberate, scoped exception to
 * DataDrix's otherwise zero-JavaScript approach.
 */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const list = document.getElementById("reorder-list");
        const saveBtn = document.getElementById("reorder-save-btn");
        const status = document.getElementById("reorder-status");
        if (!list || !saveBtn) return;

        let draggingItem = null;

        list.addEventListener("dragstart", function (e) {
            draggingItem = e.target.closest(".reorder-item");
            if (!draggingItem) return;
            draggingItem.classList.add("reorder-item--dragging");
            e.dataTransfer.effectAllowed = "move";
        });

        list.addEventListener("dragend", function () {
            if (draggingItem) draggingItem.classList.remove("reorder-item--dragging");
            draggingItem = null;
        });

        list.addEventListener("dragover", function (e) {
            e.preventDefault();
            const target = e.target.closest(".reorder-item");
            if (!target || target === draggingItem || !draggingItem) return;

            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                list.insertBefore(draggingItem, target);
            } else {
                list.insertBefore(draggingItem, target.nextSibling);
            }
        });

        saveBtn.addEventListener("click", function () {
            const orderedSlugs = Array.from(list.querySelectorAll(".reorder-item"))
                .map(function (li) { return li.dataset.slug; });

            status.textContent = "Saving…";

            fetch(list.dataset.saveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": list.dataset.csrfToken,
                },
                body: JSON.stringify(orderedSlugs),
            })
                .then(function (response) {
                    if (!response.ok) throw new Error("Save failed");
                    return response.json();
                })
                .then(function () {
                    status.textContent = "Saved ✓";
                    setTimeout(function () { status.textContent = ""; }, 2000);
                })
                .catch(function () {
                    status.textContent = "Could not save — please try again.";
                });
        });
    });
})();

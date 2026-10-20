/**
 * lesson_builder.js
 *
 * A block-based visual editor for lesson content, loaded only on the
 * admin lesson create/edit pages. Blocks are plain JS objects; this
 * file's whole job is: render an editable UI for each block, let the
 * admin add/edit/delete/duplicate/reorder blocks, and keep two other
 * things in sync with that block list on every change:
 *   1. The real <textarea> that LessonForm.body actually submits —
 *      populated with generated Markdown text.
 *   2. A live preview pane — rendered directly from block data (not by
 *      parsing the generated Markdown), reusing the site's real
 *      .lesson__body CSS classes so it's pixel-accurate to the real
 *      lesson page, with no client-side Markdown parser needed at all.
 *
 * This is a deliberate, scoped exception to LearnForge's otherwise
 * zero-JavaScript approach — a block editor has no meaningful pure-CSS
 * equivalent. It's admin-only tooling, same category as reorder.js.
 *
 * IMPORTANT: this file never changes what Markdown means to the rest
 * of the app. It only ever produces plain text that the *existing*
 * python-markdown pipeline (content_loader.py, untouched) already
 * knows how to render — fenced code blocks, pipe tables, blockquotes,
 * images, links. Nothing here is a new syntax the renderer must learn.
 */
(function () {
    "use strict";

    const CODE_LANGUAGES = ["python", "sql", "html", "css", "javascript", "bash", "json", "text"];

    const BLOCK_DEFS = {
        heading:    { label: "Heading",         defaultData: () => ({ level: 2, text: "" }) },
        paragraph:  { label: "Paragraph",        defaultData: () => ({ text: "" }) },
        bullets:    { label: "Bullet List",      defaultData: () => ({ items: [""] }) },
        numbered:   { label: "Numbered List",    defaultData: () => ({ items: [""] }) },
        code:       { label: "Code Block",       defaultData: () => ({ language: "python", code: "" }) },
        note:       { label: "Note",             defaultData: () => ({ text: "" }) },
        tip:        { label: "Tip",              defaultData: () => ({ text: "" }) },
        warning:    { label: "Warning",          defaultData: () => ({ text: "" }) },
        image:      { label: "Image",            defaultData: () => ({ url: "", alt: "" }) },
        table:      { label: "Table",            defaultData: () => ({ headers: ["", ""], rows: [["", ""]] }) },
        quote:      { label: "Quote",            defaultData: () => ({ text: "" }) },
        divider:    { label: "Divider",          defaultData: () => ({}) },
        file:       { label: "File Attachment",  defaultData: () => ({ url: "", label: "" }) },
        youtube:    { label: "YouTube Embed",    defaultData: () => ({ url: "" }) },
    };

    let blocks = [];
    let blockIdCounter = 0;

    let rootEl, textarea, previewEl;

    /* ---------- Markdown generation (one function per block type) ---------- */

    function escapeForTable(text) {
        return (text || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    }

    function blockToMarkdown(block) {
        const d = block.data;
        switch (block.type) {
            case "heading":
                return "#".repeat(d.level) + " " + (d.text || "");
            case "paragraph":
                return d.text || "";
            case "bullets":
                return (d.items || []).filter(Boolean).map(function (i) { return "- " + i; }).join("\n");
            case "numbered":
                return (d.items || []).filter(Boolean).map(function (i, idx) { return (idx + 1) + ". " + i; }).join("\n");
            case "code":
                return "```" + (d.language || "text") + "\n" + (d.code || "") + "\n```";
            case "note":
                return "> **Note:** " + (d.text || "");
            case "tip":
                return "> **Tip:** " + (d.text || "");
            case "warning":
                return "> **⚠️ Warning:** " + (d.text || "");
            case "image":
                return "![" + (d.alt || "") + "](" + (d.url || "") + ")";
            case "table": {
                const headers = d.headers || [];
                const rows = d.rows || [];
                const headerLine = "| " + headers.map(escapeForTable).join(" | ") + " |";
                const sepLine = "|" + headers.map(function () { return "---"; }).join("|") + "|";
                const rowLines = rows.map(function (row) {
                    return "| " + row.map(escapeForTable).join(" | ") + " |";
                });
                return [headerLine, sepLine].concat(rowLines).join("\n");
            }
            case "quote":
                return "> " + (d.text || "");
            case "divider":
                return "---";
            case "file":
                return "[" + (d.label || "Download") + "](" + (d.url || "") + ")";
            case "youtube": {
                const vidId = extractYouTubeId(d.url);
                if (vidId) {
                    return '<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/' + vidId + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
                }
                return "[Watch on YouTube](" + (d.url || "") + ")";
            }
            default:
                return "";
        }
    }

    function extractYouTubeId(url) {
        if (!url) return null;
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
    }

    function generateMarkdown() {
        return blocks.map(blockToMarkdown).join("\n\n");
    }

    /* ---------- Live preview (rendered directly from block data) ---------- */

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text || "";
        return div.innerHTML;
    }

    function blockToPreviewHtml(block) {
        const d = block.data;
        switch (block.type) {
            case "heading":
                return "<h" + Math.min(d.level + 1, 6) + ">" + escapeHtml(d.text) + "</h" + Math.min(d.level + 1, 6) + ">";
            case "paragraph":
                return "<p>" + escapeHtml(d.text) + "</p>";
            case "bullets":
                return "<ul>" + (d.items || []).filter(Boolean).map(function (i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("") + "</ul>";
            case "numbered":
                return "<ol>" + (d.items || []).filter(Boolean).map(function (i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("") + "</ol>";
            case "code":
                return "<pre><code>" + escapeHtml(d.code) + "</code></pre>";
            case "note":
                return "<blockquote><p><strong>Note:</strong> " + escapeHtml(d.text) + "</p></blockquote>";
            case "tip":
                return "<blockquote><p><strong>Tip:</strong> " + escapeHtml(d.text) + "</p></blockquote>";
            case "warning":
                return "<blockquote><p><strong>⚠️ Warning:</strong> " + escapeHtml(d.text) + "</p></blockquote>";
            case "image":
                return d.url ? "<img src=\"" + escapeHtml(d.url) + "\" alt=\"" + escapeHtml(d.alt) + "\">" : "<p><em>(no image URL yet)</em></p>";
            case "table": {
                const headers = d.headers || [];
                const rows = d.rows || [];
                let html = "<table><tr>" + headers.map(function (h) { return "<th>" + escapeHtml(h) + "</th>"; }).join("") + "</tr>";
                rows.forEach(function (row) {
                    html += "<tr>" + row.map(function (c) { return "<td>" + escapeHtml(c) + "</td>"; }).join("") + "</tr>";
                });
                return html + "</table>";
            }
            case "quote":
                return "<blockquote><p>" + escapeHtml(d.text) + "</p></blockquote>";
            case "divider":
                return "<hr>";
            case "file":
                return "<p>📎 <a href=\"#\">" + escapeHtml(d.label || "Download") + "</a></p>";
            case "youtube": {
                const vidId = extractYouTubeId(d.url);
                if (vidId) {
                    return '<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/' + vidId + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
                }
                return '<p>▶ <a href="' + escapeHtml(d.url || "#") + '" target="_blank" rel="noopener">Watch on YouTube</a></p>';
            }
            default:
                return "";
        }
    }

    function renderPreview() {
        if (!previewEl) return;
        previewEl.innerHTML = blocks.map(blockToPreviewHtml).join("");
    }

    function syncTextarea() {
        if (textarea) textarea.value = generateMarkdown();
    }

    function onBlocksChanged() {
        syncTextarea();
        renderPreview();
    }

    /* ---------- Block list operations ---------- */

    function addBlock(type, index) {
        const block = { id: "b" + (blockIdCounter++), type: type, data: BLOCK_DEFS[type].defaultData() };
        if (index === undefined) {
            blocks.push(block);
        } else {
            blocks.splice(index + 1, 0, block);
        }
        renderBuilder();
        onBlocksChanged();
    }

    function deleteBlock(id) {
        blocks = blocks.filter(function (b) { return b.id !== id; });
        renderBuilder();
        onBlocksChanged();
    }

    function duplicateBlock(id) {
        const index = blocks.findIndex(function (b) { return b.id === id; });
        if (index === -1) return;
        const copy = JSON.parse(JSON.stringify(blocks[index]));
        copy.id = "b" + (blockIdCounter++);
        blocks.splice(index + 1, 0, copy);
        renderBuilder();
        onBlocksChanged();
    }

    function moveBlock(id, direction) {
        const index = blocks.findIndex(function (b) { return b.id === id; });
        const target = index + direction;
        if (index === -1 || target < 0 || target >= blocks.length) return;
        const [item] = blocks.splice(index, 1);
        blocks.splice(target, 0, item);
        renderBuilder();
        onBlocksChanged();
    }

    /* ---------- Editable field rendering per block type ---------- */

    function renderBlockFields(block) {
        const d = block.data;
        const wrap = document.createElement("div");
        wrap.className = "lb-block__fields";

        function textInput(labelText, value, onInput, multiline) {
            const field = document.createElement("div");
            field.className = "lb-field";
            const label = document.createElement("label");
            label.textContent = labelText;
            const input = document.createElement(multiline ? "textarea" : "input");
            if (!multiline) input.type = "text";
            input.value = value || "";
            input.addEventListener("input", function () {
                onInput(input.value);
                onBlocksChanged();
            });
            field.appendChild(label);
            field.appendChild(input);
            return field;
        }

        switch (block.type) {
            case "heading": {
                const select = document.createElement("select");
                [1, 2, 3, 4].forEach(function (lvl) {
                    const opt = document.createElement("option");
                    opt.value = lvl; opt.textContent = "H" + lvl;
                    if (d.level === lvl) opt.selected = true;
                    select.appendChild(opt);
                });
                select.addEventListener("change", function () { d.level = parseInt(select.value, 10); onBlocksChanged(); });
                const field = document.createElement("div");
                field.className = "lb-field";
                field.appendChild(select);
                wrap.appendChild(field);
                wrap.appendChild(textInput("Heading text", d.text, function (v) { d.text = v; }));
                break;
            }
            case "paragraph":
                wrap.appendChild(textInput("Text", d.text, function (v) { d.text = v; }, true));
                break;
            case "bullets":
            case "numbered":
                (d.items || []).forEach(function (item, i) {
                    wrap.appendChild(textInput("Item " + (i + 1), item, function (v) { d.items[i] = v; }));
                });
                const addBtn = document.createElement("button");
                addBtn.type = "button";
                addBtn.className = "btn btn-secondary lb-small-btn";
                addBtn.textContent = "+ Add item";
                addBtn.addEventListener("click", function () { d.items.push(""); renderBuilder(); onBlocksChanged(); });
                wrap.appendChild(addBtn);
                break;
            case "code": {
                const select = document.createElement("select");
                CODE_LANGUAGES.forEach(function (lang) {
                    const opt = document.createElement("option");
                    opt.value = lang; opt.textContent = lang;
                    if (d.language === lang) opt.selected = true;
                    select.appendChild(opt);
                });
                select.addEventListener("change", function () { d.language = select.value; onBlocksChanged(); });
                const field = document.createElement("div");
                field.className = "lb-field";
                field.appendChild(select);
                wrap.appendChild(field);
                wrap.appendChild(textInput("Code", d.code, function (v) { d.code = v; }, true));
                break;
            }
            case "note":
            case "tip":
            case "warning":
            case "quote":
                wrap.appendChild(textInput("Text", d.text, function (v) { d.text = v; }, true));
                break;
            case "image":
                wrap.appendChild(textInput("Image URL (e.g. images/diagram.png)", d.url, function (v) { d.url = v; }));
                wrap.appendChild(textInput("Alt text (required for accessibility)", d.alt, function (v) { d.alt = v; }));
                break;
            case "table": {
                const headerRow = document.createElement("div");
                headerRow.className = "lb-table-row";
                (d.headers || []).forEach(function (h, i) {
                    const input = document.createElement("input");
                    input.type = "text"; input.value = h; input.placeholder = "Header " + (i + 1);
                    input.addEventListener("input", function () { d.headers[i] = input.value; onBlocksChanged(); });
                    headerRow.appendChild(input);
                });
                wrap.appendChild(headerRow);

                (d.rows || []).forEach(function (row, r) {
                    const rowEl = document.createElement("div");
                    rowEl.className = "lb-table-row";
                    row.forEach(function (cell, c) {
                        const input = document.createElement("input");
                        input.type = "text"; input.value = cell; input.placeholder = "Row " + (r + 1);
                        input.addEventListener("input", function () { d.rows[r][c] = input.value; onBlocksChanged(); });
                        rowEl.appendChild(input);
                    });
                    wrap.appendChild(rowEl);
                });

                const addRowBtn = document.createElement("button");
                addRowBtn.type = "button";
                addRowBtn.className = "btn btn-secondary lb-small-btn";
                addRowBtn.textContent = "+ Add row";
                addRowBtn.addEventListener("click", function () {
                    d.rows.push(d.headers.map(function () { return ""; }));
                    renderBuilder(); onBlocksChanged();
                });
                wrap.appendChild(addRowBtn);
                break;
            }
            case "divider":
                wrap.appendChild(document.createTextNode("A horizontal rule — no options needed."));
                break;
            case "file":
                wrap.appendChild(textInput("File URL (e.g. files/starter.zip)", d.url, function (v) { d.url = v; }));
                wrap.appendChild(textInput("Link text", d.label, function (v) { d.label = v; }));
                break;
            case "youtube":
                wrap.appendChild(textInput("YouTube URL", d.url, function (v) { d.url = v; }));
                break;
        }

        return wrap;
    }

    /* ---------- Block card + toolbar rendering ---------- */

    function renderBlockCard(block, index) {
        const card = document.createElement("div");
        card.className = "lb-block";

        const header = document.createElement("div");
        header.className = "lb-block__header";

        const label = document.createElement("span");
        label.className = "lb-block__label";
        label.textContent = BLOCK_DEFS[block.type].label;
        header.appendChild(label);

        const actions = document.createElement("div");
        actions.className = "lb-block__actions";

        function actionBtn(symbol, title, handler) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "lb-action-btn";
            btn.title = title;
            btn.textContent = symbol;
            btn.addEventListener("click", handler);
            return btn;
        }

        actions.appendChild(actionBtn("↑", "Move up", function () { moveBlock(block.id, -1); }));
        actions.appendChild(actionBtn("↓", "Move down", function () { moveBlock(block.id, 1); }));
        actions.appendChild(actionBtn("⧉", "Duplicate", function () { duplicateBlock(block.id); }));
        actions.appendChild(actionBtn("🗑", "Delete", function () { deleteBlock(block.id); }));
        header.appendChild(actions);

        card.appendChild(header);
        card.appendChild(renderBlockFields(block));

        const addAfter = document.createElement("div");
        addAfter.className = "lb-add-after";
        addAfter.appendChild(buildAddBlockMenu(index));
        card.appendChild(addAfter);

        return card;
    }

    function buildAddBlockMenu(afterIndex) {
        const container = document.createElement("div");
        container.className = "lb-add-menu";
        const select = document.createElement("select");
        const placeholder = document.createElement("option");
        placeholder.textContent = "+ Insert block below…";
        placeholder.value = "";
        select.appendChild(placeholder);
        Object.keys(BLOCK_DEFS).forEach(function (type) {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = BLOCK_DEFS[type].label;
            select.appendChild(opt);
        });
        select.addEventListener("change", function () {
            if (select.value) addBlock(select.value, afterIndex);
        });
        container.appendChild(select);
        return container;
    }

    function renderBuilder() {
        if (!rootEl) return;
        rootEl.innerHTML = "";
        blocks.forEach(function (block, index) {
            rootEl.appendChild(renderBlockCard(block, index));
        });
        if (blocks.length === 0) {
            const empty = document.createElement("div");
            empty.className = "lb-empty";
            empty.appendChild(document.createTextNode("No blocks yet. "));
            empty.appendChild(buildAddBlockMenu(-1));
            rootEl.appendChild(empty);
        }
    }

    /* ---------- Parse existing Markdown back into blocks (for editing an existing lesson) ---------- */
    // Deliberately simple: this only needs to understand Markdown that
    // the builder itself generates. Hand-authored lessons with more
    // varied Markdown just fall back to a single paragraph block
    // containing the raw text — still fully editable as text, nothing
    // is lost, it just won't be split into separate typed blocks.

    function parseMarkdownToBlocks(markdown) {
        if (!markdown || !markdown.trim()) return [];
        const chunks = markdown.split(/\n\n+/);
        return chunks.map(function (chunk) {
            const trimmed = chunk.trim();
            let match;

            if ((match = trimmed.match(/^(#{1,4})\s+(.*)$/))) {
                return { id: "b" + (blockIdCounter++), type: "heading", data: { level: match[1].length, text: match[2] } };
            }
            if (trimmed === "---") {
                return { id: "b" + (blockIdCounter++), type: "divider", data: {} };
            }
            if ((match = trimmed.match(/^```(\w*)\n([\s\S]*?)\n?```$/))) {
                return { id: "b" + (blockIdCounter++), type: "code", data: { language: match[1] || "text", code: match[2] } };
            }
            if ((match = trimmed.match(/^>\s*\*\*Note:\*\*\s*(.*)$/))) {
                return { id: "b" + (blockIdCounter++), type: "note", data: { text: match[1] } };
            }
            if ((match = trimmed.match(/^>\s*\*\*Tip:\*\*\s*(.*)$/))) {
                return { id: "b" + (blockIdCounter++), type: "tip", data: { text: match[1] } };
            }
            if ((match = trimmed.match(/^>\s*\*\*⚠️ Warning:\*\*\s*(.*)$/))) {
                return { id: "b" + (blockIdCounter++), type: "warning", data: { text: match[1] } };
            }
            if ((match = trimmed.match(/^>\s*(.*)$/))) {
                return { id: "b" + (blockIdCounter++), type: "quote", data: { text: match[1] } };
            }
            if ((match = trimmed.match(/^!\[([^\]]*)\]\(([^)]*)\)$/))) {
                return { id: "b" + (blockIdCounter++), type: "image", data: { alt: match[1], url: match[2] } };
            }
            if (/^- /m.test(trimmed) && trimmed.split("\n").every(function (l) { return /^- /.test(l); })) {
                return { id: "b" + (blockIdCounter++), type: "bullets", data: { items: trimmed.split("\n").map(function (l) { return l.replace(/^- /, ""); }) } };
            }
            if (/^\d+\. /m.test(trimmed) && trimmed.split("\n").every(function (l) { return /^\d+\. /.test(l); })) {
                return { id: "b" + (blockIdCounter++), type: "numbered", data: { items: trimmed.split("\n").map(function (l) { return l.replace(/^\d+\. /, ""); }) } };
            }
            if (trimmed.startsWith("|")) {
                const lines = trimmed.split("\n").filter(Boolean);
                if (lines.length >= 2) {
                    const headers = lines[0].split("|").map(function (c) { return c.trim(); }).filter(function (c, i, arr) { return !(i === 0 && c === "") && !(i === arr.length - 1 && c === ""); });
                    const rows = lines.slice(2).map(function (line) {
                        return line.split("|").map(function (c) { return c.trim(); }).filter(function (c, i, arr) { return !(i === 0 && c === "") && !(i === arr.length - 1 && c === ""); });
                    });
                    return { id: "b" + (blockIdCounter++), type: "table", data: { headers: headers, rows: rows } };
                }
            }

            return { id: "b" + (blockIdCounter++), type: "paragraph", data: { text: trimmed } };
        });
    }

    /* ---------- Boot ---------- */

    document.addEventListener("DOMContentLoaded", function () {
        rootEl = document.getElementById("lesson-builder-blocks");
        textarea = document.getElementById("lesson-body-textarea");
        previewEl = document.getElementById("lesson-builder-preview");
        if (!rootEl || !textarea) return; // not on a lesson-builder page

        blocks = parseMarkdownToBlocks(textarea.value);
        renderBuilder();
        renderPreview();
        syncTextarea();

        // Tabs: Visual Builder / Markdown Source / Preview
        const tabButtons = document.querySelectorAll(".lb-tab");
        const panels = document.querySelectorAll(".lb-panel");
        tabButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                tabButtons.forEach(function (b) { b.classList.remove("lb-tab--active"); });
                panels.forEach(function (p) { p.classList.remove("lb-panel--active"); });
                btn.classList.add("lb-tab--active");
                document.getElementById(btn.dataset.panel).classList.add("lb-panel--active");
                if (btn.dataset.panel === "lb-panel-preview") renderPreview();
            });
        });

        // If the admin edits the raw Markdown Source textarea directly,
        // re-parse it back into blocks so both views stay honest with
        // each other (last-edited view wins).
        textarea.addEventListener("input", function () {
            blocks = parseMarkdownToBlocks(textarea.value);
            renderBuilder();
            renderPreview();
        });

        // Ensure the very latest generated Markdown is in the textarea
        // right before the form actually submits, regardless of which
        // tab was last active.
        const form = textarea.closest("form");
        if (form) {
            form.addEventListener("submit", function () {
                if (document.getElementById("lb-panel-source").classList.contains("lb-panel--active")) {
                    // Markdown Source was the last-edited view — it's
                    // already authoritative in the textarea, leave it.
                    return;
                }
                syncTextarea();
            });
        }
    });
})();

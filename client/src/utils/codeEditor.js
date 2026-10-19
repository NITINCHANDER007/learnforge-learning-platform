/**
 * Code Editor Self-Indentation & Keyboard Enhancements
 * Provides auto-indentation, block deduction, tab indentation, backspace unindent,
 * auto-closing bracket/quote pairs, and shortcut execution for textarea code editors.
 */

export function handleCodeEditorKeyDown(e, setCode, onRunCode) {
  const textarea = e.target;
  const { value, selectionStart, selectionEnd } = textarea;

  // 1. Run Code Shortcut: Ctrl + Enter / Cmd + Enter
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (typeof onRunCode === 'function') {
      onRunCode();
    }
    return;
  }

  // 2. Tab / Shift + Tab Indentation
  if (e.key === 'Tab') {
    e.preventDefault();
    const tabSpaces = '    '; // 4 spaces

    // Multi-line selection: indent or unindent whole lines
    if (selectionStart !== selectionEnd) {
      const startLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      let endLineEnd = value.indexOf('\n', selectionEnd);
      if (endLineEnd === -1) endLineEnd = value.length;

      const selectedBlock = value.substring(startLineStart, endLineEnd);
      const lines = selectedBlock.split('\n');

      let modifiedLines;
      let startOffset = 0;
      let endOffset = 0;

      if (e.shiftKey) {
        // Shift + Tab: Unindent (remove up to 4 spaces)
        modifiedLines = lines.map((line, idx) => {
          let removed = 0;
          let newLine = line;
          if (line.startsWith('    ')) {
            newLine = line.substring(4);
            removed = 4;
          } else {
            const spaces = line.match(/^ +/);
            if (spaces) {
              removed = Math.min(spaces[0].length, 4);
              newLine = line.substring(removed);
            }
          }
          if (idx === 0) startOffset = removed;
          endOffset += removed;
          return newLine;
        });

        const newBlock = modifiedLines.join('\n');
        const newValue = value.substring(0, startLineStart) + newBlock + value.substring(endLineEnd);
        setCode(newValue);

        requestAnimationFrame(() => {
          textarea.selectionStart = Math.max(startLineStart, selectionStart - startOffset);
          textarea.selectionEnd = Math.max(startLineStart, selectionEnd - endOffset);
        });
      } else {
        // Tab: Indent all selected lines by 4 spaces
        modifiedLines = lines.map(line => tabSpaces + line);
        const newBlock = modifiedLines.join('\n');
        const newValue = value.substring(0, startLineStart) + newBlock + value.substring(endLineEnd);
        setCode(newValue);

        requestAnimationFrame(() => {
          textarea.selectionStart = selectionStart + 4;
          textarea.selectionEnd = selectionEnd + (lines.length * 4);
        });
      }
      return;
    }

    // Single cursor Tab: Shift + Tab unindents current line
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const spacesMatch = currentLine.match(/^ +/);

      if (spacesMatch) {
        const removeCount = Math.min(spacesMatch[0].length, 4);
        const newValue = value.substring(0, lineStart) + value.substring(lineStart + removeCount);
        setCode(newValue);

        requestAnimationFrame(() => {
          const newPos = Math.max(lineStart, selectionStart - removeCount);
          textarea.selectionStart = newPos;
          textarea.selectionEnd = newPos;
        });
      }
      return;
    }

    // Single cursor Tab: insert 4 spaces at cursor
    insertText(textarea, tabSpaces, setCode);
    return;
  }

  // 3. Enter Key: Self-Indentation & Block Logic
  if (e.key === 'Enter') {
    e.preventDefault();

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLine = value.substring(lineStart, selectionStart);

    // Get current line's leading indentation
    const indentMatch = currentLine.match(/^(\s*)/);
    let currentIndent = indentMatch ? indentMatch[1] : '';

    const charBefore = value[selectionStart - 1];
    const charAfter = value[selectionStart];

    // Check if cursor is between matching pairs: { } or ( ) or [ ]
    const isBetweenBrackets =
      (charBefore === '{' && charAfter === '}') ||
      (charBefore === '(' && charAfter === ')') ||
      (charBefore === '[' && charAfter === ']');

    if (isBetweenBrackets) {
      const extraIndent = currentIndent + '    ';
      const insertStr = '\n' + extraIndent + '\n' + currentIndent;
      const newCursor = selectionStart + extraIndent.length + 1;

      const newValue = value.substring(0, selectionStart) + insertStr + value.substring(selectionEnd);
      setCode(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = newCursor;
        textarea.selectionEnd = newCursor;
      });
      return;
    }

    // Auto-indent: check if current line ends with a block starter
    // Python (ends with :) or JS/C/SQL (ends with { or ( or [)
    const trimmedLine = currentLine.trimEnd();
    const shouldAddIndent =
      trimmedLine.endsWith(':') ||
      trimmedLine.endsWith('{') ||
      trimmedLine.endsWith('(') ||
      trimmedLine.endsWith('[');

    if (shouldAddIndent) {
      currentIndent += '    ';
    }

    const insertStr = '\n' + currentIndent;
    insertText(textarea, insertStr, setCode);
    return;
  }

  // 4. Backspace: Smooth 4-Space Unindent
  if (e.key === 'Backspace' && selectionStart === selectionEnd) {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const textBeforeCursor = value.substring(lineStart, selectionStart);

    // If all text before cursor on this line is spaces and ends with 4 spaces
    if (textBeforeCursor.length >= 4 && /^ +$/.test(textBeforeCursor) && textBeforeCursor.endsWith('    ')) {
      e.preventDefault();
      const newValue = value.substring(0, selectionStart - 4) + value.substring(selectionEnd);
      setCode(newValue);

      requestAnimationFrame(() => {
        const newPos = selectionStart - 4;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      });
      return;
    }
  }

  // 5. Auto-Closing Pairs: (), [], {}, "", '', ``
  const pairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  // Overtyping closing character
  if ([']', ')', '}', '"', "'", '`'].includes(e.key) && selectionStart === selectionEnd) {
    if (value[selectionStart] === e.key) {
      e.preventDefault();
      textarea.selectionStart = selectionStart + 1;
      textarea.selectionEnd = selectionStart + 1;
      return;
    }
  }

  // Auto-insert pair
  if (pairs[e.key]) {
    const openChar = e.key;
    const closeChar = pairs[e.key];

    // If text is selected, wrap selection in the pair
    if (selectionStart !== selectionEnd) {
      e.preventDefault();
      const selected = value.substring(selectionStart, selectionEnd);
      const wrapped = openChar + selected + closeChar;
      const newValue = value.substring(0, selectionStart) + wrapped + value.substring(selectionEnd);
      setCode(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = selectionStart + 1;
        textarea.selectionEnd = selectionEnd + 1;
      });
      return;
    }

    // If no selection and typing quotes next to a word character, don't auto-close
    if (['"', "'", '`'].includes(openChar)) {
      const nextChar = value[selectionStart];
      if (nextChar && /\w/.test(nextChar)) {
        return; // Normal typing
      }
    }

    e.preventDefault();
    const insertStr = openChar + closeChar;
    const newValue = value.substring(0, selectionStart) + insertStr + value.substring(selectionEnd);
    setCode(newValue);

    requestAnimationFrame(() => {
      const newPos = selectionStart + 1;
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
    });
    return;
  }
}

/**
 * Helper to insert text at cursor while preserving selection and history
 */
function insertText(textarea, text, setCode) {
  const { value, selectionStart, selectionEnd } = textarea;

  // Try document.execCommand first to preserve native Undo/Redo (Ctrl+Z)
  if (document.execCommand && document.execCommand('insertText', false, text)) {
    setCode(textarea.value);
    return;
  }

  // Fallback direct string manipulation
  const newValue = value.substring(0, selectionStart) + text + value.substring(selectionEnd);
  setCode(newValue);

  requestAnimationFrame(() => {
    const newPos = selectionStart + text.length;
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;
  });
}

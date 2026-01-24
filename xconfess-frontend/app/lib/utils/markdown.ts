/**
 * Insert markdown formatting at cursor position in textarea
 * Returns the new text value and cursor position for React state update
 * If text is selected, wraps it. If not, places cursor between markers.
 */
export function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = ""
): { newText: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  const newText =
    text.substring(0, start) +
    before +
    selectedText +
    after +
    text.substring(end);

  // Calculate new cursor position
  // If text was selected, place cursor after the formatting
  // If no text selected, place cursor between the markers
  let cursorPos: number;
  if (selectedText.length > 0) {
    // Text was selected - place cursor after the formatted text
    cursorPos = start + before.length + selectedText.length + after.length;
  } else {
    // No text selected - place cursor between the markers (after the opening marker)
    cursorPos = start + before.length;
  }

  return { newText, cursorPos };
}

/**
 * Insert bold markdown
 */
export function insertBold(textarea: HTMLTextAreaElement): { newText: string; cursorPos: number } {
  return insertMarkdown(textarea, "**", "**");
}

/**
 * Insert italic markdown
 */
export function insertItalic(textarea: HTMLTextAreaElement): { newText: string; cursorPos: number } {
  return insertMarkdown(textarea, "*", "*");
}

/**
 * Insert link markdown
 */
export function insertLink(textarea: HTMLTextAreaElement, url?: string): { newText: string; cursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const linkText = selectedText || "link text";
  const linkUrl = url || "https://";

  return insertMarkdown(textarea, `[${linkText}](`, `${linkUrl})`);
}

/**
 * Insert emoji at cursor position
 */
export function insertEmoji(textarea: HTMLTextAreaElement, emoji: string): { newText: string; cursorPos: number } {
  return insertMarkdown(textarea, emoji, "");
}

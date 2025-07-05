import * as vscode from 'vscode';

function editorScroll(to: string, by: string) {
  vscode.commands.executeCommand('editorScroll', {
    to: to,
    by: by,
    revealCursor: true,
    value: 1,
  });
}

async function scrollWithCursorPositionPreservation(direction: 'up' | 'down', by: 'halfPage' | 'page'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Get current visible range and cursor position
  const visibleRanges = editor.visibleRanges;
  if (visibleRanges.length === 0) {
    return;
  }

  const currentVisibleRange = visibleRanges[0];
  const currentCursorLine = editor.selection.active.line;
  const currentCursorCharacter = editor.selection.active.character;
  
  // Calculate cursor's relative position within the visible range
  const visibleStartLine = currentVisibleRange.start.line;
  const visibleEndLine = currentVisibleRange.end.line;
  const visibleLineCount = visibleEndLine - visibleStartLine;
  
  // Calculate the cursor's relative position (0 = top, 1 = bottom)
  const relativePosition = visibleLineCount > 0 ? (currentCursorLine - visibleStartLine) / visibleLineCount : 0;
  
  // Perform the scroll operation without revealing cursor
  await vscode.commands.executeCommand('editorScroll', {
    to: direction,
    by: by,
    revealCursor: false,
    value: 1,
  });
  
  // Get the new visible range after scrolling
  const newVisibleRanges = editor.visibleRanges;
  if (newVisibleRanges.length === 0) {
    return;
  }
  
  const newVisibleRange = newVisibleRanges[0];
  const newVisibleStartLine = newVisibleRange.start.line;
  const newVisibleEndLine = newVisibleRange.end.line;
  const newVisibleLineCount = newVisibleEndLine - newVisibleStartLine;
  
  // Calculate the new cursor position to maintain relative position
  const newCursorLine = Math.round(newVisibleStartLine + (relativePosition * newVisibleLineCount));
  
  // Ensure the new cursor line is within the document bounds
  const documentLineCount = editor.document.lineCount;
  const constrainedCursorLine = Math.max(0, Math.min(newCursorLine, documentLineCount - 1));
  
  // Get the line at the new cursor position to ensure the character position is valid
  const newLine = editor.document.lineAt(constrainedCursorLine);
  const constrainedCursorCharacter = Math.min(currentCursorCharacter, newLine.text.length);
  
  // Move the cursor to the new position
  const newPosition = new vscode.Position(constrainedCursorLine, constrainedCursorCharacter);
  editor.selection = new vscode.Selection(newPosition, newPosition);
}

export function scrollDownHalfPage(): void {
  scrollWithCursorPositionPreservation('down', 'halfPage');
}

export function scrollUpHalfPage(): void {
  scrollWithCursorPositionPreservation('up', 'halfPage');
}

export function scrollDownPage(): void {
  editorScroll('down', 'page');
}

export function scrollUpPage(): void {
  editorScroll('up', 'page');
}

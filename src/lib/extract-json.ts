/**
 * Robustly extract a JSON object from AI-generated text.
 * Tries multiple strategies to handle text wrapping, code blocks, etc.
 */
export function extractJSON(text: string): Record<string, unknown> | null {
  // Method 1: entire text is valid JSON
  try { return JSON.parse(text) } catch { /* continue */ }

  // Method 2: extract first { ... } block
  const match = text.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch { /* continue */ }
  }

  // Method 3: extract from ```json ... ``` code block
  const codeBlock = text.match(/```json?\s*([\s\S]*?)```/)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()) } catch { /* continue */ }
  }

  // Method 4: strip markdown fences then try again
  const cleaned = text
    .replace(/```json?\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
  const match2 = cleaned.match(/\{[\s\S]*\}/)
  if (match2) {
    try { return JSON.parse(match2[0]) } catch { /* continue */ }
  }

  return null
}

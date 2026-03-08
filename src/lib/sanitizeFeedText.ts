export function sanitizeFeedText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Decode common entities first so encoded tags are removed too
  cleaned = cleaned
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');

  // Remove script/style blocks and all remaining HTML tags
  cleaned = cleaned
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/javascript:/gi, ' ')
    .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

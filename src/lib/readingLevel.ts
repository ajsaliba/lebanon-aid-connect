/**
 * Flesch-Kincaid Reading Level utilities
 */

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Remove silent e
  word = word.replace(/(?:[^leas]e)$/, '');
  word = word.replace(/^re/, 're');

  const vowelGroups = word.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;
  return Math.max(1, count);
}

export function fleschKincaidGrade(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.replace(/[^a-z]/gi, '').length > 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const grade = 0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) - 15.59;

  return Math.max(0, Math.round(grade * 10) / 10);
}

export function readingLevelLabel(grade: number): { label: string; color: string } {
  if (grade <= 6) return { label: 'Easy', color: 'text-success' };
  if (grade <= 10) return { label: 'Standard', color: 'text-info' };
  if (grade <= 14) return { label: 'Advanced', color: 'text-warning' };
  return { label: 'Expert', color: 'text-danger' };
}

import { type NewsItem } from '@/data/mockData';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

/**
 * Detect duplicate stories across multiple sources.
 * Uses normalized keyword overlap (Jaccard similarity) on titles.
 */

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were',
  'be','been','being','have','has','had','do','does','did','will','would','could','should','may','might',
  'it','its','this','that','these','those','not','no','as','all','any','more','also','says','said',
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

const SIMILARITY_THRESHOLD = 0.45;

export interface DuplicateGroup {
  /** IDs of articles covering the same story */
  ids: string[];
  /** Representative headline */
  label: string;
}

/**
 * Find groups of articles that report the same story.
 * Returns a Map from article ID to its group (other IDs covering same story).
 */
export function findDuplicates(news: NewsItem[]): Map<string, string[]> {
  const duplicateMap = new Map<string, string[]>();
  if (news.length < 2) return duplicateMap;

  // Pre-tokenize all titles
  const tokenized = news.map(n => ({
    id: n.id,
    source: n.source,
    tokens: tokenize(sanitizeFeedText(n.title)),
  }));

  // Compare pairs (O(n²) but fine for typical feed sizes <1000)
  const groups: string[][] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < tokenized.length; i++) {
    if (assigned.has(tokenized[i].id)) continue;
    const group = [tokenized[i].id];

    for (let j = i + 1; j < tokenized.length; j++) {
      if (assigned.has(tokenized[j].id)) continue;
      // Only flag as duplicate if from DIFFERENT sources
      if (tokenized[i].source === tokenized[j].source) continue;

      const sim = jaccardSimilarity(tokenized[i].tokens, tokenized[j].tokens);
      if (sim >= SIMILARITY_THRESHOLD) {
        group.push(tokenized[j].id);
        assigned.add(tokenized[j].id);
      }
    }

    if (group.length > 1) {
      assigned.add(tokenized[i].id);
      groups.push(group);
    }
  }

  // Build map: each ID -> array of OTHER IDs in its group
  for (const group of groups) {
    for (const id of group) {
      duplicateMap.set(id, group.filter(g => g !== id));
    }
  }

  return duplicateMap;
}

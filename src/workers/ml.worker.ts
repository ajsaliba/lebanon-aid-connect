type MlTask = 'summarize' | 'sentiment' | 'embeddings' | 'semantic-search';

interface BaseMessage {
  id: string;
  task: MlTask;
}

interface SummarizePayload {
  headlines: string[];
}

interface SentimentPayload {
  text: string;
}

interface EmbeddingPayload {
  text: string;
}

interface SemanticSearchPayload {
  query: string;
  corpus: Array<{ id: string; text: string }>;
}

interface RequestMessage extends BaseMessage {
  payload: SummarizePayload | SentimentPayload | EmbeddingPayload | SemanticSearchPayload;
}

interface ResponseMessage {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

const POSITIVE_WORDS = ['safe', 'stable', 'open', 'support', 'aid', 'delivered', 'recover'];
const NEGATIVE_WORDS = ['attack', 'strike', 'collapse', 'shortage', 'fatal', 'injured', 'crisis', 'threat'];

function simpleSummary(headlines: string[]): string {
  if (headlines.length === 0) return 'No fresh intelligence available.';
  return headlines
    .slice(0, 3)
    .map((headline, index) => `${index + 1}. ${headline}`)
    .join('\n');
}

function sentimentScore(text: string): { score: number; label: 'positive' | 'neutral' | 'negative' } {
  const lower = text.toLowerCase();
  let score = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) score += 1;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) score -= 1;
  }

  const normalized = Math.max(-1, Math.min(1, score / 4));
  const label = normalized > 0.2 ? 'positive' : normalized < -0.2 ? 'negative' : 'neutral';

  return { score: normalized, label };
}

function hashToken(token: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

function embed(text: string, size = 64): number[] {
  const vector = new Array<number>(size).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    const index = hashToken(token, size);
    vector[index] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => value / norm);
}

function cosine(a: number[], b: number[]): number {
  let total = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) total += a[i] * b[i];
  return total;
}

function semanticSearch(query: string, corpus: Array<{ id: string; text: string }>) {
  const queryEmbedding = embed(query);
  return corpus
    .map(item => {
      const score = cosine(queryEmbedding, embed(item.text));
      return { id: item.id, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const { id, task, payload } = event.data;

  try {
    let result: unknown;

    if (task === 'summarize') {
      result = simpleSummary((payload as SummarizePayload).headlines);
    } else if (task === 'sentiment') {
      result = sentimentScore((payload as SentimentPayload).text);
    } else if (task === 'embeddings') {
      result = embed((payload as EmbeddingPayload).text);
    } else if (task === 'semantic-search') {
      const searchPayload = payload as SemanticSearchPayload;
      result = semanticSearch(searchPayload.query, searchPayload.corpus);
    } else {
      throw new Error('Unsupported task');
    }

    const response: ResponseMessage = { id, ok: true, result };
    self.postMessage(response);
  } catch (error) {
    const response: ResponseMessage = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : 'Worker execution failed',
    };
    self.postMessage(response);
  }
};

export {};

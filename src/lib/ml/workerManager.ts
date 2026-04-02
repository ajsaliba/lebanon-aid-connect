type MlTask = 'summarize' | 'sentiment' | 'embeddings' | 'semantic-search';

interface WorkerRequest<TPayload> {
  id: string;
  task: MlTask;
  payload: TPayload;
}

interface WorkerResponse<TResult> {
  id: string;
  ok: boolean;
  result?: TResult;
  error?: string;
}

type PendingResolver = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

class MlWorkerManager {
  private worker: Worker | null = null;

  private pending = new Map<string, PendingResolver>();

  private ensureWorker() {
    if (this.worker) return;

    this.worker = new Worker(new URL('../../workers/ml.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse<unknown>>) => {
      const message = event.data;
      const entry = this.pending.get(message.id);
      if (!entry) return;

      this.pending.delete(message.id);

      if (!message.ok) {
        entry.reject(new Error(message.error || 'Worker task failed'));
        return;
      }

      entry.resolve(message.result);
    };
  }

  private runTask<TPayload, TResult>(task: MlTask, payload: TPayload): Promise<TResult> {
    this.ensureWorker();

    const id = `ml-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const message: WorkerRequest<TPayload> = { id, task, payload };

    return new Promise<TResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker?.postMessage(message);
    });
  }

  summarize(headlines: string[]) {
    return this.runTask<{ headlines: string[] }, string>('summarize', { headlines });
  }

  sentiment(text: string) {
    return this.runTask<{ text: string }, { score: number; label: 'positive' | 'neutral' | 'negative' }>('sentiment', { text });
  }

  embeddings(text: string) {
    return this.runTask<{ text: string }, number[]>('embeddings', { text });
  }

  semanticSearch(query: string, corpus: Array<{ id: string; text: string }>) {
    return this.runTask<{ query: string; corpus: Array<{ id: string; text: string }> }, Array<{ id: string; score: number }>>(
      'semantic-search',
      { query, corpus },
    );
  }
}

export const mlWorkerManager = new MlWorkerManager();

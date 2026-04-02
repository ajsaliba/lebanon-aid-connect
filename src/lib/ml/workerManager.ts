type MlTask = 'health' | 'summarize' | 'sentiment' | 'embeddings' | 'semantic-search' | 'risk-profile';

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
  timeout: ReturnType<typeof setTimeout>;
};

interface WorkerHealth {
  ok: boolean;
  modelVersion: string;
  startedAt: string;
}

class MlWorkerManager {
  private worker: Worker | null = null;

  private pending = new Map<string, PendingResolver>();

  private defaultTimeoutMs = 12_000;

  private bootPromise: Promise<boolean> | null = null;

  private available = false;

  private ensureWorker() {
    if (this.worker) return;

    const worker = new Worker(new URL('../../workers/ml.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResponse<unknown>>) => {
      const message = event.data;
      const entry = this.pending.get(message.id);
      if (!entry) return;

      clearTimeout(entry.timeout);
      this.pending.delete(message.id);

      if (!message.ok) {
        entry.reject(new Error(message.error || 'Worker task failed'));
        return;
      }

      entry.resolve(message.result);
    };

    worker.onerror = () => {
      this.available = false;
      this.rejectAllPending(new Error('ML worker runtime error'));
      this.disposeWorker();
    };

    this.worker = worker;
  }

  private disposeWorker() {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
  }

  private rejectAllPending(error: Error) {
    for (const [id, entry] of this.pending.entries()) {
      clearTimeout(entry.timeout);
      entry.reject(error);
      this.pending.delete(id);
    }
  }

  private runTask<TPayload, TResult>(task: MlTask, payload: TPayload, timeoutMs = this.defaultTimeoutMs): Promise<TResult> {
    this.ensureWorker();

    const id = `ml-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const message: WorkerRequest<TPayload> = { id, task, payload };

    return new Promise<TResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        this.available = false;
        reject(new Error(`ML worker task timed out (${task})`));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timeout });
      this.worker?.postMessage(message);
    });
  }

  async initialize(): Promise<boolean> {
    if (this.available) return true;
    if (this.bootPromise) return this.bootPromise;

    this.bootPromise = this.runTask<null, WorkerHealth>('health', null, 3000)
      .then(result => {
        this.available = result.ok;
        return this.available;
      })
      .catch(() => {
        this.available = false;
        this.disposeWorker();
        return false;
      })
      .finally(() => {
        this.bootPromise = null;
      });

    return this.bootPromise;
  }

  isAvailable() {
    return this.available;
  }

  async restart() {
    this.available = false;
    this.rejectAllPending(new Error('ML worker restarted'));
    this.disposeWorker();
    return this.initialize();
  }

  setTimeoutMs(nextTimeoutMs: number) {
    this.defaultTimeoutMs = Math.max(1000, Math.floor(nextTimeoutMs));
  }

  summarize(headlines: string[], timeoutMs?: number) {
    return this.runTask<{ headlines: string[] }, string>('summarize', { headlines }, timeoutMs);
  }

  sentiment(text: string, timeoutMs?: number) {
    return this.runTask<{ text: string }, { score: number; label: 'positive' | 'neutral' | 'negative' }>('sentiment', { text }, timeoutMs);
  }

  embeddings(text: string, timeoutMs?: number) {
    return this.runTask<{ text: string }, number[]>('embeddings', { text }, timeoutMs);
  }

  semanticSearch(query: string, corpus: Array<{ id: string; text: string }>, timeoutMs?: number) {
    return this.runTask<{ query: string; corpus: Array<{ id: string; text: string }> }, Array<{ id: string; score: number }>>(
      'semantic-search',
      { query, corpus },
      timeoutMs,
    );
  }

  riskProfile(text: string, timeoutMs?: number) {
    return this.runTask<{ text: string }, { riskScore: number; channels: string[] }>('risk-profile', { text }, timeoutMs);
  }
}

export const mlWorkerManager = new MlWorkerManager();

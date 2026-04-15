/**
 * Task 28 – Feed health / freshness / intelligence-gap framework.
 *
 * Tracks per-feed heartbeat and exposes reactive hooks for
 * panel-level badges and a global health summary.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type FeedHealthEntry, type DomainKey, type FreshnessStatus, computeFreshness } from './types';

// ── SQL → camelCase mapper ─────────────────────────────────

interface FeedHealthRow {
  id: string;
  feed_name: string;
  domain: string;
  last_success: string | null;
  last_attempt: string | null;
  error_count: number;
  time_to_live: number;
  status: string;
  message: string | null;
  created_at: string;
}

function rowToModel(r: FeedHealthRow): FeedHealthEntry {
  return {
    id: r.id,
    feedName: r.feed_name,
    domain: r.domain as DomainKey,
    lastSuccess: r.last_success,
    lastAttempt: r.last_attempt,
    errorCount: r.error_count,
    timeToLive: r.time_to_live,
    status: r.status as FeedHealthEntry['status'],
    message: r.message,
    createdAt: r.created_at,
  };
}

// ── Hooks ──────────────────────────────────────────────────

export function useFeedHealth(domain?: DomainKey) {
  return useQuery<FeedHealthEntry[]>({
    queryKey: ['feed_health', domain],
    queryFn: async () => {
      let q = supabase.from('feed_health').select('*').order('feed_name');
      if (domain) q = q.eq('domain', domain);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as unknown as FeedHealthRow[]).map(rowToModel);
    },
    staleTime: 15_000,
  });
}

export function useFeedFreshness(feedName: string): FreshnessStatus {
  const { data: entries } = useFeedHealth();
  const entry = entries?.find((e) => e.feedName === feedName);
  return computeFreshness(entry);
}

export interface HealthGapSummary {
  total: number;
  healthy: number;
  degraded: number;
  stale: number;
  down: number;
  byDomain: Record<DomainKey, { healthy: number; total: number }>;
}

export function useHealthGapSummary(): HealthGapSummary {
  const { data: entries = [] } = useFeedHealth();

  const base: HealthGapSummary = {
    total: entries.length,
    healthy: 0,
    degraded: 0,
    stale: 0,
    down: 0,
    byDomain: {
      humanitarian: { healthy: 0, total: 0 },
      financial: { healthy: 0, total: 0 },
      infrastructure: { healthy: 0, total: 0 },
      intelligence: { healthy: 0, total: 0 },
    },
  };

  for (const e of entries) {
    const f = computeFreshness(e);
    if (f === 'live') base.healthy++;
    else if (f === 'cached') base.degraded++;
    else if (f === 'stale') base.stale++;
    else base.down++;

    const d = base.byDomain[e.domain];
    if (d) {
      d.total++;
      if (f === 'live') d.healthy++;
    }
  }

  return base;
}

// ── Publish helper (called by ingestion pipelines) ─────────

export async function publishFeedHeartbeat(
  feedName: string,
  domain: DomainKey,
  success: boolean,
  ttlSeconds: number,
  message?: string,
) {
  const now = new Date().toISOString();
  const { error } = await supabase.from('feed_health').upsert(
    {
      feed_name: feedName,
      domain,
      last_attempt: now,
      ...(success ? { last_success: now, error_count: 0, status: 'healthy' } : {}),
      ...(!success ? { status: 'degraded', message: message ?? null } : {}),
      time_to_live: ttlSeconds,
    },
    { onConflict: 'feed_name' },
  );
  if (error) console.error('[healthService] heartbeat publish failed', error);
}

// ── Mutation: increment error count on failure ─────────────

export async function reportFeedError(feedName: string, message: string) {
  const { error } = await supabase.rpc('increment_feed_error_count', {
    p_feed_name: feedName,
    p_message: message,
  });
  if (error) console.error('[healthService] reportFeedError failed', error);
}

/**
 * Tasks 6-12 – Financial domain service layer.
 *
 * Market watchlist, radar signals, stablecoin pegs, ETF flows,
 * energy analytics, central-bank policy rates, trade restrictions,
 * and strategic investment mapping.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  type MarketQuote,
  type MarketRadarSignal,
  type MarketRadarVerdict,
  type StablecoinPeg,
  type EtfFlowEstimate,
  type EnergyDataPoint,
  type PolicyRateEntry,
  type TradeRestriction,
  type StrategicInvestment,
} from './types';
import { publishFeedHeartbeat } from './healthService';

// ── Watchlist persistence ──────────────────────────────────

const WATCHLIST_KEY = 'cedarsalert_market_watchlist';

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : ['BTC', 'ETH', 'XAU', 'WTI', 'SPX', 'DXY'];
  } catch {
    return ['BTC', 'ETH', 'XAU', 'WTI', 'SPX', 'DXY'];
  }
}

export function setWatchlist(symbols: string[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
}

// ── Generic fetch-with-fallback ────────────────────────────

async function fetchRows<T>(
  table: string,
  feedName: string,
  mapper: (r: any) => T,
  orderCol = 'created_at',
  limit = 500,
): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderCol, { ascending: false })
      .limit(limit);
    if (error) throw error;
    publishFeedHeartbeat(feedName, 'financial', true, 300).catch(() => {});
    return (data ?? []).map(mapper);
  } catch (err) {
    publishFeedHeartbeat(feedName, 'financial', false, 300, String(err)).catch(() => {});
    return [];
  }
}

// ── Row mappers ────────────────────────────────────────────

const mapQuote = (r: any): MarketQuote => ({
  symbol: r.symbol,
  name: r.name,
  assetClass: r.asset_class,
  price: r.price,
  change: r.change,
  changePct: r.change_pct,
  volume: r.volume,
  timestamp: r.timestamp ?? r.updated_at,
  provider: r.provider ?? 'internal',
});

const mapRadarSignal = (r: any): MarketRadarSignal => ({
  id: r.id,
  signalName: r.signal_name,
  signalType: r.signal_type,
  value: r.value,
  status: r.status,
  confidence: r.confidence,
  updatedAt: r.updated_at,
});

const mapPeg = (r: any): StablecoinPeg => ({
  coinId: r.coin_id,
  name: r.name,
  symbol: r.symbol,
  price: r.price,
  pegTarget: r.peg_target ?? 1.0,
  deviationBps: r.deviation_bps ?? Math.round(Math.abs(r.price - 1.0) * 10000),
  status: r.status ?? (Math.abs(r.price - 1.0) > 0.01 ? 'depeg' : Math.abs(r.price - 1.0) > 0.005 ? 'warning' : 'pegged'),
  history24h: typeof r.history_24h === 'string' ? JSON.parse(r.history_24h) : (r.history_24h ?? []),
  updatedAt: r.updated_at,
});

const mapEtf = (r: any): EtfFlowEstimate => ({
  symbol: r.symbol,
  name: r.name,
  estimatedFlowUsd: r.estimated_flow_usd,
  direction: r.direction,
  volumeRatio: r.volume_ratio,
  priceDelta: r.price_delta,
  sparkline: typeof r.sparkline === 'string' ? JSON.parse(r.sparkline) : (r.sparkline ?? []),
  computedAt: r.computed_at ?? r.updated_at,
});

const mapEnergy = (r: any): EnergyDataPoint => ({
  id: r.id,
  metric: r.metric,
  value: r.value,
  unit: r.unit,
  trend: r.trend,
  change24h: r.change_24h ?? 0,
  timestamp: r.timestamp ?? r.updated_at,
  source: r.source ?? 'internal',
});

const mapPolicyRate = (r: any): PolicyRateEntry => ({
  country: r.country,
  centralBank: r.central_bank,
  currentRate: r.current_rate,
  previousRate: r.previous_rate,
  lastChange: r.last_change,
  nextMeeting: r.next_meeting,
  direction: r.direction,
});

const mapRestriction = (r: any): TradeRestriction => ({
  id: r.id,
  imposingCountry: r.imposing_country,
  targetCountry: r.target_country,
  restrictionType: r.restriction_type,
  sector: r.sector,
  description: r.description,
  effectiveDate: r.effective_date,
  source: r.source,
});

const mapInvestment = (r: any): StrategicInvestment => ({
  id: r.id,
  investorEntity: r.investor_entity,
  investorCountry: r.investor_country,
  targetEntity: r.target_entity,
  targetCountry: r.target_country,
  sector: r.sector,
  valueUsd: r.value_usd,
  status: r.status,
  year: r.year,
  lat: r.lat,
  lng: r.lng,
  source: r.source,
});

// ── Hooks ──────────────────────────────────────────────────

export function useMarketQuotes(symbols?: string[]) {
  const watchlist = symbols ?? getWatchlist();
  return useQuery<MarketQuote[]>({
    queryKey: ['market_quotes', watchlist],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('market_quotes')
          .select('*')
          .in('symbol', watchlist)
          .order('timestamp', { ascending: false });
        if (error) throw error;
        publishFeedHeartbeat('market_quotes', 'financial', true, 120).catch(() => {});
        return (data ?? []).map(mapQuote);
      } catch (err) {
        publishFeedHeartbeat('market_quotes', 'financial', false, 120, String(err)).catch(() => {});
        return [];
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarketRadar() {
  return useQuery<MarketRadarVerdict>({
    queryKey: ['market_radar'],
    queryFn: async () => {
      const signals = await fetchRows<MarketRadarSignal>(
        'market_radar_signals',
        'market_radar',
        mapRadarSignal,
        'updated_at',
      );
      return computeVerdict(signals);
    },
    staleTime: 60_000,
  });
}

function computeVerdict(signals: MarketRadarSignal[]): MarketRadarVerdict {
  if (signals.length === 0) {
    return { verdict: 'NEUTRAL', confidence: 0, signals: [], computedAt: new Date().toISOString() };
  }
  let bullish = 0;
  let bearish = 0;
  let total = 0;
  for (const s of signals) {
    if (s.status === 'unknown') continue;
    total++;
    if (s.status === 'bullish') bullish += s.confidence;
    else if (s.status === 'bearish') bearish += s.confidence;
  }
  const net = total > 0 ? (bullish - bearish) / total : 0;
  const verdict: MarketRadarVerdict['verdict'] = net > 0.2 ? 'BUY' : net < -0.2 ? 'CASH' : 'NEUTRAL';
  return {
    verdict,
    confidence: Math.abs(net),
    signals,
    computedAt: new Date().toISOString(),
  };
}

export function useStablecoinPegs() {
  return useQuery<StablecoinPeg[]>({
    queryKey: ['stablecoin_pegs'],
    queryFn: () => fetchRows('stablecoin_pegs', 'stablecoin_pegs', mapPeg, 'updated_at'),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useEtfFlows() {
  return useQuery<EtfFlowEstimate[]>({
    queryKey: ['etf_flows'],
    queryFn: () => fetchRows('etf_flows', 'etf_flows', mapEtf, 'computed_at'),
    staleTime: 60_000,
  });
}

export function useEnergyData() {
  return useQuery<EnergyDataPoint[]>({
    queryKey: ['energy_data'],
    queryFn: () => fetchRows('energy_data', 'energy_data', mapEnergy, 'timestamp'),
    staleTime: 60_000,
  });
}

export function usePolicyRates() {
  return useQuery<PolicyRateEntry[]>({
    queryKey: ['policy_rates'],
    queryFn: () => fetchRows('policy_rates', 'policy_rates', mapPolicyRate, 'last_change'),
    staleTime: 300_000,
  });
}

export function useTradeRestrictions() {
  return useQuery<TradeRestriction[]>({
    queryKey: ['trade_restrictions'],
    queryFn: () => fetchRows('trade_restrictions', 'trade_restrictions', mapRestriction, 'effective_date'),
    staleTime: 300_000,
  });
}

export function useStrategicInvestments() {
  return useQuery<StrategicInvestment[]>({
    queryKey: ['strategic_investments'],
    queryFn: () => fetchRows('strategic_investments', 'strategic_investments', mapInvestment, 'year'),
    staleTime: 300_000,
  });
}

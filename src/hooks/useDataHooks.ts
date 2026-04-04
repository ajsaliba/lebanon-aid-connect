/**
 * Unified data hooks for all Supabase entities.
 * Each hook provides real-time data with React Query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type PersonStatus = 'missing' | 'safe' | 'injured' | 'evacuated' | 'deceased';

export interface MissingPerson {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  last_known_location: string | null;
  last_known_lat: number | null;
  last_known_lng: number | null;
  description: string | null;
  status: PersonStatus;
  contact: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalResource {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'field_hospital';
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact: string | null;
  status: 'open' | 'limited' | 'closed';
  beds_available: number | null;
  specialties: string[] | null;
  created_at: string;
}

export interface CommunityChannel {
  id: string;
  name: string;
  type: 'whatsapp' | 'telegram' | 'signal' | 'radio';
  description: string | null;
  link: string | null;
  members: number;
  region: string | null;
  verified: boolean;
  created_at: string;
}

export interface AidInventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  donor_name: string | null;
  status: 'available' | 'reserved' | 'matched' | 'depleted';
  expiry_date: string | null;
  created_at: string;
}

export interface DamageReport {
  id: string;
  location: string;
  lat: number | null;
  lng: number | null;
  description: string | null;
  damage_level: 'minor' | 'moderate' | 'severe' | 'destroyed';
  building_type: string | null;
  photo_urls: string[] | null;
  reconstruction_status: 'not_started' | 'assessment' | 'in_progress' | 'completed';
  progress_pct: number;
  created_at: string;
  reported_at: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[] | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  availability: 'available' | 'busy' | 'unavailable';
  contact: string | null;
  organization: string | null;
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  is_free: boolean;
  location: string | null;
  lat: number | null;
  lng: number | null;
  contact: string | null;
  status: 'available' | 'sold' | 'reserved';
  created_at: string;
}

export interface MeshNode {
  id: string;
  node_id: string;
  name: string | null;
  lat: number | null;
  lng: number | null;
  status: 'online' | 'offline' | 'degraded';
  signal_strength: number | null;
  connected_peers: number;
  last_seen: string | null;
  created_at: string;
}

export interface EscalationEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  severity: 'monitoring' | 'elevated' | 'high';
  event_type: string;
  source_url: string | null;
  occurred_at: string;
  created_at: string;
}

export interface AidRequest {
  id: string;
  description: string;
  category: string;
  quantity: number;
  location: string | null;
  lat: number | null;
  lng: number | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'matched' | 'in_transit' | 'delivered';
  contact: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// Hook factory
// ────────────────────────────────────────────────────────────

function makeQuery<T>(table: string, options?: { filter?: string }) {
  return async (): Promise<T[]> => {
    let q = supabase.from(table).select('*').order('created_at', { ascending: false });
    if (options?.filter) q = q.eq('status', options.filter);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as T[];
  };
}

// ────────────────────────────────────────────────────────────
// Hooks
// ────────────────────────────────────────────────────────────

export function useMissingPersons(query?: string) {
  return useQuery({
    queryKey: ['missing_persons', query],
    queryFn: async () => {
      let q = supabase.from('missing_persons').select('*').order('created_at', { ascending: false });
      if (query && query.trim()) {
        q = q.or(`name.ilike.%${query}%,last_known_location.ilike.%${query}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as MissingPerson[];
    },
    staleTime: 30_000,
  });
}

export function useMedicalResources() {
  return useQuery({
    queryKey: ['medical_resources'],
    queryFn: makeQuery<MedicalResource>('medical_resources'),
    staleTime: 60_000,
  });
}

export function useCommunityChannels() {
  return useQuery({
    queryKey: ['community_channels'],
    queryFn: makeQuery<CommunityChannel>('community_channels'),
    staleTime: 60_000,
  });
}

export function useAidInventory() {
  return useQuery({
    queryKey: ['aid_inventory'],
    queryFn: makeQuery<AidInventoryItem>('aid_inventory'),
    staleTime: 30_000,
  });
}

export function useDamageReports() {
  return useQuery({
    queryKey: ['damage_reports'],
    queryFn: makeQuery<DamageReport>('damage_reports'),
    staleTime: 30_000,
  });
}

export function useVolunteers() {
  return useQuery({
    queryKey: ['volunteers'],
    queryFn: makeQuery<Volunteer>('volunteers'),
    staleTime: 60_000,
  });
}

export function useMarketplace() {
  return useQuery({
    queryKey: ['marketplace'],
    queryFn: makeQuery<MarketplaceListing>('marketplace'),
    staleTime: 30_000,
  });
}

export function useMeshNodes() {
  return useQuery({
    queryKey: ['mesh_nodes'],
    queryFn: makeQuery<MeshNode>('mesh_nodes'),
    staleTime: 15_000,
  });
}

export function useEscalationEvents() {
  return useQuery({
    queryKey: ['escalation_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escalation_events')
        .select('*')
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as EscalationEvent[];
    },
    staleTime: 30_000,
  });
}

export function useAidRequests() {
  return useQuery({
    queryKey: ['aid_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aid_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AidRequest[];
    },
    staleTime: 30_000,
  });
}

// ────────────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────────────

export function useUpdateMissingPersonStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: PersonStatus; notes?: string }) => {
      const { error } = await supabase
        .from('missing_persons')
        .update({ status, notes: notes ?? null, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['missing_persons'] }),
  });
}

export function useInsertDamageReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: Omit<DamageReport, 'id' | 'created_at' | 'reported_at'>) => {
      const { error } = await supabase.from('damage_reports').insert(report);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['damage_reports'] }),
  });
}

export function useAcceptAidMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, inventoryId, score }: { requestId: string; inventoryId: string; score: number }) => {
      const { error: matchError } = await supabase
        .from('aid_matches')
        .insert({ request_id: requestId, inventory_id: inventoryId, score });
      if (matchError) throw matchError;

      await Promise.all([
        supabase.from('aid_requests').update({ status: 'matched' }).eq('id', requestId),
        supabase.from('aid_inventory').update({ status: 'matched' }).eq('id', inventoryId),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aid_requests'] });
      qc.invalidateQueries({ queryKey: ['aid_inventory'] });
    },
  });
}

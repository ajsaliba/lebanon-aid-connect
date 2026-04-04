import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface AidRequest {
  id: string;
  category: string;
  quantity: number;
  lat: number | null;
  lng: number | null;
}

interface AidInventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  lat: number | null;
  lng: number | null;
  status: string;
  updated_at: string;
}

interface MatchResult {
  inventory_id: string;
  item_name: string;
  category: string;
  quantity: number;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  score: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { requestId } = await req.json() as { requestId: string };
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'requestId is required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the request
    const { data: reqData, error: reqErr } = await supabase
      .from('aid_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqErr || !reqData) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const request = reqData as AidRequest;

    // Fetch available inventory
    const { data: inventory, error: invErr } = await supabase
      .from('aid_inventory')
      .select('*')
      .eq('status', 'available');

    if (invErr || !inventory) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch inventory' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const now = Date.now();
    const MAX_DISTANCE_KM = 50;

    const scored: MatchResult[] = (inventory as AidInventoryItem[]).map(item => {
      let score = 0;

      // 1. Category match: 40 pts
      if (item.category === request.category) score += 40;

      // 2. Location proximity: up to 30 pts (max 50 km)
      let distKm: number | null = null;
      if (request.lat && request.lng && item.lat && item.lng) {
        distKm = haversineKm(request.lat, request.lng, item.lat, item.lng);
        if (distKm <= MAX_DISTANCE_KM) {
          score += Math.round(30 * (1 - distKm / MAX_DISTANCE_KM));
        }
      } else {
        score += 15; // partial credit when location unknown
      }

      // 3. Quantity adequacy: up to 20 pts
      if (item.quantity >= request.quantity) {
        score += 20;
      } else if (item.quantity > 0) {
        score += Math.round(20 * (item.quantity / request.quantity));
      }

      // 4. Freshness: 10 pts (prefer items not recently updated)
      const updatedMsAgo = now - new Date(item.updated_at).getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      if (updatedMsAgo > dayMs) score += 10;

      return {
        inventory_id: item.id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        lat: item.lat,
        lng: item.lng,
        distance_km: distKm,
        score,
      };
    });

    const top5 = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return new Response(JSON.stringify(top5), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});

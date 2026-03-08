import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeoResult {
  display_name: string;
  lat: number;
  lng: number;
  type: string;
}

export function useGeocode() {
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('geocode', {
          body: { query },
        });
        if (!error && data?.results) {
          setResults(data.results);
        }
      } catch {
        // silent fail
      }
      setLoading(false);
    }, 400);
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, loading, search, clear };
}

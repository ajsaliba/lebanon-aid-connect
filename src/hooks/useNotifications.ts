import { useEffect, useRef, useCallback } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useNotificationCenter, type NotificationType } from '@/contexts/NotificationCenterContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: string; freq: number }> = {
  conflict: { label: '🔴 AIRSTRIKE / CONFLICT', icon: '💥', freq: 800 },
  news: { label: '🟡 WAR UPDATE', icon: '📰', freq: 600 },
  shelter: { label: '🟢 NEW SHELTER', icon: '🏠', freq: 400 },
  housing: { label: '🔵 NEW HOUSING', icon: '🏘️', freq: 500 },
  humanitarian: { label: '🟠 HUMANITARIAN', icon: '🆘', freq: 700 },
  infrastructure: { label: '⚪ INFRASTRUCTURE', icon: '🏗️', freq: 550 },
};

const MIDDLE_EAST_KEYWORDS = [
  'lebanon', 'beirut', 'sidon', 'tyre', 'nabatieh', 'tripoli', 'bekaa',
  'gaza', 'rafah', 'khan younis', 'west bank', 'palestine', 'israel', 'jerusalem',
  'iran', 'tehran', 'isfahan', 'iraq', 'baghdad', 'syria', 'damascus', 'aleppo',
  'yemen', 'sanaa', 'houthi', 'hezbollah', 'hamas', 'middle east',
];

const WAR_KEYWORDS = [
  'war', 'airstrike', 'strike', 'missile', 'rocket', 'attack', 'bomb', 'shelling',
  'ceasefire', 'military', 'troops', 'invasion', 'casualties', 'killed', 'wounded',
  'evacuation', 'displaced', 'hostilities', 'offensive', 'defense',
];

function isMiddleEastWarRelated(text: string, source: string, category: string): boolean {
  const lower = `${text} ${source}`.toLowerCase();
  const hasME = MIDDLE_EAST_KEYWORDS.some((k) => lower.includes(k));
  const hasWar = WAR_KEYWORDS.some((k) => lower.includes(k));

  if (category === 'conflict') return hasME;
  if (category === 'humanitarian' || category === 'infrastructure') return hasME && hasWar;
  return hasME && hasWar;
}

function playAlertSound(type: NotificationType) {
  try {
    const ctx = new AudioContext();
    const config = TYPE_CONFIG[type];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type === 'conflict' ? 'sawtooth' : 'sine';
    osc.frequency.value = config.freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio unavailable
  }
}

const SOS_PROXIMITY_KM = 10;

export function useNotifications() {
  const { news } = useNewsFeedContext();
  const { addNotification } = useNotificationCenter();
  const { position } = useGeolocation();
  const seenNewsIds = useRef<Set<string>>(new Set());
  const initialLoad = useRef(true);
  const shelterPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const housingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenShelterIds = useRef<Set<string>>(new Set());
  const seenHousingIds = useRef<Set<string>>(new Set());
  const seenSosIds = useRef<Set<string>>(new Set());
  const posRef = useRef(position);

  useEffect(() => {
    if (initialLoad.current) {
      news.forEach((n) => seenNewsIds.current.add(n.id));
      initialLoad.current = false;
      return;
    }

    const newItems = news
      .filter((n) => !seenNewsIds.current.has(n.id))
      .filter((n) => isMiddleEastWarRelated(`${n.title} ${n.summary}`, n.source, n.category));

    news.forEach((n) => seenNewsIds.current.add(n.id));

    newItems.slice(0, 3).forEach((item, i) => {
      setTimeout(() => {
        let type: NotificationType = 'news';
        if (item.category === 'conflict' || item.severity === 'high') type = 'conflict';
        else if (item.category === 'humanitarian') type = 'humanitarian';
        else if (item.category === 'infrastructure') type = 'infrastructure';

        const cleanTitle = sanitizeFeedText(item.title);
        playAlertSound(type);
        toast({
          title: TYPE_CONFIG[type].label,
          description: `${TYPE_CONFIG[type].icon} ${cleanTitle} — ${item.source}`,
          variant: type === 'conflict' ? 'destructive' : 'default',
          duration: type === 'conflict' ? 8000 : 5000,
        });

        addNotification({
          type,
          title: cleanTitle,
          source: item.source,
        });
      }, i * 1500);
    });
  }, [news, addNotification]);

  const checkShelters = useCallback(async () => {
    const { data } = await supabase.from('shelters').select('id,name').order('created_at', { ascending: false }).limit(10);
    if (!data) return;

    if (seenShelterIds.current.size === 0) {
      data.forEach((s) => seenShelterIds.current.add(s.id));
      return;
    }

    data.forEach((s) => {
      if (!seenShelterIds.current.has(s.id)) {
        seenShelterIds.current.add(s.id);
        const title = sanitizeFeedText(s.name);
        playAlertSound('shelter');
        toast({ title: TYPE_CONFIG.shelter.label, description: `${TYPE_CONFIG.shelter.icon} ${title}` });
        addNotification({ type: 'shelter', title });
      }
    });
  }, [addNotification]);

  const checkHousing = useCallback(async () => {
    const { data } = await supabase.from('housing_listings').select('id,title').order('created_at', { ascending: false }).limit(10);
    if (!data) return;

    if (seenHousingIds.current.size === 0) {
      data.forEach((h) => seenHousingIds.current.add(h.id));
      return;
    }

    data.forEach((h) => {
      if (!seenHousingIds.current.has(h.id)) {
        seenHousingIds.current.add(h.id);
        const title = sanitizeFeedText(h.title);
        playAlertSound('housing');
        toast({ title: TYPE_CONFIG.housing.label, description: `${TYPE_CONFIG.housing.icon} ${title}` });
        addNotification({ type: 'housing', title });
      }
    });
  }, [addNotification]);

  useEffect(() => {
    checkShelters();
    checkHousing();
    shelterPollRef.current = setInterval(checkShelters, 60_000);
    housingPollRef.current = setInterval(checkHousing, 60_000);
    return () => {
      if (shelterPollRef.current) clearInterval(shelterPollRef.current);
      if (housingPollRef.current) clearInterval(housingPollRef.current);
    };
  }, [checkShelters, checkHousing]);
}

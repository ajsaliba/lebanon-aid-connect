import { useEffect, useRef, useCallback } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type NotificationType = 'conflict' | 'news' | 'shelter' | 'housing' | 'humanitarian' | 'infrastructure';

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: string; freq: number }> = {
  conflict: { label: '🔴 AIRSTRIKE / CONFLICT', icon: '💥', freq: 800 },
  news: { label: '🟡 NEWS UPDATE', icon: '📰', freq: 600 },
  shelter: { label: '🟢 NEW SHELTER', icon: '🏠', freq: 400 },
  housing: { label: '🔵 NEW HOUSING', icon: '🏘️', freq: 500 },
  humanitarian: { label: '🟠 HUMANITARIAN', icon: '🆘', freq: 700 },
  infrastructure: { label: '⚪ INFRASTRUCTURE', icon: '🏗️', freq: 550 },
};

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

    if (type === 'conflict') {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sawtooth';
      osc2.frequency.value = config.freq * 1.5;
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.6);
    }
  } catch {
    // Audio not available
  }
}

function showNotification(type: NotificationType, title: string, source?: string) {
  const config = TYPE_CONFIG[type];
  toast({
    title: config.label,
    description: `${config.icon} ${title}${source ? ` — ${source}` : ''}`,
    variant: type === 'conflict' ? 'destructive' : 'default',
    duration: type === 'conflict' ? 8000 : 5000,
  });
}

export function useNotifications() {
  const { news } = useNewsFeedContext();
  const seenNewsIds = useRef<Set<string>>(new Set());
  const initialLoad = useRef(true);
  const shelterPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const housingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenShelterIds = useRef<Set<string>>(new Set());
  const seenHousingIds = useRef<Set<string>>(new Set());

  // Track new news/conflict items
  useEffect(() => {
    if (initialLoad.current) {
      // On first load, just record all existing IDs without notifying
      news.forEach(n => seenNewsIds.current.add(n.id));
      initialLoad.current = false;
      return;
    }

    const newItems = news.filter(n => !seenNewsIds.current.has(n.id));
    news.forEach(n => seenNewsIds.current.add(n.id));

    // Notify for new items (max 3 to avoid spam)
    const toNotify = newItems.slice(0, 3);
    toNotify.forEach((item, i) => {
      setTimeout(() => {
        let type: NotificationType = 'news';
        if (item.category === 'conflict' || item.severity === 'high') type = 'conflict';
        else if (item.category === 'humanitarian') type = 'humanitarian';
        else if (item.category === 'infrastructure') type = 'infrastructure';

        playAlertSound(type);
        showNotification(type, item.title, item.source);
      }, i * 1500); // stagger notifications
    });

    if (newItems.length > 3) {
      setTimeout(() => {
        toast({
          title: '📢 More updates',
          description: `+${newItems.length - 3} additional updates received`,
          duration: 4000,
        });
      }, 3 * 1500);
    }
  }, [news]);

  // Poll for new shelters
  const checkShelters = useCallback(async () => {
    const { data } = await supabase.from('shelters').select('id,name').order('created_at', { ascending: false }).limit(10);
    if (!data) return;

    if (seenShelterIds.current.size === 0) {
      data.forEach(s => seenShelterIds.current.add(s.id));
      return;
    }

    data.forEach(s => {
      if (!seenShelterIds.current.has(s.id)) {
        seenShelterIds.current.add(s.id);
        playAlertSound('shelter');
        showNotification('shelter', s.name);
      }
    });
  }, []);

  // Poll for new housing
  const checkHousing = useCallback(async () => {
    const { data } = await supabase.from('housing_listings').select('id,title').order('created_at', { ascending: false }).limit(10);
    if (!data) return;

    if (seenHousingIds.current.size === 0) {
      data.forEach(h => seenHousingIds.current.add(h.id));
      return;
    }

    data.forEach(h => {
      if (!seenHousingIds.current.has(h.id)) {
        seenHousingIds.current.add(h.id);
        playAlertSound('housing');
        showNotification('housing', h.title);
      }
    });
  }, []);

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

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation, getDirectionsUrl } from '@/hooks/useGeolocation';
import { mockEmergencyContacts } from '@/data/mockData';
import {
  Phone, Share2, Loader2, MapPin, AlertTriangle, Shield, Building2, Heart, Stethoscope,
  Navigation, Users, Clock, CheckCircle2, Radio, XCircle, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

const catIcons = { emergency: Shield, embassy: Building2, ngo: Heart, medical: Stethoscope };
const catColors = { emergency: 'text-danger', embassy: 'text-info', ngo: 'text-success', medical: 'text-warning' };

const NEEDS_OPTIONS = ['Medical', 'Water', 'Food', 'Shelter', 'Evacuation', 'Trapped', 'Children', 'Elderly'] as const;
const NEEDS_KEYS: Record<string, string> = {
  Medical: 'sos.needMedical', Water: 'sos.needWater', Food: 'sos.needFood',
  Shelter: 'sos.needShelter', Evacuation: 'sos.needEvacuation', Trapped: 'sos.needTrapped',
  Children: 'sos.needChildren', Elderly: 'sos.needElderly',
};

interface SOSSignal {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  message: string | null;
  status: string;
  people_count: number;
  needs: string[];
  contact_phone: string | null;
  created_at: string;
}

export function SOSPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { position, loading: geoLoading, refresh: refreshGeo } = useGeolocation();

  const [activeSignals, setActiveSignals] = useState<SOSSignal[]>([]);
  const [myActiveSignal, setMyActiveSignal] = useState<SOSSignal | null>(null);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // SOS form state
  const [sosMessage, setSosMessage] = useState('');
  const [sosPeople, setSosPeople] = useState('1');
  const [sosPhone, setSosPhone] = useState('');
  const [sosNeeds, setSosNeeds] = useState<string[]>([]);

  // Fetch active SOS signals
  const fetchSignals = useCallback(async () => {
    const { data } = await supabase
      .from('sos_signals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (data) {
      setActiveSignals(data as SOSSignal[]);
      if (user) {
        const mine = data.find((s: any) => s.user_id === user.id);
        setMyActiveSignal(mine as SOSSignal || null);
      }
    }
  }, [user]);

  // Subscribe to realtime SOS signals
  useEffect(() => {
    fetchSignals();
    const channel = supabase
      .channel('sos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_signals' }, () => {
        fetchSignals();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSignals]);

  // Send SOS distress signal
  const sendSOS = async () => {
    if (!user) {
      toast({ title: t('sos.signInRequired'), description: t('sos.signInDesc'), variant: 'destructive' });
      return;
    }
    if (!position) {
      refreshGeo();
      toast({ title: t('sos.gettingLocation'), description: t('sos.allowLocation') });
      return;
    }
    setSending(true);
    const { error } = await supabase.from('sos_signals').insert({
      user_id: user.id,
      lat: position.lat,
      lng: position.lng,
      accuracy: position.accuracy,
      message: sosMessage || null,
      people_count: parseInt(sosPeople) || 1,
      needs: sosNeeds,
      contact_phone: sosPhone || null,
    });
    setSending(false);
    if (error) {
      toast({ title: t('sos.errorSending'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('sos.sosSent'), description: t('sos.sosSentDesc') });
      setShowSOSDialog(false);
      setSosMessage('');
      setSosNeeds([]);
      fetchSignals();
    }
  };

  // Cancel/resolve SOS
  const resolveMySignal = async () => {
    if (!myActiveSignal) return;
    await supabase.from('sos_signals').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', myActiveSignal.id);
    toast({ title: t('sos.resolved'), description: t('sos.resolvedDesc') });
    setMyActiveSignal(null);
    fetchSignals();
  };

  // "I'm Safe" check-in
  const checkInSafe = async () => {
    if (!user) {
      toast({ title: t('sos.signInRequired'), variant: 'destructive' });
      return;
    }
    setCheckingIn(true);
    await supabase.from('safety_checkins').insert({
      user_id: user.id,
      lat: position?.lat || null,
      lng: position?.lng || null,
      status: 'safe',
      message: 'I am safe',
    });
    setCheckingIn(false);
    toast({ title: t('sos.checkedInSafe'), description: t('sos.checkedInDesc') });
  };

  // Share location via WhatsApp or native share
  const shareLocationWhatsApp = () => {
    if (!position) { refreshGeo(); toast({ title: t('sos.gettingLocation'), description: t('sos.allowLocation') }); return; }
    const text = encodeURIComponent(
      `🆘 EMERGENCY — I need help!\n📍 https://www.google.com/maps?q=${position.lat},${position.lng}\n⏰ ${new Date().toLocaleString()}`
    );
    const url = `https://wa.me/?text=${text}`;
    try { window.open(url, '_blank', 'noopener'); } catch { window.location.href = url; }
  };

  const toggleNeed = (need: string) => {
    setSosNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
  };

  const timeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return t('time.justNow');
    if (mins < 60) return `${mins}${t('time.mAgo')}`;
    return `${Math.floor(mins / 60)}${t('time.hAgo')}`;
  };

  return (
    <div className="space-y-3 p-3">
      {/* === BIG SOS BUTTON === */}
      <div className="flex flex-col items-center gap-3 py-4 border border-danger/20 rounded-lg bg-danger/5">
        {myActiveSignal ? (
          <>
            <div className="flex items-center gap-2 text-danger text-xs font-bold animate-pulse">
              <Radio className="h-4 w-4" /> {t('sos.sosActive')}
            </div>
            <p className="text-[10px] text-muted-foreground text-center px-4">
              {t('sos.respondersCanSee')}
            </p>
            <Button
              onClick={resolveMySignal}
              variant="outline"
              className="h-8 text-xs gap-1.5 border-success/50 text-success hover:bg-success/10"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {t('sos.imSafeCancelSOS')}
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowSOSDialog(true)}
              className="relative w-24 h-24 rounded-full bg-danger text-danger-foreground flex flex-col items-center justify-center shadow-lg shadow-danger/40 hover:scale-105 active:scale-95 transition-transform"
              aria-label="Send SOS Distress Signal"
            >
              <AlertTriangle className="h-8 w-8 mb-0.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('tab.sos')}</span>
            </button>
            <span className="text-[10px] text-muted-foreground text-center">
              {t('sos.tapToBroadcast')}
            </span>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-1.5">
        <Button
          onClick={() => window.location.href = 'tel:140'}
          className="h-9 text-[10px] gap-1.5 bg-danger/90 hover:bg-danger text-danger-foreground"
        >
          <Phone className="h-3.5 w-3.5" /> {t('sos.callRedCross')}
        </Button>
        <Button
          onClick={shareLocationWhatsApp}
          disabled={geoLoading}
          className="h-9 text-[10px] gap-1.5 bg-success/90 hover:bg-success text-success-foreground"
        >
          {geoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
          {t('sos.shareWhatsApp')}
        </Button>
      </div>

      {/* I'm Safe Check-in */}
      <Button
        onClick={checkInSafe}
        disabled={checkingIn || !user}
        variant="outline"
        className="w-full h-8 text-xs gap-1.5 border-success/50 text-success hover:bg-success/10"
      >
        {checkingIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
        {t('sos.imSafeCheckIn')}
      </Button>

      {position && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
          <MapPin className="h-3 w-3 text-danger shrink-0" />
          <span>{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
          <span className="text-muted-foreground/60">±{Math.round(position.accuracy)}m</span>
        </div>
      )}

      {/* Active SOS Feed (for responders) */}
      {activeSignals.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-danger animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-danger">
              {t('sos.activeDistress')} ({activeSignals.length})
            </span>
          </div>
          {activeSignals.slice(0, 10).map(signal => (
            <div key={signal.id} className="p-2 rounded border border-danger/30 bg-danger/5 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-danger" />
                  <span className="font-semibold text-foreground">
                    {signal.people_count} {signal.people_count === 1 ? t('sos.person') : t('sos.people')}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2 w-2" /> {timeSince(signal.created_at)}
                </span>
              </div>
              {signal.message && <p className="text-muted-foreground">{signal.message}</p>}
              {signal.needs.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {signal.needs.map(n => (
                    <Badge key={n} variant="outline" className="text-[8px] h-4 border-danger/40 text-danger">{n}</Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                {signal.contact_phone && (
                  <Button variant="outline" size="sm" className="h-5 text-[9px] gap-0.5 flex-1 border-danger/50 text-danger" onClick={() => window.location.href = `tel:${signal.contact_phone}`}>
                    <Phone className="h-2 w-2" /> {t('sos.call')}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-5 text-[9px] gap-0.5 flex-1 border-info/50 text-info" onClick={() => window.open(getDirectionsUrl(signal.lat, signal.lng), '_blank')}>
                  <Navigation className="h-2 w-2" /> {t('sos.navigate')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Tips */}
      <div className="p-2 rounded border border-warning/30 bg-warning/5 text-[10px] space-y-1">
        <div className="flex items-center gap-1 text-warning font-bold text-xs">
          <AlertTriangle className="h-3 w-3" /> {t('sos.safetyTips')}
        </div>
        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
          <li>{t('sos.tip1')}</li>
          <li>{t('sos.tip2')}</li>
          <li>{t('sos.tip3')}</li>
          <li>{t('sos.tip4')}</li>
          <li>{t('sos.tip5')}</li>
        </ul>
      </div>

      {/* Emergency Contacts */}
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-danger flex items-center gap-2">
        <Phone className="h-3 w-3" /> {t('emergency.contacts')}
      </h2>
      {mockEmergencyContacts.map((contact) => {
        const Icon = catIcons[contact.category];
        return (
          <div key={contact.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${catColors[contact.category]}`} />
              <div className="flex-1 min-w-0">
                <div className="font-sans font-semibold text-foreground text-xs">{contact.name}</div>
                <div className="text-muted-foreground text-[10px]">{contact.description}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-6 text-[10px] gap-1 border-danger/50 text-danger hover:bg-danger/10"
              onClick={() => window.location.href = `tel:${contact.phone}`}
            >
              <Phone className="h-2.5 w-2.5" /> {contact.phone}
            </Button>
          </div>
        );
      })}

      {/* SOS Detail Dialog */}
      <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm text-danger flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {t('sos.sendDistress')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              {t('sos.gpsBroadcast')}
            </p>

            <div className="space-y-1">
              <Label className="text-xs">{t('sos.whatDoYouNeed')}</Label>
              <div className="flex flex-wrap gap-1">
                {NEEDS_OPTIONS.map(need => (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className={cn(
                      'px-2 py-1 rounded text-[10px] border transition-colors',
                      sosNeeds.includes(need)
                        ? 'bg-danger/10 border-danger/50 text-danger font-semibold'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {t(NEEDS_KEYS[need])}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t('sos.peopleWithYou')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={sosPeople}
                  onChange={e => setSosPeople(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('sos.phoneForRescuers')}</Label>
                <Input
                  value={sosPhone}
                  onChange={e => setSosPhone(e.target.value)}
                  placeholder="+961..."
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t('sos.additionalDetails')}</Label>
              <Textarea
                value={sosMessage}
                onChange={e => setSosMessage(e.target.value)}
                placeholder={t('sos.detailsPlaceholder')}
                className="text-xs min-h-[60px]"
              />
            </div>

            {position ? (
              <div className="flex items-center gap-1.5 text-[10px] text-success bg-success/5 rounded p-1.5 border border-success/20">
                <MapPin className="h-3 w-3" />
                <span>{t('sos.locationLocked')}: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-warning bg-warning/5 rounded p-1.5 border border-warning/20">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t('sos.gettingYourLocation')}</span>
              </div>
            )}

            <Button
              onClick={sendSOS}
              disabled={sending || !position || sosNeeds.length === 0}
              className="w-full h-9 text-xs gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground font-bold"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {t('sos.broadcastSignal')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

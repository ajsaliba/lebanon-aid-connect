import { useState } from 'react';
import { Send, Loader2, MessageCircle, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const SAMPLE_CONTACTS = [
  { id: '1', name: 'Red Cross Lebanon', phone: '+9611140' },
  { id: '2', name: 'Civil Defense', phone: '+9611125' },
  { id: '3', name: 'UN OCHA', phone: '+9611981288' },
  { id: '4', name: 'MSF Lebanon', phone: '+9611612750' },
];

const MAX_SMS_CHARS = 160;

type Channel = 'sms' | 'whatsapp';

export function BroadcastAlertDialog() {
  const { user } = useAuth();
  const { canCoordinate } = useProfile();

  // Only coordinators and admins can broadcast alerts
  if (!canCoordinate) return null;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<Channel>('sms');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const toggleContact = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!message.trim() || selected.size === 0) return;
    setSending(true);

    const recipients = SAMPLE_CONTACTS
      .filter(c => selected.has(c.id))
      .map(c => c.phone);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          to: recipients,
          message,
          channel,
          senderId: user?.id ?? 'anonymous',
        }),
      });

      const result = await res.json() as { success?: number; failed?: number; error?: string };

      if (result.error) {
        toast({ title: 'Broadcast failed', description: result.error, variant: 'destructive' });
      } else {
        toast({
          title: 'Broadcast sent',
          description: `${result.success ?? selected.size} message(s) sent via ${channel.toUpperCase()}`,
        });
        setOpen(false);
        setMessage('');
        setSelected(new Set());
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full h-8 text-xs gap-1.5 border-warning/50 text-warning hover:bg-warning/10"
      >
        <Send className="h-3 w-3" /> Broadcast Alert
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-sm text-warning flex items-center gap-2">
              <Send className="h-4 w-4" /> Broadcast Alert
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Recipients */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Recipients</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {SAMPLE_CONTACTS.map(contact => (
                  <label
                    key={contact.id}
                    className="flex items-center gap-2 px-2 py-1 rounded border border-border hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                      className="h-3 w-3"
                    />
                    <span className="text-xs font-medium">{contact.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto font-mono">{contact.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Channel toggle */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Channel</p>
              <div className="flex rounded border border-border overflow-hidden">
                {(['sms','whatsapp'] as Channel[]).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1 transition-colors',
                      channel === ch
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {ch === 'sms' ? <Phone className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                    {ch === 'sms' ? 'SMS' : 'WhatsApp'}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Message</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_SMS_CHARS))}
                placeholder="Enter alert message..."
                className="w-full bg-muted border border-border rounded px-3 py-2 text-xs min-h-[80px] resize-none focus:outline-none focus:border-primary/50"
              />
              <p className="text-[10px] font-mono text-muted-foreground text-right mt-0.5">
                {message.length}/{MAX_SMS_CHARS}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20"
                onClick={handleSend}
                disabled={sending || !message.trim() || selected.size === 0}
              >
                {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Send to {selected.size} contact{selected.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

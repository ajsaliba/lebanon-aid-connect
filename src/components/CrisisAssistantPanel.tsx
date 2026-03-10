import { useState } from 'react';
import { Bot, Send, Shield, Navigation, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

const quickActions = [
  { icon: '🚨', label: 'Nearest shelter', query: 'Where is the nearest shelter from my location?' },
  { icon: '🏥', label: 'Find hospital', query: 'Which hospitals are currently operational nearby?' },
  { icon: '🛣️', label: 'Safe route', query: 'What is the safest route to leave Beirut right now?' },
  { icon: '💧', label: 'Water point', query: 'Where can I find clean water distribution?' },
  { icon: '📶', label: 'Internet access', query: 'Where can I get internet access nearby?' },
  { icon: '⚡', label: 'Charge phone', query: 'Where can I charge my phone?' },
];

const presetResponses: Record<string, string> = {
  shelter: '📍 Nearest shelters:\n1. Al-Amine Mosque Basement (1.2km) — capacity 200, safety ★★★★★\n2. AUB Medical Center Parking (2.4km) — capacity 150, safety ★★★★\n3. Verdun Commercial Center (3.1km) — capacity 80, safety ★★★\n\nHead to Al-Amine Mosque via Ras Beirut road (currently clear).',
  hospital: '🏥 Operational hospitals:\n1. AUBMC — fully operational, accepting patients\n2. Rafik Hariri Hospital — operational, high load\n3. Hôtel-Dieu de France — limited capacity\n\n⚠️ Avoid Dahieh area hospitals — currently inaccessible.',
  route: '🛣️ Safest route from Beirut:\n1. North: Jounieh Highway → Byblos (clear, ~45min)\n2. East: Sin el-Fil → Metn → Zahle (LAF checkpoint, 30min delay)\n\n❌ Avoid: Southern suburbs, Chouf mountain road (landslide), Sidon highway (heavy traffic).',
  water: '💧 Water distribution points:\n1. UNICEF Water Tank — Shatila (2.1km) 7AM–7PM\n2. WFP Distribution — Cola (3.5km) 8AM–2PM\n\n💡 Tip: Bring your own containers. Lines are shorter early morning.',
  internet: '📶 Internet access points:\n1. Starbucks Hamra WiFi (free, 10Mbps) — 0.8km\n2. AUB Emergency WiFi (free, 25Mbps) — 1.5km\n3. Net Zone Jounieh ($2/hr, generator-powered) — 12km\n\n💡 Tip: SMS reports work via Red Cross at #1199 (no internet needed).',
  charge: '⚡ Charging locations:\n1. UNDP Solar Hub — Verdun (free, 30 USB ports) 8AM–6PM\n2. Power Bank Exchange — Cola (free swap) 9AM–5PM\n3. Community Generator — Hamra (free, bring cord) 6PM–6AM\n\n💡 One car battery = ~20 full phone charges.',
};

function getResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('shelter')) return presetResponses.shelter;
  if (q.includes('hospital') || q.includes('medical')) return presetResponses.hospital;
  if (q.includes('route') || q.includes('leave') || q.includes('evacuate')) return presetResponses.route;
  if (q.includes('water')) return presetResponses.water;
  if (q.includes('internet') || q.includes('wifi')) return presetResponses.internet;
  if (q.includes('charge') || q.includes('phone') || q.includes('battery')) return presetResponses.charge;
  return '🤖 I can help you find shelters, hospitals, safe routes, water, internet, and charging points. Try asking about one of these topics.\n\n⚠️ For immediate emergencies, press the SOS button or call:\n• Lebanese Red Cross: 140\n• Civil Defense: 125\n• Army: 1701';
}

export function CrisisAssistantPanel() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'assistant', text: '🤖 Crisis AI Assistant ready. Ask me about shelters, hospitals, safe routes, water, internet, or charging points. I can help you navigate the crisis.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (query: string) => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { id: messages.length, role: 'user', text: query };
    const response = getResponse(query);
    const botMsg: ChatMessage = { id: messages.length + 1, role: 'assistant', text: response };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Brain className="h-3 w-3" /> {t('crisisAI.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('crisisAI.subtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        {quickActions.map(qa => (
          <button key={qa.label} onClick={() => handleSend(qa.query)}
            className="text-[7px] p-1 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-center">
            <span className="text-sm block">{qa.icon}</span>
            {qa.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={cn('rounded p-2 text-[9px] whitespace-pre-line',
            msg.role === 'user' ? 'bg-primary/10 text-foreground ml-4' : 'bg-muted/30 text-foreground mr-4'
          )}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border flex gap-1">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(input)}
          placeholder={t('crisisAI.placeholder')}
          className="h-7 text-xs flex-1"
        />
        <button onClick={() => handleSend(input)}
          className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
          <Send className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

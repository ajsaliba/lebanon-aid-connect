import { useState } from 'react';
import { mockCommunityChannels } from '@/data/extendedMockData';
import { MessageSquare, Users, Hash, Megaphone, HelpCircle, Search, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const channelTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  neighborhood: { icon: <Users className="h-3 w-3" />, color: 'text-primary' },
  topic: { icon: <Hash className="h-3 w-3" />, color: 'text-info' },
  emergency: { icon: <Radio className="h-3 w-3" />, color: 'text-danger' },
  mutual_aid: { icon: <HelpCircle className="h-3 w-3" />, color: 'text-success' },
  announcement: { icon: <Megaphone className="h-3 w-3" />, color: 'text-warning' },
};

export function CommunityPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = mockCommunityChannels.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const totalMembers = mockCommunityChannels.reduce((s, c) => s + c.member_count, 0);
  const activeChannels = mockCommunityChannels.filter(c => c.is_active).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3" /> {t('community.channelsTitle')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('community.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockCommunityChannels.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('community.channels')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{activeChannels}</div>
          <div className="text-[7px] text-muted-foreground">{t('community.active')}</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{totalMembers.toLocaleString()}</div>
          <div className="text-[7px] text-muted-foreground">{t('community.members')}</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder={t('community.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            className="h-7 text-xs pl-7" />
        </div>
      </div>

      {/* Channels */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.map(channel => {
          const cfg = channelTypeConfig[channel.type] || channelTypeConfig.topic;
          return (
            <div key={channel.id} className="border border-border rounded p-2 space-y-1 hover:bg-muted/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <span className="text-xs font-medium">{channel.name}</span>
                  {channel.is_active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  )}
                </div>
                {channel.unread_count > 0 && (
                  <span className="text-[8px] px-1.5 py-0 rounded-full bg-primary text-primary-foreground font-bold">
                    {channel.unread_count}
                  </span>
                )}
              </div>

              <p className="text-[9px] text-muted-foreground">{channel.description}</p>

              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Users className="h-2.5 w-2.5" /> {channel.member_count} {t('community.members')}
                </span>
                <span className={cn('capitalize px-1 py-0 rounded', 
                  channel.type === 'emergency' ? 'bg-danger/20 text-danger' : 'bg-muted')}>
                  {channel.type.replace('_', ' ')}
                </span>
              </div>

              {channel.last_message && (
                <div className="bg-muted/30 rounded p-1">
                  <p className="text-[8px] text-muted-foreground truncate">{channel.last_message}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

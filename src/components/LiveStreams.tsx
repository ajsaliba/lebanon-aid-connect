import { useState } from 'react';
import { liveStreams } from '@/data/mockData';
import { Video, ChevronDown, ChevronUp, Radio, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Category = 'news' | 'lebanese' | 'camera';

export function LiveStreams() {
  const [expanded, setExpanded] = useState(false);
  const [activeStream, setActiveStream] = useState(liveStreams[0]);
  const [category, setCategory] = useState<Category>('news');

  const filtered = liveStreams.filter(s => s.category === category);

  return (
    <div className="border-t border-border">
      <button
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Video className="h-3 w-3 text-danger" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Live Streams</span>
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-danger" />
        </div>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="p-2 space-y-2">
          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {([
              { key: 'news' as const, label: 'News', icon: Radio },
              { key: 'lebanese' as const, label: 'Lebanese TV', icon: Video },
              { key: 'camera' as const, label: 'Live Cameras', icon: Camera },
            ]).map(tab => (
              <Button
                key={tab.key}
                variant={category === tab.key ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px] gap-1"
                onClick={() => { setCategory(tab.key); setActiveStream(liveStreams.find(s => s.category === tab.key) || liveStreams[0]); }}
              >
                <tab.icon className="h-3 w-3" /> {tab.label}
              </Button>
            ))}
          </div>

          {/* Stream buttons */}
          <div className="flex gap-1 flex-wrap">
            {filtered.map((stream) => (
              <Button
                key={stream.id}
                variant={activeStream.id === stream.id ? 'default' : 'ghost'}
                size="sm"
                className={cn('h-6 px-2 text-[10px]', activeStream.id === stream.id && 'ring-1 ring-primary')}
                onClick={() => setActiveStream(stream)}
              >
                {stream.channel}
              </Button>
            ))}
          </div>

          {/* Video player */}
          <div className="aspect-[16/9] bg-muted rounded overflow-hidden w-full">
            <iframe
              src={`https://www.youtube.com/embed/${activeStream.embedId}?autoplay=1&mute=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeStream.name}
            />
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{activeStream.name}</p>
        </div>
      )}
    </div>
  );
}

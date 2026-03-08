import { useState } from 'react';
import { liveStreams } from '@/data/mockData';
import { Video, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LiveStreams() {
  const [expanded, setExpanded] = useState(false);
  const [activeStream, setActiveStream] = useState(liveStreams[0]);

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
          <div className="flex gap-1 flex-wrap">
            {liveStreams.map((stream) => (
              <Button
                key={stream.id}
                variant={activeStream.id === stream.id ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => setActiveStream(stream)}
              >
                {stream.channel}
              </Button>
            ))}
          </div>
          <div className="aspect-[16/9] bg-muted rounded overflow-hidden w-full">
            <iframe
              src={`https://www.youtube.com/embed/${activeStream.embedId}?autoplay=1&mute=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeStream.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}

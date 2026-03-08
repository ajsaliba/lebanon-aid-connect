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
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Live Streams</span>
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-danger" />
        </div>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="p-2 space-y-2">
          <div className="flex gap-1">
            {liveStreams.map((stream) => (
              <Button
                key={stream.id}
                variant={activeStream.id === stream.id ? 'default' : 'ghost'}
                size="sm"
                className="h-5 px-1.5 text-[9px]"
                onClick={() => setActiveStream(stream)}
              >
                {stream.channel}
              </Button>
            ))}
          </div>
          <div className="aspect-video bg-muted rounded overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/live_stream?channel=${activeStream.channelId}&autoplay=0`}
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

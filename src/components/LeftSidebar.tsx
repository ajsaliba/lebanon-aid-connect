import { useState } from 'react';
import { NewsFeed } from './NewsFeed';
import { LiveStreams } from './LiveStreams';
import { cn } from '@/lib/utils';
import { Newspaper, Video } from 'lucide-react';

export function LeftSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside className={cn(
      'h-full border-r border-border bg-card flex flex-col overflow-hidden transition-all duration-300',
      isOpen ? 'w-96' : 'w-0'
    )}>
      {isOpen && (
        <>
          <div className="flex-1 overflow-hidden flex flex-col">
            <NewsFeed />
          </div>
          <LiveStreams />
        </>
      )}
    </aside>
  );
}

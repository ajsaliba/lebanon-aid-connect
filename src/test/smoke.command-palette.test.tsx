import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CommandPalette } from '@/components/CommandPalette';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('@/contexts/NewsFeedContext', () => ({
  useNewsFeedContext: () => ({
    news: [
      {
        id: 'n1',
        title: 'Aid convoys moving toward coastal shelters',
        summary: 'Humanitarian routes remain open.',
        source: 'Wire',
        url: 'https://example.com',
        publishedAt: new Date().toISOString(),
        severity: 'monitoring',
        category: 'humanitarian',
      },
    ],
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'cmd.searchPlaceholder': 'Search monitor data',
        'cmd.noResults': 'No results',
        'cmd.typeToSearch': 'Type to search',
        'feed.navigate': 'Navigate',
        'cmd.open': 'Open',
        'cmd.close': 'Close',
        'cmd.news': 'News',
        'cmd.hotspotZone': 'Hotspot zone',
        'cmd.hotspots': 'Hotspots',
        'cmd.infrastructure': 'Infrastructure',
        'cmd.ciiCountry': 'Country',
        'cmd.countries': 'Countries',
      };
      return labels[key] ?? key;
    },
  }),
}));

describe('Command palette smoke', () => {
  it('opens with Ctrl+K', async () => {
    render(<CommandPalette />, { wrapper: Wrapper });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });

    expect(await screen.findByPlaceholderText('Search monitor data')).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from '@/pages/Index';

let mockIsMobile = false;

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => {},
}));

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => ({ position: null }),
}));

vi.mock('@/components/TopBar', () => ({
  TopBar: () => <div data-testid="topbar" />,
}));

vi.mock('@/components/AlertTicker', () => ({
  AlertTicker: () => <div data-testid="alert-ticker" />,
}));

vi.mock('@/components/CrisisMap', () => ({
  CrisisMap: () => <div data-testid="crisis-map" />,
}));

vi.mock('@/components/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar" />,
}));

vi.mock('@/components/LeftSidebar', () => ({
  LeftSidebar: ({ mobileForceTab }: { mobileForceTab?: string }) => (
    <div data-testid="left-sidebar">{mobileForceTab ? `tab:${mobileForceTab}` : 'desktop-sidebar'}</div>
  ),
}));

vi.mock('@/components/RightPanel', () => ({
  RightPanel: () => <div data-testid="right-panel" />,
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'nav.map': 'Map',
        'nav.feed': 'Feed',
        'nav.intel': 'Intel',
        'nav.aid': 'Aid',
        'nav.tools': 'Tools',
      };
      return labels[key] ?? key;
    },
  }),
}));

describe('Root app shell smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    mockIsMobile = false;
  });

  it('loads map and side panels on desktop', () => {
    render(<Index />);

    expect(screen.getByTestId('crisis-map')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar')).toHaveTextContent('desktop-sidebar');
    expect(screen.getByTestId('right-panel')).toBeInTheDocument();
  });

  it('loads feed flow on mobile tab state', () => {
    mockIsMobile = true;
    localStorage.setItem('cedarsalert_mobiletab', JSON.stringify('feed'));

    render(<Index />);

    expect(screen.getByTestId('left-sidebar')).toHaveTextContent('tab:feed');
  });
});

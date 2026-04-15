import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

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
    localStorage.setItem('cedarsalert_shell_mode', 'legacy');
    mockIsMobile = false;
  });

  it('defaults to operations shell when legacy override is removed', () => {
    localStorage.removeItem('cedarsalert_shell_mode');

    render(<Index />, { wrapper: Wrapper });

    expect(screen.getAllByTestId('left-sidebar').length).toBeGreaterThan(1);
    expect(screen.getByText('Map Command')).toBeInTheDocument();
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

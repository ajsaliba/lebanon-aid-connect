import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RightPanel } from '@/components/RightPanel';

vi.mock('@/components/SOSPanel', () => ({
  SOSPanel: () => <div>SOS Flow Content</div>,
}));

vi.mock('@/components/SafeBuildingPanel', () => ({
  SafeBuildingPanel: () => <div>Safe Building Content</div>,
}));

vi.mock('@/components/ShelterPanel', () => ({
  ShelterPanel: () => <div>Shelter Flow Content</div>,
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'tab.sos': 'SOS',
        'tab.shelters': 'Shelters',
        'tab.housing': 'Housing',
        'tab.donate': 'Donate',
        'tab.aidMatch': 'Aid Match',
        'tab.medical': 'Medical',
        'tab.volunteer': 'Volunteer',
        'tab.family': 'Family',
        'tab.jobs': 'Jobs',
      };
      return labels[key] ?? key;
    },
  }),
}));

describe('Right panel smoke', () => {
  it('keeps SOS and shelters workflows reachable via tab switching', () => {
    render(<RightPanel isOpen onToggle={() => {}} fullWidth />);

    expect(screen.getByText('SOS Flow Content')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Shelters/i }));

    expect(screen.getByText('Shelter Flow Content')).toBeInTheDocument();
  });
});

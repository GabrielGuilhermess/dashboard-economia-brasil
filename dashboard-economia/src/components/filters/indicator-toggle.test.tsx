import { fireEvent, render, screen } from '@testing-library/react';

import { IndicatorToggle } from '@/components/filters/indicator-toggle';

const toggleIndicator = jest.fn();

jest.mock('@/store/dashboard-store', () => ({
  useDashboardStore: (selector: (state: object) => unknown) =>
    selector({
      activeIndicators: ['selic', 'ipca'],
      toggleIndicator,
    }),
}));

describe('IndicatorToggle', () => {
  beforeEach(() => {
    toggleIndicator.mockClear();
  });

  it('shows only the indicators used in the main comparative chart', () => {
    render(<IndicatorToggle />);

    expect(screen.getByRole('button', { name: 'Selic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IPCA' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dólar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'CDI' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Selic' }));
    expect(toggleIndicator).toHaveBeenCalledWith('selic');
  });
});

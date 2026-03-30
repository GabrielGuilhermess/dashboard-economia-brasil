import { fireEvent, render, screen } from '@testing-library/react';

import { PeriodSelector } from '@/components/filters/period-selector';
import { useDashboardStore } from '@/store/dashboard-store';

describe('PeriodSelector', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      theme: 'light',
      period: '1Y',
      activeIndicators: ['selic', 'ipca', 'dolar', 'cdi'],
      hoveredUF: null,
    });
  });

  it('renders UI labels in years but stores canonical period values', () => {
    render(<PeriodSelector />);

    const oneYearOption = screen.getByRole('radio', { name: '1A' });
    expect(oneYearOption).toHaveAttribute('aria-checked', 'true');

    const fiveYearsOption = screen.getByRole('radio', { name: '5A' });
    fireEvent.click(fiveYearsOption);

    expect(useDashboardStore.getState().period).toBe('5Y');
    expect(fiveYearsOption).toHaveAttribute('aria-checked', 'true');
  });
});

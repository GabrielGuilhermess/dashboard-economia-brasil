import { render, screen } from '@testing-library/react';

import { SummaryCards } from '@/components/cards/summary-cards';
import type { SummaryCard } from '@/types/economia';

describe('SummaryCards', () => {
  const cards: SummaryCard[] = [
    {
      id: 'selic',
      title: 'Selic Meta',
      value: '14,75',
      unit: '% a.a.',
      change: -0.25,
      changeLabel: 'vs reuniao anterior',
      invertSentiment: true,
      color: 'sky',
    },
    {
      id: 'pib',
      title: 'PIB Nacional',
      value: '10,94',
      unit: 'R$ tri',
      change: -1.2,
      changeLabel: 'vs ano anterior',
      invertSentiment: false,
      color: 'amber',
    },
  ];

  it('applies positive sentiment when invertSentiment is true and change is negative', () => {
    render(<SummaryCards cards={cards} />);

    const goodChange = screen.getByText('-0,25');
    const badChange = screen.getByText('-1,2');

    expect(goodChange).toHaveClass('text-success');
    expect(badChange).toHaveClass('text-danger');
  });

  it('shows stale badge based on updatedAt timestamp', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-29T20:00:00.000Z').getTime());

    render(
      <SummaryCards
        cards={cards}
        isStale
        updatedAt="2026-03-29T18:00:00.000Z"
      />,
    );

    expect(screen.getAllByText('dados de 2h atrás')).toHaveLength(2);

    jest.restoreAllMocks();
  });
});

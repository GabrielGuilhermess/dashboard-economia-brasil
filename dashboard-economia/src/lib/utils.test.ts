import {
  bcbDateToISO,
  formatCompact,
  formatCurrency,
  formatPercent,
  toCSV,
} from '@/lib/utils';

describe('utils', () => {
  it('formats currency in pt-BR', () => {
    expect(formatCurrency(5.73)).toBe('R$ 5,73');
  });

  it('formats percent with decimals', () => {
    expect(formatPercent(5.06)).toBe('5,06%');
  });

  it('formats compact monetary values', () => {
    expect(formatCompact(2_800_000_000_000)).toBe('R$ 2.8 tri');
    expect(formatCompact(350_000_000_000)).toBe('R$ 350 bi');
  });

  it('converts BCB dates to ISO', () => {
    expect(bcbDateToISO('01/03/2026')).toBe('2026-03-01');
  });

  it('exports CSV with headers', () => {
    const csv = toCSV(
      [
        { date: '2026-03-01', selic: 14.75 },
        { date: '2026-02-01', selic: 15 },
      ],
      [
        { key: 'date', label: 'Data' },
        { key: 'selic', label: 'Selic' },
      ],
    );

    expect(csv).toContain('Data,Selic');
    expect(csv).toContain('2026-03-01,14.75');
  });
});

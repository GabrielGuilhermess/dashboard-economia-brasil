export function toBcbDate(date) {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function toPtaxDate(date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export function toIsoDate(date) {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function subtractMonths(date, months) {
  const clonedDate = new Date(date);
  clonedDate.setMonth(clonedDate.getMonth() - months);
  return clonedDate;
}

export function getStartDate(period) {
  const date = new Date();

  switch (period) {
    case '1M':
      date.setDate(1);
      date.setMonth(date.getMonth() - 1);
      break;
    case '6M':
      date.setDate(1);
      date.setMonth(date.getMonth() - 5);
      break;
    case '1Y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    case '5Y':
      date.setFullYear(date.getFullYear() - 5);
      break;
    case '10Y':
      date.setFullYear(date.getFullYear() - 10);
      break;
    default:
      throw new Error(`Periodo nao suportado: ${period}`);
  }

  return date;
}

export function filterSeriesByStartDate(series, startDate) {
  const startKey = formatDateKey(startDate);
  return series.filter((point) => point.date >= startKey);
}

export function normalizeSeriesForPeriod(series) {
  const lastValueByMonth = new Map();

  for (const point of series) {
    const monthKey = point.date.slice(0, 7);
    lastValueByMonth.set(monthKey, point);
  }

  return [...lastValueByMonth.entries()]
    .sort(([leftMonth], [rightMonth]) => leftMonth.localeCompare(rightMonth))
    .map(([monthKey, point]) => ({
      date: `${monthKey}-01`,
      value: point.value,
    }));
}

export function calcPercentChange(current, previous) {
  if (previous === 0) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

export function sumLastN(series, count) {
  return series
    .slice(-count)
    .reduce((total, point) => total + point.value, 0);
}

export function sumPreviousWindow(series, count) {
  return series
    .slice(-(count * 2), -count)
    .reduce((total, point) => total + point.value, 0);
}

export function formatDecimal(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

export function formatTri(valueInThousandReais) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueInThousandReais / 1_000_000_000);
}

export function toPeriodSlug(period) {
  return period.toLowerCase();
}

import { RowData, GlobalFilterState } from './types';

export function filterData(data: RowData[], filters: GlobalFilterState): RowData[] {
  return data.filter(row => {
    // Source
    if (filters.source !== 'All' && row.source !== filters.source) return false;

    // Date Range
    if (filters.dateRange.from) {
      const fromStr = filters.dateRange.from.toISOString().split('T')[0];
      if (row.dateStr < fromStr) return false;
    }
    if (filters.dateRange.to) {
      const toStr = filters.dateRange.to.toISOString().split('T')[0];
      if (row.dateStr > toStr) return false;
    }

    // Topic
    if (filters.topic !== 'All' && row.topic !== filters.topic) return false;

    // Sentiment
    if (filters.sentiment !== 'All' && row.sentiment !== filters.sentiment) return false;

    // Aspect
    if (filters.aspect !== 'All') {
      const match1 = row.aspect1 === filters.aspect;
      const match2 = row.aspect2 === filters.aspect;
      if (!match1 && !match2) return false;
    }

    // Hide Umum
    if (filters.hideUmum) {
      if (row.aspect1 === 'Umum') return false;
    }

    // Min aspect score
    if (row.aspectScore < filters.minAspectScore) return false;

    return true;
  });
}

export function searchFilter(data: RowData[], query: string): RowData[] {
  if (!query) return data;
  const lower = query.toLowerCase();
  return data.filter(row => row.text.toLowerCase().includes(lower));
}

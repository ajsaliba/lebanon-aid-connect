/**
 * Data export utilities — CSV and JSON export of dashboard state.
 * Follows World Monitor's data export pattern.
 */

import { type NewsItem } from '@/data/mockData';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportNewsAsCSV(news: NewsItem[], filename = 'cedarsalert-export') {
  const headers = ['Title', 'Source', 'Category', 'Severity', 'Published', 'URL', 'Lat', 'Lng', 'Summary'];
  const rows = news.map(n => [
    escapeCsv(n.title),
    escapeCsv(n.source),
    n.category,
    n.severity,
    n.publishedAt,
    n.url || '',
    n.lat?.toString() || '',
    n.lng?.toString() || '',
    escapeCsv(n.summary || ''),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const ts = new Date().toISOString().split('T')[0];
  downloadFile(csv, `${filename}-${ts}.csv`, 'text/csv');
}

export function exportNewsAsJSON(news: NewsItem[], filename = 'cedarsalert-export') {
  const data = {
    exportedAt: new Date().toISOString(),
    articleCount: news.length,
    articles: news.map(n => ({
      title: n.title,
      source: n.source,
      category: n.category,
      severity: n.severity,
      publishedAt: n.publishedAt,
      url: n.url,
      lat: n.lat,
      lng: n.lng,
      summary: n.summary,
    })),
  };

  const ts = new Date().toISOString().split('T')[0];
  downloadFile(JSON.stringify(data, null, 2), `${filename}-${ts}.json`, 'application/json');
}

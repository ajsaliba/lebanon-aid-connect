/**
 * Intelligence Signals Engine — cross-stream correlation detection.
 * Detects convergence, velocity spikes, and triangulation patterns.
 */

import { useMemo } from 'react';
import { type NewsItem } from '@/data/mockData';
import { getSourceProfile } from '@/config/sourceReliability';

export interface IntelSignal {
  id: string;
  type: 'convergence' | 'velocity_spike' | 'triangulation' | 'geographic_convergence' | 'hotspot_escalation';
  title: string;
  description: string;
  confidence: number; // 0-1
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  relatedArticles: string[];
}

function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const topics: string[] = [];
  const keywords = [
    'airstrike', 'ceasefire', 'missile', 'drone', 'nuclear', 'invasion',
    'sanctions', 'humanitarian', 'evacuation', 'bombing', 'deployment',
    'escalation', 'retaliation', 'blockade', 'infrastructure', 'hospital',
    'refugee', 'displacement', 'negotiation', 'truce', 'offensive',
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) topics.push(kw);
  }
  return topics;
}

export function useIntelSignals(news: NewsItem[]): IntelSignal[] {
  return useMemo(() => {
    const signals: IntelSignal[] = [];
    const now = Date.now();
    const oneHour = 3600000;
    const thirtyMin = 1800000;

    // Only analyze recent news
    const recent = news.filter(n => now - new Date(n.publishedAt).getTime() < oneHour * 6);
    if (recent.length < 3) return signals;

    // 1. Velocity Spike — topic mention rate doubles with 6+ sources
    const topicFreq: Record<string, { count: number; sources: Set<string>; articles: string[] }> = {};
    for (const article of recent) {
      const topics = extractTopics(`${article.title} ${article.summary}`);
      for (const topic of topics) {
        if (!topicFreq[topic]) topicFreq[topic] = { count: 0, sources: new Set(), articles: [] };
        topicFreq[topic].count++;
        topicFreq[topic].sources.add(article.source);
        topicFreq[topic].articles.push(article.id);
      }
    }

    for (const [topic, data] of Object.entries(topicFreq)) {
      if (data.count >= 8 && data.sources.size >= 4) {
        signals.push({
          id: `velocity-${topic}`,
          type: 'velocity_spike',
          title: `🔥 Velocity Spike: "${topic}"`,
          description: `"${topic}" mentioned ${data.count} times across ${data.sources.size} sources in recent coverage`,
          confidence: Math.min(0.95, 0.6 + data.sources.size * 0.05),
          severity: data.count >= 15 ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
          relatedArticles: data.articles.slice(0, 5),
        });
      }
    }

    // 2. Convergence — 3+ source types report same story within 30 min
    const timeWindows: Record<string, NewsItem[]> = {};
    for (const article of recent) {
      const windowKey = Math.floor(new Date(article.publishedAt).getTime() / thirtyMin).toString();
      if (!timeWindows[windowKey]) timeWindows[windowKey] = [];
      timeWindows[windowKey].push(article);
    }

    for (const [, windowArticles] of Object.entries(timeWindows)) {
      const sourceTypes = new Set(windowArticles.map(a => getSourceProfile(a.source).type));
      if (sourceTypes.size >= 3 && windowArticles.length >= 4) {
        const topArticle = windowArticles[0];
        signals.push({
          id: `convergence-${topArticle.publishedAt}`,
          type: 'convergence',
          title: `◉ Source Convergence Detected`,
          description: `${sourceTypes.size} source types (${[...sourceTypes].join(', ')}) reporting overlapping stories within 30-minute window`,
          confidence: Math.min(0.95, 0.7 + sourceTypes.size * 0.05),
          severity: sourceTypes.size >= 4 ? 'critical' : 'warning',
          timestamp: topArticle.publishedAt,
          relatedArticles: windowArticles.slice(0, 5).map(a => a.id),
        });
      }
    }

    // 3. Triangulation — Wire + Government + Intel sources align
    const wireArticles = recent.filter(a => getSourceProfile(a.source).type === 'wire');
    const govArticles = recent.filter(a => getSourceProfile(a.source).type === 'government');
    const intelArticles = recent.filter(a => ['defense', 'think_tank'].includes(getSourceProfile(a.source).type));

    if (wireArticles.length >= 2 && govArticles.length >= 1 && intelArticles.length >= 1) {
      // Check if they share topics
      const wireTopics = new Set(wireArticles.flatMap(a => extractTopics(`${a.title} ${a.summary}`)));
      const govTopics = new Set(govArticles.flatMap(a => extractTopics(`${a.title} ${a.summary}`)));
      const intelTopics = new Set(intelArticles.flatMap(a => extractTopics(`${a.title} ${a.summary}`)));

      const sharedTopics = [...wireTopics].filter(t => govTopics.has(t) || intelTopics.has(t));
      if (sharedTopics.length >= 1) {
        signals.push({
          id: `triangulation-${sharedTopics[0]}`,
          type: 'triangulation',
          title: `△ Authority Triangulation: "${sharedTopics[0]}"`,
          description: `Wire services, government sources, and intel specialists all reporting on "${sharedTopics.join(', ')}"`,
          confidence: 0.85,
          severity: 'critical',
          timestamp: new Date().toISOString(),
          relatedArticles: [...wireArticles, ...govArticles, ...intelArticles].slice(0, 5).map(a => a.id),
        });
      }
    }

    // 4. Geographic Convergence — multiple high-severity events in same area
    const geoArticles = recent.filter(a => a.lat && a.lng && a.severity === 'high');
    const geoBins: Record<string, NewsItem[]> = {};
    for (const a of geoArticles) {
      const binKey = `${Math.round(a.lat!)},${Math.round(a.lng!)}`;
      if (!geoBins[binKey]) geoBins[binKey] = [];
      geoBins[binKey].push(a);
    }

    for (const [, binArticles] of Object.entries(geoBins)) {
      if (binArticles.length >= 3) {
        const categories = new Set(binArticles.map(a => a.category));
        if (categories.size >= 2) {
          signals.push({
            id: `geo-conv-${binArticles[0].lat}-${binArticles[0].lng}`,
            type: 'geographic_convergence',
            title: `🌍 Geographic Convergence`,
            description: `${binArticles.length} high-severity events from ${categories.size} categories co-occurring in same region`,
            confidence: 0.8,
            severity: 'warning',
            timestamp: binArticles[0].publishedAt,
            relatedArticles: binArticles.map(a => a.id),
          });
        }
      }
    }

    return signals.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }).slice(0, 10); // Cap at 10 signals
  }, [news]);
}

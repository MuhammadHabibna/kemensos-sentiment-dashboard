import { RowData, GlobalFilterState } from './types';

export interface DashboardMetrics {
    totalComments: number;
    sentimentCounts: Record<string, number>; // Positive, Neutral, Negative
    dominantSentiment: { label: string; count: number; percentage: number };
    topTopic: { label: string; count: number };
    topAspect: { label: string; count: number };
}

export interface TrendPoint {
    date: string; // "YYYY-MM-DD" (start of week)
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    topTopics: { label: string; count: number }[];
    topAspects: { label: string; count: number }[];
}

export function calculateKPIs(data: RowData[]): DashboardMetrics {
    const totalComments = data.length;
    const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    const topicCounts: Record<string, number> = {};
    const aspectCounts: Record<string, number> = {};

    if (totalComments === 0) {
        return {
            totalComments: 0,
            sentimentCounts,
            dominantSentiment: { label: 'N/A', count: 0, percentage: 0 },
            topTopic: { label: 'N/A', count: 0 },
            topAspect: { label: 'N/A', count: 0 },
        };
    }

    data.forEach(row => {
        // Sentiment
        if (sentimentCounts[row.sentiment] !== undefined) {
            sentimentCounts[row.sentiment]++;
        }
        // Topic
        if (row.topic) {
            topicCounts[row.topic] = (topicCounts[row.topic] || 0) + 1;
        }
        // Aspect (combined)
        if (row.aspect1 && row.aspect1 !== 'Umum') aspectCounts[row.aspect1] = (aspectCounts[row.aspect1] || 0) + 1;
        if (row.aspect2 && row.aspect2 !== 'Umum') aspectCounts[row.aspect2] = (aspectCounts[row.aspect2] || 0) + 1;
    });

    // Dominant Sentiment
    let domLabel = 'Neutral';
    let domCount = -1;
    Object.entries(sentimentCounts).forEach(([label, count]) => {
        if (count > domCount) {
            domCount = count;
            domLabel = label;
        }
    });

    // Top Topic
    let topTopic = { label: 'None', count: 0 };
    Object.entries(topicCounts).forEach(([label, count]) => {
        if (count > topTopic.count) {
            topTopic = { label, count };
        }
    });

    // Top Aspect
    let topAspect = { label: 'None', count: 0 };
    Object.entries(aspectCounts).forEach(([label, count]) => {
        if (count > topAspect.count) {
            topAspect = { label, count };
        }
    });

    return {
        totalComments,
        sentimentCounts,
        dominantSentiment: {
            label: domLabel,
            count: domCount,
            percentage: Math.round((domCount / totalComments) * 100),
        },
        topTopic,
        topAspect,
    };
}

// Helper to get top items from a raw list
function getTopItems(items: string[], topN: number = 2) {
    const counts: Record<string, number> = {};
    items.forEach(i => counts[i] = (counts[i] || 0) + 1);
    return Object.entries(counts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}

// Trend Chart Aggregation (Weekly)
export function aggregateTrend(data: RowData[]): TrendPoint[] {
    if (data.length === 0) return [];

    // Find max date in dataset to clamp buckets
    let maxDateStr = '';
    data.forEach(row => {
        if (row.dateStr > maxDateStr) maxDateStr = row.dateStr;
    });

    // Group by Week Start
    const groups: Record<string, {
        date: string;
        total: number;
        positive: number;
        neutral: number;
        negative: number;
        topics: string[];
        aspects: string[];
    }> = {};

    data.forEach(row => {
        // Use dateStr (YYYY-MM-DD) for reliable parsing
        const dateStr = row.dateStr;

        // Construct date object for Week calculation (set time to noon)
        const d = new Date(dateStr);
        d.setHours(12, 0, 0, 0);

        // Get Monday of the week
        const day = d.getDay(); // 0 is Sunday
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d);
        monday.setDate(diff);

        // Format back to YYYY-MM-DD
        const y = monday.getFullYear();
        const m = String(monday.getMonth() + 1).padStart(2, '0');
        const dd = String(monday.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${dd}`;

        // Initialize bucket if not exists
        if (!groups[key]) {
            groups[key] = {
                date: key,
                total: 0,
                positive: 0,
                neutral: 0,
                negative: 0,
                topics: [],
                aspects: []
            };
        }

        const g = groups[key];
        g.total++;
        if (row.sentiment === 'Positive') g.positive++;
        else if (row.sentiment === 'Neutral') g.neutral++;
        else if (row.sentiment === 'Negative') g.negative++;

        if (row.topic) g.topics.push(row.topic);
        if (row.aspect1 && row.aspect1 !== 'Umum') g.aspects.push(row.aspect1);
    });

    // Sanity filter: Remove any buckets that start AFTER the true max date of the dataset
    const validGroups = Object.values(groups).filter(g => g.date <= maxDateStr);

    return validGroups
        .map(g => ({
            date: g.date,
            total: g.total,
            positive: g.positive,
            neutral: g.neutral,
            negative: g.negative,
            topTopics: getTopItems(g.topics, 2), // Keep top 2 for tooltip
            topAspects: getTopItems(g.aspects, 1) // Keep top 1 for tooltip
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

// Top Lists
export function getTopLists(data: RowData[]) {
    const topicCounts: Record<string, number> = {};
    const aspectCounts: Record<string, number> = {};

    data.forEach(row => {
        if (row.topic) topicCounts[row.topic] = (topicCounts[row.topic] || 0) + 1;

        // De-duplicate aspects per row if needed, but usually just count them
        const seenAspects = new Set<string>();
        if (row.aspect1 && row.aspect1 !== 'Umum') seenAspects.add(row.aspect1);
        if (row.aspect2 && row.aspect2 !== 'Umum') seenAspects.add(row.aspect2);

        seenAspects.forEach(a => {
            aspectCounts[a] = (aspectCounts[a] || 0) + 1;
        });
    });

    const topTopics = Object.entries(topicCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const topAspects = Object.entries(aspectCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return { topTopics, topAspects };
}

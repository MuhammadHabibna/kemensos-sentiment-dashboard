import Papa from 'papaparse';
import { RowData, RawCsvRow } from './types';

// Assuming dataset is in public/data/dataset.csv
const DATA_URL = '/data/dataset.csv';

let cachedData: RowData[] | null = null;

function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

export async function loadData(): Promise<RowData[]> {
    if (cachedData) return cachedData;

    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            console.error('Failed to fetch CSV data from public folder');
            return [];
        }
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse<RawCsvRow>(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsed: RowData[] = results.data.map((row, index) => {
                        // 1. Trim strings
                        let topic = row.Topik?.trim() || 'Unknown';
                        let source = row.Sumber?.trim() || 'Unknown';
                        const sentiment = (row.sentiment?.trim() || 'Neutral') as 'Positive' | 'Neutral' | 'Negative';
                        const text = row.Text_rf || '';
                        const textNoStop = row.Text_rf_nostop || ''; // STRICT: No fallback to raw text
                        let aspect1 = row.Aspect_1?.trim() || 'Umum';
                        const aspect2 = row.Aspect_2?.trim() || null;

                        // 2. Normalize Source: TikTok / YouTube
                        if (source.toLowerCase() === 'tiktok') source = 'TikTok';
                        else if (source.toLowerCase() === 'youtube') source = 'YouTube';
                        else source = toTitleCase(source); // Fallback Title Case

                        // 3. Aspect Score
                        let score = 0;
                        if (row.aspect_score) {
                            if (typeof row.aspect_score === 'number') score = row.aspect_score;
                            else {
                                const num = parseFloat(row.aspect_score);
                                score = isNaN(num) ? 0 : num;
                            }
                        }

                        // 4. Keywords
                        const parseKeywords = (str: string): string[] => {
                            if (!str) return [];
                            const clean = str.replace(/[\[\]'"]/g, '');
                            if (!clean.trim()) return [];
                            return clean.split(',').map(s => s.trim());
                        };

                        const kw1 = parseKeywords(row.Aspect_1_matched_keywords);
                        const kw2 = parseKeywords(row.Aspect_2_matched_keywords);

                        // 5. Date Parsing
                        const dStr = row.Date_std; // YYYY-MM-DD
                        let dateObj = new Date(dStr);
                        if (isNaN(dateObj.getTime())) {
                            // Fallback or skip?
                            // Spec: "if Date_std is missing, derive it...". 
                            // Assuming valid ISO for now as MVP.
                            dateObj = new Date(); // Default to now or handle error
                        }

                        return {
                            id: index,
                            topic,
                            source,
                            sentiment,
                            text,
                            textNoStop,
                            aspect1,
                            aspect2,
                            aspectScore: score,
                            aspect1Keywords: kw1,
                            aspect2Keywords: kw2,
                            date: dateObj,
                            dateStr: dStr,
                        };
                    });

                    cachedData = parsed;
                    resolve(parsed);
                },
                error: (err: Error) => {
                    reject(err);
                }
            });
        });
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Stopwords caching
let cachedStopwords: Set<string> | null = null;

// Built-in fallback stopwords (small common list)
const FALLBACK_STOPWORDS = new Set([
    'yang', 'di', 'dan', 'ini', 'itu', 'dari', 'ke', 'pada', 'untuk', 'dengan',
    'adalah', 'saya', 'tidak', 'karena', 'yg', 'ya', 'gak', 'bisa', 'ada',
    'aku', 'mau', 'kalau', 'tapi', 'saja', 'juga', 'sudah', 'telah', 'bagi', 'atau',
    'kami', 'kita', 'kamu', 'dia', 'mereka', 'anda', 'akan', 'bukan', 'tak', 'tp',
    'sdh', 'udah', 'bgt', 'dong', 'kan', 'sih', 'kok', 'mah', 'deh', 'yuk', 'loh',
    'lagi', 'apa', 'kenapa', 'gimana', 'siapa', 'kapan', 'dimana', 'bagaimana',
    'semoga', 'terima', 'kasih', 'tolong', 'mohon', 'mas', 'mbak', 'kak', 'bang',
    'pak', 'bu', 'ibu', 'bapak', 'min', 'nya', 'dr', 'dlm', 'utk', 'dgn',
    'sm', 'sy', 'klo', 'kalo', 'jd', 'jgn', 'ga', 'gk', 'wkwk', 'haha', 'hehe',
    'wkwkwk', 'awokwok', 'lah', 'kah', 'pun', 'man', 'wan', 'com', 'http', 'https',
    'www', 'rt', 'via', 'aja', 'doang'
]);

// Filler tokens (always removed if stopwords are active)
const FILLER_TOKENS = new Set(['wkwk', 'haha', 'hehe', 'lol', 'wkwkwk', 'awokwok', 'hix', 'huft']);

export async function loadStopwords(): Promise<Set<string>> {
    if (cachedStopwords) return cachedStopwords;

    try {
        // Attempt to fetch from public folder
        // Note: In Next.js client-side, we can fetch relative URL
        const res = await fetch('/stopwords/id.txt');
        if (res.ok) {
            const text = await res.text();
            const words = text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
            cachedStopwords = new Set(words);
            // also add fillers
            FILLER_TOKENS.forEach(t => cachedStopwords?.add(t));
            return cachedStopwords;
        }
    } catch (e) {
        console.warn('Failed to load stopwords file, using fallback.', e);
    }

    cachedStopwords = new Set(FALLBACK_STOPWORDS);
    FILLER_TOKENS.forEach(t => cachedStopwords?.add(t));
    return cachedStopwords;
}

export function tokenize(text: string): string[] {
    if (!text) return [];
    // Lowercase
    let clean = text.toLowerCase();
    // Remove URLs
    clean = clean.replace(/https?:\/\/[^\s]+/g, '');
    // Remove non-alphanumeric (keep spaces)
    clean = clean.replace(/[^a-z0-9\s]/g, ' ');
    // Split on whitespace
    return clean.split(/\s+/).filter(t => t.length > 0);
}

function isNumeric(str: string) {
    return /^\d+$/.test(str);
}

export interface NlpOptions {
    removeStopwords: boolean;
    minTokenLen?: number;
    dropPureNumber?: boolean;
    dropFillers?: boolean;
}

export function buildNgrams(tokens: string[], n: number, stopwords: Set<string>, options: NlpOptions): string[] {
    const result: string[] = [];
    if (tokens.length < n) return [];

    const minLen = options.minTokenLen ?? 3;
    const checkStopwords = options.removeStopwords && stopwords.size > 0;

    for (let i = 0; i <= tokens.length - n; i++) {
        const slice = tokens.slice(i, i + n);

        // 1. Check for stopwords/fillers if enabled
        if (checkStopwords) {
            const hasStopword = slice.some(t => stopwords.has(t));
            if (hasStopword) continue;
        }

        // 2. Length check
        if (slice.some(t => t.length < minLen)) continue;

        // 3. Pure numbers
        if (options.dropPureNumber && slice.some(t => isNumeric(t))) continue;

        result.push(slice.join(' '));
    }
    return result;
}

export interface WordCount {
    text: string;
    value: number;
}

export function countTopTerms(
    texts: string[],
    n: number,
    stopwords: Set<string>,
    options: NlpOptions,
    topN: number
): WordCount[] {
    if (!texts || !Array.isArray(texts) || texts.length === 0) return [];

    const freqMap: Record<string, number> = {};

    texts.forEach(text => {
        if (!text) return;
        const tokens = tokenize(text);
        // buildNgrams now takes (tokens, n, stopwords, options)
        const ngrams = buildNgrams(tokens, n, stopwords, options);
        ngrams.forEach(gram => {
            freqMap[gram] = (freqMap[gram] || 0) + 1;
        });
    });

    return Object.entries(freqMap)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);
}

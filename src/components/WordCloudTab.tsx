'use client';

import React from 'react';
import { RowData, GlobalFilterState } from '@/lib/types';
import { countTopTerms } from '@/lib/nlp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TermSamplesModal } from './TermSamplesModal';
import WordCloudClient, { WordCloudWord } from './WordCloudClient';

interface WordCloudTabProps {
    data: RowData[];
    filters: GlobalFilterState;
    onTermClick?: (term: string) => void;
}

// Colors
const SENTIMENT_COLORS = {
    Positive: '#10b981', // emerald-500
    Neutral: '#f59e0b',  // amber-500
    Negative: '#ef4444'  // red-500
};

// WordCloud Options
// Typed as any to avoid strict typing issues with the library's options interface which can be inconsistent
const WORDCLOUD_OPTIONS: any = {
    rotations: 2,
    rotationAngles: [0, 0],
    fontSizes: [12, 48],
    fontFamily: 'Inter, sans-serif',
    enableTooltip: false,
    deterministic: true,
    spiral: 'archimedean',
    padding: 2,
};

export function WordCloudTab({ data, filters, onTermClick }: WordCloudTabProps) {
    const [ngram, setNgram] = React.useState<1 | 2 | 3>(1);

    // We keep the state for UI stability ensuring slider is always valid
    const [topNArr, setTopNArr] = React.useState<number[]>([80]);

    // Derived safe value for logical use
    const safeTopNArr = React.useMemo(() => {
        return Array.isArray(topNArr) && topNArr.length > 0 ? topNArr : [80];
    }, [topNArr]);

    const topN = safeTopNArr[0];

    // isLoading only checked for initial mount to avoid hydration mismatch
    const [isMounted, setIsMounted] = React.useState(false);

    // Modal State
    const [selectedTerm, setSelectedTerm] = React.useState<string | null>(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [sourceDataForModal, setSourceDataForModal] = React.useState<RowData[]>([]);
    const [modalColor, setModalColor] = React.useState(SENTIMENT_COLORS.Neutral);

    // Mount check
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Memoize word counts using Text_rf_nostop (no client-side stopword removal)
    const { posWords, neuWords, negWords } = React.useMemo(() => {
        if (!data || data.length === 0) {
            return { posWords: [], neuWords: [], negWords: [] };
        }

        const nlpOptions = {
            removeStopwords: false, // Don't run removal logic
            minTokenLen: 3,
            dropPureNumber: true,
            dropFillers: true
        };

        const emptyStopwords = new Set<string>();

        // Defensive filtering to avoid crashes if data is malformed
        const posRows = data.filter(r => r?.sentiment === 'Positive');
        const neuRows = data.filter(r => r?.sentiment === 'Neutral');
        const negRows = data.filter(r => r?.sentiment === 'Negative');

        // STRICT: Use Text_rf_nostop ONLY. No fallback to text/Text_rf as that reintroduces stopwords.
        const getCloudText = (r: RowData) => {
            const t = r.textNoStop;
            // Double strict: if t is falsy, return empty string.
            return (typeof t === 'string' && t.trim().length > 0) ? t : '';
        };

        const posTexts = posRows.map(getCloudText).filter(Boolean);
        const neuTexts = neuRows.map(getCloudText).filter(Boolean);
        const negTexts = negRows.map(getCloudText).filter(Boolean);

        const p = countTopTerms(posTexts, ngram, emptyStopwords, nlpOptions, topN);
        const n = countTopTerms(neuTexts, ngram, emptyStopwords, nlpOptions, topN);
        const g = countTopTerms(negTexts, ngram, emptyStopwords, nlpOptions, topN);

        // DEV ONLY: Regression Check
        if (process.env.NODE_ENV === 'development') {
            const allTerms = [...p, ...n, ...g];
            const hasYang = allTerms.some(w => w.text.toLowerCase() === 'yang');
            if (hasYang) {
                console.warn("[WordCloud] Stopword 'yang' detected. WordCloud MUST use Text_rf_nostop only.");
            }
        }

        return { posWords: p, neuWords: n, negWords: g };
    }, [data, ngram, topN]);

    // Handlers
    const handleWordClick = (word: any, sentimentCategory: 'Positive' | 'Neutral' | 'Negative') => {
        if (!word) return;

        // Defensive: handle both shape { text, value } and Recharts payload shape
        let text = '';
        if (typeof word === 'string') {
            text = word;
        } else if (typeof word === 'object') {
            if (word.text) text = word.text;
            else if (word.payload && word.payload.text) text = word.payload.text;
        }

        if (!text) return;

        setSelectedTerm(text);
        setSourceDataForModal(data || []);
        setModalColor(SENTIMENT_COLORS[sentimentCategory]);
        setModalOpen(true);
        // if (onTermClick) onTermClick(text);
    };

    const handleSliderChange = (val: number[]) => {
        if (Array.isArray(val) && val.length > 0) {
            setTopNArr(val);
        } else {
            setTopNArr([80]);
        }
    };

    // Sub-components for Panels
    const WordPanel = ({
        title,
        words,
        color,
        sentiment
    }: {
        title: string,
        words: { text: string, value: number }[],
        color: string,
        sentiment: 'Positive' | 'Neutral' | 'Negative'
    }) => {

        // Defensive: sanitize for chart usage
        const validWords = React.useMemo(() => {
            if (!Array.isArray(words)) return [];
            return words.filter(w => w && typeof w.text === 'string' && Number.isFinite(w.value) && w.value > 0);
        }, [words]);

        const top10 = React.useMemo(() => {
            return validWords.slice(0, 10);
        }, [validWords]);

        // Only render cloud if we are mounted and have words.
        const shouldRenderCloud = isMounted && validWords.length > 0;

        const cloudOptions = React.useMemo(() => ({
            ...WORDCLOUD_OPTIONS,
            colors: [color] // Force single color, no random gray fallback
        }), [color]);

        return (
            <div className="flex flex-col gap-4 h-full">
                {/* Cloud Card */}
                <Card className="flex-1 min-h-[400px] border-slate-200 shadow-sm relative overflow-hidden group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle style={{ color }} className="text-lg">{title}</CardTitle>
                    </CardHeader>
                    {/* Fixed Height Container to avoid width warnings and layout issues */}
                    <CardContent className="h-[350px] min-h-[350px] p-0 relative">
                        {validWords.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
                                Not enough terms.
                            </div>
                        ) : shouldRenderCloud ? (
                            <div className="w-full h-full min-h-[350px] cursor-pointer">
                                <WordCloudClient
                                    words={validWords}
                                    options={cloudOptions}
                                    onWordClick={(w) => handleWordClick(w, sentiment)}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Rendering...
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top 10 Chart */}
                <Card className="min-h-[300px] border-slate-200 shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-semibold text-slate-700">Top 10 Terms ({title})</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pl-0">
                        {shouldRenderCloud && top10.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={top10} margin={{ top: 5, right: 16, left: 8, bottom: 5 }}>
                                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                                    <YAxis
                                        type="category"
                                        dataKey="text"
                                        width={110}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill={color}
                                        radius={[0, 4, 4, 0]}
                                        barSize={12}
                                        isAnimationActive={false}
                                        onClick={(entry: any) => {
                                            if (entry && entry.text) {
                                                handleWordClick(entry, sentiment);
                                            } else if (entry && entry.payload && entry.payload.text) {
                                                handleWordClick(entry.payload, sentiment);
                                            }
                                        }}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No data</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (!isMounted) return null; // Prevent hydration errors

    return (
        <motion.div
            className="space-y-6 p-6 min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Controls Bar */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm sticky top-4 z-10">
                <CardContent className="py-4 flex flex-wrap items-center justify-between gap-6">

                    <div className="flex items-center gap-6">
                        {/* N-Gram */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">N-Gram</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {[1, 2, 3].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setNgram(n as 1 | 2 | 3)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ngram === n
                                            ? 'bg-white shadow text-slate-900 border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top N Slider */}
                        <div className="flex items-center gap-4 min-w-[180px]">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">Top {topN}</label>
                            <Slider
                                value={safeTopNArr}
                                min={30} max={150} step={10}
                                onValueChange={handleSliderChange}
                                className="w-24"
                            />
                        </div>

                        {/* Stopwords UI Removed - strictly preprocessed offline */}
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                                <p>This view uses the `Text_rf_nostop` field where stopwords are pre-cleaned. Click terms to see context.</p>
                            </PopoverContent>
                        </Popover>
                    </div>

                </CardContent>
            </Card>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WordPanel
                    title="Positive"
                    words={posWords}
                    color={SENTIMENT_COLORS.Positive}
                    sentiment="Positive"
                />
                <WordPanel
                    title="Neutral"
                    words={neuWords}
                    color={SENTIMENT_COLORS.Neutral}
                    sentiment="Neutral"
                />
                <WordPanel
                    title="Negative"
                    words={negWords}
                    color={SENTIMENT_COLORS.Negative}
                    sentiment="Negative"
                />
            </div>

            {/* Modal */}
            <TermSamplesModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                term={selectedTerm || ''}
                data={sourceDataForModal}
                sentimentColor={modalColor}
            />

        </motion.div>
    );
}

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RowData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TermSamplesModalProps {
    isOpen: boolean;
    onClose: () => void;
    term: string;
    data: RowData[];
    sentimentColor: string;
}

export function TermSamplesModal({ isOpen, onClose, term, data, sentimentColor }: TermSamplesModalProps) {
    const [sourceFilter, setSourceFilter] = React.useState<string>('All');
    const [topicFilter, setTopicFilter] = React.useState<string>('All');
    const [showAspect2, setShowAspect2] = React.useState<boolean>(false);

    // Reset filters when term changes
    React.useEffect(() => {
        setSourceFilter('All');
        setTopicFilter('All');
        setShowAspect2(false);
    }, [term, isOpen]);

    // Helper to get readable text (Text_rf), never Text_rf_nostop
    const getReadableText = (r: RowData) => r.text || '';

    // 1. Find all rows containing the term (searching in readable text)
    const matchedRows = React.useMemo(() => {
        if (!term || !data) return [];
        const lowerTerm = term.toLowerCase();
        return data.filter(row => {
            const txt = getReadableText(row);
            if (!txt) return false;
            return txt.toLowerCase().includes(lowerTerm);
        });
    }, [data, term]);

    // 2. Compute available topics
    const availableTopics = React.useMemo(() => {
        const topics = new Set<string>();
        matchedRows.forEach(r => { if (r.topic) topics.add(r.topic); });
        return Array.from(topics).sort();
    }, [matchedRows]);

    // 3. Filter
    const filteredMatches = React.useMemo(() => {
        return matchedRows.filter(row => {
            if (sourceFilter !== 'All' && row.source !== sourceFilter) return false;
            if (topicFilter !== 'All' && row.topic !== topicFilter) return false;
            return true;
        });
    }, [matchedRows, sourceFilter, topicFilter]);

    // 4. Sort
    const sortedMatches = React.useMemo(() => {
        return filteredMatches.sort((a, b) => {
            const lowerTerm = term.toLowerCase();
            const txtA = getReadableText(a);
            const txtB = getReadableText(b);
            const countA = (txtA.toLowerCase().match(new RegExp(escapeRegExp(lowerTerm), 'g')) || []).length;
            const countB = (txtB.toLowerCase().match(new RegExp(escapeRegExp(lowerTerm), 'g')) || []).length;
            if (countA !== countB) return countB - countA;
            if (a.dateStr > b.dateStr) return -1;
            if (a.dateStr < b.dateStr) return 1;
            return 0;
        }).slice(0, 50); // Increased to 50 samples
    }, [filteredMatches, term]);

    function escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
        if (!highlight) return <>{text}</>;
        const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="font-bold px-1 rounded mx-0.5 text-white shadow-sm" style={{ backgroundColor: sentimentColor }}>
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden border border-slate-200"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between sticky top-0">
                                <div>
                                    <div className="flex items-center gap-2 text-xl">
                                        <span className="text-slate-600">Term:</span>
                                        <span className="font-extrabold text-2xl tracking-tight" style={{ color: sentimentColor }}>{term}</span>
                                        <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">
                                            {matchedRows.length} matches found
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Sample comments containing this term, sorted by relevance.
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="px-6 py-3 border-b bg-white flex flex-wrap items-center gap-4 sticky top-[76px] z-10">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Source</label>
                                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                        <SelectTrigger className="h-8 w-[120px] text-xs">
                                            <SelectValue placeholder="All Sources" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Sources</SelectItem>
                                            <SelectItem value="TikTok">TikTok</SelectItem>
                                            <SelectItem value="YouTube">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Topic</label>
                                    <Select value={topicFilter} onValueChange={setTopicFilter}>
                                        <SelectTrigger className="h-8 w-[160px] text-xs">
                                            <SelectValue placeholder="All Topics" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Topics</SelectItem>
                                            {availableTopics.map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                    <Switch id="show-aspect2" checked={showAspect2} onCheckedChange={setShowAspect2} />
                                    <label htmlFor="show-aspect2" className="text-xs font-medium cursor-pointer text-slate-700">Show Aspect 2</label>
                                </div>
                            </div>

                            {/* List (Custom Scroll Area) */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                <div className="space-y-4">
                                    {sortedMatches.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            No filtered comments found.
                                        </div>
                                    ) : (
                                        sortedMatches.map((row) => (
                                            <motion.div
                                                key={row.id}
                                                layout
                                                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                {/* Metadata Header */}
                                                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                                                    <Badge variant="secondary" className={row.source === 'TikTok' ? 'bg-black text-white hover:bg-slate-800' : 'bg-red-600 text-white hover:bg-red-700'}>
                                                        {row.source}
                                                    </Badge>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="font-mono text-slate-500">{row.dateStr}</span>

                                                    <div className="ml-auto flex flex-wrap gap-2">
                                                        {row.topic && <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50">{row.topic}</Badge>}
                                                        {row.aspect1 && row.aspect1 !== 'Umum' && <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">{row.aspect1}</Badge>}
                                                        {showAspect2 && row.aspect2 && row.aspect2 !== 'Umum' && (
                                                            <Badge variant="outline" className="text-cyan-600 border-cyan-100 bg-cyan-50">{row.aspect2}</Badge>
                                                        )}
                                                        <Badge
                                                            variant="outline"
                                                            className={`border-0
                                                                ${row.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' : ''}
                                                                ${row.sentiment === 'Negative' ? 'bg-red-100 text-red-800' : ''}
                                                                ${row.sentiment === 'Neutral' ? 'bg-amber-100 text-amber-800' : ''}
                                                            `}
                                                        >
                                                            {row.sentiment}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                                                    <HighlightedText text={row.text} highlight={term} />
                                                </p>
                                            </motion.div>
                                        ))
                                    )}

                                    {/* Load More or End indicator */}
                                    {filteredMatches.length > 20 && (
                                        <p className="text-center text-xs text-muted-foreground pt-4">
                                            Showing top 20 of {filteredMatches.length} matching comments.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

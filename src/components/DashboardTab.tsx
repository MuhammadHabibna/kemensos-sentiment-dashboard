'use client';

import React from 'react';
import { RowData, GlobalFilterState } from '@/lib/types';
import { calculateKPIs, aggregateTrend, getTopLists } from '@/lib/aggregations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { format } from "date-fns";
import { motion } from 'framer-motion';
import { PublicSentimentCard } from './dashboard/PublicSentimentCard';
import { TrendTooltip } from './dashboard/TrendTooltip';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DashboardTabProps {
    data: RowData[];
    filters: GlobalFilterState;
}

export function DashboardTab({ data, filters }: DashboardTabProps) {
    const kpis = React.useMemo(() => calculateKPIs(data), [data]);
    const trendData = React.useMemo(() => aggregateTrend(data), [data]);
    const { topTopics, topAspects } = React.useMemo(() => getTopLists(data), [data]);
    const [trendMode, setTrendMode] = React.useState<'Total' | 'Sentiment'>('Total');

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-6 p-6 min-h-screen text-slate-800"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Row 1: Sentiment Card + Trend Chart */}
            <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-12">

                {/* Public Sentiment Card (Span 4) */}
                <motion.div variants={item} className="md:col-span-12 lg:col-span-4">
                    <PublicSentimentCard metrics={kpis} />
                </motion.div>

                {/* Trend Chart (Span 8) */}
                <motion.div variants={item} className="md:col-span-12 lg:col-span-8 space-y-6">
                    <Card className="border-slate-200 shadow-sm h-full bg-white/60 backdrop-blur-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div>
                                        <CardTitle>Comment Volume Trend</CardTitle>
                                        <CardDescription>Weekly comment activity over time</CardDescription>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600 -mt-4">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 text-sm">
                                            <p>Shows the volume of comments per week. Toggle 'Sentiment' to see the breakdown of positive, neutral, and negative comments.</p>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTrendMode('Total')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${trendMode === 'Total' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Total
                                    </button>
                                    <button
                                        onClick={() => setTrendMode('Sentiment')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${trendMode === 'Sentiment' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Sentiment
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => format(new Date(value), 'MMM d')}
                                            fontSize={12}
                                            minTickGap={30}
                                            stroke="#94a3b8"
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                            stroke="#94a3b8"
                                        />
                                        <RechartsTooltip content={<TrendTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                                        {trendMode === 'Total' ? (
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorTotal)"
                                                name="Total"
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        ) : (
                                            <>
                                                <Area type="monotone" stackId="1" dataKey="negative" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorNeg)" name="Negative" />
                                                <Area type="monotone" stackId="1" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNeu)" name="Neutral" />
                                                <Area type="monotone" stackId="1" dataKey="positive" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPos)" name="Positive" />
                                            </>
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Row 2: Top Lists (Below Top Row) */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Top Topics List */}
                <motion.div variants={item}>
                    <Card className="h-full border-slate-200 shadow-sm min-h-[300px] bg-white/60 backdrop-blur-md">
                        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base text-slate-800">Top 5 Topics</CardTitle>
                                <CardDescription>Most discussed subjects</CardDescription>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    <p>Top 5 topics most frequently discussed in the filtered comments.</p>
                                </PopoverContent>
                            </Popover>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topTopics.slice(0, 5).map((t, i) => (
                                    <div key={t.label} className="group">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 truncate max-w-[70%] group-hover:text-indigo-600 transition-colors">
                                                {i + 1}. {t.label}
                                            </span>
                                            <span className="text-slate-500 text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{t.count.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${(t.count / (topTopics[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Aspects List */}
                <motion.div variants={item}>
                    <Card className="h-full border-slate-200 shadow-sm min-h-[300px] bg-white/60 backdrop-blur-md">
                        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base text-slate-800">Top 5 Aspects</CardTitle>
                                <CardDescription>Key areas of focus</CardDescription>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    <p>Top 5 aspects: main issue categories inferred from Aspect_1 labeling.</p>
                                </PopoverContent>
                            </Popover>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topAspects.slice(0, 5).map((t, i) => (
                                    <div key={t.label} className="group">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700 truncate max-w-[70%] group-hover:text-emerald-600 transition-colors">
                                                {i + 1}. {t.label}
                                            </span>
                                            <span className="text-slate-500 text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{t.count.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${(t.count / (topAspects[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </motion.div>
    );
}

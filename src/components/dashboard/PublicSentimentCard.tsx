import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/lib/aggregations';
import { motion } from 'framer-motion';

const SentimentGauge = ({ percentage, sentiment }: { percentage: number, sentiment: string }) => {
    // 0 to 180 degrees
    const r = 80;
    const cx = 100;
    const cy = 100;
    const strokeWidth = 20;

    // Determine color
    let color = '#64748b'; // slate-500 default
    if (sentiment === 'Positive') color = '#10b981'; // emerald-500
    if (sentiment === 'Negative') color = '#ef4444'; // red-500
    if (sentiment === 'Neutral') color = '#f59e0b'; // amber-500

    // Calculate path for full semi-circle (background)
    const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

    // Calculate path for value
    // value 0 -> -90 deg (left), 100 -> +90 deg (right) ??
    // actually gauge usually goes left-to-right.
    // Let's map 0..100 to 0..180 degrees.
    const angle = (percentage / 100) * 180;
    const rad = (angle * Math.PI) / 180;

    // Start at -180 (left) relative to center? No, standard SVG arc.
    // M (cx-r) cy is the left point.
    // We want to draw arc from left point to target angle.
    // x = cx - r * cos(rad)
    // y = cy - r * sin(rad)
    // Wait, simpler:
    // Start angle: 180 (left) -> End angle: 180 + val
    // We want a semi circle from 180 deg to 360 deg in standard math (left to right top).

    // Easier manual polars:
    // P1 = (cx-r, cy)
    // P2 = (cx - r*cos(rad), cy - r*sin(rad)) 
    // Note: y goes down in SVG. So cy - sin.

    const x2 = cx - r * Math.cos(rad);
    const y2 = cy - r * Math.sin(rad);

    const valuePath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

    return (
        <div className="relative flex flex-col items-center justify-center h-[140px]">
            <svg viewBox="0 0 200 110" className="w-[180px] overflow-visible">
                {/* Background Track */}
                <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} strokeLinecap="round" />

                {/* Value Track */}
                <motion.path
                    d={valuePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute bottom-0 text-center pb-2">
                <div className="text-4xl font-bold tracking-tighter" style={{ color }}>{percentage}%</div>
                <div className="text-sm font-medium text-muted-foreground">{sentiment}</div>
            </div>
        </div>
    );
};

import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function PublicSentimentCard({ metrics }: { metrics: DashboardMetrics }) {
    const { dominantSentiment, sentimentCounts, totalComments } = metrics;

    return (
        <Card className="h-full border-slate-200 shadow-sm relative group bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">Public Sentiment</CardTitle>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600">
                            <Info className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 text-sm">
                        <p>Overall sentiment index derived from comment analysis. Also shows the distribution of Positive, Neutral, and Negative comments.</p>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <SentimentGauge
                    percentage={dominantSentiment.percentage}
                    sentiment={dominantSentiment.label}
                />

                <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-4 border-t text-center text-xs">
                    <div>
                        <div className="font-bold text-lg text-emerald-600">{sentimentCounts.Positive.toLocaleString()}</div>
                        <div className="text-muted-foreground font-medium">Positive</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-amber-500">{sentimentCounts.Neutral.toLocaleString()}</div>
                        <div className="text-muted-foreground font-medium">Neutral</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-red-500">{sentimentCounts.Negative.toLocaleString()}</div>
                        <div className="text-muted-foreground font-medium">Negative</div>
                    </div>
                </div>

                <div className="mt-6 w-full text-center bg-slate-50 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-sm">Total Comments: </span>
                    <span className="text-slate-900 font-bold text-base ml-1">{totalComments.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}

import React from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { TrendPoint } from '@/lib/aggregations';

export const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // payload[0].payload is the original data object (TrendPoint)
        const data: TrendPoint = payload[0].payload;

        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-3 text-sm min-w-[200px]">
                <div className="font-bold mb-2 border-b pb-1">
                    {format(new Date(label), 'MMM d, yyyy')}
                </div>

                {/* Total & Sentiment */}
                <div className="space-y-1 mb-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Comments</span>
                        <span className="font-bold">{data.total}</span>
                    </div>
                    <div className="flex gap-2 text-xs pt-1">
                        <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {data.positive}</span>
                        <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400" /> {data.neutral}</span>
                        <span className="flex items-center gap-1 text-red-500"><span className="w-2 h-2 rounded-full bg-red-500" /> {data.negative}</span>
                    </div>
                </div>

                {/* Dominant Topic */}
                {data.topTopics && data.topTopics.length > 0 && (
                    <div className="mb-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Top Topic</div>
                        <div className="bg-secondary/50 p-1.5 rounded text-xs font-medium truncate">
                            {data.topTopics[0].label} <span className="opacity-70">({data.topTopics[0].count})</span>
                        </div>
                    </div>
                )}

                {/* Dominant Aspect */}
                {data.topAspects && data.topAspects.length > 0 && (
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Top Aspect</div>
                        <div className="bg-indigo-50 p-1.5 rounded text-xs font-medium text-indigo-700 truncate">
                            {data.topAspects[0].label} <span className="opacity-70">({data.topAspects[0].count})</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

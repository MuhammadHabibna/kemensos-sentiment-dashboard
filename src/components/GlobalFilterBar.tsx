'use client';

import React from 'react';
import { GlobalFilterState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface FilterBarProps {
    filters: GlobalFilterState;
    setFilters: (f: GlobalFilterState) => void;
    uniqueTopics: string[];
    uniqueAspects: string[];
    totalComments: number;
    filteredCount: number;
}

export function GlobalFilterBar({ filters, setFilters, uniqueTopics, uniqueAspects, totalComments, filteredCount }: FilterBarProps) {
    const [localFilters, setLocalFilters] = React.useState<GlobalFilterState>(filters);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: filters.dateRange.from,
        to: filters.dateRange.to,
    });

    // Sync from parent
    React.useEffect(() => {
        setLocalFilters(filters);
        setDateRange({ from: filters.dateRange.from, to: filters.dateRange.to });
    }, [filters]);

    const handleApply = () => {
        setFilters({
            ...localFilters,
            dateRange: { from: dateRange?.from, to: dateRange?.to }
        });
    };

    const handleReset = () => {
        const defaults: GlobalFilterState = {
            source: 'All',
            dateRange: {},
            topic: 'All',
            sentiment: 'All',
            aspect: 'All',
            hideUmum: true,
            minAspectScore: 2,
            searchQuery: '',
        };
        setLocalFilters(defaults);
        setDateRange(undefined);
        setFilters(defaults);
    };



    return (
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-sm">
            <div className="flex flex-col gap-4 max-w-7xl mx-auto">

                {/* Top Row: Filters */}
                <div className="flex flex-wrap items-center gap-2">

                    {/* Source */}
                    <Select value={localFilters.source} onValueChange={(v) => setLocalFilters({ ...localFilters, source: v })}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Sources</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Start Date */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="date"
                                className="h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const d = e.target.value ? new Date(e.target.value) : undefined;
                                    const newRange = { ...dateRange, from: d };
                                    if (!newRange.to) newRange.to = undefined;
                                    setDateRange(newRange as any);
                                }}
                            />
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="relative">
                            <input
                                type="date"
                                className="h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const d = e.target.value ? new Date(e.target.value) : undefined;
                                    const newRange = { ...dateRange, to: d };
                                    setDateRange(newRange as any);
                                }}
                            />
                        </div>
                    </div>

                    {/* Topic */}
                    <Select value={localFilters.topic} onValueChange={(v) => setLocalFilters({ ...localFilters, topic: v })}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Topics</SelectItem>
                            {uniqueTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Sentiment */}
                    <Select value={localFilters.sentiment} onValueChange={(v) => setLocalFilters({ ...localFilters, sentiment: v })}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Sentiments</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Neutral">Neutral</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                        </SelectContent>
                    </Select>



                    {/* Buttons */}
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
                        <Button size="sm" onClick={handleApply}>Apply</Button>
                    </div>
                </div>

                {/* Bottom Row: Quality Controls & Status */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hideUmum"
                            checked={localFilters.hideUmum}
                            onCheckedChange={(c) => setLocalFilters({ ...localFilters, hideUmum: !!c })}
                        />
                        <label htmlFor="hideUmum" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Hide "Umum"
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Min Score: {localFilters.minAspectScore}</span>
                        <Slider
                            value={[localFilters.minAspectScore]}
                            min={0} max={10} step={1}
                            className="w-[100px]"
                            onValueChange={(v) => setLocalFilters({ ...localFilters, minAspectScore: v[0] })}
                        />
                    </div>

                    <div className="ml-auto">
                        Showing <strong className="text-foreground">{filteredCount.toLocaleString()}</strong> of {totalComments.toLocaleString()} comments
                    </div>

                </div>
            </div>
        </div>
    );
}

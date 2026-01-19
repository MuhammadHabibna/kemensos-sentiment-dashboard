'use client';

import React from 'react';
import { RowData, GlobalFilterState } from '@/lib/types';
import { searchFilter } from '@/lib/filters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface ExploreTabProps {
    data: RowData[];
    filters: GlobalFilterState;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}

export function ExploreTab({ data, filters, searchQuery, setSearchQuery }: ExploreTabProps) {
    const [sortOrder, setSortOrder] = React.useState<'Newest' | 'Oldest' | 'HighestScore'>('Newest');
    const [page, setPage] = React.useState(1);
    const pageSize = 50;

    const filteredData = React.useMemo(() => {
        let res = searchFilter(data, searchQuery);

        // Sort
        res = res.sort((a, b) => {
            if (sortOrder === 'Newest') return b.date.getTime() - a.date.getTime();
            if (sortOrder === 'Oldest') return a.date.getTime() - b.date.getTime();
            if (sortOrder === 'HighestScore') return b.aspectScore - a.aspectScore;
            return 0;
        });

        return res;
    }, [data, searchQuery, sortOrder]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

    React.useEffect(() => {
        setPage(1);
    }, [filteredData.length]);

    return (
        <motion.div
            className="space-y-6 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search within filtered results..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Newest">Newest First</SelectItem>
                            <SelectItem value="Oldest">Oldest First</SelectItem>
                            <SelectItem value="HighestScore">Highest Aspect Score</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead className="w-[80px]">Source</TableHead>
                                <TableHead className="w-[100px]">Sentiment</TableHead>
                                <TableHead className="w-[150px]">Topic</TableHead>
                                <TableHead className="w-[150px]">Aspect</TableHead>
                                <TableHead className="w-[60px]">Score</TableHead>
                                <TableHead>Comment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No comments found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row) => (
                                    <TableRow key={row.id} className="group align-top">
                                        {/* Date */}
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {row.dateStr}
                                        </TableCell>
                                        {/* Source */}
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{row.source}</Badge>
                                        </TableCell>
                                        {/* Sentiment */}
                                        <TableCell>
                                            <Badge variant={row.sentiment === 'Positive' ? 'default' : row.sentiment === 'Negative' ? 'destructive' : 'secondary'} className="text-xs">
                                                {row.sentiment}
                                            </Badge>
                                        </TableCell>
                                        {/* Topic */}
                                        <TableCell className="text-xs truncate max-w-[120px]" title={row.topic}>{row.topic}</TableCell>
                                        {/* Aspect */}
                                        <TableCell className="text-xs truncate max-w-[120px]" title={row.aspect1}>{row.aspect1}</TableCell>
                                        {/* Score */}
                                        <TableCell className="text-xs font-mono">{row.aspectScore}</TableCell>

                                        {/* Text / Accordion */}
                                        <TableCell className="max-w-[400px]">
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value={`item-${row.id}`} className="border-b-0">
                                                    <AccordionTrigger className="hover:no-underline py-0 text-left text-sm font-normal">
                                                        <span className="line-clamp-2">{row.text}</span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 text-xs bg-muted/30 p-2 rounded mt-2">
                                                        <div className="space-y-2">
                                                            <p className="italic">{row.text}</p>
                                                            <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-2">
                                                                <div>
                                                                    <span className="font-semibold block">Aspect 1 Keywords:</span>
                                                                    {row.aspect1Keywords.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {row.aspect1Keywords.map(k => <Badge key={k} variant="secondary" className="text-[10px] px-1 py-0">{k}</Badge>)}
                                                                        </div>
                                                                    ) : <span className="text-muted-foreground">-</span>}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold block">Aspect 2 ({row.aspect2 || 'None'}):</span>
                                                                    {row.aspect2Keywords.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {row.aspect2Keywords.map(k => <Badge key={k} variant="secondary" className="text-[10px] px-1 py-0">{k}</Badge>)}
                                                                        </div>
                                                                    ) : <span className="text-muted-foreground">-</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>
            </div>
        </motion.div>
    );
}

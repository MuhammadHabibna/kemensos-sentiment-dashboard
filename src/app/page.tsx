'use client';

import React, { useEffect, useState } from 'react';
import { RowData, GlobalFilterState } from '@/lib/types';
import { loadData } from '@/lib/dataLoader';
import { filterData } from '@/lib/filters';
import { GlobalFilterBar } from '@/components/GlobalFilterBar';
import { DashboardTab } from '@/components/DashboardTab';
import { WordCloudTab } from '@/components/WordCloudTab';
import { ExploreTab } from '@/components/ExploreTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GlobalFilterState>({
    source: 'All',
    dateRange: {},
    topic: 'All',
    sentiment: 'All',
    aspect: 'All',
    hideUmum: true,
    minAspectScore: 2,
    searchQuery: '',
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  // Compute unique filter options (from full dataset)
  const uniqueTopics = React.useMemo(() => {
    const set = new Set(data.map(d => d.topic).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const uniqueAspects = React.useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => {
      if (d.aspect1) set.add(d.aspect1);
      if (d.aspect2) set.add(d.aspect2!);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [data]);

  // Apply Global Filters
  const filteredData = React.useMemo(() => {
    return filterData(data, filters);
  }, [data, filters]);

  // For WordCloud click interaction
  const handleTermClick = (term: string) => {
    setFilters(prev => ({ ...prev, searchQuery: term }));
    setActiveTab('explore');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-lg font-medium text-muted-foreground">Loading dataset...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Public Sentiment Viewer</h1>
            <p className="text-xs text-muted-foreground">Analisis Sentiment Kemensos</p>
          </div>
          {/* Nav Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="wordcloud">WordCloud</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filter Bar */}
        <GlobalFilterBar
          filters={filters}
          setFilters={setFilters}
          uniqueTopics={uniqueTopics}
          uniqueAspects={uniqueAspects}
          totalComments={data.length}
          filteredCount={filteredData.length}
        />
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
        {activeTab === 'dashboard' && (
          <DashboardTab data={filteredData} filters={filters} />
        )}
        {activeTab === 'wordcloud' && (
          <WordCloudTab data={filteredData} filters={filters} onTermClick={handleTermClick} />
        )}
        {activeTab === 'explore' && (
          <ExploreTab
            data={filteredData}
            filters={filters}
            searchQuery={filters.searchQuery}
            setSearchQuery={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
          />
        )}
      </main>

    </div>
  );
}

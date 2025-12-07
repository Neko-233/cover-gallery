'use client';

import { useMemo, useState } from 'react';
import CoverGrid from '@/components/CoverGrid';
import Slider from '@/components/Slider';
import type { Cover } from '@/lib/covers';
import { Search, Trash2, SlidersHorizontal, CheckSquare, Square, Download, Grid3X3, ArrowUpDown } from 'lucide-react';

// Configuration
const CONFIG = {
  IMAGE: {
    MIN_WIDTH: 150,
    MAX_WIDTH: 500,
    STEP: 10,
    DEFAULT: 280
  },
  SPACING: {
    MIN: 10,
    MAX: 60,
    DEFAULT: 24
  }
} as const;

type SortOption = 'newest' | 'oldest' | 'title';

export default function DashboardClient({ covers: initialCovers }: { covers: Cover[] }) {
  // State
  const [covers, setCovers] = useState<Cover[]>(initialCovers);
  const [searchQuery, setSearchQuery] = useState('');
  const [minWidth, setMinWidth] = useState<number>(CONFIG.IMAGE.DEFAULT);
  const [spacing, setSpacing] = useState<number>(CONFIG.SPACING.DEFAULT);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Derived state
  const filteredCovers = useMemo(() => {
    let result = [...covers];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        (c.title?.toLowerCase().includes(q)) || 
        (c.source?.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // Assuming initialCovers comes sorted by date, or we can use IDs/timestamps if available
      // Here we rely on array order from props which was sorted by createdAt desc
      const indexA = initialCovers.findIndex(c => c.id === a.id);
      const indexB = initialCovers.findIndex(c => c.id === b.id);
      
      return sortBy === 'newest' ? indexA - indexB : indexB - indexA;
    });

    return result;
  }, [covers, searchQuery, sortBy, initialCovers]);

  const selectedCount = selectedIds.size;

  // Handlers
  const handleCoverClick = (cover: Cover) => {
    if (isSelectionMode) {
      toggleSelect(cover);
      return;
    }
    const url = cover.pageUrl || cover.url;
    try {
      window.open(url, '_blank');
    } catch {}
  };

  const toggleSelect = (cover: Cover) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cover.id)) next.delete(cover.id);
      else next.add(cover.id);
      return next;
    });
  };

  const handleDelete = async (cover: Cover) => {
    // Optimistic update
    const previousCovers = [...covers];
    setCovers(prev => prev.filter(c => c.id !== cover.id));

    try {
      const res = await fetch(`/api/covers/${cover.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('删除失败，请重试');
      setCovers(previousCovers);
    }
  };

  const handleDownloadSelected = async () => {
    const list = covers.filter((c) => selectedIds.has(c.id));
    for (const c of list) {
      try {
        const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(c.url)}`);
        const blob = await res.blob();
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const nameFromUrl = (() => {
          try {
            const u = new URL(c.url);
            const seg = u.pathname.split('/').filter(Boolean);
            return seg[seg.length - 1] || `cover-${c.id}`;
          } catch { return `cover-${c.id}`; }
        })();
        a.href = url;
        a.download = nameFromUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
          
          {/* Left: Search */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="搜索封面..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg leading-5 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent sm:text-sm transition-all shadow-sm"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            
            {/* Sort Dropdown */}
            <div className="relative inline-block text-left">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer"
              >
                <option value="newest">最新上传</option>
                <option value="oldest">最早上传</option>
                <option value="title">名称排序</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            {/* View Settings Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              title="显示视图设置"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>

            {/* Selection Mode Toggle */}
            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelectionMode 
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                  : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              {isSelectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              <span>{isSelectionMode ? '退出选择' : '选择'}</span>
            </button>

            {/* Download Button (Only in selection mode) */}
            {isSelectionMode && (
              <button
                onClick={handleDownloadSelected}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">下载 {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filters/Settings Area */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 fade-in duration-200">
             <div className="flex flex-wrap items-center gap-8 max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  图片大小
                </div>
                <Slider
                  min={CONFIG.IMAGE.MIN_WIDTH}
                  max={CONFIG.IMAGE.MAX_WIDTH}
                  step={CONFIG.IMAGE.STEP}
                  value={minWidth}
                  onChange={setMinWidth}
                  className="w-32 sm:w-48"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">间距</div>
                <Slider
                  min={CONFIG.SPACING.MIN}
                  max={CONFIG.SPACING.MAX}
                  value={spacing}
                  onChange={setSpacing}
                  className="w-32 sm:w-48"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-8 pb-12">
        <CoverGrid
          covers={filteredCovers}
          onCoverClick={handleCoverClick}
          selectable={isSelectionMode}
          selectedIds={selectedIds}
          onSelectToggle={toggleSelect}
          onDelete={handleDelete}
          fit="cover"
          orientation="landscape"
          spacing={spacing}
          columnsPreset="xlarge"
          minWidth={minWidth}
          maxWidth={Math.floor(minWidth * 1.5)}
          alignment="center"
        />
      </div>
    </div>
  );
}

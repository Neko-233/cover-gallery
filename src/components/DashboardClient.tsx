'use client';

import { useMemo, useState, useEffect } from 'react';
import CoverGrid from '@/components/CoverGrid';
import Slider from '@/components/Slider';
import type { Cover } from '@/lib/covers';
import Link from 'next/link';
import { Search, SlidersHorizontal, CheckSquare, Square, Download, Grid3X3, ArrowUpDown, Folder, Image as ImageIcon, Plus, Globe, Lock, FolderInput, Trash2, CheckCircle2, AlertCircle, GalleryVerticalEnd } from 'lucide-react';

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

interface Collection {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  covers?: { url: string }[];
  _count: { covers: number };
}

export default function DashboardClient({ initialCovers, collections: initialCollections }: { initialCovers: Cover[]; collections: Collection[] }) {
  // State
  const [activeTab, setActiveTab] = useState<'covers' | 'collections'>('covers');
  const [covers, setCovers] = useState<Cover[]>(initialCovers);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [searchQuery, setSearchQuery] = useState('');
  const [minWidth, setMinWidth] = useState<number>(CONFIG.IMAGE.DEFAULT);
  const [spacing, setSpacing] = useState<number>(CONFIG.SPACING.DEFAULT);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Create Collection State
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionVisibility, setNewCollectionVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cover | 'selected' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

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
      // Assuming initialCovers comes sorted by date
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

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCovers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCovers.map(c => c.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget('selected');
    setShowDeleteConfirm(true);
  };

  const handleDelete = async (cover: Cover) => {
    setDeleteTarget(cover);
    setShowDeleteConfirm(true);
  };

  const performDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget === 'selected') {
      // Optimistic update
      const previousCovers = [...covers];
      setCovers(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setShowDeleteConfirm(false);

      try {
        const deletePromises = Array.from(selectedIds).map(id => 
          fetch(`/api/covers/${id}`, { method: 'DELETE' })
        );
        
        const results = await Promise.all(deletePromises);
        const failed = results.filter(r => !r.ok);
        
        if (failed.length > 0) {
          throw new Error(`Failed to delete ${failed.length} items`);
        }
      } catch (error) {
        console.error(error);
        showToastMessage('部分删除失败，请重试', 'error');
        setCovers(previousCovers);
      }
    } else {
      // Single delete
      const cover = deleteTarget;
      // Optimistic update
      const previousCovers = [...covers];
      setCovers(prev => prev.filter(c => c.id !== cover.id));
      setShowDeleteConfirm(false);

      try {
        const res = await fetch(`/api/covers/${cover.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error(error);
        showToastMessage('删除失败，请重试', 'error');
        setCovers(previousCovers);
      }
    }
    setDeleteTarget(null);
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

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDesc,
          visibility: newCollectionVisibility,
        }),
      });
      
      if (res.ok) {
        const newCollection = await res.json();
        setCollections(prev => [{ ...newCollection, _count: { covers: 0 } }, ...prev]);
        setShowCreateCollection(false);
        setNewCollectionName('');
        setNewCollectionDesc('');
        setNewCollectionVisibility('PRIVATE');
      } else {
        throw new Error('Failed to create');
      }
    } catch (e) {
      console.error(e);
      showToastMessage('创建合集失败', 'error');
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (selectedIds.size === 0) return;
    setAddingToCollection(true);
    
    try {
      const res = await fetch('/api/collections/add-covers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverIds: Array.from(selectedIds),
          collectionId,
        }),
      });

      if (res.ok) {
        showToastMessage('添加成功！');
        setShowAddToCollection(false);
        setIsSelectionMode(false);
        setSelectedIds(new Set());
        // Update local collection count optimistically
        setCollections(prev => prev.map(c => 
          c.id === collectionId 
            ? { ...c, _count: { covers: c._count.covers + selectedIds.size } }
            : c
        ));
      } else {
        throw new Error('添加失败');
      }
    } catch (e) {
      console.error(e);
      showToastMessage('添加到合集失败', 'error');
    } finally {
      setAddingToCollection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs - Modern Segmented Control Style */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('covers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'covers' 
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            我的封面
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs transition-colors ${
              activeTab === 'covers' 
                ? 'bg-zinc-100 dark:bg-zinc-800' 
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}>
              {covers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'collections' 
                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            合集
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs transition-colors ${
              activeTab === 'collections' 
                ? 'bg-zinc-100 dark:bg-zinc-800' 
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}>
              {collections.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'collections' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateCollection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-full text-sm font-medium hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all hover:shadow-sm"
            >
              <Plus className="w-4 h-4" />
              新建合集
            </button>
          </div>

          {/* Create Modal */}
          {showCreateCollection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">新建合集</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">创建您的专属封面收藏夹</p>
                </div>
                
                <form onSubmit={handleCreateCollection} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">名称</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          className="w-full pl-4 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:outline-none transition-all"
                          placeholder="例如：2024 年度精选"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">描述</label>
                      <textarea
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:outline-none transition-all resize-none"
                        placeholder="简单介绍一下这个合集..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">可见性</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setNewCollectionVisibility('PRIVATE')}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            newCollectionVisibility === 'PRIVATE'
                              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50'
                              : 'border-transparent bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Lock className={`w-6 h-6 mb-2 ${newCollectionVisibility === 'PRIVATE' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`} />
                          <span className={`text-sm font-medium ${newCollectionVisibility === 'PRIVATE' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>私有</span>
                          {newCollectionVisibility === 'PRIVATE' && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setNewCollectionVisibility('PUBLIC')}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            newCollectionVisibility === 'PUBLIC'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-transparent bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Globe className={`w-6 h-6 mb-2 ${newCollectionVisibility === 'PUBLIC' ? 'text-blue-500' : 'text-zinc-400'}`} />
                          <span className={`text-sm font-medium ${newCollectionVisibility === 'PUBLIC' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'}`}>公开</span>
                          {newCollectionVisibility === 'PUBLIC' && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateCollection(false)}
                      className="flex-1 px-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={creatingCollection}
                      className="flex-1 px-4 py-3 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
                    >
                      {creatingCollection ? '创建中...' : '立即创建'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <Link 
                href={`/collection/${collection.id}`} 
                key={collection.id}
                className="group flex flex-col mt-32"
              >
                {/* Cover Preview */}
                <div className="aspect-[2/1] bg-zinc-100 dark:bg-zinc-900 relative group-hover:opacity-90 transition-opacity">
                  {/* Stack Effect Background Layers - Overflowing */}
                  <div className="absolute inset-0 overflow-visible">
                    {/* Layer 4 */}
                    <div className="absolute -top-24 left-8 right-8 h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl shadow-sm scale-[0.88] transition-transform duration-300 group-hover:-translate-y-16 z-[-2] overflow-hidden">
                      {collection.covers && collection.covers[4] ? (
                        <img
                          src={collection.covers[4].url}
                          alt=""
                          className="w-full h-full object-cover opacity-40 block"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-zinc-100 dark:bg-zinc-800 opacity-40 block" />
                      )}
                    </div>
                    {/* Layer 3 */}
                    <div className="absolute -top-18 left-6 right-6 h-full bg-zinc-150 dark:bg-zinc-850 rounded-xl shadow-sm scale-[0.91] transition-transform duration-300 group-hover:-translate-y-12 z-[-1] overflow-hidden">
                      {collection.covers && collection.covers[3] ? (
                        <img
                          src={collection.covers[3].url}
                          alt=""
                          className="w-full h-full object-cover opacity-50 block"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-zinc-200 dark:bg-zinc-700 opacity-50 block" />
                      )}
                    </div>
                    {/* Layer 2 */}
                    <div className="absolute -top-12 left-4 right-4 h-full bg-zinc-200 dark:bg-zinc-800 rounded-xl shadow-sm scale-[0.94] transition-transform duration-300 group-hover:-translate-y-8 z-0 overflow-hidden">
                      {collection.covers && collection.covers[2] ? (
                        <img
                          src={collection.covers[2].url}
                          alt=""
                          className="w-full h-full object-cover opacity-60 block"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-zinc-300 dark:bg-zinc-600 opacity-60 block" />
                      )}
                    </div>
                    {/* Layer 1 */}
                    <div className="absolute -top-6 left-2 right-2 h-full bg-zinc-300 dark:bg-zinc-700 rounded-xl shadow-md scale-[0.97] transition-transform duration-300 group-hover:-translate-y-4 z-10 overflow-hidden">
                      {collection.covers && collection.covers[1] ? (
                        <img
                          src={collection.covers[1].url}
                          alt=""
                          className="w-full h-full object-cover opacity-80 block"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-zinc-400 dark:bg-zinc-500 opacity-80 block" />
                      )}
                    </div>
                  </div>
                  
                  {/* Main Image Layer */}
                  <div className="relative h-full w-full bg-zinc-400 dark:bg-zinc-600 rounded-xl shadow-sm overflow-hidden z-20 transition-all duration-300 group-hover:shadow-md">
                    {collection.covers && collection.covers.length > 0 ? (
                      <img
                        src={collection.covers[0].url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                        <Folder className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1 truncate">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
                    {collection.description || '暂无描述'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      {collection.visibility === 'PUBLIC' ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                          <Globe className="w-3 h-3" />
                          <span>公开</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          <Lock className="w-3 h-3" />
                          <span>私有</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <GalleryVerticalEnd className="w-3 h-3" />
                        {collection._count.covers}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="sticky top-20 z-30 p-2 rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
              
              {/* Left: Search */}
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="搜索封面..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl leading-5 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent sm:text-sm transition-all focus:bg-white dark:focus:bg-zinc-950"
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                
                {/* Sort Dropdown */}
                <div className="relative inline-block text-left">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer transition-colors"
                  >
                    <option value="newest">最新上传</option>
                    <option value="oldest">最早上传</option>
                    <option value="title">名称排序</option>
                  </select>
                  <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

                {/* View Settings Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  title="显示视图设置"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>

                {/* Selection Mode Toggle */}
                <button
                  onClick={() => {
                    if (isSelectionMode) {
                      setIsSelectionMode(false);
                      setSelectedIds(new Set());
                    } else {
                      setIsSelectionMode(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelectionMode 
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {isSelectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  <span>{isSelectionMode ? '退出选择' : '选择'}</span>
                </button>

                {/* Select All Button (Only in selection mode) */}
                {isSelectionMode && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {selectedIds.size === filteredCovers.length && filteredCovers.length > 0 ? '取消全选' : '全选'}
                    </span>
                  </button>
                )}

                {/* Add to Collection Button (Only in selection mode) */}
                {isSelectionMode && (
                  <button
                    onClick={() => setShowAddToCollection(true)}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <FolderInput className="h-4 w-4" />
                    <span className="hidden sm:inline">添加到合集</span>
                  </button>
                )}

                {/* Download Button (Only in selection mode) */}
                {isSelectionMode && (
                  <button
                    onClick={handleDownloadSelected}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">下载</span>
                  </button>
                )}

                {/* Delete Button (Only in selection mode) */}
                {isSelectionMode && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">删除</span>
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

          {/* Add to Collection Modal */}
          {showAddToCollection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">添加到合集</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {collections.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                      还没有合集，请先创建一个
                    </p>
                  ) : (
                    collections.map(collection => (
                      <button
                        key={collection.id}
                        onClick={() => handleAddToCollection(collection.id)}
                        disabled={addingToCollection}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          collection.visibility === 'PUBLIC' 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30' 
                            : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700'
                        }`}>
                          <Folder className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{collection.name}</span>
                            {collection.visibility === 'PUBLIC' ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-medium text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                                <Globe className="w-3 h-3" />
                                <span>公开</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                <Lock className="w-3 h-3" />
                                <span>私有</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{collection._count.covers} 个封面</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowAddToCollection(false)}
                    className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">确认删除</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {deleteTarget === 'selected' 
                      ? `确定要删除选中的 ${selectedIds.size} 张封面吗？此操作无法撤销。`
                      : '确定要删除这张封面吗？此操作无法撤销。'
                    }
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={performDelete}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors shadow-sm"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          )}

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
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { notFound } from 'next/navigation';
import CoverGrid from '@/components/CoverGrid';
import Link from 'next/link';
import { GalleryVerticalEnd, Globe, Lock, Share2, ThumbsUp, Star, MessageCircle, ChevronDown, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/Avatar';
import HeaderActions from '@/components/HeaderActions';
import CommentSection from '@/components/CommentSection';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  covers: {
    id: string;
    filename: string;
    url: string;
    title?: string;
    source?: string;
    pageUrl?: string;
    createdAt: string;
    likesCount: number;
    liked: boolean;
  }[];
  isOwner: boolean;
  likesCount: number;
  liked: boolean;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
}

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('popular_today');
  
  // Likes state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Edit Collection State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVisibility, setEditVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [updating, setUpdating] = useState(false);
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

  useEffect(() => {
    fetchCollection();
  }, [id, sortBy]);

  useEffect(() => {
    if (collection) {
      setLiked(collection.liked ?? false);
      setLikesCount(collection.likesCount ?? 0);
      // Pre-fill edit form
      setEditName(collection.name);
      setEditDesc(collection.description || '');
      setEditVisibility(collection.visibility);
    }
  }, [collection]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCollection(prev => prev ? { ...prev, comments: data } : null);
      }
    } catch {}
  }, [id]);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${id}?sort=${sortBy}`);
      if (res.status === 404) {
        setError('Collection not found');
      } else if (res.status === 403) {
        setError('Access denied');
      } else if (!res.ok) {
        setError('Failed to load collection');
      } else {
        const data = await res.json();
        setCollection(data);
        // Also fetch comments
        fetchComments();
      }
    } catch {
      setError('Error loading collection');
    } finally {
      setLoading(false);
    }
  }, [id, sortBy, fetchComments]);

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !session) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          visibility: editVisibility,
        }),
      });

      if (res.ok) {
        const updatedCollection = await res.json();
        setCollection(prev => prev ? { ...prev, ...updatedCollection } : null);
        setShowEditModal(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error(e);
      showToastMessage('更新失败', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleLike = async () => {
    if (!session) return;
    if (liking) return;
    setLiking(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    // Optimistically update collection state immediately to reflect in stats card
    setCollection(prev => prev ? {
      ...prev,
      liked: newLiked,
      likesCount: newLiked ? prev.likesCount + 1 : prev.likesCount - 1
    } : null);

    try {
      const res = await fetch('/api/collections/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!newLiked);
      setLikesCount(prev => !newLiked ? prev + 1 : prev - 1);
      // Revert collection state on error
      setCollection(prev => prev ? {
        ...prev,
        liked: !newLiked,
        likesCount: !newLiked ? prev.likesCount + 1 : prev.likesCount - 1
      } : null);
    } finally {
      setLiking(false);
    }
  };

  if (loading && !collection) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-pulse text-zinc-400">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 gap-4">
        <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{error}</div>
        <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-zinc-900/50 transition-all group-hover:scale-105 group-hover:rotate-3">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="hidden sm:block text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">封面画廊</h2>
            </Link>
            
            <div className="flex items-center gap-3">
              {collection.isOwner && (
                 <button
                   onClick={() => setShowEditModal(true)}
                   className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                 >
                   <Edit className="w-4 h-4" />
                   编辑信息
                 </button>
              )}
              <HeaderActions />
            </div>
          </div>
        </div>
      </header>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">编辑合集信息</h3>
            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">名称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent focus:ring-2 focus:ring-zinc-500"
                  placeholder="例如：2024 年度精选"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">描述</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent focus:ring-2 focus:ring-zinc-500"
                  placeholder="选填..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">可见性</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={editVisibility === 'PRIVATE'}
                      onChange={(e) => setEditVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
                    />
                    <span className="text-sm">私有</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={editVisibility === 'PUBLIC'}
                      onChange={(e) => setEditVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
                    />
                    <span className="text-sm">公开</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {updating ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-5 fade-in duration-300">
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

        {/* Hero Section */}
        <div className="relative bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    collection.visibility === 'PUBLIC' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                    {collection.visibility === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {collection.visibility === 'PUBLIC' ? '公开' : '私有'}
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Link href={`/user/${collection.userId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar src={collection.user.image} name={collection.user.name} size={20} />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{collection.user.name || 'Unknown'}</span>
                    </Link>
                    <span>创建于 {new Date(collection.covers[0]?.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={handleLike}
                    disabled={!session || liking}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all active:scale-95 backdrop-blur-xl border ${
                      liked 
                        ? 'bg-amber-50/80 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50 shadow-[0_4px_20px_-4px_rgba(251,191,36,0.3)]' 
                        : 'bg-white/40 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/50 hover:bg-white/60 dark:hover:bg-zinc-800/60 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span>{liked ? '已收藏' : '收藏合集'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToastMessage('链接已复制');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300 font-medium hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all active:scale-95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>分享</span>
                  </button>
                  
                  <a href="#comments" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">
                    <MessageCircle className="w-5 h-5" />
                    <span>评论</span>
                    <span className="opacity-60 ml-1">| {collection.comments?.filter(c => !c.parentId).length || 0}</span>
                  </a>
                </div>
              </div>

              {/* Stats Card */}
              <div className="w-full md:w-auto p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 min-w-[240px]">
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">合集数据</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                      <GalleryVerticalEnd className="w-4 h-4" /> 封面数量
                    </span>
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{collection.covers.length}</span>
                  </div>
                  <div className="w-full h-px bg-zinc-200 dark:bg-zinc-700/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                      <Star className="w-4 h-4" /> 合集收藏
                    </span>
                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">全部内容</h2>
            
            <div className="flex items-center gap-2 relative group">
               <span className="text-sm text-zinc-500">排序：</span>
               <div className="relative">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="appearance-none bg-transparent pl-2 pr-8 py-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                 >
                   <option value="popular_today">今日热门</option>
                   <option value="popular_all_time">最多点赞</option>
                   <option value="newest">最新添加</option>
                 </select>
                 <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-blue-600 transition-colors" />
               </div>
            </div>
          </div>

          <CoverGrid covers={collection.covers} />

          {/* Comments Section */}
          <div id="comments" className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 max-w-4xl mx-auto">
            <CommentSection 
              targetId={collection.id}
              type="collection"
              initialComments={collection.comments}
              title="评论"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

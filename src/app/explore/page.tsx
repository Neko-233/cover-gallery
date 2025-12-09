'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GalleryVerticalEnd, Globe, Heart, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/Avatar';
import HeaderActions from '@/components/HeaderActions';

interface PublicCollection {
  id: string;
  name: string;
  description: string | null;
  user: {
    name: string | null;
    image: string | null;
  };
  covers: { url: string }[];
  _count: {
    covers: number;
    collectionLikes: number;
  };
}

export default function ExplorePage() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchCollections();
  }, [sortBy]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/public?sort=${sortBy}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch {
      console.error('Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

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
            
            <HeaderActions />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-8 h-8 text-blue-500" />
              发现灵感
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              探索用户分享的合集
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'popular'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              热门
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'newest'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              最新
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            暂无公开收藏夹
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {collection.covers.length > 4 && (
                        <div className="absolute -top-24 left-8 right-8 h-full bg-zinc-100 dark:bg-zinc-900 rounded-xl shadow-sm scale-[0.88] transition-transform duration-300 group-hover:-translate-y-16 z-[-2] overflow-hidden">
                          <img
                            src={collection.covers[4].url}
                            alt=""
                            className="w-full h-full object-cover opacity-40"
                          />
                        </div>
                      )}
                      {/* Layer 3 */}
                      {collection.covers.length > 3 && (
                        <div className="absolute -top-18 left-6 right-6 h-full bg-zinc-150 dark:bg-zinc-850 rounded-xl shadow-sm scale-[0.91] transition-transform duration-300 group-hover:-translate-y-12 z-[-1] overflow-hidden">
                          <img
                            src={collection.covers[3].url}
                            alt=""
                            className="w-full h-full object-cover opacity-50"
                          />
                        </div>
                      )}
                      {/* Layer 2 */}
                      {collection.covers.length > 2 && (
                        <div className="absolute -top-12 left-4 right-4 h-full bg-zinc-200 dark:bg-zinc-800 rounded-xl shadow-sm scale-[0.94] transition-transform duration-300 group-hover:-translate-y-8 z-0 overflow-hidden">
                          <img
                            src={collection.covers[2].url}
                            alt=""
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      )}
                      {/* Layer 1 */}
                      {collection.covers.length > 1 && (
                        <div className="absolute -top-6 left-2 right-2 h-full bg-zinc-300 dark:bg-zinc-700 rounded-xl shadow-md scale-[0.97] transition-transform duration-300 group-hover:-translate-y-4 z-10 overflow-hidden">
                          <img
                            src={collection.covers[1].url}
                            alt=""
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Main Image Layer */}
                    <div className="relative h-full w-full bg-zinc-400 dark:bg-zinc-600 rounded-xl shadow-sm overflow-hidden z-20 transition-all duration-300 group-hover:shadow-md">
                    {collection.covers.length > 0 ? (
                      <img
                        src={collection.covers[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                        <GalleryVerticalEnd className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
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
                      <Avatar src={collection.user.image} name={collection.user.name} size={20} />
                      <span className="truncate max-w-[100px]">{collection.user.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <GalleryVerticalEnd className="w-3 h-3" />
                        {collection._count.covers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {collection._count.collectionLikes}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

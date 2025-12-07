'use client';

import { useEffect, useRef, useState } from 'react';
import type { Cover } from '@/lib/covers';
import CoverCard from '@/components/CoverCard';

const CHUNK = 12;

export default function InfiniteAllenAIGallery() {
  const [items, setItems] = useState<Cover[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const loadChunk = async (nextCursor: number, direction: 'down' | 'up' = 'down') => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scrape/allenai?offset=${nextCursor}&limit=${CHUNK}`);
      if (!res.ok) throw new Error('fetch_failed');
      const data: Cover[] = await res.json();
      setItems((prev) => direction === 'down' ? [...prev, ...data] : [...data, ...prev]);
      setCursor(nextCursor + CHUNK);
    } catch {
      setError('封面加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChunk(0);
    const bottomObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadChunk(cursor + CHUNK, 'down');
    }, { threshold: 0.1 });
    const topObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadChunk(Math.max(cursor - CHUNK * 2, 0), 'up');
    }, { threshold: 0.1 });
    if (bottomRef.current) bottomObserver.observe(bottomRef.current);
    if (topRef.current) topObserver.observe(topRef.current);
    return () => { bottomObserver.disconnect(); topObserver.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen">
      {error && (
        <div className="px-6 sm:px-8">
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">{error}</div>
        </div>
      )}
      <div ref={topRef} />
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 px-6 sm:px-8">
        {items.map((c) => (
          <CoverCard key={c.id} cover={c} fit="cover" />
        ))}
      </div>
      <div className="flex items-center justify-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
        {loading ? '加载中…' : '向下滚动加载更多'}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}


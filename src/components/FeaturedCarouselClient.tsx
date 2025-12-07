'use client';

import { useEffect, useState } from 'react';
import CoverCarousel from '@/components/CoverCarousel';
import type { Cover } from '@/lib/covers';

export default function FeaturedCarouselClient({ covers, endpoint = '/api/featured' }: { covers?: Cover[]; endpoint?: string }) {
  const [data, setData] = useState<Cover[] | null>(covers ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (covers && covers.length) return;
    let aborted = false;
    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error('fetch_failed');
        const d = await res.json();
        if (!aborted) setData(d);
      })
      .catch(() => { if (!aborted) { setError('精选封面加载失败'); setData([]); } });
    return () => { aborted = true; };
  }, [covers]);

  if (error) {
    return (
      <div className="px-6 sm:px-8">
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-[200px] flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm px-6 sm:px-8">正在加载…</div>;
  }

  return (
    <div className="px-6 sm:px-8">
      <CoverCarousel covers={data} />
    </div>
  );
}

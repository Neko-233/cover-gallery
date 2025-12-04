'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import CoverGrid from '@/components/CoverGrid';
import type { Cover } from '@/lib/covers';

export default function UserCoversClient() {
  const { data: session, status } = useSession();
  const [covers, setCovers] = useState<Cover[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setCovers([]);
      return;
    }
    let aborted = false;
    setError(null);
    fetch('/api/covers')
      .then(async (res) => {
        if (!res.ok) throw new Error('fetch_failed');
        const data = await res.json();
        if (!aborted) setCovers(
          data.map((c: any) => ({ id: c.id, filename: c.url, title: c.title || undefined, source: c.source || undefined, url: c.url }))
        );
      })
      .catch(() => {
        if (!aborted) {
          setError('封面加载失败');
          setCovers([]);
        }
      });
    return () => { aborted = true; };
  }, [status, session?.user?.id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">
        {error}
      </div>
    );
  }

  if (covers === null) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm">正在加载…</div>
    );
  }

  return <CoverGrid covers={covers} />;
}


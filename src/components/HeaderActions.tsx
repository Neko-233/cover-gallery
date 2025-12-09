'use client';

import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import UserMenu from '@/components/UserMenu';

export default function HeaderActions({ count, showCount = false }: { count?: number; showCount?: boolean }) {
  const { data: session, status } = useSession();
  const [clientCount, setClientCount] = useState<number | null>(null);
  useEffect(() => {
    if (!showCount) return;
    if (status !== 'authenticated') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClientCount(0);
      return;
    }
    let aborted = false;
    fetch('/api/covers')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (!aborted) setClientCount(Array.isArray(data) ? data.length : 0); })
      .catch(() => { if (!aborted) setClientCount(null); });
    return () => { aborted = true; };
  }, [showCount, status, session]);
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {showCount && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{(clientCount ?? count ?? 0)} 张封面</div>
      )}
      <ThemeSwitcher />
      {session?.user ? (
        <UserMenu />
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 px-4 py-2 text-sm font-medium hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all hover:shadow-sm">登录</Link>
          <Link href="/register" className="rounded-full bg-zinc-900/80 dark:bg-zinc-100/80 backdrop-blur-md text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all hover:shadow-md">注册</Link>
        </div>
      )}
    </div>
  );
}

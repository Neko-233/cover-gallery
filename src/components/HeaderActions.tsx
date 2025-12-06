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
  }, [showCount, status, session?.user?.id]);
  return (
    <div className="flex items-center gap-4">
      {showCount && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{(clientCount ?? count ?? 0)} 张封面</div>
      )}
      <ThemeSwitcher />
      {session?.user ? (
        <div className="flex items-center gap-2">
          <Link href="/add" className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2 text-sm">添加封面</Link>
          <UserMenu />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm">登录</Link>
          <Link href="/register" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm">注册</Link>
        </div>
      )}
    </div>
  );
}

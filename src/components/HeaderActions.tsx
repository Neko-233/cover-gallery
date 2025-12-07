'use client';

import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import UserMenu from '@/components/UserMenu';
import { Plus } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      {showCount && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{(clientCount ?? count ?? 0)} 张封面</div>
      )}
      <ThemeSwitcher />
      {session?.user ? (
        <>
          <Link 
            href="/add" 
            aria-label="添加封面"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
          </Link>
          <UserMenu />
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm">登录</Link>
          <Link href="/register" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm">注册</Link>
        </div>
      )}
    </div>
  );
}

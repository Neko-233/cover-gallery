'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const name = session?.user?.name || session?.user?.email || '';
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="用户菜单"
        className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:opacity-90"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
          <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {name || '已登录'}
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800" />
          <div className="py-1">
            <Link href="/dashboard" className="block px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              我的主页
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

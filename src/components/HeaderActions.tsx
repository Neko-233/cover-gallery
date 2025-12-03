'use client';

import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { signOut, useSession } from 'next-auth/react';

export default function HeaderActions({ count }: { count: number }) {
  const { data: session } = useSession();
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{count} 张封面</div>
      <ThemeSwitcher />
      {session?.user ? (
        <div className="flex items-center gap-2">
          <Link href="/add" className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2 text-sm">添加封面</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm">退出</button>
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

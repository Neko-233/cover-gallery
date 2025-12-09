'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ProfileEditModal from './ProfileEditModal';
import Avatar from './Avatar';

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="用户菜单"
          className="rounded-full hover:opacity-90 transition-opacity"
        >
          <Avatar src={session?.user?.image} name={name} size={36} />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-32 rounded-xl border border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-2xl z-50 p-1 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate border-b border-zinc-200/50 dark:border-zinc-800/50 mb-1">
              {name || '已登录'}
            </div>
            {userId && (
              <Link
                href="/dashboard"
                className="block px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                我的主页
              </Link>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setShowEditModal(true);
              }}
              className="block w-full text-left px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              编辑资料
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block w-full text-left px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg border-t border-zinc-200/50 dark:border-zinc-800/50 mt-1 pt-1.5 transition-colors"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
      <ProfileEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </>
  );
}

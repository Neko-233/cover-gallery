import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserMenu from '@/components/UserMenu';

import DashboardGridClient from '@/components/DashboardGridClient';

import { GalleryVerticalEnd } from 'lucide-react';

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">封面画廊</h2>
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-zinc-700 dark:text-zinc-300 mb-4">请先登录。</div>
            <Link href="/login" className="inline-block rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2">前往登录</Link>
          </div>
        </main>
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} 封面画廊. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const sp = await searchParams;
  const page = Number(sp?.page ?? '1') || 1;
  const pageSize = Number(sp?.pageSize ?? '20') || 20;
  const take = Math.max(1, Math.min(100, pageSize));
  const skip = (Math.max(1, page) - 1) * take;
  const covers = await prisma.cover.findMany({ where: { userId: String(userId) }, orderBy: { createdAt: 'desc' }, take, skip });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedCovers = covers.map((c: any) => ({
    id: c.id,
    filename: c.url,
    title: c.title || undefined,
    source: c.source || undefined,
    url: c.url,
    pageUrl: c.pageUrl || undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="w-full px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">封面画廊</h2>
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">{mappedCovers.length} 张封面</div>
              <Link href="/add" className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 text-xs sm:text-sm hover:opacity-90">添加封面</Link>
              <ThemeSwitcher />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full py-8">
        <div className="px-6 sm:px-8 mb-6">
           <div className="text-zinc-700 dark:text-zinc-300">欢迎，{session?.user?.name || session?.user?.email}</div>
        </div>
        <DashboardGridClient covers={mappedCovers} />
      </main>
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="w-full px-6 sm:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} 封面画廊. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserMenu from '@/components/UserMenu';
import DashboardClient from '@/components/DashboardClient';
import { GalleryVerticalEnd, Plus } from 'lucide-react';

export default async function Page() {
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">请先登录</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">登录后即可管理您的封面收藏</p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium transition-transform hover:scale-105 active:scale-95"
            >
              前往登录
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch all covers for the user to enable client-side filtering/sorting
  const covers = await prisma.cover.findMany({ 
    where: { userId: String(userId) }, 
    orderBy: { createdAt: 'desc' } 
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedCovers = covers.map((c: any) => ({
    id: c.id,
    filename: c.url,
    title: c.title || undefined,
    source: c.source || undefined,
    url: c.url,
    pageUrl: c.pageUrl || undefined,
    createdAt: c.createdAt,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:block">封面画廊</h2>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/add" 
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">添加封面</span>
              <span className="sm:hidden">添加</span>
            </Link>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
            <ThemeSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">我的封面</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              共 {mappedCovers.length} 张封面 · 欢迎回来，{session.user.name || session.user.email}
            </p>
          </div>
          
          <DashboardClient covers={mappedCovers} />
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
        <div className="w-full px-6 sm:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} 封面画廊. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

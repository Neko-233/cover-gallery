import CoverGrid from '@/components/CoverGrid';
import HeaderActions from '@/components/HeaderActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import UserCoversClient from '@/components/UserCoversClient';
import AutoScrollMasonry from '@/components/AutoScrollMasonry';

import { GalleryVerticalEnd } from 'lucide-react';

import Hero from '@/components/Hero';

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  let session: Awaited<ReturnType<typeof getServerSession>> | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session as any)?.user?.id as string | undefined;
  let covers: { id: string; filename: string; title?: string; source?: string; url: string; pageUrl?: string }[] = [];
  if (userId) {
    try {
      const sp = await searchParams;
      const page = Number(sp?.page ?? '1') || 1;
      const pageSize = Number(sp?.pageSize ?? '20') || 20;
      const take = Math.max(1, Math.min(100, pageSize));
      const skip = (Math.max(1, page) - 1) * take;
      const userCovers = await prisma.cover.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      });
      covers = userCovers.map((c) => ({ id: c.id, filename: c.url, title: c.title || undefined, source: c.source || undefined, url: c.url, pageUrl: c.pageUrl || undefined }));
    } catch {}
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative">
      {/* Global Background Layer - Fixed and Full Screen */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-zinc-50/40 dark:bg-zinc-900/40 backdrop-blur-[1px]" />
        
        {/* Gradient Overlays - moved from Hero to cover full screen */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-zinc-50/50 via-zinc-50/20 to-zinc-50/80 dark:from-zinc-900/50 dark:via-zinc-900/20 dark:to-zinc-900/80 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,theme(colors.zinc.50)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,theme(colors.zinc.900)_0%,transparent_100%)] opacity-60 pointer-events-none" />
        
        <AutoScrollMasonry />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-zinc-900/50 transition-all hover:scale-105 hover:rotate-3">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">封面画廊</h2>
            </div>
            <div className="flex items-center gap-3">
              <HeaderActions />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full pt-[72px] flex flex-col justify-center">
        {/* Hero Content Layer */}
        <Hero isLoggedIn={!!userId} />
      </main>

      <footer className="relative z-10 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} 封面画廊. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

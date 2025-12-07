import CoverGrid from '@/components/CoverGrid';
import HeaderActions from '@/components/HeaderActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import UserCoversClient from '@/components/UserCoversClient';
import AutoScrollMasonry from '@/components/AutoScrollMasonry';

import { GalleryVerticalEnd } from 'lucide-react';

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
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="w-full px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">封面画廊</h2>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <HeaderActions />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-0 border-0 overflow-hidden">
        <AutoScrollMasonry />
      </main>

      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="w-full px-4 sm:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} 封面画廊. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

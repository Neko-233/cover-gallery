import CoverGrid from '@/components/CoverGrid';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import HeaderActions from '@/components/HeaderActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import UserCoversClient from '@/components/UserCoversClient';

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  let session: Awaited<ReturnType<typeof getServerSession>> | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch (_) {
    session = null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session as any)?.user?.id as string | undefined;
  let covers: { id: string; filename: string; title?: string; source?: string; url: string }[] = [];
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
      covers = userCovers.map((c) => ({ id: c.id, filename: c.url, title: c.title || undefined, source: c.source || undefined, url: c.url }));
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              封面画廊
            </h1>
            <HeaderActions />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {covers.length > 0 ? <CoverGrid covers={covers} /> : <UserCoversClient />}
      </main>

      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            封面收集展示网站 - 简洁、干净、不花哨
          </div>
        </div>
      </footer>
    </div>
  );
}

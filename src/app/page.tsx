import { getCovers } from '@/lib/covers';
import CoverGrid from '@/components/CoverGrid';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import HeaderActions from '@/components/HeaderActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';

export default async function Home({ searchParams }: { searchParams?: { page?: string; pageSize?: string } }) {
  const session = await getServerSession(authOptions);
  const staticCovers = await getCovers();
  let userCovers: Awaited<ReturnType<typeof prisma.cover.findMany>> = [];
  if (session?.user?.id) {
    const page = Number(searchParams?.page ?? '1') || 1;
    const pageSize = Number(searchParams?.pageSize ?? '20') || 20;
    const take = Math.max(1, Math.min(100, pageSize));
    const skip = (Math.max(1, page) - 1) * take;
    userCovers = await prisma.cover.findMany({
      where: { userId: String(session.user.id) },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }
  const covers = [
    ...userCovers.map((c) => ({
      id: c.id,
      filename: c.url,
      title: c.title || undefined,
      source: c.source || undefined,
      url: c.url,
    })),
    ...staticCovers,
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              封面画廊
            </h1>
            <HeaderActions count={covers.length} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CoverGrid covers={covers} />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            封面收集展示网站 - 简洁、干净、不花哨
          </div>
        </div>
      </footer>
    </div>
  );
}

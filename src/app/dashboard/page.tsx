import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

import CoverGrid from '@/components/CoverGrid';

export default async function Page({ searchParams }: { searchParams?: { page?: string; pageSize?: string } }) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-zinc-700 dark:text-zinc-300 mb-4">请先登录。</div>
            <Link href="/login" className="inline-block rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2">前往登录</Link>
          </div>
        </div>
      </div>
    );
  }

  const page = Number(searchParams?.page ?? '1') || 1;
  const pageSize = Number(searchParams?.pageSize ?? '20') || 20;
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
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">我的主页</h2>
        <div className="text-zinc-700 dark:text-zinc-300 mb-4">欢迎，{session?.user?.name || session?.user?.email}</div>
        <div className="mb-6">
          <Link href="/add" className="inline-block rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2">添加封面</Link>
        </div>
        <CoverGrid covers={mappedCovers} />
      </div>
    </div>
  );
}

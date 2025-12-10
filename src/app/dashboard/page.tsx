import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserMenu from '@/components/UserMenu';
import DashboardClient from '@/components/DashboardClient';
import { GalleryVerticalEnd, Plus, User, Sparkles } from 'lucide-react';
import Avatar from '@/components/Avatar';

export default async function Page() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const userId = user?.id;
  
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

  // Fetch all covers for the user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const covers = await (prisma as any).cover.findMany({ 
    where: { userId: String(userId) }, 
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { likes: true } }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = await (prisma as any).collection.findMany({
    where: { userId: String(userId) },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { covers: true } },
      covers: {
        take: 5,
        select: { url: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  // Calculate stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLikes = covers.reduce((acc: number, c: any) => acc + c._count.likes, 0);

  // Fetch visit count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitCount = await (prisma as any).visit.count({
    where: { targetUserId: String(userId) }
  });

  // Count total comments (excluding replies)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCommentsCount = await (prisma as any).comment.count({
    where: { 
      targetUserId: String(userId),
      parentId: null
    }
  });

  // Get liked status for covers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likedCoverIds = await (prisma as any).like.findMany({
    where: {
      userId: String(userId),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      coverId: { in: covers.map((c: any) => c.id) },
    },
    select: { coverId: true }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likedSet = new Set(likedCoverIds.map((l: any) => l.coverId));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedCovers = covers.map((c: any) => ({
    id: c.id,
    filename: c.url,
    title: c.title || undefined,
    source: c.source || undefined,
    url: c.url,
    pageUrl: c.pageUrl || undefined,
    createdAt: c.createdAt,
    likesCount: c._count.likes,
    liked: likedSet.has(c.id),
    collectionId: c.collectionId,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-zinc-900/50 transition-all group-hover:scale-105 group-hover:rotate-3">
                <GalleryVerticalEnd className="w-5 h-5 text-white dark:text-zinc-900" />
              </div>
              <h2 className="hidden sm:block text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">封面画廊</h2>
            </Link>

            <div className="flex items-center gap-3">
              <Link 
                href="/add"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>添加封面</span>
              </Link>
              <Link 
                href="/add"
                className="sm:hidden flex items-center justify-center w-9 h-9 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-sm hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
              </Link>
              
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
              
              <ThemeSwitcher />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-8">
        {/* Profile Summary */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden">
                <Avatar src={user.image} name={user.name} size={112} />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                {user.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>加入于 {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-4 md:justify-end">
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{covers.length}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">封面</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{collections.length}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">合集</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalLikes}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">封面获赞</span>
            </div>
            <Link href={`/user/${userId}/visitors`} className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{visitCount}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">访客</span>
            </Link>
            <Link href="/dashboard/comments" className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalCommentsCount}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">留言</span>
            </Link>
          </div>
        </div>

        <DashboardClient initialCovers={mappedCovers} collections={collections} />
      </main>
    </div>
  );
}

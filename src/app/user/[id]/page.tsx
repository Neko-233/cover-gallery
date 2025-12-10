import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserMenu from '@/components/UserMenu';
import DashboardClient from '@/components/DashboardClient';
import { GalleryVerticalEnd, User, Sparkles } from 'lucide-react';
import Avatar from '@/components/Avatar';
import CommentSection from '@/components/CommentSection';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if viewing own profile
  if (session?.user?.id === userId) {
    redirect('/dashboard');
  }

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      bio: true,
      createdAt: true,
    }
  });

  if (!user) {
    notFound();
  }

  // Record visit if visitor is logged in and not the owner
  if (session?.user?.id && session.user.id !== userId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).visit.create({
        data: {
          visitorId: session.user.id,
          targetUserId: userId,
        }
      });
    } catch (e) {
      console.error('Failed to record visit', e);
    }
  }

  // Fetch all PUBLIC covers for the user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const covers = await (prisma as any).cover.findMany({ 
    where: { userId: String(userId) }, // TODO: Add visibility check if covers have visibility
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { likes: true } }
    }
  });

  // Fetch PUBLIC collections for the user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = await (prisma as any).collection.findMany({
    where: { 
      userId: String(userId),
      visibility: 'PUBLIC' 
    },
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

  // Fetch visit count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitCount = await (prisma as any).visit.count({
    where: { targetUserId: userId }
  });

  // Calculate stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLikes = covers.reduce((acc: number, c: any) => acc + c._count.likes, 0);

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
    liked: false, 
    collectionId: c.collectionId,
  }));

  // Fetch initial comments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialComments = await (prisma as any).comment.findMany({
    where: {
      targetUserId: userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Count total comments (excluding replies)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCommentsCount = await (prisma as any).comment.count({
    where: { 
      targetUserId: userId,
      parentId: null
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedComments = initialComments.map((c: any) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
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
                {user.bio && (
                  <p className="max-w-lg">{user.bio}</p>
                )}
                <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>加入于 {user.createdAt.getFullYear()}</span>
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
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">公开合集</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalLikes}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">获赞</span>
            </div>
            <Link href={`/user/${userId}/visitors`} className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{visitCount}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">访客</span>
            </Link>
            <a href="#comments" className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalCommentsCount}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">留言</span>
            </a>
          </div>
        </div>

        <DashboardClient initialCovers={mappedCovers} collections={collections} />

        {/* Message Board */}
        <div id="comments" className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800">
           <CommentSection 
             targetId={userId} 
             type="user" 
             title="留言板"
             initialComments={formattedComments}
           />
        </div>
      </main>
    </div>
  );
}

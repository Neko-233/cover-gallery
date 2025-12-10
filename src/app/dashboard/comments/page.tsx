import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import { redirect } from 'next/navigation';

export default async function DashboardCommentsPage() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const userId = user?.id;

  if (!userId) {
    redirect('/login');
  }

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

  // Count total comments (including replies)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCommentsCount = await (prisma as any).comment.count({
    where: { targetUserId: userId }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedComments = initialComments.map((c: any) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">留言板</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <CommentSection 
            targetId={userId} 
            type="user" 
            title={`共 ${totalCommentsCount} 条留言`}
            initialComments={formattedComments}
          />
        </div>
      </main>
    </div>
  );
}

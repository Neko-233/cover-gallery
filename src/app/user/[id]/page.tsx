import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { GalleryVerticalEnd, Globe, Lock, Folder } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import Avatar from '@/components/Avatar';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserId = (session?.user as any)?.id;
  const isOwner = currentUserId === id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma as any).user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch collections
  // If owner, maybe show all? But typically profile is public view.
  // Let's show public only for now, or all if owner.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = await (prisma as any).collection.findMany({
    where: {
      userId: id,
      visibility: isOwner ? undefined : 'PUBLIC',
    },
    include: {
      _count: {
        select: { covers: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

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
               <Link href="/" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                 返回首页
               </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden">
                <Avatar src={user.image} name={user.name} size={112} />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {user.name || '未命名用户'}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed line-clamp-2">
                {user.bio || '此人很懒，自我介绍都用了默认皮肤。'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex gap-4 md:justify-end">
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl min-w-[100px] border border-zinc-100 dark:border-zinc-800 transition-transform hover:scale-105">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{collections.length}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">公开合集</span>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            收藏夹 ({collections.length})
          </h2>

          {collections.length === 0 ? (
            <div className="text-center py-12 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 border-dashed">
              <p className="text-zinc-500 dark:text-zinc-400">暂无公开收藏夹</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {collections.map((collection: any) => (
                <Link 
                  href={`/collection/${collection.id}`} 
                  key={collection.id}
                  className="group block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${collection.visibility === 'PUBLIC' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    {collection.visibility === 'PUBLIC' ? (
                      <Globe className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-10">
                    {collection.description || '暂无描述'}
                  </p>
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {collection._count?.covers || 0} 个内容
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

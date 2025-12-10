import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { notFound } from 'next/navigation';

export default async function VisitorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true }
  });

  if (!user) {
    notFound();
  }

  // Fetch visits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visits = await (prisma as any).visit.findMany({
    where: { targetUserId: userId },
    include: {
      visitor: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    },
    orderBy: { visitedAt: 'desc' }
  });

  // Group visits by date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedVisits = visits.reduce((acc: any, visit: any) => {
    const date = new Date(visit.visitedAt).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(visit);
    return acc;
  }, {});

  // Convert to array and sort groups (though visits are already sorted by desc, 
  // so the first date encountered is the latest one, so keys insertion order *might* be enough, 
  // but better to be explicit if we weren't sure. 
  // Since we iterate visits desc, the first date we see is the newest. 
  // Object.keys order is generally insertion order for strings in modern JS, but let's be safe).
  
  const groups = Object.entries(groupedVisits).map(([date, items]) => ({
    date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (items as any[]).sort((a, b) => 
      // Sort by time within day (descending, latest first)
      new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
    )
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href={`/user/${userId}`}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">访客记录</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">暂无访客</h3>
            <p className="text-zinc-500 dark:text-zinc-400">还没有人访问过这里</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 sticky top-20">
                    {group.date}
                  </h3>
                </div>
                
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {group.items.map((visit: any) => (
                    <div key={visit.id} className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <Link href={`/user/${visit.visitor.id}`} className="shrink-0">
                        <Avatar src={visit.visitor.image} name={visit.visitor.name} size={48} />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/user/${visit.visitor.id}`} className="block">
                          <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate hover:underline">
                            {visit.visitor.name || 'Unknown User'}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(visit.visitedAt).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import AddCoverForm from '@/components/AddCoverForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import Link from 'next/link';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user?.id;
  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
        <div className="absolute top-0 right-0 bottom-0 w-64 bg-gradient-to-l from-white/10 dark:from-zinc-950 to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">添加新封面</h1>
            <p className="text-lg text-zinc-300 leading-relaxed">
              发现精彩设计？只需粘贴链接，我们帮您自动提取并收藏。
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">Auto</div>
              <div className="text-sm text-zinc-400">自动提取</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">Fast</div>
              <div className="text-sm text-zinc-400">快速收藏</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">添加封面</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              输入网页链接，构建您的专属画廊
            </p>
          </div>

          <div className="mt-8">
            {!isAuthed ? (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">请先登录后再添加封面。</p>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium transition-transform hover:scale-105 active:scale-95"
                >
                  前往登录
                </Link>
              </div>
            ) : (
              <AddCoverForm />
            )}
            
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                ← 返回我的画廊
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

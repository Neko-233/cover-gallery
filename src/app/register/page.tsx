import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';

export default function Page() {
  const next = undefined;
  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
        {/* Smooth transition to the right panel */}
        <div className="absolute top-0 right-0 bottom-0 w-64 bg-gradient-to-l from-white/10 dark:from-zinc-950 to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">加入 Cover Gallery</h1>
            <p className="text-lg text-zinc-300 leading-relaxed">
              创建您的个人收藏，发现更多精彩设计。
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>无限收藏您喜爱的封面</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>与其他设计师交流灵感</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>获取专属个性化推荐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">创建账号</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              填写以下信息完成注册
            </p>
          </div>

          <div className="mt-8">
            <RegisterForm />
            
            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">已有账号？</span>
              <Link 
                href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} 
                className="ml-2 font-medium text-zinc-900 dark:text-zinc-200 hover:underline"
              >
                立即登录
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-8">
            注册即代表您同意我们的
            <Link href="/terms" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">服务条款</Link>
            和
            <Link href="/privacy" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">隐私政策</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

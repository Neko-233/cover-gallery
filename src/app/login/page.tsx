import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function Page() {
  const next = undefined;
  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
        {/* Smooth transition to the right panel */}
        <div className="absolute top-0 right-0 bottom-0 w-64 bg-gradient-to-l from-white/10 dark:from-zinc-950 to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Cover Gallery</h1>
            <p className="text-lg text-zinc-300 leading-relaxed">
              探索、收藏和分享精美的封面设计。让灵感触手可及。
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">1000+</div>
              <div className="text-sm text-zinc-400">精选封面</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">Daily</div>
              <div className="text-sm text-zinc-400">每日更新</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">欢迎回来</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              请登录您的账号以继续
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
            
            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">还没有账号？</span>
              <Link 
                href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} 
                className="ml-2 font-medium text-zinc-900 dark:text-zinc-200 hover:underline"
              >
                立即注册
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-8">
            登录即代表您同意我们的
            <Link href="/terms" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">服务条款</Link>
            和
            <Link href="/privacy" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">隐私政策</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

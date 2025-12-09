import Link from 'next/link';
import { ArrowRight, Plus, LayoutGrid } from 'lucide-react';

export default function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] px-4 text-center pointer-events-none">
      <div className="relative z-20 max-w-4xl mx-auto space-y-6 sm:space-y-8 pointer-events-auto">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm animate-fade-up">
          构建专属的
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 px-2">
            封面灵感库
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '100ms' }}>
          不再让灵感稍纵即逝。
          <br className="hidden sm:block" />
          在这里，你可以轻松收集、整理并回味每一个让你心动的封面设计，打造独一无二的私人画廊。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Link 
            href="/explore"
            className="group relative w-48 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 text-zinc-900 dark:text-white rounded-full font-medium text-lg transition-all hover:bg-white/50 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 flex items-center justify-center gap-2"
          >
            探索灵感
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {isLoggedIn ? (
            <Link 
              href="/dashboard"
              className="group w-48 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-2xl text-zinc-900 dark:text-white border border-white/20 dark:border-white/10 rounded-full font-medium text-lg transition-all hover:bg-white/50 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 flex items-center justify-center gap-2"
            >
              我的画廊
              <LayoutGrid className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          ) : (
            <Link 
              href="/register"
              className="group w-48 h-14 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 text-zinc-900 dark:text-white rounded-full font-medium text-lg transition-all hover:bg-white/50 dark:hover:bg-white/10 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 flex items-center justify-center gap-2"
            >
              加入我们
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

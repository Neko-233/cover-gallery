import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

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
            href="/dashboard"
            className="group relative px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-zinc-900/20 active:scale-95 flex items-center gap-2"
          >
            开始探索
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {isLoggedIn && (
            <Link 
              href="/add"
              className="group px-8 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full font-medium text-lg transition-all hover:bg-white dark:hover:bg-zinc-900 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              上传作品
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

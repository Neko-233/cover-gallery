import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function Page() {
  const next = undefined;
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">登录</h2>
        <LoginForm />
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          还没有账号？
          <Link href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="ml-1 underline">去注册</Link>
        </div>
      </div>
    </div>
  );
}

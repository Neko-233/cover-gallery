import RegisterForm from '@/components/RegisterForm';
import Link from 'next/link';

export default function Page() {
  const next = undefined;
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="px-6 pt-6">
          <h2 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">注册</h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-300">创建账号开始收藏你的封面</p>
        </div>
        <div className="px-6 py-6">
          <RegisterForm />
          <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
            已有账号？
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="ml-1 underline">去登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

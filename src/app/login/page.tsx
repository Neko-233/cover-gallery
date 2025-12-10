import LoginForm from '@/components/LoginForm';
import AuthLayout from '@/components/AuthLayout';
import { AuthHeader, AuthLink } from '@/components/AuthShared';

export default function Page() {
  const next = undefined;
  return (
    <AuthLayout>
      <AuthHeader
        title="欢迎回来"
        subtitle="请登录您的账号以继续"
      />

      <div className="mt-8">
        <LoginForm />
        <AuthLink
          question="还没有账号？"
          action="立即注册"
          href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
        />
      </div>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-8">
        登录即代表您同意我们的
        <a href="/terms" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">服务条款</a>
        和
        <a href="/privacy" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">隐私政策</a>
      </p>
    </AuthLayout>
  );
}

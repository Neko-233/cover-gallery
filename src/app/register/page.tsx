import RegisterForm from '@/components/RegisterForm';
import AuthLayout from '@/components/AuthLayout';
import { AuthHeader, AuthLink } from '@/components/AuthShared';

export default function Page() {
  const next = undefined;

  return (
    <AuthLayout>
      <AuthHeader
        title="创建账号"
        subtitle="填写以下信息完成注册"
      />

      <div className="mt-8">
        <RegisterForm />
        <AuthLink
          question="已有账号？"
          action="立即登录"
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
        />
      </div>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-8">
        注册即代表您同意我们的
        <a href="/terms" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">服务条款</a>
        和
        <a href="/privacy" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 mx-1">隐私政策</a>
      </p>
    </AuthLayout>
  );
}

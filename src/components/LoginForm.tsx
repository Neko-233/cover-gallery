'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = name.trim();
    const pwd = (document.getElementById('password') as HTMLInputElement)?.value || '';
    if (!email || !pwd) return;
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', { email, password: pwd, redirect: false });
    setLoading(false);
    if (res?.error) {
      console.error('Login failed:', res.error);
      setError('邮箱或密码错误');
      return;
    }
    router.push('/');
    router.refresh(); // Ensure the session state is updated on client
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">邮箱</label>
        <input
          type="email"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">密码</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          placeholder="至少6位"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
        disabled={loading}
      >
        {loading ? '登录中…' : '登录'}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const [name, setName] = useState('');
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = name.trim();
    const pwd = (document.getElementById('password') as HTMLInputElement)?.value || '';
    if (!email || !pwd) return;
    signIn('credentials', { email, password: pwd, redirect: true, callbackUrl: '/' });
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">邮箱</label>
        <input
          type="email"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">密码</label>
        <input
          id="password"
          type="password"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
          placeholder="至少6位"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2"
      >
        登录
      </button>
    </form>
  );
}

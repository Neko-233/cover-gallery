"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
    } else {
      setMsg(data.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">注册</h2>
        <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
          {msg && <div className="text-red-600 dark:text-red-400 text-sm">{msg}</div>}
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">昵称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none" required />
          </div>
          <button type="submit" className="w-full rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2">注册</button>
        </form>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          已有账号？<Link href="/login" className="ml-1 underline">去登录</Link>
        </div>
      </div>
    </div>
  );
}

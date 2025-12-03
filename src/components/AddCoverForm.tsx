'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCoverForm() {
  const [pageUrl, setPageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = pageUrl.trim();
    setError(null);
    if (!u) return setError('请输入网页链接');
    const isHttp = /^https?:\/\//i.test(u);
    if (!isHttp) return setError('请提交以 http/https 开头的网页链接');
    setLoading(true);
    const res = await fetch('/api/covers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageUrl: u, title, source }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json().catch(() => ({} as any));
      setError(data?.error || '提交失败，无法提取封面');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-lg mx-auto space-y-4">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">网页链接</label>
        <input
          type="url"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
          placeholder="https://example.com/article"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">标题（可选）</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
          placeholder="例如：AI 新闻封面"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">来源（可选）</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none"
          placeholder="例如：Hacker News"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? '正在提取封面…' : '添加到画廊'}
      </button>
    </form>
  );
}

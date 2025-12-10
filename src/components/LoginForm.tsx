'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { AuthInput, AuthButton } from './AuthShared';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.trim();
    const pwd = (document.getElementById('password') as HTMLInputElement)?.value || '';
    if (!finalEmail || !pwd) return;
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', { email: finalEmail, password: pwd, redirect: false });
    setLoading(false);
    if (res?.error) {
      console.error('Login failed:', res.error);
      setError('邮箱或密码错误');
      return;
    }
    router.push('/');
    router.refresh();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.form
      variants={container}
      initial="hidden"
      animate="show"
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <AuthInput
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />
      </motion.div>

      <motion.div variants={item} className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">密码</label>
          <a href="/forgot-password" className="text-sm text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">忘记密码？</a>
        </div>
        <div className="relative group">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 -m-0.5"
            layoutId="input-glow-password"
          />
          <input
            id="password"
            type="password"
            className="w-full relative rounded-xl border-2 border-zinc-100 bg-zinc-50/50 px-4 py-4 pl-12 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200 
            hover:bg-white hover:border-zinc-200 
            focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 
            dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:bg-black dark:focus:bg-black dark:focus:border-indigo-400/50 dark:focus:ring-indigo-400/10 font-medium"
            placeholder="••••••••"
            required
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="pt-2">
        <AuthButton type="submit" loading={loading} loadingText="登录中...">
          登录
        </AuthButton>
      </motion.div>
    </motion.form>
  );
}

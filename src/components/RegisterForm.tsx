'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { AuthInput, AuthButton } from './AuthShared';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      setRecoveryKey(data.recoveryKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (recoveryKey) {
      navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onContinue = async () => {
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('自动登录失败，请手动登录');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
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

  if (recoveryKey) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="rounded-2xl bg-emerald-50 p-8 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 text-center shadow-lg shadow-emerald-500/5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6"
          >
            <svg className="h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">注册成功！</h3>
          <p className="mt-2 text-emerald-700 dark:text-emerald-400">
            欢迎加入 Cover Gallery。<br />请妥善保存您的账户恢复密钥。
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 ml-1">
            恢复密钥
          </label>
          <div className="relative group">
            <div className="w-full rounded-2xl bg-zinc-50 border-2 border-zinc-100 p-5 font-mono text-sm dark:bg-zinc-900/50 dark:border-zinc-800 break-all transition-colors group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
              {recoveryKey}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="absolute right-3 top-3 rounded-xl bg-white p-2 shadow-sm border border-zinc-100 text-zinc-500 hover:text-indigo-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 transition-colors"
              type="button"
            >
              {copied ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </motion.button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 ml-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            此密钥是您重置密码的唯一凭证，请勿丢失。
          </p>
        </div>

        <div className="pt-4">
          <AuthButton onClick={onContinue} loading={loading}>
            进入控制台
          </AuthButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={container}
      initial="hidden"
      animate="show"
      onSubmit={onRegister}
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
          label="昵称"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="您的称呼"
          required
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </motion.div>

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
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">密码</label>
        <div className="relative group">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 -m-0.5"
            layoutId="input-glow-password-reg"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full relative rounded-xl border-2 border-zinc-100 bg-zinc-50/50 px-4 py-4 pl-12 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200 
            hover:bg-white hover:border-zinc-200 
            focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 
            dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:bg-black dark:focus:bg-black dark:focus:border-indigo-400/50 dark:focus:ring-indigo-400/10 font-medium"
            placeholder="至少6位"
            minLength={6}
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
        <AuthButton type="submit" loading={loading} loadingText="注册中...">
          注册
        </AuthButton>
      </motion.div>
    </motion.form>
  );
}

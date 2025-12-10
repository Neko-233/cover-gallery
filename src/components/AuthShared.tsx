'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'framer-motion';

// Input Component
interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: ReactNode;
}

export function AuthInput({ label, icon, className = '', ...props }: AuthInputProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
                {label}
            </label>
            <div className="relative group">
                <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 -m-0.5"
                    layoutId={`input-glow-${label}`}
                />
                <input
                    className={`w-full relative rounded-xl border-2 border-zinc-100 bg-zinc-50/50 px-4 py-4 pl-12 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-200 
                    hover:bg-white hover:border-zinc-200 
                    focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 
                    dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:bg-black dark:focus:bg-black dark:focus:border-indigo-400/50 dark:focus:ring-indigo-400/10 font-medium ${className}`}
                    {...props}
                />
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

// Button Component
interface AuthButtonProps extends HTMLMotionProps<"button"> {
    loading?: boolean;
    loadingText?: string;
    children: ReactNode;
    disabled?: boolean;
}

export function AuthButton({ loading, loadingText, children, className = '', disabled, ...props }: AuthButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 transition-all ${className}`}
            disabled={loading || disabled}
            {...props}
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{loadingText || 'Loading...'}</span>
                    </>
                ) : (
                    children
                )}
            </div>
        </motion.button>
    );
}

// Header Component
interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    return (
        <div className="text-center mb-10">
            <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
                {title}
            </motion.h2>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 text-base text-zinc-500 dark:text-zinc-400"
            >
                {subtitle}
            </motion.p>
        </div>
    );
}

// Link Component
interface AuthLinkProps {
    question: string;
    action: string;
    href: string;
}

export function AuthLink({ question, action, href }: AuthLinkProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm"
        >
            <span className="text-zinc-500 dark:text-zinc-400">{question}</span>
            <Link
                href={href}
                className="ml-2 font-semibold text-zinc-900 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
                {action}
            </Link>
        </motion.div>
    );
}

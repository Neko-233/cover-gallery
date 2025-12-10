'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: ReactNode;
    decoration?: ReactNode;
}

export default function AuthLayout({ children, decoration }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black overflow-hidden font-sans">

            {/* Left side - Decorative */}
            <div className="hidden lg:flex relative items-center justify-center bg-zinc-950 h-full p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-zinc-950 to-zinc-950 z-0" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] z-0" />

                {/* Animated Background Blobs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                />

                <div className="relative z-10 w-full max-w-lg">
                    {decoration || (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="mb-12">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="h-16 w-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </motion.div>
                                <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tighter text-white">
                                    Cover <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Gallery</span>
                                </h1>
                                <p className="text-lg lg:text-xl text-zinc-400 leading-relaxed font-light max-w-md">
                                    探索设计的无限可能。收藏灵感，激发创意，与全球设计师共同成长。
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10"
                                >
                                    <div className="text-3xl font-bold mb-2 text-white">1000+</div>
                                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">精选作品</div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10"
                                >
                                    <div className="text-3xl font-bold mb-2 text-white">Daily</div>
                                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">每日更新</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-24 w-full h-full bg-white dark:bg-black relative">
                {/* Mobile decoration background */}
                <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-50" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-[400px] z-10"
                >
                    {children}
                </motion.div>
            </div>

        </div>
    );
}

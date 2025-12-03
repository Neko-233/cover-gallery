import AddCoverForm from '@/components/AddCoverForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import Link from 'next/link';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user?.id;
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">添加封面</h2>
        {!isAuthed ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-zinc-700 dark:text-zinc-300 mb-4">请先登录后再添加封面。</div>
            <Link href="/login" className="inline-block rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2">前往登录</Link>
          </div>
        ) : (
          <AddCoverForm />
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
            ← 返回首页
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">服务条款</h1>
          
          <div className="space-y-8 text-zinc-600 dark:text-zinc-300">
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">1. 接受条款</h2>
              <p className="leading-relaxed">
                欢迎访问 Cover Gallery。通过访问或使用本网站，即表示您同意受这些服务条款的约束。如果您不同意这些条款的任何部分，请不要使用我们的服务。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">2. 服务说明</h2>
              <p className="leading-relaxed">
                Cover Gallery 是一个封面设计展示和分享平台。我们致力于为设计师和爱好者提供高质量的封面灵感。您可以浏览、收藏和分享平台上的内容。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">3. 用户行为</h2>
              <p className="leading-relaxed mb-4">在使用本服务时，您同意不会：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>上传或传播违反法律法规的内容</li>
                <li>侵犯他人的知识产权或隐私权</li>
                <li>发布恶意软件、病毒或进行任何可能损害平台运行的行为</li>
                <li>未经授权进行数据抓取或自动化访问</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">4. 知识产权</h2>
              <p className="leading-relaxed">
                平台上的所有内容（不包括用户上传的内容）均归 Cover Gallery 所有。用户上传的内容版权归原作者所有，但通过上传，您授予我们在平台范围内展示和推广该内容的权利。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">5. 免责声明</h2>
              <p className="leading-relaxed">
                本服务按&quot;原样&quot;提供，不包含任何形式的明示或暗示保证。我们不保证服务不会中断或没有错误，也不对因使用服务而产生的任何损失负责。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">6. 条款修改</h2>
              <p className="leading-relaxed">
                我们保留随时修改这些条款的权利。修改后的条款将在发布时生效。继续使用本服务即表示您接受修改后的条款。
              </p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-400">
            最后更新日期：2025年12月8日
          </div>
        </div>
      </div>
    </div>
  );
}

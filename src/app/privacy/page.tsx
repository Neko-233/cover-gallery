import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
            ← 返回首页
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">隐私政策</h1>
          
          <div className="space-y-8 text-zinc-600 dark:text-zinc-300">
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">1. 信息收集</h2>
              <p className="leading-relaxed mb-4">
                为了向您提供更好的服务，我们可能会收集以下类型的信息：
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>账户信息：</strong> 当您注册时提供的昵称、邮箱地址和密码。</li>
                <li><strong>使用数据：</strong> 您在使用平台时的浏览记录、收藏行为和偏好设置。</li>
                <li><strong>上传内容：</strong> 您上传到平台的封面图片及相关元数据。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">2. 信息使用</h2>
              <p className="leading-relaxed mb-4">我们要将收集的信息用于：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>提供、维护和改进我们的服务</li>
                <li>个性化您的用户体验</li>
                <li>发送服务通知和更新</li>
                <li>防止欺诈和滥用行为</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">3. 信息共享</h2>
              <p className="leading-relaxed">
                我们重视您的隐私。除非法律要求或为了保护我们的权利，否则我们不会向第三方出售、出租或分享您的个人信息。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">4. 数据安全</h2>
              <p className="leading-relaxed">
                我们采取合理的安全措施来保护您的信息免受未经授权的访问、修改或泄露。但请注意，没有任何互联网传输方式是绝对安全的。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">5. Cookie 使用</h2>
              <p className="leading-relaxed">
                我们使用 Cookie 和类似技术来识别您的身份、保存偏好设置并分析流量。您可以通过浏览器设置管理 Cookie 偏好。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">6. 联系我们</h2>
              <p className="leading-relaxed">
                如果您对本隐私政策有任何疑问，请通过以下方式联系我们：<br />
                Email: support@covergallery.com
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

# 封面画廊

## 用户管理系统
- 注册：/register（邮箱、密码、昵称）
- 登录：/login（邮箱、密码）
- 用户主页：/dashboard（显示个人信息与封面）
- 添加封面：/add（登录后）

## 环境变量
在项目根目录 `.env` 中配置：
- `DATABASE_URL`（需要 PostgreSQL 数据库连接串）
- `NEXTAUTH_URL`（开发为 `http://localhost:3000`）
- `NEXTAUTH_SECRET`（生产环境请设置随机字符串）

## 本地开发
1. 安装依赖：`npm install`
2. 生成与迁移数据库：`npx prisma generate && npx prisma migrate dev --name init`
3. 启动开发：`npm run dev`

## 部署到 Vercel
1. 创建 Vercel Postgres 并将连接串写入 `DATABASE_URL`
2. 设置环境变量：`NEXTAUTH_URL`、`NEXTAUTH_SECRET`
3. 执行 Prisma 迁移（建议在 CI/CD 或本地执行后推送）
4. 部署并验证注册/登录/添加封面流程

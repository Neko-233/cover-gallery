
import { Telegraf, Context } from 'telegraf';
import { User } from '@prisma/client';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';
import { fetchCoverFromPage } from './fetchCover';

// Define extended Context interface containing user property
export interface BotContext extends Context {
  user?: User;
}

// Bot Token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8226805152:AAHUEFtZqsWnlKoF1Px75o859Z2UdVnoFp4';

if (!BOT_TOKEN) {
  console.error('Bot token is required');
}

// Initialize Bot instance
// Note: We export a function to get the bot to avoid side effects during build time if needed,
// but for now a singleton instance is fine as long as we handle webhook/polling correctly.
export const bot = new Telegraf<BotContext>(BOT_TOKEN);

// Web App URL (from env or default)
const WEB_APP_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

// Help message
const HELP_MESSAGE = `
🤖 *Cover Gallery Bot*

可用指令：
/help - 显示此帮助信息
/bind <email> <password> - 绑定账号
/unbind - 解绑当前账号
/list - 查看我的收藏列表
/add <url> [title] - 添加新封面
/delete <id> - 删除封面
/delete <序号> (例如 /delete 1 删除列表中的第一项)
/check - 查看 Bot 运行状态

*注意*：为了安全起见，建议绑定后删除聊天记录中的密码信息。
`;

// Middleware: Get currently bound user
const withUser = async (ctx: BotContext, next: () => Promise<void>) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return next();

  const account = await prisma.account.findFirst({
    where: {
      provider: 'telegram',
      providerAccountId: telegramId,
    },
    include: { user: true },
  });

  if (!account || !account.user) {
    return ctx.reply('您尚未绑定账号。请使用 /bind <email> <password> 进行绑定。');
  }

  ctx.user = account.user;
  return next();
};

// --- Command Handlers ---

// /start & /help
bot.start((ctx) => ctx.replyWithMarkdown(HELP_MESSAGE));
bot.help((ctx) => ctx.replyWithMarkdown(HELP_MESSAGE));

// /bind <email> <password>
bot.command('bind', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 2) {
    return ctx.reply('格式错误。请使用: /bind <email> <password>');
  }

  const [email, password] = args;
  const telegramId = ctx.from.id.toString();

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return ctx.reply('未找到该邮箱对应的用户。');
    }

    // 2. Verify password
    if (!user.passwordHash) {
      return ctx.reply('该账号未设置密码（可能是通过第三方登录），无法通过密码绑定。');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return ctx.reply('密码错误。');
    }

    // 3. Bind (Create Account record)
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'telegram',
        providerAccountId: telegramId,
      },
    });

    if (existingAccount) {
      if (existingAccount.userId !== user.id) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { userId: user.id },
        });
        return ctx.reply(`账号已重新绑定到用户: ${user.name || user.email}`);
      }
      return ctx.reply('您已经绑定了该账号。');
    }

    // Create new binding
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'telegram',
        providerAccountId: telegramId,
      },
    });

    ctx.reply(`✅ 绑定成功！当前绑定用户: ${user.name || user.email}`);
  } catch (error) {
    console.error(error);
    ctx.reply('绑定过程中发生错误。');
  }
});

// /unbind
bot.command('unbind', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;
  
  try {
    const deleteResult = await prisma.account.deleteMany({
      where: {
        provider: 'telegram',
        providerAccountId: telegramId,
      },
    });

    if (deleteResult.count > 0) {
      ctx.reply('✅ 解绑成功。');
    } else {
      ctx.reply('您尚未绑定账号。');
    }
  } catch (error) {
    console.error(error);
    ctx.reply('解绑失败。');
  }
});

// /list
bot.command('list', withUser, async (ctx) => {
  if (!ctx.user) return; // Should be handled by middleware

  try {
    const covers = await prisma.cover.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (covers.length === 0) {
      return ctx.reply('您的收藏列表为空。');
    }

    let message = '*最近收藏的封面：*\n\n';
    covers.forEach((cover, index) => {
      message += `${index + 1}. [${cover.title || '无标题'}](${cover.url})\nID: \`${cover.id}\`\n\n`;
    });

    ctx.replyWithMarkdown(message, { link_preview_options: { is_disabled: true } });
  } catch (error) {
    console.error(error);
    ctx.reply('获取列表失败。');
  }
});

// /add <url> [title]
bot.command('add', withUser, async (ctx) => {
  if (!ctx.user || !ctx.message || !('text' in ctx.message)) return;

  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 1) {
    return ctx.reply('格式错误。请使用: /add <url> [title]');
  }

  const url = args[0];
  let title = args.slice(1).join(' '); // User provided title
  let imageUrl = url;
  let source = 'telegram-bot';

  try {
    // Simple URL validation
    if (!url.startsWith('http')) {
        return ctx.reply('请输入有效的 URL (以 http 或 https 开头)。');
    }

    ctx.reply('🔍 正在提取封面信息...');

    // Try to fetch cover info
    const info = await fetchCoverFromPage(url);
    
    if (info.imageUrl) {
        imageUrl = info.imageUrl;
        if (!title && info.title) {
            title = info.title;
        }
        if (info.source) {
            source = info.source;
        }
    }

    if (!title) {
        title = 'Untitled Cover';
    }

    const cover = await prisma.cover.create({
      data: {
        userId: ctx.user.id,
        url: imageUrl,
        pageUrl: url,
        title: title,
        source: source,
      },
    });

    let replyMsg = `✅ 封面添加成功！\nID: \`${cover.id}\`\nTitle: ${cover.title}`;
    if (imageUrl !== url) {
        replyMsg += `\nImage: [Preview](${imageUrl})`;
    }
    
    ctx.replyWithMarkdown(replyMsg);
  } catch (error) {
    console.error(error);
    ctx.reply('添加封面失败。');
  }
});

// /delete <id> or <index>
bot.command('delete', withUser, async (ctx) => {
  if (!ctx.user || !ctx.message || !('text' in ctx.message)) return;

  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 1) {
    return ctx.reply('格式错误。请使用: /delete <id> 或 /delete <序号> (例如 /delete 1 删除列表中的第一项)');
  }

  const input = args[0];

  try {
    let coverId = input;

    // Check if input is a number
    if (/^\d+$/.test(input)) {
        const index = parseInt(input, 10);
        if (index < 1) {
            return ctx.reply('序号必须大于 0');
        }

        const covers = await prisma.cover.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: 'desc' },
            take: index,
            select: { id: true, title: true },
        });

        if (covers.length < index) {
            return ctx.reply(`找不到序号为 ${index} 的封面。您最近只有 ${covers.length} 个收藏。`);
        }

        const targetCover = covers[index - 1];
        coverId = targetCover.id;
        
        await ctx.reply(`正在删除第 ${index} 个封面: ${targetCover.title || 'Untitled'} ...`);
    }

    const cover = await prisma.cover.findFirst({
      where: {
        id: coverId,
        userId: ctx.user.id,
      },
    });

    if (!cover) {
      return ctx.reply('未找到该封面或您无权删除。');
    }

    await prisma.cover.delete({
      where: { id: coverId },
    });

    ctx.reply(`✅ 封面已删除。\n标题: ${cover.title || 'Untitled'}`);
  } catch (error) {
    console.error(error);
    ctx.reply('删除封面失败。');
  }
});

// /check - Check bot status
bot.command('check', async (ctx) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    
    const formatMem = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    
    let dbStatus = '❌ Disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = '✅ Connected';
    } catch (e) {
      console.error('DB check failed:', e);
      dbStatus = '❌ Error';
    }

    const message = `
📊 *System Status*

🌍 *Web URL*: ${WEB_APP_URL}
⏱ *Uptime*: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s
💾 *Memory Usage*:
  - RSS: ${formatMem(memoryUsage.rss)}
  - Heap Total: ${formatMem(memoryUsage.heapTotal)}
  - Heap Used: ${formatMem(memoryUsage.heapUsed)}
💻 *System Memory*:
  - Free: ${formatMem(freeMemory)}
  - Total: ${formatMem(totalMemory)}
🗄 *Database*: ${dbStatus}
    `;

    ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error(error);
    ctx.reply('获取状态失败。');
  }
});

// Handle photo messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
bot.on('photo', withUser, async (ctx: any) => {
  if (!ctx.user) return; 

  try {
    const photos = ctx.message.photo;
    const photo = photos[photos.length - 1];
    const fileId = photo.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    // NOTE: On Vercel, we cannot save files to local disk permanently.
    // This part is problematic for serverless.
    // Ideally, we should stream the file to S3 or similar.
    // For now, we keep the logic but it might fail or file will be lost on Vercel.
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const ext = path.extname(fileLink.href) || '.jpg';
    const filename = `telegram-${ctx.user.id}-${timestamp}-${random}${ext}`;
    
    // Use /tmp for Vercel if needed, but for now we stick to public/uploads
    // warning: this will not persist in Vercel production
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(publicPath, filename);
    const dbUrl = `/uploads/${filename}`;

    if (!fs.existsSync(publicPath)) {
        // This might throw EROFS on Vercel if public is read-only at runtime
        // But let's try-catch or just proceed
        try {
            fs.mkdirSync(publicPath, { recursive: true });
        } catch (e) {
            console.error('Failed to create upload dir:', e);
            return ctx.reply('❌ 服务器存储配置错误 (Vercel Read-only FS)。图片上传功能在无对象存储配置下不可用。');
        }
    }

    await new Promise<void>((resolve, reject) => {
        https.get(fileLink, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            fileStream.on('error', (err) => {
                fs.unlink(filePath, () => {}); 
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });

    const title = ('caption' in ctx.message && ctx.message.caption) ? ctx.message.caption : 'Uploaded via Telegram';

    const cover = await prisma.cover.create({
      data: {
        userId: ctx.user.id,
        url: dbUrl,
        title: title,
        source: 'telegram-bot-upload',
      },
    });

    ctx.reply(`✅ 图片上传成功！\nID: \`${cover.id}\`\nTitle: ${cover.title}\n(注意：在 Vercel 上文件可能无法持久保存)`);

  } catch (error) {
    console.error('Error handling photo:', error);
    ctx.reply('图片上传失败，请稍后重试。');
  }
});


import { Telegraf, Markup, Context } from 'telegraf';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';
import { fetchCoverFromPage } from '../lib/fetchCover';

// Define extended Context interface containing user property
interface BotContext extends Context {
  user?: User;
}

// Initialize Prisma Client
const prisma = new PrismaClient();

// Bot Token
const BOT_TOKEN = '8226805152:AAHUEFtZqsWnlKoF1Px75o859Z2UdVnoFp4';
// Web App URL (from env or default)
const WEB_APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('Bot token is required');
  process.exit(1);
}

const bot = new Telegraf<BotContext>(BOT_TOKEN);

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
    // Note: Assuming user.passwordHash is a bcrypt hash
    if (!user.passwordHash) {
      return ctx.reply('该账号未设置密码（可能是通过第三方登录），无法通过密码绑定。');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return ctx.reply('密码错误。');
    }

    // 3. Bind (Create Account record)
    // Check if already bound
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'telegram',
        providerAccountId: telegramId,
      },
    });

    if (existingAccount) {
      // If already bound, update userId (prevent previous binding residue)
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
bot.command('list', withUser, async (ctx: BotContext) => {
  if (!ctx.user) return; // Should be handled by middleware

  try {
    const covers = await prisma.cover.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 most recent covers to avoid overly long messages
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
bot.command('add', withUser, async (ctx: BotContext) => {
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
        // Use fetched title if user didn't provide one
        if (!title && info.title) {
            title = info.title;
        }
        if (info.source) {
            source = info.source;
        }
    }

    // Fallback title if still empty
    if (!title) {
        title = 'Untitled Cover';
    }

    const cover = await prisma.cover.create({
      data: {
        userId: ctx.user.id,
        url: imageUrl,
        pageUrl: url, // Save original page URL
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

// Handle photo messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
bot.on('photo', withUser, async (ctx: any) => {
  if (!ctx.user) return; // Should be handled by middleware

  try {
    // Get the highest resolution photo
    const photos = ctx.message.photo;
    const photo = photos[photos.length - 1];
    const fileId = photo.file_id;

    // Get file link
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    // Generate filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const ext = path.extname(fileLink.href) || '.jpg';
    const filename = `telegram-${ctx.user.id}-${timestamp}-${random}${ext}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(publicPath, filename);
    const dbUrl = `/uploads/${filename}`;

    // Ensure directory exists
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }

    // Download file
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
                // Delete incomplete file
                fs.unlink(filePath, () => {}); 
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });

    // Get Caption as title
    const title = ('caption' in ctx.message && ctx.message.caption) ? ctx.message.caption : 'Uploaded via Telegram';

    // Save to database
    const cover = await prisma.cover.create({
      data: {
        userId: ctx.user.id,
        url: dbUrl,
        title: title,
        source: 'telegram-bot-upload',
      },
    });

    ctx.reply(`✅ 图片上传成功！\nID: \`${cover.id}\`\nTitle: ${cover.title}`);

  } catch (error) {
    console.error('Error handling photo:', error);
    ctx.reply('图片上传失败，请稍后重试。');
  }
});

// /delete <id> or <index>
bot.command('delete', withUser, async (ctx: BotContext) => {
  if (!ctx.user || !ctx.message || !('text' in ctx.message)) return;

  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 1) {
    return ctx.reply('格式错误。请使用: /delete <id> 或 /delete <序号> (例如 /delete 1 删除列表中的第一项)');
  }

  const input = args[0];

  try {
    let coverId = input;

    // Check if input is a number (index from /list)
    if (/^\d+$/.test(input)) {
        const index = parseInt(input, 10);
        if (index < 1) {
            return ctx.reply('序号必须大于 0');
        }

        // Fetch the recent list to find the ID corresponding to the index
        // Note: This relies on the list order being consistent (created at desc)
        // and assumes the user is referring to the top 10 list.
        const covers = await prisma.cover.findMany({
            where: { userId: ctx.user.id },
            orderBy: { createdAt: 'desc' },
            take: index, // Fetch up to the requested index
            select: { id: true, title: true },
        });

        if (covers.length < index) {
            return ctx.reply(`找不到序号为 ${index} 的封面。您最近只有 ${covers.length} 个收藏。`);
        }

        // Get the cover at the specified index (array is 0-indexed)
        const targetCover = covers[index - 1];
        coverId = targetCover.id;
        
        // Notify user which cover is being deleted
        await ctx.reply(`正在删除第 ${index} 个封面: ${targetCover.title || 'Untitled'} ...`);
    }

    // Confirm cover belongs to the user
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
    
    // Format memory helper
    const formatMem = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    
    // Check DB connection
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

// Start Bot
bot.launch().then(() => {
  console.log('Bot is running...');
}).catch((err) => {
  console.error('Failed to launch bot:', err);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

import { NextResponse } from 'next/server';
import { Cover } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { fetchCoverFromPage } from '@/lib/fetchCover';
import { allow } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const url = new URL(req.url);
  const collectionId = url.searchParams.get('collectionId');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: String(session.user.id) };
  if (collectionId) {
    where.collectionId = collectionId;
  }

  const covers = await (prisma.cover as any).findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { likes: true },
      },
    },
  });

  // Get liked status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likedCoverIds = await (prisma as any).like.findMany({
    where: {
      userId: String(session.user.id),
      coverId: { in: covers.map((c: Cover) => c.id) },
    },
    select: { coverId: true },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const likedSet = new Set(likedCoverIds.map((l: any) => l.coverId));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = covers.map((c: any) => ({
    ...c,
    likesCount: c._count.likes,
    liked: likedSet.has(c.id),
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ok = allow(`covers:${ip}`, 60_000, 20);
  if (!ok) return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const pageUrl: string | null = body?.pageUrl ? String(body.pageUrl) : null;
  const directUrl: string | null = body?.url ? String(body.url) : null;
  const collectionId: string | null = body?.collectionId ? String(body.collectionId) : null;

  const isAsync = (req.headers.get('x-async') || '').trim() === '1';

  if (pageUrl && isAsync && process.env.NODE_ENV !== 'production') {
    const taskId = crypto.randomUUID();
    (async () => {
      try {
        const result = await fetchCoverFromPage(pageUrl);
        if (!result.imageUrl) return;
        await prisma.cover.create({
          data: {
            userId: String(session.user.id),
            url: result.imageUrl,
            pageUrl,
            title: (body?.title ? String(body.title) : result.title) || null,
            source: (body?.source ? String(body.source) : result.source) || null,
            collectionId,
          } as any,
        });
      } catch {}
    })();
    return NextResponse.json({ accepted: true, taskId }, { status: 202 });
  }

  if (pageUrl) {
    const result = await fetchCoverFromPage(pageUrl);
    if (!result.imageUrl) {
      return NextResponse.json({ error: '无法从网页提取封面，请选择其他链接' }, { status: 400 });
    }
    const data = await prisma.cover.create({
      data: {
        userId: String(session.user.id),
        url: result.imageUrl,
        pageUrl,
        title: (body?.title ? String(body.title) : result.title) || null,
        source: (body?.source ? String(body.source) : result.source) || null,
        collectionId,
      } as any,
    });
    return NextResponse.json(data);
  }

  if (!directUrl) return NextResponse.json({ error: '缺少链接' }, { status: 400 });
  const isHttp = /^https?:\/\//i.test(directUrl);
  const isImageExt = /\.(jpg|jpeg|png|webp|svg|avif)(\?.*)?$/i.test(directUrl);
  if (!isHttp || !isImageExt) {
    return NextResponse.json({ error: '请提交图片直链（http/https，以图片扩展结尾）' }, { status: 400 });
  }
  try {
    const head = await fetch(directUrl, { method: 'HEAD' });
    const ct = head.headers.get('content-type') || '';
    if (ct && !ct.startsWith('image/')) {
      return NextResponse.json({ error: '链接内容不是图片，请提交图片直链' }, { status: 400 });
    }
  } catch {}
  const data = await prisma.cover.create({
    data: {
      userId: String(session.user.id),
      url: directUrl,
      title: body?.title ? String(body.title) : null,
      source: body?.source ? String(body.source) : null,
      collectionId,
    } as any,
  });
  return NextResponse.json(data);
}

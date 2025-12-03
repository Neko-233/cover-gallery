import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { fetchCoverFromPage } from '@/lib/fetchCover';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const covers = await prisma.cover.findMany({ where: { userId: String(session.user.id) }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(covers);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const pageUrl: string | null = body?.pageUrl ? String(body.pageUrl) : null;
  const directUrl: string | null = body?.url ? String(body.url) : null;

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
      },
    });
    return NextResponse.json(data);
  }

  if (!directUrl) return NextResponse.json({ error: '缺少链接' }, { status: 400 });
  const isHttp = /^https?:\/\//i.test(directUrl);
  const isImageExt = /\.(jpg|jpeg|png|webp|svg)(\?.*)?$/i.test(directUrl);
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
    },
  });
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  // Use req to avoid unused variable warning if needed, or just remove it if not used. 
  // But wait, the previous code didn't use req. Let's keep it but maybe use it or ignore.
  // Actually the warning said 'req' is defined but never used. 
  // I can just remove `req: Request` but GET usually expects it. 
  // Let's just use `_req` or remove it if I can. 
  // Or better, just ignore it.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = await (prisma as any).collection.findMany({
    where: {
      userId: String(session.user.id),
    },
    include: {
      _count: {
        select: { covers: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, visibility } = body;

  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = await (prisma as any).collection.create({
    data: {
      userId: String(session.user.id),
      name,
      description,
      visibility: visibility || 'PRIVATE',
    },
  });

  return NextResponse.json(collection);
}

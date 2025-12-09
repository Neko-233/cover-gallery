import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { collectionId } = await req.json();
  if (!collectionId) {
    return NextResponse.json({ error: 'Missing collectionId' }, { status: 400 });
  }

  const userId = String(session.user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingLike = await (prisma as any).collectionLike.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId,
      },
    },
  });

  if (existingLike) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).collectionLike.delete({
      where: { id: existingLike.id },
    });
    return NextResponse.json({ liked: false });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).collectionLike.create({
      data: {
        userId,
        collectionId,
      },
    });
    return NextResponse.json({ liked: true });
  }
}

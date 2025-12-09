import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { coverId } = await req.json();
  if (!coverId) {
    return NextResponse.json({ error: 'Missing coverId' }, { status: 400 });
  }

  const userId = String(session.user.id);

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_coverId: {
        userId,
        coverId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await prisma.like.create({
      data: {
        userId,
        coverId,
      },
    });
    return NextResponse.json({ liked: true });
  }
}

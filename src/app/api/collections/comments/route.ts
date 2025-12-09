import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

// Get comments for a collection
export async function GET(req: Request) {
  const url = new URL(req.url);
  const collectionId = url.searchParams.get('collectionId');

  if (!collectionId) {
    return NextResponse.json({ error: 'Missing collectionId' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = await (prisma as any).comment.findMany({
    where: { 
      collectionId,
      parentId: null // Only fetch top-level comments initially
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(comments);
}

// Post a comment
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { collectionId, content, parentId } = await req.json();

  if (!collectionId || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comment = await (prisma as any).comment.create({
    data: {
      userId: String(session.user.id),
      collectionId,
      content,
      parentId: parentId || null,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(comment);
}

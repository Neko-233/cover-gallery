import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { coverIds, collectionId } = await req.json();

  if (!coverIds || !Array.isArray(coverIds) || coverIds.length === 0) {
    return NextResponse.json({ error: 'Missing coverIds' }, { status: 400 });
  }

  if (!collectionId) {
    return NextResponse.json({ error: 'Missing collectionId' }, { status: 400 });
  }

  const userId = String(session.user.id);

  // Verify collection ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = await (prisma as any).collection.findUnique({
    where: { id: collectionId },
  });

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  if (collection.userId !== userId) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Update covers
  await prisma.cover.updateMany({
    where: {
      id: { in: coverIds },
      userId: userId, // Ensure user owns the covers
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      collectionId: collectionId,
    } as any,
  });

  return NextResponse.json({ success: true });
}

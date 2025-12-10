import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const url = new URL(req.url);
  const sort = url.searchParams.get('sort') || 'popular_today';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = await (prisma as any).collection.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          collectionLikes: true,
        },
      },
      covers: {
        include: {
          _count: {
            select: { likes: true },
          },
          likes: {
            where: {
              createdAt: {
                gte: today,
              },
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const isOwner = session?.user?.id && String(session.user.id) === collection.userId;

  if (collection.visibility === 'PRIVATE' && !isOwner) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Sort covers
  const sortedCovers = [...collection.covers];
  if (sort === 'popular_today') {
    sortedCovers.sort((a, b) => b.likes.length - a.likes.length);
  } else if (sort === 'popular_all_time') {
    sortedCovers.sort((a, b) => b._count.likes - a._count.likes);
  } else if (sort === 'newest') {
    sortedCovers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Add `liked` status if user is logged in
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let coversWithLikeStatus = sortedCovers.map((cover: any) => ({
    id: cover.id,
    url: cover.url,
    title: cover.title,
    source: cover.source,
    pageUrl: cover.pageUrl,
    createdAt: cover.createdAt,
    likesCount: cover._count.likes,
    likesToday: cover.likes.length,
    liked: false, // Default
  }));

  let isCollectionLiked = false;

  if (session?.user?.id) {
    const userId = String(session.user.id);

    // Check if user liked the collection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionLike = await (prisma as any).collectionLike.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId: id,
        },
      },
    });
    isCollectionLiked = !!collectionLike;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likedCoverIds = await (prisma as any).like.findMany({
      where: {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        coverId: { in: collection.covers.map((c: any) => c.id) },
      },
      select: { coverId: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likedSet = new Set(likedCoverIds.map((l: any) => l.coverId));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coversWithLikeStatus = coversWithLikeStatus.map((c: any) => ({
      ...c,
      liked: likedSet.has(c.id),
    }));
  }

  return NextResponse.json({
    ...collection,
    covers: coversWithLikeStatus,
    isOwner,
    likesCount: collection._count.collectionLikes,
    liked: isCollectionLiked,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, visibility } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = await (prisma as any).collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  if (collection.userId !== String(session.user.id)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).collection.update({
    where: { id },
    data: {
      name,
      description,
      visibility,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collection = await (prisma as any).collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  if (collection.userId !== String(session.user.id)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Optional: Decide what to do with covers. 
  // For now, we'll keep covers but set their collectionId to null.
  // Or delete them? Usually users expect covers to remain in their "All covers".
  // Let's set collectionId to null.
  
  await prisma.cover.updateMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { collectionId: id } as any,
    data: { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionId: null 
    } as any,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).collection.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

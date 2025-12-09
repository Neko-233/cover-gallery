import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = url.searchParams.get('sort') || 'popular'; // popular, newest

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections = await (prisma as any).collection.findMany({
    where: {
      visibility: 'PUBLIC',
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          covers: true,
          collectionLikes: true,
        },
      },
      covers: {
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          url: true,
        },
      },
    },
    orderBy: sort === 'popular' 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? { collectionLikes: { _count: 'desc' } } as any
      : { createdAt: 'desc' },
  });

  return NextResponse.json(collections);
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const cover = await prisma.cover.findUnique({
      where: { id },
    });

    if (!cover) {
      return NextResponse.json({ error: 'Cover not found' }, { status: 404 });
    }

    if (cover.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.cover.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete cover error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

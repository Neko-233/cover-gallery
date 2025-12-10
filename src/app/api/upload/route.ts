import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate a unique filename using UUID and original extension
    const ext = path.extname(file.name);
    const filename = `avatars/${uuidv4()}${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      // BLOB_READ_WRITE_TOKEN is automatically used from environment variables
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

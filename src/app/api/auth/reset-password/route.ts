import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }

    if (!user.recoveryKey) {
      return NextResponse.json({ error: '该账号未设置恢复密钥，无法重置密码' }, { status: 400 });
    }

    // Verify recovery key
    const isValidKey = await bcrypt.compare(code, user.recoveryKey);

    if (!isValidKey) {
      return NextResponse.json({ error: '恢复密钥错误' }, { status: 400 });
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.password || !body?.name) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }
    const email = String(body.email).toLowerCase().trim();
    const name = String(body.name).trim();
    const password = String(body.password);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      console.log('⚠️ Registration failed: Email already exists:', email);
      return NextResponse.json({ error: '邮箱已注册' }, { status: 409 });
    }

    // Generate Recovery Key
    const rawRecoveryKey = `rk-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}`;
    const recoveryKeyHash = await bcrypt.hash(rawRecoveryKey, 10);

    console.log('📝 Registering new user:', email);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { 
        email, 
        name, 
        passwordHash,
        recoveryKey: recoveryKeyHash 
      } 
    });
    
    console.log('✅ User created successfully:', user.id);
    return NextResponse.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      recoveryKey: rawRecoveryKey // Return the raw key to the user ONCE
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
  }
}

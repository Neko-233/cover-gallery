import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱' }, { status: 400 });
    }

    if (!['register', 'reset'].includes(type)) {
      return NextResponse.json({ error: '无效的请求类型' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (type === 'register' && user) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    if (type === 'reset' && !user) {
      // For security, we don't want to reveal if a user exists or not.
      // But for a friendly UI, we might want to say "user not found" or handle it gracefully.
      // Here we'll just return success but not send email to prevent enumeration?
      // Or send a "You tried to reset password but don't have account" email?
      // For simplicity in this demo, we'll return success but not send the code.
      return NextResponse.json({ success: true });
    }

    // Generate 6-digit OTP
    const token = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    // Store token
    // First delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Cover Gallery <onboarding@resend.dev>',
          to: email,
          subject: `${type === 'register' ? '注册验证码' : '重置密码验证码'} - Cover Gallery`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${type === 'register' ? '欢迎加入 Cover Gallery' : '重置密码'}</h2>
              <p>您的验证码是：</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 24px 0; color: #18181b;">
                ${token}
              </div>
              <p style="color: #71717a; font-size: 14px;">此验证码将在10分钟后失效。</p>
              <p style="color: #71717a; font-size: 14px;">如果您没有发起此请求，请忽略此邮件。</p>
            </div>
          `,
        });
        console.log(`✅ OTP sent to ${email}: ${token}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not found. Email sending skipped.');
    }

    // Always log in dev environment
    if (process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY) {
      console.log('------------------------------------------------');
      console.log(`OTP requested for ${email} (${type})`);
      console.log(`OTP: ${token}`);
      console.log('------------------------------------------------');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

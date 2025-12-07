import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Even if user not found, we return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

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

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Cover Gallery <onboarding@resend.dev>', // Use your verified domain in production
          to: email,
          subject: '重置您的 Cover Gallery 密码',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>重置密码</h2>
              <p>您好，</p>
              <p>我们收到了重置您 Cover Gallery 账号密码的请求。如果您没有发起此请求，请忽略此邮件。</p>
              <p>点击下方按钮重置密码：</p>
              <a href="${resetLink}" style="display: inline-block; background-color: #18181b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">重置密码</a>
              <p style="color: #71717a; font-size: 14px;">或者复制链接到浏览器：<br>${resetLink}</p>
              <p style="color: #71717a; font-size: 14px; margin-top: 32px;">此链接将在24小时后失效。</p>
            </div>
          `,
        });
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request, just log it. In dev we still log the link below.
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not found. Email sending skipped.');
    }

    // Always log in dev environment for easier testing
    if (process.env.NODE_ENV !== 'production' || !process.env.RESEND_API_KEY) {
      console.log('------------------------------------------------');
      console.log(`Password reset requested for ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('------------------------------------------------');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

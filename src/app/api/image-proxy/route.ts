import { NextResponse } from 'next/server';
import { allow } from '@/lib/rateLimit';

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) return true;
  return false;
}

export async function GET(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
  const ok = allow(`image:${forwarded}`, 60_000, 60);
  if (!ok) return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('url');
  if (!raw) return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: '非法链接' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return NextResponse.json({ error: '仅支持 http/https' }, { status: 400 });
  }
  if (isBlockedHost(target.hostname)) {
    return NextResponse.json({ error: '域名不被允许' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'referer': target.origin,
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `拉取失败: ${upstream.status}` }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: '目标不是图片' }, { status: 400 });
    }

    const contentLengthHeader = upstream.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : undefined;
    const MAX_BYTES = 8 * 1024 * 1024; // 8MB 上限
    if (typeof contentLength === 'number' && contentLength > MAX_BYTES) {
      return NextResponse.json({ error: '图片体积过大' }, { status: 413 });
    }

    const res = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'x-proxy-url': target.toString(),
        ...(contentLengthHeader ? { 'content-length': contentLengthHeader } : {}),
      },
    });
    return res;
  } catch {
    return NextResponse.json({ error: '代理失败' }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}

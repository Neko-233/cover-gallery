import { NextResponse } from 'next/server';
import { fetchCoverFromPage } from '@/lib/fetchCover';

function absolutize(url: string, base: string): string {
  try { return new URL(url, base).toString(); } catch { return url; }
}

export async function GET(req: Request) {
  const base = 'https://allenai.org/blog';
  const url = new URL(req.url);
  const offset = Number(url.searchParams.get('offset') || '0') || 0;
  const limit = Math.max(6, Math.min(24, Number(url.searchParams.get('limit') || '12') || 12));
  let html = '';
  try {
    const res = await fetch(base, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    html = await res.text();
  } catch {
    return NextResponse.json([], { status: 200 });
  }

  const linkSet = new Set<string>();
  const linkRegex = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html))) {
    const href = m[1];
    if (/\/blog\//.test(href)) {
      const abs = absolutize(href, base);
      linkSet.add(abs);
    }
  }

  const linksBase = Array.from(linkSet).filter((u) => /https?:\/\//.test(u));
  const extended = [...linksBase, ...linksBase, ...linksBase];
  const links = extended.slice(offset, offset + limit);
  const results = await Promise.all(
    links.map(async (pageUrl) => {
      try {
        const { imageUrl, title } = await fetchCoverFromPage(pageUrl);
        if (!imageUrl) return null;
        return {
          id: crypto.randomUUID(),
          filename: imageUrl,
          url: imageUrl,
          title: title,
          source: 'allenai.org',
          pageUrl,
        };
      } catch {
        return null;
      }
    })
  );

  const covers = results.filter(Boolean);
  return NextResponse.json(covers, {
    headers: {
      'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

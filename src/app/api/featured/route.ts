import { NextResponse } from 'next/server';
import { FEATURED_SOURCES } from '@/lib/featuredSources';

export async function GET() {
  const list = await Promise.allSettled(
    FEATURED_SOURCES.map(async (item) => {
      return {
        id: crypto.randomUUID(),
        filename: item.url,
        url: item.url,
        title: item.title,
        source: item.source,
        pageUrl: item.pageUrl,
      };
    })
  );
  const covers = list
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<any>).value);
  return NextResponse.json(covers, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

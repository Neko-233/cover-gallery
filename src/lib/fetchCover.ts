'use server';

const DEBUG_FETCH = process.env.DEBUG_FETCH_COVER === '1';

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h === '0.0.0.0'
  ) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) return true;
  return false;
}

function findMetaContent(html: string, names: string[]): string | null {
  const metas = html.match(/<meta[\s\S]*?>/gi) || [];
  for (const meta of metas) {
    for (const name of names) {
      const hasName = new RegExp(`(?:property|name)\\s*=\\s*["']${name.replace(/:/g, '\\:')}["']`, 'i').test(meta);
      if (!hasName) continue;
      const contentMatch = meta.match(/content\s*=\s*["']([^"']+)["']/i);
      if (contentMatch && contentMatch[1]) return contentMatch[1];
    }
  }
  // 顺序不匹配时的兜底：content 在前 property/name 在后
  for (const name of names) {
    const re = new RegExp(`<meta[\\s\\S]*?content\\s*=\\s*["']([^"']+)["'][\\s\\S]*?(?:property|name)\\s*=\\s*["']${name.replace(/:/g, '\\:')}["'][\\s\\S]*?>`, 'i');
    const m = html.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

function findLinkHref(html: string, rels: string[]): string | null {
  const links = html.match(/<link[\s\S]*?>/gi) || [];
  for (const link of links) {
    for (const rel of rels) {
      const hasRel = new RegExp(`rel\\s*=\\s*["']${rel}["']`, 'i').test(link);
      if (!hasRel) continue;
      const hrefMatch = link.match(/href\s*=\s*["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) return hrefMatch[1];
    }
  }
  return null;
}

function findJsonLdImage(html: string): string | null {
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const script of scripts) {
    const match = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (match && match[1]) {
      try {
        const json = JSON.parse(match[1]);
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (item.image) {
            if (typeof item.image === 'string') return item.image;
            if (Array.isArray(item.image) && typeof item.image[0] === 'string') return item.image[0];
            if (typeof item.image === 'object' && item.image.url) return item.image.url;
          }
        }
      } catch {}
    }
  }
  return null;
}

function absolutizeUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

async function isImageUrl(url: string, signal: AbortSignal): Promise<boolean> {
  if (DEBUG_FETCH) console.log(JSON.stringify({ ts: Date.now(), mod: 'fetchCover', fn: 'isImageUrl', msg: 'checking', url }));
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal });
    const ct = res.headers.get('content-type') || '';
    if (DEBUG_FETCH) console.log(JSON.stringify({ ts: Date.now(), mod: 'fetchCover', fn: 'isImageUrl', msg: 'head', status: res.status, contentType: ct }));
    if (ct.startsWith('image/')) return true;
    // Some servers might return 405 or 403 for HEAD, or incorrect content-type
    throw new Error('Content-type check failed or not image');
  } catch (e) {
    if (DEBUG_FETCH) console.log(JSON.stringify({ ts: Date.now(), mod: 'fetchCover', fn: 'isImageUrl', msg: 'head_failed', error: e instanceof Error ? e.message : String(e) }));
    // Fallback to extension check
    const isExtMatch = /(\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?)$/i.test(url);
    if (DEBUG_FETCH) console.log(JSON.stringify({ ts: Date.now(), mod: 'fetchCover', fn: 'isImageUrl', msg: 'ext_match', result: isExtMatch }));
    return isExtMatch;
  }
}

export async function fetchCoverFromPage(pageUrl: string): Promise<{ imageUrl: string | null; title?: string; source?: string }> {
  let u: URL;
  try {
    u = new URL(pageUrl);
  } catch {
    return { imageUrl: null };
  }
  if (!['http:', 'https:'].includes(u.protocol)) {
    return { imageUrl: null };
  }
  if (isBlockedHost(u.hostname)) {
    return { imageUrl: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) return { imageUrl: null };
    const html = await res.text();

    const ogImage = findMetaContent(html, ['og:image', 'og:image:url', 'og:image:secure_url']);
    const twImage = findMetaContent(html, ['twitter:image', 'twitter:image:src']);
    const linkImage = findLinkHref(html, ['image_src']);
    const jsonLdImage = findJsonLdImage(html);
    if (DEBUG_FETCH) console.log(JSON.stringify({ ts: Date.now(), mod: 'fetchCover', fn: 'fetchCoverFromPage', msg: 'candidates', ogImage, twImage, linkImage, jsonLdImage }));

    let img = ogImage || twImage || jsonLdImage || null;

    if (!img && linkImage) img = linkImage;
    if (img) img = absolutizeUrl(img, pageUrl);

    const title = findMetaContent(html, ['og:title']) || (() => {
      const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      return m ? m[1].trim() : undefined;
    })();

    const siteName = findMetaContent(html, ['og:site_name']);
    const source = siteName || u.hostname;

    if (!img) {
      // 尝试从 img 标签获取，过滤掉 data: 和 svg
      const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
      for (const m of imgMatches) {
        const src = m[1];
        if (src && !src.startsWith('data:') && !src.includes('.svg')) {
          img = absolutizeUrl(src, pageUrl);
          break;
        }
      }
    }

    // 尝试从 poster 属性获取 (video/mux-player)
    if (!img) {
      const posterMatch = html.match(/poster=["']([^"']+)["']/i);
      if (posterMatch && posterMatch[1]) {
        img = absolutizeUrl(posterMatch[1], pageUrl);
      }
    }

    if (img) {
      const ok = await isImageUrl(img, controller.signal);
      if (!ok) img = null;
    }

    return { imageUrl: img, title, source };
  } catch {
    return { imageUrl: null };
  } finally {
    clearTimeout(timeout);
  }
}

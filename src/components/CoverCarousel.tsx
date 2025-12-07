'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Cover } from '@/lib/covers';
import CoverCard from '@/components/CoverCard';

interface CoverCarouselProps {
  covers: Cover[];
  autoPlay?: boolean;
  intervalMs?: number;
}

export default function CoverCarousel({ covers, autoPlay = true, intervalMs = 4000 }: CoverCarouselProps) {
  const list = useMemo(() => covers, [covers]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    const el = scrollerRef.current;
    if (!el) return;
    let timer: number | null = null;
    const tick = () => {
      if (paused) return;
      const children = Array.from(el.children);
      const next = (active + 1) % children.length;
      const target = children[next] as HTMLElement | undefined;
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActive(next);
    };
    timer = window.setInterval(tick, intervalMs);
    return () => { if (timer) window.clearInterval(timer); };
  }, [active, paused, autoPlay, intervalMs]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target) {
          const idx = Array.from(el.children).indexOf(visible.target as HTMLElement);
          if (idx >= 0) setActive(idx);
        }
      },
      { root: el, threshold: [0.5, 0.75, 0.9] }
    );
    Array.from(el.children).forEach((ch) => obs.observe(ch));
    return () => obs.disconnect();
  }, []);

  const onPrev = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const prev = (active - 1 + children.length) % children.length;
    (children[prev] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActive(prev);
  };
  const onNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.children);
    const next = (active + 1) % children.length;
    (children[next] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActive(next);
  };

  if (!list.length) {
    return (
      <div className="min-h-[240px] grid place-items-center text-zinc-500 dark:text-zinc-400">暂无内容</div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        aria-label="封面轮播"
        role="region"
      >
        {list.map((cover) => (
          <div
            key={cover.id}
            className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[32%] xl:w-[28%]"
          >
            <CoverCard cover={cover} fit="cover" />
          </div>
        ))}
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          type="button"
          aria-label="上一张"
          onClick={onPrev}
          className="m-2 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur px-2 py-2 shadow-sm hover:bg-white dark:hover:bg-zinc-800"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          type="button"
          aria-label="下一张"
          onClick={onNext}
          className="m-2 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur px-2 py-2 shadow-sm hover:bg-white dark:hover:bg-zinc-800"
        >
          ›
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {list.map((_, i) => (
          <button
            key={i}
            aria-label={`第 ${i + 1} 张`}
            onClick={() => setActive(i)}
            className={`h-2 w-2 rounded-full ${active === i ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  );
}


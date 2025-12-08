'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Cover } from '@/lib/covers';
import CoverCard from '@/components/CoverCard';

const INITIAL_LOAD = 60;

function useColumns() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setColumns(5);
      else if (window.innerWidth >= 1024) setColumns(4);
      else if (window.innerWidth >= 768) setColumns(3);
      else if (window.innerWidth >= 640) setColumns(2);
      else setColumns(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return columns;
}

export default function AutoScrollMasonry() {
  const [items, setItems] = useState<Cover[]>([]);
  const [error, setError] = useState<string | null>(null);
  const columns = useColumns();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sources = ['allenai', 'smashing', 'vercel'];
        
        // Use a Set to avoid duplicates if any
        const loadedCovers = new Set<string>();
        const newItems: Cover[] = [];

        // Fetch concurrently but update state progressively
        const fetchSource = async (source: string) => {
          try {
            const res = await fetch(`/api/scrape/${source}?offset=0&limit=20`);
            if (!res.ok) return;
            const data: Cover[] = await res.json();
            
            if (cancelled) return;

            const uniqueData = data.filter(c => !loadedCovers.has(c.url));
            uniqueData.forEach(c => loadedCovers.add(c.url));
            newItems.push(...uniqueData);

            // Shuffle what we have so far
            for (let i = newItems.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
            }

            // Update state immediately with whatever we have
            // Ensure minimum items for marquee effect by duplication if needed
            const displayItems = newItems.length < 20 
              ? [...newItems, ...newItems, ...newItems].slice(0, 60) 
              : [...newItems];
            
            setItems(displayItems);
          } catch {
            // ignore individual source errors
          }
        };

        // Fire all requests but let them settle independently
        await Promise.all(sources.map(fetchSource));
        
      } catch {
        if (!cancelled) setError('部分封面加载失败');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const columnData = useMemo(() => {
    if (!items.length) return [];
    const cols: Cover[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => {
      cols[i % columns].push(item);
    });
    return cols;
  }, [items, columns]);

  return (
    <div className="h-full w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
      {error && (
        <div className="absolute top-4 left-0 right-0 z-10 px-6 sm:px-8">
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">{error}</div>
        </div>
      )}
      
      {/* 
        Vertical Marquee Container 
        Use Flex to separate columns
      */}
      <div className="h-full w-full flex gap-4 px-4 sm:gap-6 sm:px-8 justify-center">
        {columnData.map((colItems, colIndex) => (
          <div 
            key={colIndex} 
            className="flex-1 min-w-0 h-full overflow-hidden relative"
          >
            <div 
              className="animate-marquee-vertical"
              style={{
                // Adjust duration based on content length to maintain consistent speed
                // Add some variation per column
                animationDuration: `${Math.max(40, colItems.length * 8) + (colIndex % 2 === 0 ? 0 : 5)}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                // Stagger start time to avoid lining up perfectly
                animationDelay: `-${colIndex * 7}s`,
                // Alternate direction for visual interest
                animationDirection: colIndex % 2 === 0 ? 'normal' : 'reverse'
              }}
            >
              {/* Original List */}
              <div className="pb-4 sm:pb-6">
                {colItems.map((c, idx) => (
                  <div key={`${c.id}-${idx}`} className="mb-4 sm:mb-6">
                    <CoverCard cover={c} fit="cover" orientation="landscape" />
                  </div>
                ))}
              </div>
              
              {/* Duplicated List for seamless loop */}
              <div className="pb-4 sm:pb-6">
                {colItems.map((c, idx) => (
                  <div key={`${c.id}-${idx}-dup`} className="mb-4 sm:mb-6">
                    <CoverCard cover={c} fit="cover" orientation="landscape" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes marquee-vertical {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0%);
          }
        }
        .animate-marquee-vertical {
          animation-name: marquee-vertical;
          will-change: transform;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
        /* Make sure container doesn't shrink cards too much */
        .flex-1 {
          flex-basis: 0;
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
}

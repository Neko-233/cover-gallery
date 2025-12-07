"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Cover } from '@/lib/covers';

interface CoverCardProps {
  cover: Cover;
  onClick?: () => void;
  fit?: 'cover' | 'contain';
  frame?: boolean;
  orientation?: 'landscape' | 'portrait';
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
  onDelete?: () => void;
}

export default function CoverCard({ cover, onClick, fit = 'contain', frame = true, orientation = 'landscape', selectable = false, selected = false, onSelectToggle, onDelete }: CoverCardProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div
      onClick={onClick ?? (() => { try { window.open(cover.pageUrl || cover.url, '_blank'); } catch {} })}
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer h-full"
    >
      {selectable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelectToggle?.(); }}
          aria-pressed={selected}
          className={`absolute z-10 top-2 right-2 h-6 w-6 grid place-items-center rounded-md border ${selected ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200' : 'bg-white/80 text-zinc-700 border-zinc-300 dark:bg-zinc-900/80 dark:text-zinc-200 dark:border-zinc-700'}`}
        >
          {selected ? '✓' : ''}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('确定要删除这张封面吗？')) {
              onDelete();
            }
          }}
          className="absolute z-10 top-2 left-2 p-1.5 rounded-md bg-white/80 text-red-600 border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:bg-zinc-900/80 dark:text-red-400 dark:border-zinc-700 dark:hover:bg-red-900/30"
          title="删除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/></svg>
        </button>
      )}
      <div className={`${orientation === 'portrait' ? 'aspect-3/4' : 'aspect-video'} relative bg-gray-100 dark:bg-gray-800 ${frame ? 'ring-1 ring-gray-200 dark:ring-gray-700' : ''}`}>
        {cover.url.startsWith('http') ? (
          <Image
            src={`/api/image-proxy?url=${encodeURIComponent(cover.url)}`}
            alt={cover.title || 'Cover image'}
            fill
            unoptimized
            className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-300 ease-in-out group-hover:scale-[1.02]`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setHasError(true)}
          />
        ) : (
          <Image
            src={cover.url}
            alt={cover.title || 'Cover image'}
            fill
            className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-300 ease-in-out group-hover:scale-[1.02]`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={false}
            onError={() => setHasError(true)}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {cover.title && (
            <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">
              {cover.title}
            </h3>
          )}
          {cover.source && (
            <p className="text-white/80 text-xs line-clamp-1">
              {cover.source}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

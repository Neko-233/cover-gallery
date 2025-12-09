"use client";
import Image from 'next/image';
import { Heart } from 'lucide-react';
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
  showLike?: boolean;
  variant?: 'default' | 'image-only';
}

export default function CoverCard({ cover, onClick, fit = 'contain', frame = true, orientation = 'landscape', selectable = false, selected = false, onSelectToggle, onDelete, showLike = true, variant = 'default' }: CoverCardProps) {
  const [hasError, setHasError] = useState(false);
  const [liked, setLiked] = useState(cover.liked || false);
  const [likesCount, setLikesCount] = useState(cover.likesCount || 0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setLiked(cover.liked || false);
    setLikesCount(cover.likesCount || 0);
  }, [cover.liked, cover.likesCount]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverId: cover.id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(!newLiked);
      setLikesCount(prev => !newLiked ? prev + 1 : prev - 1);
    } finally {
      setLiking(false);
    }
  };

  if (hasError) return null;

  return (
    <div
      onClick={onClick ?? (() => { try { window.open(cover.pageUrl || cover.url, '_blank'); } catch {} })}
      className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer h-full border border-zinc-200 dark:border-zinc-800"
    >
      <div className="relative w-full">
        {selectable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelectToggle?.(); }}
          aria-pressed={selected}
          className={`absolute z-30 top-2 right-2 h-6 w-6 grid place-items-center rounded-md border shadow-sm transition-all ${selected ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 scale-100' : 'bg-white/90 text-zinc-400 border-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-500 dark:border-zinc-700 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}
        >
          {selected ? '✓' : ''}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute z-30 top-2 left-2 p-1.5 rounded-md bg-white/90 text-red-500 border border-zinc-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 dark:bg-zinc-900/90 dark:text-red-400 dark:border-zinc-700 dark:hover:bg-red-900/30"
          title="删除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/></svg>
        </button>
      )}
      
      {showLike && !selectable && (
        <button
          type="button"
          onClick={handleLike}
          className="absolute z-30 top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
          style={{ opacity: liked ? 1 : undefined }}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-current'}`} />
          {likesCount > 0 && <span className={`text-xs font-medium ${liked ? 'text-red-500' : 'text-current'}`}>{likesCount}</span>}
        </button>
      )}

      <div className={`${orientation === 'portrait' ? 'aspect-3/4' : 'aspect-video'} relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden`}>
        {/* Background blurred image - only show for contain mode */}
        {fit === 'contain' && (
          <Image
            src={cover.url.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(cover.url)}` : cover.url}
            alt=""
            fill
            unoptimized={cover.url.startsWith('http')}
            className="object-cover blur-2xl scale-110 opacity-50 dark:opacity-30 saturate-150"
            aria-hidden="true"
          />
        )}
        
        {/* Main image */}
        {cover.url.startsWith('http') ? (
          <Image
            src={`/api/image-proxy?url=${encodeURIComponent(cover.url)}`}
            alt={cover.title || 'Cover image'}
            fill
            unoptimized
            className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 ease-out group-hover:scale-105 z-10 drop-shadow-sm`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setHasError(true)}
          />
        ) : (
          <Image
            src={cover.url}
            alt={cover.title || 'Cover image'}
            fill
            className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 ease-out group-hover:scale-105 z-10 drop-shadow-sm`}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={false}
            onError={() => setHasError(true)}
          />
        )}
      </div>
      </div>

      {variant === 'default' && (
        <div className="p-3 flex flex-col gap-1">
          {cover.title ? (
            <h3 className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {cover.title}
            </h3>
          ) : (
            <h3 className="text-zinc-400 dark:text-zinc-600 text-sm italic">无标题</h3>
          )}
          {cover.source && (
            <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
              {cover.source}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

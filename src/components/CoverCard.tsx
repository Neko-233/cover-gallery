import Image from 'next/image';
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
}

export default function CoverCard({ cover, onClick, fit = 'contain', frame = true, orientation = 'landscape', selectable = false, selected = false, onSelectToggle }: CoverCardProps) {
  return (
    <div
      onClick={onClick}
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
      <div className={`${orientation === 'portrait' ? 'aspect-3/4' : 'aspect-video'} relative bg-gray-100 dark:bg-gray-800 ${frame ? 'ring-1 ring-gray-200 dark:ring-gray-700' : ''}`}>
        {cover.url.startsWith('http') ? (
          <Image
            src={`/api/image-proxy?url=${encodeURIComponent(cover.url)}`}
            alt={cover.title || 'Cover image'}
            fill
            unoptimized
            className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-300 ease-in-out group-hover:scale-[1.02]`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <Image
            src={cover.url}
            alt={cover.title || 'Cover image'}
            fill
            className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-300 ease-in-out group-hover:scale-[1.02]`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            priority={false}
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

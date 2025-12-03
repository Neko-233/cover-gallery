import Image from 'next/image';
import { Cover } from '@/lib/covers';

interface CoverCardProps {
  cover: Cover;
  onClick?: () => void;
}

export default function CoverCard({ cover, onClick }: CoverCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105"
    >
      <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-800">
        {cover.url.startsWith('http') ? (
          <img
            src={`/api/image-proxy?url=${encodeURIComponent(cover.url)}`}
            alt={cover.title || 'Cover image'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={cover.url}
            alt={cover.title || 'Cover image'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            priority={false}
          />
        )}
      </div>
      
      {/* Overlay with title and source on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

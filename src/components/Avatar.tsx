'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={cn(
        "relative rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 text-zinc-700 dark:text-zinc-300 font-medium",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

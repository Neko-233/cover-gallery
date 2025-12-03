'use client';

import { Cover } from '@/lib/covers';
import { useMemo } from 'react';
import CoverCard from './CoverCard';

interface CoverGridProps {
  covers: Cover[];
  onCoverClick?: (cover: Cover) => void;
}

export default function CoverGrid({ covers, onCoverClick }: CoverGridProps) {
  const allCovers = useMemo(() => covers, [covers]);

  if (allCovers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            暂无封面图片
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            请在 public/covers/ 目录中添加图片文件
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {allCovers.map((cover) => (
        <CoverCard
          key={cover.id}
          cover={cover}
          onClick={() => onCoverClick?.(cover)}
        />
      ))}
    </div>
  );
}

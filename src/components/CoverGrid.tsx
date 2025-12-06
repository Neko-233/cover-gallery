'use client';

import { Cover } from '@/lib/covers';
import { useMemo } from 'react';
import CoverCard from './CoverCard';

interface CoverGridProps {
  covers: Cover[];
  onCoverClick?: (cover: Cover) => void;
  columnsPreset?: 'compact' | 'normal' | 'comfortable' | 'xlarge';
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectToggle?: (cover: Cover) => void;
  fit?: 'cover' | 'contain';
  orientation?: 'landscape' | 'portrait';
}

export default function CoverGrid({ covers, onCoverClick, columnsPreset = 'normal', selectable = false, selectedIds, onSelectToggle, fit = 'contain', orientation = 'landscape' }: CoverGridProps) {
  const allCovers = useMemo(() => covers, [covers]);

  if (allCovers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            暂无封面图片
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            还没有内容，上传或添加你的封面来开始吧
          </div>
        </div>
      </div>
    );
  }

  const gridClass =
    columnsPreset === 'compact'
      ? 'grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'
      : columnsPreset === 'comfortable'
      ? 'grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'
      : columnsPreset === 'xlarge'
      ? 'grid w-full justify-start grid-cols-[repeat(auto-fill,minmax(280px,280px))] gap-4'
      : 'grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';

  return (
    <div className={gridClass}>
      {allCovers.map((cover) => (
        <CoverCard
          key={cover.id}
          cover={cover}
          onClick={() => onCoverClick?.(cover)}
          selectable={selectable}
          selected={selectedIds ? selectedIds.has(cover.id) : false}
          onSelectToggle={() => onSelectToggle?.(cover)}
          fit={fit}
          orientation={orientation}
        />
      ))}
    </div>
  );
}

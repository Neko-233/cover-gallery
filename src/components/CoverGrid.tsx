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
  spacing?: number;
  minWidth?: number;
  maxWidth?: number;
  alignment?: 'start' | 'center' | 'end';
}

export default function CoverGrid({ covers, onCoverClick, columnsPreset = 'comfortable', selectable = false, selectedIds, onSelectToggle, fit = 'contain', orientation = 'landscape', spacing = 16, minWidth = 280, maxWidth = 280, alignment = 'start' }: CoverGridProps) {
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

  const alignmentClass = alignment === 'center' ? 'justify-center' : alignment === 'end' ? 'justify-end' : 'justify-start';
  const gridClass =
    columnsPreset === 'compact'
      ? 'grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'
      : columnsPreset === 'comfortable'
      ? 'grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'
      : columnsPreset === 'xlarge'
      ? `grid w-full ${alignmentClass}`
      : 'grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
  const gridStyle =
    columnsPreset === 'xlarge'
      ? { gap: spacing, gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, ${maxWidth}px))` }
      : { gap: spacing };

  return (
    <div className={gridClass} style={gridStyle}>
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

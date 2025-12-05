'use client';

import { Cover } from '@/lib/covers';
import { useMemo } from 'react';
import CoverCard from './CoverCard';
import { useFlipAnimation } from '@/hooks/useFlipAnimation';

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

export default function CoverGrid({
  covers,
  onCoverClick,
  selectable = false,
  selectedIds,
  onSelectToggle,
  fit = 'contain',
  orientation = 'landscape',
  spacing = 8,
  minWidth = 160,
  maxWidth = 300,
  alignment = 'start'
}: CoverGridProps) {
  const allCovers = useMemo(() => covers, [covers]);
  const registerItem = useFlipAnimation([alignment, spacing, minWidth, allCovers]);

  if (allCovers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-6 sm:px-8">
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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, ${maxWidth}px))`,
        gap: `${spacing}px`,
        justifyContent: alignment,
      }}
      className="w-full transition-all duration-300 ease-in-out px-6 sm:px-8"
    >
      {allCovers.map((cover, index) => (
        <div
          key={cover.id}
          ref={(el) => registerItem(cover.id, el)}
          data-index={index}
          style={{ height: '100%' }} // 确保 wrapper 填满 grid cell
        >
          <CoverCard
            cover={cover}
            onClick={() => onCoverClick?.(cover)}
            selectable={selectable}
            selected={selectedIds ? selectedIds.has(cover.id) : false}
            onSelectToggle={() => onSelectToggle?.(cover)}
            fit={fit}
            orientation={orientation}
          />
        </div>
      ))}
    </div>
  );
}

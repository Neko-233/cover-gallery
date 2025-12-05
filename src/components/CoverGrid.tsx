'use client';

import { Cover } from '@/lib/covers';
import { useMemo, useLayoutEffect, useRef } from 'react';
import CoverCard from './CoverCard';

// 简单的 FLIP 动画 Hook
function useFlipAnimation(deps: unknown[]) {
  const itemsRef = useRef<Map<string, HTMLElement | null>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

  useLayoutEffect(() => {
    // 1. 计算当前所有元素的新位置
    const currentRects = new Map<string, DOMRect>();
    itemsRef.current.forEach((el, id) => {
      if (el) currentRects.set(id, el.getBoundingClientRect());
    });

    // 2. 对比旧位置，应用 FLIP
    itemsRef.current.forEach((el, id) => {
      if (!el) return;
      const prev = prevRectsRef.current.get(id);
      const current = currentRects.get(id);

      if (prev && current) {
        const dx = prev.left - current.left;
        const dy = prev.top - current.top;

        if (dx !== 0 || dy !== 0) {
          // Invert: 瞬间移动回旧位置
          el.style.transition = 'none';
          el.style.transform = `translate(${dx}px, ${dy}px)`;

          // Play: 在下一帧启用过渡，移动到新位置（即 transform: none）
          requestAnimationFrame(() => {
            // 强制重绘
            void el.offsetHeight; 
            
            // 设置非线性动画和动态时长
            // 假设 element 有 data-index 属性来计算不同的速度
            const index = Number(el.dataset.index || 0);
            const duration = 400 + (index % 5) * 60; // 400ms ~ 640ms
            
            el.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
            el.style.transform = '';
          });
        }
      }
    });

    // 3. 保存当前位置供下次使用
    prevRectsRef.current = currentRects;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (id: string, el: HTMLElement | null) => {
    if (el) itemsRef.current.set(id, el);
    else itemsRef.current.delete(id);
  };
}

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

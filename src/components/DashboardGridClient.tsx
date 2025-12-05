'use client';

import { useMemo, useState } from 'react';
import CoverGrid from '@/components/CoverGrid';
import type { Cover } from '@/lib/covers';

// 配置常量 - 可以在这里调整参数范围
const CONFIG = {
  IMAGE: {
    MIN_WIDTH: 150,   // 图片最小宽度
    MAX_WIDTH: 500,  // 图片最大宽度
    STEP: 10,        // 调节步长
    DEFAULT: 220     // 默认宽度
  },
  SPACING: {
    MIN: 10,          // 最小间距
    MAX: 60,         // 最大间距
    DEFAULT: 25       // 默认间距
  }
} as const;

export default function DashboardGridClient({ covers }: { covers: Cover[] }) {
  const [minWidth, setMinWidth] = useState<number>(CONFIG.IMAGE.DEFAULT);
  const [spacing, setSpacing] = useState<number>(CONFIG.SPACING.DEFAULT);
  const [alignment, setAlignment] = useState<'start' | 'center' | 'end'>('start');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedCount = selected.size;
  const selectedIds = useMemo(() => selected, [selected]);
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');

  const onItemClick = (cover: Cover) => {
    if (selectMode) {
      toggleSelect(cover);
      return;
    }
    const url = cover.url;
    try {
      window.open(url, '_blank');
    } catch {}
  };

  const toggleSelect = (cover: Cover) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cover.id)) next.delete(cover.id); else next.add(cover.id);
      return next;
    });
  };

  const downloadSelected = async () => {
    const list = covers.filter((c) => selected.has(c.id));
    for (const c of list) {
      try {
        const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(c.url)}`);
        const blob = await res.blob();
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const nameFromUrl = (() => {
          try {
            const u = new URL(c.url);
            const seg = u.pathname.split('/').filter(Boolean);
            return seg[seg.length - 1] || `cover-${c.id}`;
          } catch { return `cover-${c.id}`; }
        })();
        a.href = url;
        a.download = nameFromUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch {}
    }
  };
  return (
    <div>
      <div className="mx-6 sm:mx-8 mb-6 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">图片大小</div>
            <input
              type="range"
              min={CONFIG.IMAGE.MIN_WIDTH}
              max={CONFIG.IMAGE.MAX_WIDTH}
              step={CONFIG.IMAGE.STEP}
              value={minWidth}
              onChange={(e) => setMinWidth(Number(e.target.value))}
              className="w-32 sm:w-48 accent-zinc-900 dark:accent-zinc-100"
            />
            <div className="text-xs text-zinc-500 dark:text-zinc-400 w-8">{minWidth}px</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">间距</div>
            <input
              type="range"
              min={CONFIG.SPACING.MIN}
              max={CONFIG.SPACING.MAX}
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              className="w-32 sm:w-48 accent-zinc-900 dark:accent-zinc-100"
            />
            <div className="text-xs text-zinc-500 dark:text-zinc-400 w-6">{spacing}px</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setAlignment('start')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${alignment === 'start' ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              左对齐
            </button>
            <button
              onClick={() => setAlignment('center')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${alignment === 'center' ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              居中
            </button>
            <button
              onClick={() => setAlignment('end')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${alignment === 'end' ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              右对齐
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-2 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">适配</div>
            <button
              type="button"
              onClick={() => setFit((v) => (v === 'cover' ? 'contain' : 'cover'))}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {fit === 'cover' ? '裁切' : '完整'}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectMode((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${selectMode ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
            >
              {selectMode ? '退出选择' : '选择封面'}
            </button>
            <button
              type="button"
              onClick={downloadSelected}
              disabled={!selectedCount}
              className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-1.5 text-xs font-medium disabled:opacity-50 hover:opacity-90 shadow-sm transition-opacity"
            >
              下载所选 {selectedCount > 0 && `(${selectedCount})`}
            </button>
          </div>
        </div>
      </div>

      <CoverGrid
        covers={covers}
        onCoverClick={onItemClick}
        selectable={selectMode}
        selectedIds={selectedIds}
        onSelectToggle={toggleSelect}
        fit={fit}
        orientation={'landscape'}
        spacing={spacing}
        minWidth={minWidth}
        maxWidth={Math.floor(minWidth * 1.5)}
        alignment={alignment}
      />
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import CoverGrid from '@/components/CoverGrid';
import type { Cover } from '@/lib/covers';

export default function DashboardGridClient({ covers }: { covers: Cover[] }) {
  const [size, setSize] = useState<1 | 2 | 3 | 4>(4);
  const preset = size === 1 ? 'compact' : size === 2 ? 'normal' : size === 3 ? 'comfortable' : 'comfortable';
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
      <div className="mb-4 flex items-center gap-3 w-full">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">显示大小</div>
        <input
          type="range"
          min={1}
          max={4}
          value={size}
          onChange={(e) => setSize(Number(e.target.value) as 1 | 2 | 3 | 4)}
          className="w-80"
        />
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{size === 1 ? '紧凑' : size === 2 ? '标准' : size === 3 ? '舒适' : '更大'}</div>
        <div className="ml-6 flex items-center gap-2">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">适配</div>
          <button
            type="button"
            onClick={() => setFit((v) => (v === 'cover' ? 'contain' : 'cover'))}
            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {fit === 'cover' ? '裁切' : '完整'}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectMode((v) => !v)}
            className={`rounded-lg px-3 py-2 text-sm ${selectMode ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200'}`}
          >
            {selectMode ? '退出选择' : '选择封面'}
          </button>
          <button
            type="button"
            onClick={downloadSelected}
            disabled={!selectedCount}
            className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 px-3 py-2 text-sm disabled:opacity-50 hover:opacity-90"
          >
            下载所选
          </button>
        </div>
      </div>
      <CoverGrid
        covers={covers}
        columnsPreset={size === 4 ? 'xlarge' : (preset as any)}
        onCoverClick={onItemClick}
        selectable={selectMode}
        selectedIds={selectedIds}
        onSelectToggle={toggleSelect}
        fit={fit}
        orientation={'landscape'}
      />
    </div>
  );
}

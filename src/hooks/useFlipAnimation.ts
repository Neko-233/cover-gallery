import { useLayoutEffect, useRef } from 'react';

// 简单的 FLIP 动画 Hook
export function useFlipAnimation(deps: unknown[]) {
  const itemsRef = useRef<Map<string, HTMLElement | null>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    // 1. 计算当前所有元素的新位置
    const currentRects = new Map<string, DOMRect>();
    itemsRef.current.forEach((el, id) => {
      if (el) currentRects.set(id, el.getBoundingClientRect());
    });

    // 收集需要动画的元素
    const movedItems: HTMLElement[] = [];

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
          movedItems.push(el);
        }
      }
    });

    // 如果有元素移动，执行 Play 阶段
    if (movedItems.length > 0) {
      // 取消之前的动画帧（如果有）
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Play: 在下一帧启用过渡，移动到新位置（即 transform: none）
      rafIdRef.current = requestAnimationFrame(() => {
        movedItems.forEach((el) => {
          // 强制重绘
          void el.offsetHeight;

          // 设置非线性动画和动态时长
          // 假设 element 有 data-index 属性来计算不同的速度
          const index = Number(el.dataset.index || 0);
          const duration = 400 + (index % 5) * 60; // 400ms ~ 640ms

          el.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
          el.style.transform = '';
        });
        rafIdRef.current = null;
      });
    }

    // 3. 保存当前位置供下次使用
    prevRectsRef.current = currentRects;

    // 清理函数
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (id: string, el: HTMLElement | null) => {
    if (el) itemsRef.current.set(id, el);
    else itemsRef.current.delete(id);
  };
}

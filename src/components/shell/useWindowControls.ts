"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MIN_W = 340;
export const MIN_H = 180;
const EDGE = 8;

export type WinState = {
  min: boolean;
  max: boolean;
  pos: { x: number; y: number } | null; // null = docked bottom-right
  size: { w: number; h: number } | null; // null = default 540×340
};

/*
 * Window chrome for the floating shell (plan §5):
 * - drag/resize via pointer events with setPointerCapture, active-pointerId
 *   guard (second finger ignored), pointercancel treated as pointerup
 * - during a gesture only inline styles change (transform for drag — no
 *   layout/paint of the shadowed window per move); state commits on release
 * - clamps to viewport, auto-shrinks at right/bottom edges, min 340×180
 * - committed pos/size re-clamped on viewport resize/orientation change
 *   (otherwise the title bar — and the only close button — can rotate
 *   off-screen)
 * Invariant: nothing but these handlers mutates pos/size mid-gesture.
 */
export function useWindowControls(winRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<WinState>({
    min: false,
    max: false,
    pos: null,
    size: null,
  });
  const draggedRef = useRef(false); // suppresses the bar-click minimize toggle
  const activePointer = useRef<number | null>(null);

  /* ── drag (title bar) ─────────────────────────────────────── */
  const onHeadDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (state.max || state.min) return;
      if (activePointer.current !== null) return;
      const win = winRef.current;
      if (!win) return;

      activePointer.current = e.pointerId;
      const bar = e.currentTarget as HTMLElement;
      bar.setPointerCapture(e.pointerId);

      const rect0 = win.getBoundingClientRect();
      const off = { x: e.clientX - rect0.left, y: e.clientY - rect0.top };
      // cache viewport once per gesture — no layout reads in the move handler
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let pos: { x: number; y: number } | null = null;
      let size: { w: number; h: number } | null = null;

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointer.current) return;
        draggedRef.current = true;
        pos = {
          x: Math.min(Math.max(0, ev.clientX - off.x), vw - MIN_W - EDGE),
          y: Math.min(Math.max(0, ev.clientY - off.y), vh - MIN_H - EDGE),
        };
        // shrink when the window would overflow right/bottom
        size = {
          w: Math.max(MIN_W, Math.min(rect0.width, vw - pos.x - EDGE)),
          h: Math.max(MIN_H, Math.min(rect0.height, vh - pos.y - EDGE)),
        };
        win.style.transform = `translate3d(${pos.x - rect0.left}px, ${pos.y - rect0.top}px, 0)`;
        win.style.width = size.w + "px";
        win.style.height = size.h + "px";
      };

      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointer.current) return;
        bar.releasePointerCapture(ev.pointerId);
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        activePointer.current = null;
        if (pos) {
          // pin final geometry inline BEFORE clearing the transform so the
          // window never flashes back to its pre-drag spot
          win.style.transform = "";
          win.style.left = pos.x + "px";
          win.style.top = pos.y + "px";
          win.style.right = "auto";
          win.style.bottom = "auto";
          setState((s) => ({ ...s, pos, size }));
        }
        setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      };

      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
      e.preventDefault();
    },
    [state.max, state.min, winRef],
  );

  /* ── resize (◢ handle) ────────────────────────────────────── */
  const onResizeDown = useCallback(
    (e: React.PointerEvent) => {
      if (state.max || state.min) return;
      if (activePointer.current !== null) return;
      const win = winRef.current;
      if (!win) return;

      activePointer.current = e.pointerId;
      const handle = e.currentTarget as HTMLElement;
      handle.setPointerCapture(e.pointerId);

      const rect0 = win.getBoundingClientRect();
      const pin = { x: rect0.left, y: rect0.top };
      // pin top-left so growing width/height extends right/down
      win.style.left = pin.x + "px";
      win.style.top = pin.y + "px";
      win.style.right = "auto";
      win.style.bottom = "auto";

      const start = { x: e.clientX, y: e.clientY, w: rect0.width, h: rect0.height };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let size: { w: number; h: number } | null = null;

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointer.current) return;
        size = {
          w: Math.min(
            Math.max(MIN_W, start.w + ev.clientX - start.x),
            vw - pin.x - EDGE,
          ),
          h: Math.min(
            Math.max(MIN_H, start.h + ev.clientY - start.y),
            vh - pin.y - EDGE,
          ),
        };
        win.style.width = size.w + "px";
        win.style.height = size.h + "px";
      };

      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointer.current) return;
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        activePointer.current = null;
        setState((s) => ({ ...s, pos: pin, size: size ?? s.size }));
      };

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
      e.preventDefault();
      e.stopPropagation();
    },
    [state.max, state.min, winRef],
  );

  /* ── viewport re-clamp ────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      setState((s) => {
        if (!s.pos || s.max || s.min) return s;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = Math.min(s.pos.x, Math.max(0, vw - MIN_W - EDGE));
        const y = Math.min(s.pos.y, Math.max(0, vh - MIN_H - EDGE));
        const size = s.size
          ? {
              w: Math.max(MIN_W, Math.min(s.size.w, vw - x - EDGE)),
              h: Math.max(MIN_H, Math.min(s.size.h, vh - y - EDGE)),
            }
          : null;
        if (x === s.pos.x && y === s.pos.y && size === s.size) return s;
        return { ...s, pos: { x, y }, size };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── chrome actions ───────────────────────────────────────── */
  const minimize = useCallback(
    () => setState((s) => ({ ...s, min: true })),
    [],
  );
  const toggleMin = useCallback(() => {
    if (draggedRef.current) return;
    setState((s) => ({ ...s, min: !s.min }));
  }, []);
  const toggleMax = useCallback(
    () => setState((s) => ({ ...s, max: !s.max, min: false })),
    [],
  );

  /* ── computed style (prototype termWinStyle) ──────────────── */
  const style: React.CSSProperties = state.min
    ? { bottom: 20, right: 20, width: "min(540px, calc(100vw - 32px))" }
    : state.max
      ? { left: 16, top: 16, right: 16, bottom: 16, width: "auto", height: "auto" }
      : {
          ...(state.pos
            ? { left: state.pos.x, top: state.pos.y }
            : { bottom: 20, right: 20 }),
          width: state.size ? state.size.w : "min(540px, calc(100vw - 32px))",
          height: state.size ? state.size.h : 340,
        };

  return { state, style, onHeadDown, onResizeDown, minimize, toggleMin, toggleMax };
}

'use client';

import type React from 'react';

export type HoverDirection = 'top' | 'right' | 'bottom' | 'left';

function computePointerGeometry(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number; diameter: number; dir: HoverDirection } | null {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const dx = (x - rect.width / 2) / Math.max(rect.width / 2, 1);
  const dy = (y - rect.height / 2) / Math.max(rect.height / 2, 1);

  let dir: HoverDirection;
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx < 0 ? 'left' : 'right';
  } else {
    dir = dy < 0 ? 'top' : 'bottom';
  }

  // Exact farthest-corner distance from the cursor ensures minimal excess diameter
  // so radial sweeps travel visibly across the full button from any entry/exit edge.
  const farX = Math.max(x, rect.width - x);
  const farY = Math.max(y, rect.height - y);
  const diameter = Math.ceil(Math.hypot(farX, farY) * 2.08);

  return { x, y, diameter, dir };
}

export function setDirectionalHoverOrigin(
  el: HTMLElement,
  clientX: number,
  clientY: number,
  active: boolean,
): void {
  const geom = computePointerGeometry(el, clientX, clientY);
  if (!geom) return;

  el.style.setProperty('--btn-x', `${geom.x.toFixed(1)}px`);
  el.style.setProperty('--btn-y', `${geom.y.toFixed(1)}px`);
  el.style.setProperty('--btn-r', `${geom.diameter}px`);
  el.dataset.dir = geom.dir;
  el.dataset.hovered = active ? 'true' : 'false';
}

export function createDirectionalPointerHandlers<T extends HTMLElement>() {
  return {
    onPointerEnter(event: React.PointerEvent<T>) {
      if (event.pointerType === 'touch') return;
      setDirectionalHoverOrigin(
        event.currentTarget,
        event.clientX,
        event.clientY,
        true,
      );
    },
    onPointerLeave(event: React.PointerEvent<T>) {
      if (event.pointerType === 'touch') return;
      setDirectionalHoverOrigin(
        event.currentTarget,
        event.clientX,
        event.clientY,
        false,
      );
    },
  };
}

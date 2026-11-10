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

  // Full bounding-box diagonal scaled comfortably so radial fill reaches opposite corners
  const diameter = Math.ceil(Math.hypot(rect.width, rect.height) * 2.2);

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
    onPointerMove(event: React.PointerEvent<T>) {
      if (event.pointerType === 'touch') return;
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      el.style.setProperty('--btn-x', `${(event.clientX - rect.left).toFixed(1)}px`);
      el.style.setProperty('--btn-y', `${(event.clientY - rect.top).toFixed(1)}px`);
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

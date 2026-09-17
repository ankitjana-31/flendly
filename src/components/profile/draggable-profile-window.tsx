"use client";

import { useRef, useState } from "react";

import { RetroWindow, type RetroWindowProps } from "@/components/ui/retro-window";

export function DraggableProfileWindow(props: RetroWindowProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const drag = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  return (
    <div
      className="relative block md:cursor-grab md:active:cursor-grabbing"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={(event) => {
        if (
          !(event.target instanceof HTMLElement) ||
          !event.target.closest("[data-window-titlebar]") ||
          event.target.closest("button")
        ) return;
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: position.x,
          originY: position.y,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const activeDrag = drag.current;
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        setPosition({
          x: activeDrag.originX + event.clientX - activeDrag.startX,
          y: activeDrag.originY + event.clientY - activeDrag.startY,
        });
      }}
      onPointerUp={(event) => {
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
    >
      <RetroWindow {...props} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface Block {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  currentOpacity: number;
}

export function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BLOCK_SIZE = 40;
    const BLOCK_GAP = 50;
    const INFLUENCE_RADIUS = 150;

    let blocks: Block[] = [];
    let mousePos = { x: -1000, y: -1000 };
    let animationFrameId: number;

    const initializeBlocks = () => {
      blocks = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (let y = -BLOCK_GAP; y < height + BLOCK_GAP; y += BLOCK_GAP) {
        for (let x = -BLOCK_GAP; x < width + BLOCK_GAP; x += BLOCK_GAP) {
          blocks.push({
            x,
            y,
            size: BLOCK_SIZE,
            baseOpacity: 0.1,
            currentOpacity: 0.1,
          });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeBlocks();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleMouseLeave = () => {
      mousePos = { x: -1000, y: -1000 };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const dx = block.x - mousePos.x;
        const dy = block.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < INFLUENCE_RADIUS) {
          const influence = 1 - distance / INFLUENCE_RADIUS;
          block.currentOpacity = Math.min(block.baseOpacity + influence * 0.4, 0.6);
        } else {
          block.currentOpacity = block.baseOpacity;
        }

        ctx.fillStyle = `rgba(59, 130, 246, ${block.currentOpacity})`;
        ctx.fillRect(block.x, block.y, block.size, block.size);

        if (distance < INFLUENCE_RADIUS && block.currentOpacity > 0.2) {
          ctx.shadowColor = `rgba(59, 130, 246, ${block.currentOpacity * 0.5})`;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = `rgba(139, 92, 246, ${block.currentOpacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(block.x, block.y, block.size, block.size);
        }
      }

      ctx.shadowColor = "transparent";
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

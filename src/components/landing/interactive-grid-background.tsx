"use client";

import { useEffect, useRef, useState } from "react";

interface Block {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  currentOpacity: number;
  distance: number;
}

export function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const BLOCK_SIZE = 40;
  const BLOCK_GAP = 50;
  const INFLUENCE_RADIUS = 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeBlocks();
    };

    const initializeBlocks = () => {
      const newBlocks: Block[] = [];
      let id = 0;

      for (let y = -BLOCK_GAP; y < window.innerHeight + BLOCK_GAP; y += BLOCK_GAP) {
        for (let x = -BLOCK_GAP; x < window.innerWidth + BLOCK_GAP; x += BLOCK_GAP) {
          newBlocks.push({
            id: id++,
            x,
            y,
            size: BLOCK_SIZE,
            baseOpacity: 0.1,
            currentOpacity: 0.1,
            distance: 1000,
          });
        }
      }

      setBlocks(newBlocks);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 1)"; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      blocks.forEach((block) => {
        const dx = block.x - mousePos.x;
        const dy = block.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate opacity based on distance
        if (distance < INFLUENCE_RADIUS) {
          const influence = 1 - distance / INFLUENCE_RADIUS;
          block.currentOpacity = Math.min(block.baseOpacity + influence * 0.4, 0.6);
        } else {
          block.currentOpacity = block.baseOpacity;
        }

        // Draw block
        ctx.fillStyle = `rgba(59, 130, 246, ${block.currentOpacity})`;
        ctx.fillRect(block.x, block.y, block.size, block.size);

        // Add subtle glow on nearby blocks
        if (distance < INFLUENCE_RADIUS && block.currentOpacity > 0.2) {
          ctx.shadowColor = `rgba(59, 130, 246, ${block.currentOpacity * 0.5})`;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = `rgba(139, 92, 246, ${block.currentOpacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(block.x, block.y, block.size, block.size);
        }
      });

      ctx.shadowColor = "transparent";
      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [blocks]);;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}

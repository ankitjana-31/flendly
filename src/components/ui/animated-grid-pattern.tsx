"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 44,
  height = 44,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  numSquares = 40,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

  const getPos = useCallback(() => {
    return [
      Math.floor((Math.random() * (dimensions.width || 1000)) / width),
      Math.floor((Math.random() * (dimensions.height || 800)) / height),
    ] as [number, number];
  }, [dimensions.width, dimensions.height, width, height]);

  // Generate random blinking squares
  const generateSquares = useCallback(
    (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(),
      }));
    },
    [getPos]
  );

  const [squares, setSquares] = useState<Array<{ id: number; pos: [number, number] }>>([]);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares));
    }
  }, [dimensions.width, dimensions.height, generateSquares, numSquares]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      setTouchPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerLeave = () => {
      setTouchPos(null);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  // Calculate grid coordinates for touch cursor glow
  const touchGridPos = touchPos
    ? [Math.floor(touchPos.x / width), Math.floor(touchPos.y / height)]
    : null;

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 h-full w-full fill-blue-500/10 stroke-slate-800/60 dark:stroke-slate-800/80",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
        {/* Glow filter */}
        <filter id="gridGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base Grid Lines */}
      <rect width="100%" height="100%" fill={`url(#${id})`} />

      {/* Random Animated Blinking Squares */}
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id: sqId }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              delay: (index * 0.15) % duration,
              repeatDelay: Math.random() * repeatDelay,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => {
              setSquares((prev) =>
                prev.map((sq) => (sq.id === sqId ? { ...sq, pos: getPos() } : sq))
              );
            }}
            key={`${squareX}-${squareY}-${sqId}`}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            className="fill-blue-500/25 stroke-blue-400/40"
            strokeWidth="1"
          />
        ))}

        {/* Interactive Touch/Cursor Glow Squares */}
        {touchGridPos && (
          <>
            {/* Center touched cell */}
            <motion.rect
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              width={width - 1}
              height={height - 1}
              x={touchGridPos[0] * width + 1}
              y={touchGridPos[1] * height + 1}
              className="fill-blue-500/60 stroke-blue-300"
              strokeWidth="1.5"
              filter="url(#gridGlow)"
            />

            {/* Adjacent surrounding cells with softer glow */}
            {[-1, 0, 1].flatMap((dx) =>
              [-1, 0, 1].map((dy) => {
                if (dx === 0 && dy === 0) return null;
                const gx = touchGridPos[0] + dx;
                const gy = touchGridPos[1] + dy;
                return (
                  <motion.rect
                    key={`touch-adj-${gx}-${gy}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ duration: 0.2 }}
                    width={width - 1}
                    height={height - 1}
                    x={gx * width + 1}
                    y={gy * height + 1}
                    className="fill-cyan-500/30 stroke-blue-400/30"
                    strokeWidth="1"
                  />
                );
              })
            )}
          </>
        )}
      </svg>
    </svg>
  );
}
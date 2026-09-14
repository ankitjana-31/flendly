"use client";

import React, { useEffect, useState } from "react";

interface CursorGlowProps {
  className?: string;
}

export function CursorGlow({ className = "" }: CursorGlowProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handlePointerLeave = () => {
      setPosition(null);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  if (!position) return null;

  return (
    <>
      {/* Light Mode Cursor Glow Halo */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-10 block dark:hidden transition-opacity duration-300 ${className}`}
        style={{
          background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, rgba(37, 99, 235, 0.14), rgba(45, 212, 191, 0.10), rgba(255, 230, 0, 0.04) 60%, transparent 80%)`,
        }}
      />

      {/* Dark Mode Cursor Glow Halo */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-10 hidden dark:block transition-opacity duration-300 ${className}`}
        style={{
          background: `radial-gradient(650px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.22), rgba(45, 212, 191, 0.14), transparent 70%)`,
        }}
      />
    </>
  );
}

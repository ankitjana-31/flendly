"use client";

import React, { useEffect, useRef } from "react";

interface CursorGlowProps {
  className?: string;
}

export function CursorGlow({ className = "" }: CursorGlowProps) {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (lightRef.current) {
          lightRef.current.style.background = `radial-gradient(550px circle at ${x}px ${y}px, rgba(37, 99, 235, 0.14), rgba(45, 212, 191, 0.10), rgba(255, 230, 0, 0.04) 60%, transparent 80%)`;
          lightRef.current.style.opacity = "1";
        }
        if (darkRef.current) {
          darkRef.current.style.background = `radial-gradient(650px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.18), rgba(45, 212, 191, 0.11), transparent 70%)`;
          darkRef.current.style.opacity = "1";
        }
      });
    };

    const handlePointerLeave = () => {
      if (lightRef.current) lightRef.current.style.opacity = "0";
      if (darkRef.current) darkRef.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <>
      {/* Light Mode Cursor Glow Halo */}
      <div
        ref={lightRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-10 block dark:hidden transition-opacity duration-300 opacity-0 ${className}`}
      />

      {/* Dark Mode Cursor Glow Halo */}
      <div
        ref={darkRef}
        aria-hidden="true"
        className={`cursor-glow-dark pointer-events-none fixed inset-0 z-10 hidden dark:block transition-opacity duration-300 opacity-0 ${className}`}
      />
    </>
  );
}

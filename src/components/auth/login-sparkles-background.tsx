"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export function LoginSparklesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
      {/* Ambient gradient glow backdrop */}
      <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/20 via-sky-500/10 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 right-10 h-[400px] w-[500px] rounded-full bg-gradient-to-t from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />

      {/* Sparkles Particle Layer */}
      <SparklesCore
        id="loginSparkles"
        background="transparent"
        minSize={0.6}
        maxSize={1.8}
        particleDensity={50}
        speed={0.8}
        particleColor="#6366f1"
        className="h-full w-full"
      />
    </div>
  );
}

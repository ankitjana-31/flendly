"use client";

/**
 * LoginWaveBackground
 * 
 * Implements the official Flendly Stitch Background Wave Motif System Specification
 * (Variation B: Layered Two-Line Harmonic Counter-Curves).
 * 
 * Features:
 * - Top framing crest shelf (anchored to top viewport)
 * - Bottom grounding wave foundation (anchored to bottom viewport)
 * - Pure SVG background layer (pointer-events-none, z-0)
 * - Theme-aware styling for Light and Dark modes
 * - 100% responsive fluid scaling across mobile (393px) and desktop
 * - Zero overlap interference with interactive cards or navigation controls
 */
export function LoginWaveBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`auth-wave-motif pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      {/* Top Framing Wave Shelf */}
      <div className="absolute top-0 left-0 right-0 w-full h-16 sm:h-24 opacity-75 dark:opacity-60 transition-opacity">
        <svg
          viewBox="0 0 1440 96"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Layer 1 fill: Electric Blue tint */}
          <path
            d="M0,0 L1440,0 L1440,48 C1180,18 860,68 520,28 C300,4 120,38 0,32 Z"
            className="auth-wave-top-fill1 fill-[#2563EB]/10 dark:fill-[#3B82F6]/15"
          />
          {/* Layer 2 fill: Soft Amber/Yellow tint */}
          <path
            d="M0,0 L1440,0 L1440,32 C1100,56 780,16 420,44 C220,58 90,28 0,20 Z"
            className="auth-wave-top-fill2 fill-[#FFE600]/18 dark:fill-[#FFE600]/10"
          />
          {/* Stroke 1: Primary Structural Crest */}
          <path
            d="M0,32 C120,38 300,4 520,28 C860,68 1180,18 1440,48"
            className="auth-wave-stroke-main stroke-black/20 dark:stroke-white/15"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Stroke 2: Harmonic Secondary Line */}
          <path
            d="M0,20 C90,28 220,58 420,44 C780,16 1100,56 1440,32"
            className="auth-wave-top-stroke2 stroke-[#2563EB]/35 dark:stroke-[#60A5FA]/30"
            strokeWidth="1.75"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Bottom Grounding Wave Foundation */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-28 opacity-80 dark:opacity-60 transition-opacity">
        <svg
          viewBox="0 0 1440 110"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Layer 1 fill: Mint / Cyan tint */}
          <path
            d="M0,52 C240,82 580,22 920,68 C1160,84 1320,46 1440,58 L1440,110 L0,110 Z"
            className="auth-wave-bot-fill1 fill-[#2DD4BF]/14 dark:fill-[#2DD4BF]/10"
          />
          {/* Layer 2 fill: Soft Blue tint */}
          <path
            d="M0,74 C280,34 640,88 1020,42 C1220,28 1360,64 1440,48 L1440,110 L0,110 Z"
            className="auth-wave-bot-fill2 fill-[#2563EB]/8 dark:fill-[#60A5FA]/10"
          />
          {/* Stroke 1: Primary Grounding Base Contour */}
          <path
            d="M0,52 C240,82 580,22 920,68 C1160,84 1320,46 1440,58"
            className="auth-wave-stroke-main stroke-black/20 dark:stroke-white/15"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Stroke 2: Secondary Contour */}
          <path
            d="M0,74 C280,34 640,88 1020,42 C1220,28 1360,64 1440,48"
            className="auth-wave-bot-stroke2 stroke-[#059669]/30 dark:stroke-[#2DD4BF]/30"
            strokeWidth="1.75"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

export const AuthWaveBackground = LoginWaveBackground;

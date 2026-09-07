"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 8;
    return {
        x: Math.random() * width * 1.4 - width * 0.2,
        y: Math.random() * height * 1.4 - height * 0.2,
        width: 40 + Math.random() * 50,
        length: height * 2,
        angle: angle,
        speed: 0.5 + Math.random() * 0.8,
        opacity: 0.12 + Math.random() * 0.14,
        hue: 190 + Math.random() * 65,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
    };
}

export function BeamsBackground({
    className,
    children,
    intensity = "strong",
}: AnimatedGradientBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const TOTAL_BEAMS = 14;

    const opacityMap = {
        subtle: 0.65,
        medium: 0.8,
        strong: 1,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const updateCanvasSize = () => {
            // Cap DPR at 1.5 to guarantee ultra-fast rendering on 4K/Retina displays
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = window.innerWidth;
            const h = window.innerHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.scale(dpr, dpr);

            beamsRef.current = Array.from({ length: TOTAL_BEAMS }, () =>
                createBeam(w, h)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize, { passive: true });

        function resetBeam(beam: Beam, index: number) {
            if (!canvas) return beam;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const column = index % 3;
            const spacing = w / 3;

            beam.y = h + 80;
            beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 60 + Math.random() * 60;
            beam.speed = 0.4 + Math.random() * 0.5;
            beam.hue = 190 + (index * 60) / TOTAL_BEAMS;
            beam.opacity = 0.14 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.85 + Math.sin(beam.pulse) * 0.15) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 60%, 0)`);
            gradient.addColorStop(0.2, `hsla(${beam.hue}, 85%, 60%, ${pulsingOpacity * 0.6})`);
            gradient.addColorStop(0.5, `hsla(${beam.hue}, 85%, 60%, ${pulsingOpacity})`);
            gradient.addColorStop(0.8, `hsla(${beam.hue}, 85%, 60%, ${pulsingOpacity * 0.6})`);
            gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 60%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            const beams = beamsRef.current;
            for (let i = 0; i < beams.length; i++) {
                const beam = beams[i];
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -60) {
                    resetBeam(beam, i);
                }

                drawBeam(ctx, beam);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div
            className={cn(
                "relative min-h-screen w-full overflow-x-hidden bg-[#0B0F14] text-white transition-colors duration-200",
                className
            )}
        >
            {/* GPU-accelerated CSS blur canvas (0% CPU overhead) */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0 h-full w-full opacity-80 transform-gpu"
                style={{ filter: "blur(24px)", transform: "translateZ(0)" }}
            />

            <div className="relative z-10 flex min-h-screen w-full items-center justify-center transform-gpu">
                {children}
            </div>
        </div>
    );
}

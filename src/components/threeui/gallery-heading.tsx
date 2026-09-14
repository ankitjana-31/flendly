"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface GalleryHeadingProps {
  variant?: "rising-diagonal";
  className?: string;
  headline?: {
    line1: string;
    line2: string;
  };
}

/**
 * ThreeUI GalleryHeading component - Canvas 2D ring animation with rising-diagonal variant.
 * Extracted from https://threeui.com/source-code/gallery-heading.json
 *
 * Design frame: 2962 x 2160px
 * Animation loop: 15.015 seconds (seamless)
 * Ring tiles: 12 with 11 unique procedural artwork layers
 */
export function GalleryHeading({
  variant = "rising-diagonal",
  className = "",
  headline = {
    line1: "NEW GRAINIENT",
    line2: "COLLECTION ADDED",
  },
}: GalleryHeadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Design constants
    const DW = 2962,
      DH = 2160,
      DASP = DW / DH;

    // Ring parameters (rising-diagonal variant)
    const RING = {
      cx: 1484, // projected ring centre
      cy: 1108,
      a: 712, // semi-major axis
      ratio: 0.492, // semi-minor / semi-major (plane tilt 60.5deg)
      axis: 25.5, // screen angle of major axis
      n: 12, // tiles
      tile: 346, // tile side in ring units
      radius: 0.22, // corner radius fraction
      dist: 13, // camera distance in ring radii
      phase: 93, // psi of tile 0 at t=0
    };

    const DUR = 15.015; // one full revolution = seamless loop
    const SANS = '"Helvetica Neue",Helvetica,"Inter",Arial,system-ui,sans-serif';

    // Deterministic noise for grain
    function rng(seed: number) {
      let s = seed >>> 0;
      return function (): number {
        s ^= s << 13;
        s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5;
        s >>>= 0;
        return s / 4294967296;
      };
    }

    // Create canvas element
    function mkc(w: number, h: number) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    }

    // Film grain tile
    const TS = 512;
    const grainTile = (() => {
      const c = mkc(160, 160);
      const x = c.getContext("2d")!;
      const d = x.createImageData(160, 160);
      const r = rng(0x51f3);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = 128 + (r() - 0.5) * 116;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      return c;
    })();

    // Gradient helpers
    function lin(
      x: CanvasRenderingContext2D,
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      stops: [number, string][]
    ) {
      const g = x.createLinearGradient(x0 * TS, y0 * TS, x1 * TS, y1 * TS);
      stops.forEach(([offset, color]) => g.addColorStop(offset, color));
      return g;
    }

    function rad(
      x: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      stops: [number, string][],
      r0?: number
    ) {
      const g = x.createRadialGradient(
        cx * TS,
        cy * TS,
        (r0 || 0) * TS,
        cx * TS,
        cy * TS,
        r * TS
      );
      stops.forEach(([offset, color]) => g.addColorStop(offset, color));
      return g;
    }

    function fill(x: CanvasRenderingContext2D, style: string | CanvasGradient) {
      x.fillStyle = style;
      x.fillRect(0, 0, TS, TS);
    }

    // Soft blurred stroke
    function band(
      x: CanvasRenderingContext2D,
      pts: number[][],
      color: string,
      width: number,
      blur: number,
      passes?: number
    ) {
      x.save();
      x.translate(-2 * TS, 0);
      x.shadowOffsetX = 2 * TS;
      x.shadowBlur = blur * TS;
      x.shadowColor = color;
      x.strokeStyle = color;
      x.lineWidth = width * TS;
      x.lineCap = "round";
      x.lineJoin = "round";
      x.beginPath();
      x.moveTo(pts[0][0] * TS, pts[0][1] * TS);
      for (let i = 1; i < pts.length - 1; i += 2) {
        x.quadraticCurveTo(
          pts[i][0] * TS,
          pts[i][1] * TS,
          pts[i + 1][0] * TS,
          pts[i + 1][1] * TS
        );
      }
      for (let p = 0; p < (passes || 1); p++) x.stroke();
      x.restore();
    }

    function glow(
      x: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      color: string,
      mode?: GlobalCompositeOperation
    ) {
      x.save();
      x.globalCompositeOperation = mode || "lighter";
      x.fillStyle = rad(x, cx, cy, r, [
        [0, color],
        [1, "rgba(0,0,0,0)"],
      ]);
      x.fillRect(0, 0, TS, TS);
      x.restore();
    }

    // Wavy spine
    function spine(y0: number, amp: number, ph: number, tilt: number) {
      const p: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const u = -0.12 + i * 0.31;
        p.push([u, y0 + amp * Math.sin(ph + u * 4.2) + tilt * u]);
      }
      return p;
    }

    // Wavy edge
    function wavy(
      x: CanvasRenderingContext2D,
      y0: number,
      ph: number,
      amp: number,
      freq: number,
      tilt?: number
    ) {
      x.beginPath();
      for (let i = 0; i <= 10; i++) {
        const u = -0.12 + i * 0.124;
        const y = y0 + amp * Math.sin(ph + u * freq) + (tilt || 0) * u;
        if (i === 0) x.moveTo(u * TS, y * TS);
        else x.lineTo(u * TS, y * TS);
      }
    }

    function wavyStroke(
      x: CanvasRenderingContext2D,
      y0: number,
      ph: number,
      amp: number,
      freq: number,
      tilt: number,
      color: string,
      w: number,
      blur: number
    ) {
      x.save();
      x.translate(-2 * TS, 0);
      x.shadowOffsetX = 2 * TS;
      x.shadowBlur = blur * TS;
      x.shadowColor = color;
      x.strokeStyle = color;
      x.lineWidth = w * TS;
      x.lineCap = "round";
      wavy(x, y0, ph, amp, freq, tilt);
      x.stroke();
      x.stroke();
      x.restore();
    }

    // Folded chrome sheet
    function chrome(
      x: CanvasRenderingContext2D,
      y0: number,
      h: number,
      ph: number,
      amp: number,
      freq: number,
      tilt: number,
      hot?: string
    ) {
      // Shadow
      x.save();
      x.translate(-2 * TS, 0);
      x.shadowOffsetX = 2 * TS;
      x.shadowBlur = 0.06 * TS;
      x.shadowColor = "rgba(132,12,0,0.9)";
      x.fillStyle = "#000";
      // bandPath simulation - draw filled path
      x.beginPath();
      for (let i = 0; i <= 10; i++) {
        const u = -0.12 + i * 0.124;
        x.lineTo(u * TS, (y0 - 0.018 + amp * 0.62 * Math.sin(ph + 1.9 + u * freq * 0.86) + tilt * u) * TS);
      }
      for (let i = 10; i >= 0; i--) {
        const u = -0.12 + i * 0.124;
        x.lineTo(u * TS, (y0 + h + 0.036 + amp * 0.62 * Math.sin(ph + 1.9 + u * freq * 0.86) + tilt * u) * TS);
      }
      x.closePath();
      x.fill();
      x.fill();
      x.restore();

      // Chrome gradient fill
      x.save();
      x.beginPath();
      for (let i = 0; i <= 10; i++) {
        const u = -0.12 + i * 0.124;
        x.lineTo(u * TS, (y0 + amp * Math.sin(ph + u * freq) + tilt * u) * TS);
      }
      for (let i = 10; i >= 0; i--) {
        const u = -0.12 + i * 0.124;
        x.lineTo(
          u * TS,
          (y0 + h + amp * 0.62 * Math.sin(ph + 1.9 + u * freq * 0.86) + tilt * u) * TS
        );
      }
      x.closePath();
      x.clip();

      const g = x.createLinearGradient(0, (y0 - 0.03) * TS, 0, (y0 + h + 0.03) * TS);
      g.addColorStop(0, "rgba(8,0,2,1)");
      g.addColorStop(0.12, "rgba(58,2,6,1)");
      g.addColorStop(0.3, "rgba(146,10,8,1)");
      g.addColorStop(0.43, "rgba(220,42,16,1)");
      g.addColorStop(0.49, hot || "rgba(255,206,132,1)");
      g.addColorStop(0.56, "rgba(206,28,12,1)");
      g.addColorStop(0.72, "rgba(90,4,6,1)");
      g.addColorStop(0.88, "rgba(26,0,4,1)");
      g.addColorStop(1, "rgba(5,0,2,1)");
      x.fillStyle = g;
      x.fillRect(0, 0, TS, TS);
      x.restore();

      // Highlights
      wavyStroke(
        x,
        y0 + 0.004,
        ph,
        amp,
        freq,
        tilt,
        "rgba(255,238,214,0.55)",
        0.005,
        0.004
      );
      wavyStroke(
        x,
        y0 + h - 0.006,
        ph + 1.9,
        amp * 0.62,
        freq * 0.86,
        tilt,
        "rgba(40,220,200,0.42)",
        0.008,
        0.009
      );
      wavyStroke(
        x,
        y0 + h + 0.012,
        ph + 1.9,
        amp * 0.62,
        freq * 0.86,
        tilt,
        "rgba(170,230,80,0.28)",
        0.006,
        0.008
      );
    }

    // Shadow overlay
    function shade(
      x: CanvasRenderingContext2D,
      x0: number,
      x1: number,
      strength: number
    ) {
      x.save();
      const g = x.createLinearGradient(x0 * TS, 0, x1 * TS, 0);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.55, `rgba(0,0,0,${(strength * 0.7).toFixed(2)})`);
      g.addColorStop(1, `rgba(0,0,0,${strength.toFixed(2)})`);
      x.fillStyle = g;
      x.fillRect(0, 0, TS, TS);
      x.restore();
    }

    // Tile artwork layers (11 variants)
    const ART = [
      // 0 — violet field
      (x: CanvasRenderingContext2D) => {
        fill(
          x,
          rad(x, 0.5, 0.48, 0.82, [
            [0, "#020105"],
            [0.3, "#030106"],
            [0.37, "#1d0a48"],
            [0.46, "#4f2c94"],
            [0.54, "#38167e"],
            [0.66, "#22084e"],
            [0.86, "#0a0218"],
            [1, "#04010a"],
          ])
        );
        glow(x, 0.3, 0.24, 0.4, "rgba(96,66,180,0.4)");
        glow(x, 0.76, 0.8, 0.3, "rgba(52,18,110,0.35)");
      },
      // 1 — white silk
      (x: CanvasRenderingContext2D) => {
        fill(x, "#fbf9fb");
        band(
          x,
          spine(0.52, 0.09, 0.6, -0.18),
          "rgba(236,44,140,0.92)",
          0.19,
          0.055,
          2
        );
        band(
          x,
          spine(0.66, 0.07, 2.2, -0.14),
          "rgba(255,96,26,0.9)",
          0.16,
          0.05,
          2
        );
        band(
          x,
          spine(0.4, 0.06, 3.4, -0.1),
          "rgba(70,120,255,0.55)",
          0.09,
          0.05,
          1
        );
        band(
          x,
          spine(0.58, 0.08, 1.2, -0.16),
          "rgba(255,255,255,0.9)",
          0.05,
          0.03,
          2
        );
        band(
          x,
          spine(0.86, 0.05, 0.2, -0.05),
          "rgba(150,40,200,0.5)",
          0.1,
          0.06,
          1
        );
        glow(x, 0.22, 0.14, 0.46, "rgba(255,255,255,0.85)");
      },
      // 2 — deep blue
      (x: CanvasRenderingContext2D) => {
        fill(
          x,
          lin(x, 0.98, 0, 0.06, 1, [
            [0, "#01020e"],
            [0.3, "#03082e"],
            [0.56, "#0820c4"],
            [0.76, "#1a4dff"],
            [0.95, "#7ea8ff"],
            [1, "#b6ccff"],
          ])
        );
        glow(x, 0.2, 0.86, 0.3, "rgba(176,206,255,0.8)");
        glow(x, 0.06, 0.98, 0.22, "rgba(226,120,220,0.55)");
        glow(x, 0.92, 0.06, 0.44, "rgba(0,0,8,0.75)", "source-over");
      },
      // 3 — pale blue horizon
      (x: CanvasRenderingContext2D) => {
        fill(
          x,
          lin(x, 0.08, 0, 0, 1, [
            [0, "#9dbccd"],
            [0.14, "#5b87ad"],
            [0.26, "#245693"],
            [0.36, "#7793a8"],
            [0.45, "#e2523a"],
            [0.52, "#e07a5e"],
            [0.58, "#82aec8"],
            [0.68, "#2467a8"],
            [0.8, "#0e3970"],
            [0.92, "#081c40"],
            [1, "#051026"],
          ])
        );
        band(
          x,
          spine(0.42, 0.02, 1.0, 0.03),
          "rgba(240,140,105,0.45)",
          0.05,
          0.03,
          1
        );
        band(
          x,
          spine(0.63, 0.02, 2.4, -0.03),
          "rgba(150,200,235,0.4)",
          0.05,
          0.03,
          1
        );
      },
      // 4 — navy
      (x: CanvasRenderingContext2D) => {
        fill(
          x,
          lin(x, 0.88, 0.04, 0.14, 0.96, [
            [0, "#010103"],
            [0.34, "#030316"],
            [0.58, "#0d066a"],
            [0.78, "#2a10b8"],
            [0.93, "#5a38e0"],
            [1, "#8464f4"],
          ])
        );
        glow(x, 0.14, 0.92, 0.3, "rgba(110,86,210,0.55)");
        glow(x, 0.9, 0.08, 0.42, "rgba(0,0,4,0.75)", "source-over");
      },
      // 5 — dark red-brown
      (x: CanvasRenderingContext2D) => {
        fill(x, "#020104");
        band(
          x,
          spine(0.46, 0.07, 1.4, -0.1),
          "rgba(88,30,18,0.7)",
          0.24,
          0.13,
          2
        );
        band(
          x,
          spine(0.44, 0.07, 1.4, -0.1),
          "rgba(168,64,36,0.45)",
          0.08,
          0.07,
          1
        );
        glow(x, 0.16, 0.2, 0.32, "rgba(20,30,64,0.35)");
        glow(x, 0.9, 0.88, 0.22, "rgba(70,64,110,0.3)");
      },
      // 6 — pale silk lavender
      (x: CanvasRenderingContext2D) => {
        fill(x, "#e3dcec");
        band(
          x,
          spine(0.42, 0.1, 2.6, 0.16),
          "rgba(132,58,220,0.9)",
          0.18,
          0.055,
          2
        );
        band(
          x,
          spine(0.6, 0.09, 1.1, 0.2),
          "rgba(240,104,20,0.92)",
          0.16,
          0.05,
          2
        );
        band(
          x,
          spine(0.5, 0.09, 2.0, 0.18),
          "rgba(245,40,140,0.65)",
          0.1,
          0.045,
          1
        );
        band(
          x,
          spine(0.55, 0.09, 1.6, 0.18),
          "rgba(255,255,255,0.8)",
          0.04,
          0.03,
          2
        );
        glow(x, 0.82, 0.94, 0.36, "rgba(255,255,255,0.7)");
        glow(x, 0.08, 0.08, 0.26, "rgba(60,40,110,0.4)", "source-over");
      },
      // 7 — amber corner
      (x: CanvasRenderingContext2D) => {
        fill(x, "#12030a");
        glow(x, 0.02, 0.04, 0.42, "rgba(255,142,36,0.85)");
        glow(x, 0.5, 0.5, 0.62, "rgba(178,26,14,0.8)");
        chrome(x, 0.18, 0.58, 1.1, 0.07, 4.2, -0.1, "rgba(255,216,158,1)");
        shade(x, 0.55, 1.2, 0.45);
        glow(x, 0.94, 0.94, 0.3, "rgba(60,14,96,0.45)");
      },
      // 8 — red chrome
      (x: CanvasRenderingContext2D) => {
        fill(x, "#040103");
        glow(x, 0.4, 0.46, 0.5, "rgba(48,14,10,0.8)");
        chrome(x, 0.3, 0.44, 2.4, 0.06, 4.8, 0.1, "rgba(255,190,110,1)");
        shade(x, 0.3, 1.15, 0.72);
        band(
          x,
          spine(0.9, 0.05, 0.4, 0.1),
          "rgba(70,16,110,0.45)",
          0.12,
          0.08,
          1
        );
      },
      // 9 — dark navy
      (x: CanvasRenderingContext2D) => {
        fill(
          x,
          lin(x, 0.4, 0, 0.6, 1, [
            [0, "#03040e"],
            [0.42, "#060a22"],
            [0.72, "#070412"],
            [1, "#030106"],
          ])
        );
        glow(x, 0.28, 0.14, 0.42, "rgba(18,32,84,0.55)");
        chrome(x, 0.6, 0.3, 0.9, 0.05, 3.8, -0.08, "rgba(255,198,120,1)");
        shade(x, 0.3, 1.1, 0.8);
      },
      // 10 — chrome + blue-pink
      (x: CanvasRenderingContext2D) => {
        fill(x, "#050208");
        chrome(x, 0.02, 0.34, 2.0, 0.045, 4.4, -0.07, "rgba(255,206,132,1)");
        shade(x, 0.45, 1.1, 0.7);
        x.save();
        x.beginPath();
        x.moveTo(0, TS * 0.72);
        x.lineTo(TS, TS * 0.56);
        x.lineTo(TS, TS);
        x.lineTo(0, TS);
        x.closePath();
        x.clip();
        fill(
          x,
          lin(x, 0, 0.5, 0.4, 1, [
            [0, "#cfd6dc"],
            [0.6, "#e8eaee"],
            [1, "#f4f5f7"],
          ])
        );
        band(
          x,
          spine(0.7, 0.03, 1.0, -0.1),
          "rgba(245,44,96,0.8)",
          0.055,
          0.03,
          2
        );
        band(
          x,
          spine(0.76, 0.03, 1.6, -0.1),
          "rgba(30,146,245,0.75)",
          0.045,
          0.026,
          2
        );
        band(
          x,
          spine(0.82, 0.03, 2.2, -0.08),
          "rgba(245,130,54,0.5)",
          0.035,
          0.026,
          1
        );
        x.restore();
      },
      // 11 — pale plate
      (x: CanvasRenderingContext2D) => {
        fill(x, "#08050a");
        for (let i = 0; i < 9; i++) {
          const y0 = 0.06 + i * 0.045;
          const a = 0.8 - i * 0.06;
          band(
            x,
            spine(y0, 0.02, 0.4 + i * 0.5, -0.2),
            `rgba(${250 - i * 3},${30 + i * 15},${80 + i * 5},${a.toFixed(2)})`,
            0.032,
            0.018,
            2
          );
        }
        band(
          x,
          spine(0.28, 0.02, 1.2, -0.18),
          "rgba(255,120,72,0.55)",
          0.05,
          0.035,
          1
        );
        band(
          x,
          spine(0.14, 0.02, 2.4, -0.2),
          "rgba(120,190,255,0.4)",
          0.03,
          0.02,
          1
        );
        x.save();
        x.beginPath();
        x.moveTo(0, TS * 0.72);
        x.lineTo(TS, TS * 0.4);
        x.lineTo(TS, TS);
        x.lineTo(0, TS);
        x.closePath();
        x.clip();
        fill(
          x,
          lin(x, 0.1, 0.4, 0.6, 1, [
            [0, "#c6c7cd"],
            [0.5, "#e2e2e6"],
            [1, "#f2f2f4"],
          ])
        );
        x.restore();
      },
    ];

    function buildTextures() {
      const front = [];
      const back = [];
      for (let i = 0; i < ART.length; i++) {
        const c = mkc(TS, TS);
        const x = c.getContext("2d")!;
        ART[i](x);

        // Film grain
        x.save();
        x.globalCompositeOperation = "overlay";
        x.globalAlpha = 0.15;
        const p = x.createPattern(grainTile, "repeat");
        if (p) {
          x.fillStyle = p;
          x.fillRect(0, 0, TS, TS);
        }
        x.restore();
        front.push(c);

        // Reverse side
        const d = mkc(TS, TS);
        const y = d.getContext("2d")!;
        y.drawImage(c, 0, 0);
        y.globalCompositeOperation = "saturation";
        y.fillStyle = "rgba(128,128,128,0.2)";
        y.fillRect(0, 0, TS, TS);
        y.globalCompositeOperation = "multiply";
        y.fillStyle = "rgba(6,8,18,0.75)";
        y.fillRect(0, 0, TS, TS);
        back.push(d);
      }
      return { front, back };
    }

    const TEX = buildTextures();

    // Ring geometry
    const ax = (RING.axis * Math.PI) / 180;
    const cf = RING.ratio;
    const sf = Math.sqrt(1 - cf * cf);
    const U = [Math.cos(ax), Math.sin(ax), 0];
    const V = [-Math.sin(ax) * cf, Math.cos(ax) * cf, sf];
    const AXIS = [
      U[1] * V[2] - U[2] * V[1],
      U[2] * V[0] - U[0] * V[2],
      U[0] * V[1] - U[1] * V[0],
    ];

    // Canvas layout
    let W = 0,
      H = 0,
      K = 1,
      OX = 0,
      OY = 0;
    let headLayer: HTMLCanvasElement | null = null;
    let labelLayer: HTMLCanvasElement | null = null;

    function d2sx(x: number) {
      return OX + x * K;
    }
    function d2sy(y: number) {
      return OY + y * K;
    }

    function fitText(
      x: CanvasRenderingContext2D,
      str: string,
      font: string,
      weight: string,
      cap: number,
      cx: number,
      capTop: number,
      targetW: number,
      color: string,
      align?: string
    ) {
      const probe = 100;
      x.font = weight + " " + probe + "px " + font;
      const m = x.measureText("H");
      const capUnit = (m.actualBoundingBoxAscent || 71) / probe;
      const size = cap / capUnit;
      x.font = weight + " " + size + "px " + font;
      const mm = x.measureText(str);
      const inkW = (mm.actualBoundingBoxRight || mm.width) + (mm.actualBoundingBoxLeft || 0);
      const sx = targetW ? targetW / inkW : 1;
      x.save();
      x.fillStyle = color;
      x.textBaseline = "alphabetic";
      x.translate(cx, capTop + cap);
      x.scale(sx, 1);
      x.textAlign = (align || "center") as CanvasTextAlign;
      const left = mm.actualBoundingBoxLeft || 0;
      x.fillText(str, align === "left" ? left : 0, 0);
      x.restore();
      return inkW * sx;
    }

    function buildHead() {
      headLayer = mkc(Math.max(1, W), Math.max(1, H));
      const x = headLayer.getContext("2d")!;
      const CAP = 142;
      const headData = [
        { s: headline.line1, top: 930, w: 1370, fill: "#d0d0d0" },
        { s: headline.line2, top: 1114, w: 1775, fill: "#ffffff" },
      ];
      for (let i = 0; i < headData.length; i++) {
        const h = headData[i];
        fitText(x, h.s, SANS, "700", CAP * K, d2sx(1481), d2sy(h.top), h.w * K, h.fill);
      }
    }

    function buildLabels() {
      labelLayer = mkc(Math.max(1, W), Math.max(1, H));
      const x = labelLayer.getContext("2d")!;
      const SMALL = 22;
      const cap = SMALL * K;
      const dim = "#b0b0b0";
      const pad = 88 * K;

      x.save();
      x.fillStyle = dim;
      x.textBaseline = "alphabetic";
      x.textAlign = "left";
      const f = "400 " + cap / 0.717 + "px " + SANS;
      x.font = f;
      x.fillText("VOID BLUE   /   GRADIENT STRIPS   /   RED AURA", pad, pad + cap);
      x.fillText("2026", pad, H - pad);
      x.textAlign = "right";
      x.fillText("GRAINIENT.SUPPLY", W - pad, H - pad);
      x.restore();

      const pitch = 33 * K;
      const L = ["(50+) Gradients", "Backgrounds", "Added,"];
      for (let i = 0; i < L.length; i++) {
        fitText(x, L[i], SANS, "500", cap, d2sx(344), d2sy(1148) + i * pitch, 0, "#ffffff", "left");
      }
      const Rt = ["Gradients &", "AI-Generated", "Backgrounds"];
      for (let j = 0; j < Rt.length; j++) {
        fitText(
          x,
          Rt[j],
          SANS,
          "500",
          cap,
          d2sx(2310),
          d2sy(932) + j * 32.5 * K,
          0,
          "#ffffff",
          "left"
        );
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(window.innerWidth * dpr);
      H = Math.round(window.innerHeight * dpr);
      canvas!.width = W;
      canvas!.height = H;
      const S = Math.min(W, H * DASP);
      K = S / DW;
      OX = (W - DW * K) / 2;
      OY = (H - DH * K) / 2;
      buildHead();
      buildLabels();
    }

    function project(p: number[]) {
      const k = (RING.a * K * RING.dist) / (RING.dist - p[2]);
      return [d2sx(RING.cx) + k * p[0], d2sy(RING.cy) + k * p[1], k];
    }

    function drawTile(i: number, psi: number) {
      const c = Math.cos(psi);
      const s = Math.sin(psi);
      const C = [c * U[0] + s * V[0], c * U[1] + s * V[1], c * U[2] + s * V[2]];
      const T = [-s * U[0] + c * V[0], -s * U[1] + c * V[1], -s * U[2] + c * V[2]];
      const h = RING.tile / (2 * RING.a);
      const p0 = project(C);
      const pT = project([C[0] + T[0] * h, C[1] + T[1] * h, C[2] + T[2] * h]);
      const pA = project([C[0] + AXIS[0] * h, C[1] + AXIS[1] * h, C[2] + AXIS[2] * h]);
      const ex = pT[0] - p0[0];
      const ey = pT[1] - p0[1];
      const fx = pA[0] - p0[0];
      const fy = pA[1] - p0[1];
      if (Math.abs(ex * fy - ey * fx) < 0.4) return;

      const facing = C[2] > 0;
      const img = (facing ? TEX.front : TEX.back)[i % TEX.front.length];
      ctx!.save();
      ctx!.setTransform(ex * (2 / TS), ey * (2 / TS), fx * (2 / TS), fy * (2 / TS), p0[0], p0[1]);
      ctx!.beginPath();
      ctx!.moveTo(-TS / 2 + TS * RING.radius, -TS / 2);
      ctx!.lineTo(TS / 2 - TS * RING.radius, -TS / 2);
      ctx!.quadraticCurveTo(TS / 2, -TS / 2, TS / 2, -TS / 2 + TS * RING.radius);
      ctx!.lineTo(TS / 2, TS / 2 - TS * RING.radius);
      ctx!.quadraticCurveTo(TS / 2, TS / 2, TS / 2 - TS * RING.radius, TS / 2);
      ctx!.lineTo(-TS / 2 + TS * RING.radius, TS / 2);
      ctx!.quadraticCurveTo(-TS / 2, TS / 2, -TS / 2, TS / 2 - TS * RING.radius);
      ctx!.lineTo(-TS / 2, -TS / 2 + TS * RING.radius);
      ctx!.quadraticCurveTo(-TS / 2, -TS / 2, -TS / 2 + TS * RING.radius, -TS / 2);
      ctx!.closePath();
      ctx!.clip();
      ctx!.drawImage(img, -TS / 2, -TS / 2, TS, TS);
      ctx!.restore();
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
    }

    function render(t: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, W, H);
      ctx!.imageSmoothingQuality = "high";

      const spin = (t / DUR) * Math.PI * 2;
      const list: { i: number; psi: number; z: number }[] = [];
      for (let i = 0; i < RING.n; i++) {
        const psi = (RING.phase * Math.PI) / 180 - (i * 2 * Math.PI) / RING.n + spin;
        const c = Math.cos(psi);
        const s = Math.sin(psi);
        list.push({ i, psi, z: c * U[2] + s * V[2] });
      }
      list.sort((a, b) => a.z - b.z);

      let drawnText = false;
      for (let i = 0; i < list.length; i++) {
        if (!drawnText && list[i].z > 0 && headLayer) {
          ctx!.drawImage(headLayer, 0, 0);
          drawnText = true;
        }
        drawTile(list[i].i, list[i].psi);
      }
      if (!drawnText && headLayer) ctx!.drawImage(headLayer, 0, 0);
      if (labelLayer) ctx!.drawImage(labelLayer, 0, 0);
    }

    // Animation loop
    let t0 = performance.now();
    let tNow = 0;
    let playing = true;

    function frame(now: number) {
      if (playing) {
        tNow = ((now - t0) / 1000) % DUR;
        render(tNow);
      }
      animationRef.current = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", () => {
      resize();
      render(tNow);
    });

    resize();
    setIsReady(true);
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", () => {
        resize();
        render(tNow);
      });
    };
  }, [headline]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className={`relative w-full overflow-hidden bg-black ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: "block", touchAction: "none" }}
      />
    </motion.div>
  );
}

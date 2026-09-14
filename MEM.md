# MEM.md — Project Activity & Recent Changes Log

## Current Version: v2.4 (Stitch Neo-Brutalist Retro OS Overhaul)

### Recent Fixes & Feature Implementations:

1. **Complete User Profile Retro Overhaul**:
   - Upgraded /complete-profile and /preview/complete-profile to the full Stitch Retro OS design with RetroWindow, ambient geometric grid, ThemeToggle, and CursorGlow.
   - Updated UsernameForm with neo-brutalist inputs, hard shadows, monospace typography, and responsive validation feedback.

2. **Static Retro Window Controls**:
   - Converted the _, □, and ✕ window buttons in RetroWindow to clean, static decorative window headers, removing disruptive click collapse/close actions.

3. **Top Bar Profile & Sign Out Accessibility**:
   - Added sticky top header on desktop with session status, notifications alert pill, theme toggle, profile handle pill (@{username}), and direct Sign Out button.
   - Enhanced mobile header with FLENDLY logo, theme toggle, notifications badge, quick profile link, and one-tap sign out icon.

4. **Mobile Viewport & Zoom Optimization**:
   - Added explicit responsive Viewport metadata in src/app/layout.tsx (width: device-width, initialScale: 1).
   - Replaced fixed min-widths in preview section with w-full sm:w-auto sm:min-w-[180px] to eliminate horizontal overflow on small mobile viewports.

5. **Landing & Learn More Footer**:
   - Added standardized footer with FLENDLY, all rights reserved under NEXCHARIS, 2026. to landing and learn-more pages.

6. **Storytelling Names**:
   - Updated mock and showcase names across the Learn More section to **Rajarshi**, **Rahul**, and **Ayush**.

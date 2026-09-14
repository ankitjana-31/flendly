# MEM.md — Project Activity & Recent Changes Log

## Current Version: v2.4 (Stitch Neo-Brutalist Retro OS Overhaul)

### Recent Fixes & Feature Implementations:

1. **Brand Identity Normalization**:
   - Standardized application naming to **FLENDLY** across all components (removed FLENDLY OS and .exe/.sys suffixes).

2. **Typography & Heading Cleanup**:
   - Removed ugly underscore characters (_) from all headings and titles (e.g. SYSTEM_AUDIT -> SYSTEM AUDIT, DIFF_VIEW -> COMPARISON VIEW, AUTH_LOGIN.sys -> FLENDLY // AUTHENTICATION, SETTINGS.exe -> SETTINGS // PREFERENCES, etc.).
   - Replaced placeholder names throughout landing, demo mocks, and input fields with realistic names: **Supriya**, **Junaid**, **Rahul**.
   - Increased font sizes and contrast for enhanced legibility across desktop and mobile screens.

3. **Layout Spacing & Mobile Viewport Polish**:
   - Fixed side spacing across all authenticated pages (dashboard, self-track, equests, lent, orrowed, 
otifications) using responsive containers (max-w-6xl, balanced padding px-4 sm:px-6 md:px-8).
   - Fixed mobile layout bug in the Self Track private ledger where the record cards overlapped under the sticky creation card. Changed sticky position from mobile sticky to desktop lg:sticky lg:top-20 with clean z-indexing.

4. **Interactive Window Controls**:
   - Upgraded RetroWindow into a fully stateful client component supporting interactive minimize (_), maximize (□), and close/reopen (✕) controls with hover transitions.

5. **Theme Support**:
   - Light mode default background set to crisp retro warm cream/white (#FAF8F5) while respecting system device dark mode and user toggles.
   - Reactive cursor glow animation (CursorGlow) styled to illuminate gracefully in both light and dark modes.

6. **Self Track Ledger Synchronization**:
   - Fixed query hydration on Dashboard so personal offline tracks and calculations (lent/borrowed amounts) update immediately in parallel.

7. **Documentation**:
   - Created CONTEXT.md for full project architecture and workflow reference for future agents and developers.
   - Created MEM.md for tracking recent change history.

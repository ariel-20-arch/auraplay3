# AURA STREAM — 8D Spatial Audio, DJ Engine, Neon Theme Switcher & AURA Stats

Comprehensive implementation plan to expand AURA STREAM with 4 major capabilities: 360° 8D Spatial Audio, DJ Performance Engine (auto-crossfade and speed/pitch modes like Nightcore & Vaporwave), a Quick-Color Orb Theme Switcher in the top navigation bar, and an AURA Stats live listening dashboard.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Clarification Interview:**
> - **Audio 8D Espacial**: Web Audio API `StereoPannerNode` with orbital sinusoidal LFO rotating stereo pan from left to right (-1.0 to +1.0) with adjustable orbital speed and active orbit animation indicator.
> - **DJ Engine & Transiciones**: Floating quick-action toggles in the bottom player dock with automatic crossfade (0s, 3s, 6s, 9s) and playback speed presets: Normal (1.0x), Nightcore (1.25x), Vaporwave / Slowed (0.85x), and Fast Run (1.5x).
> - **Selector de Acento Neón**: Color orb switcher in Zone 2/3 of the TopBar featuring 4 neon aesthetics: Phosphor Orange (`#ff5500`), Tokyo Cyber Cyan (`#00f2ff`), Acid Green Otaku (`#39ff14`), and Synthwave Sunset Magenta (`#ff007f`), updating CSS variables dynamically across all components, canvas visualizers, and borders.
> - **AURA Stats Dashboard**: Interactive analytics view showing session listening time, total tracks completed, dominant genre chart, and accumulated BPM energy counter.

---

## 1. Overview & Core Concept

- **What It Adds**:
  1. **360° 8D Spatial Audio**: Immerses listeners using headphone binaural panning that continuously orbits sound around the head.
  2. **DJ Crossfade & Speed Modes**: Seamless gapless track transitions plus one-touch tempo/pitch transformations.
  3. **Theme Color Customization**: Instant visual mood switching with persistent CSS variable retheming.
  4. **Listening Telemetry**: Real-time stats dashboard tracking user playback habits, favorites breakdown, and session energy.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **8D Spatial Audio Mode**:
   - Listener clicks the **8D** pill toggle in the bottom player bar.
   - An orbital panner activates: audio begins sweeping gently between ears at 0.1 Hz to 0.25 Hz.
   - A pulsing circular orbit indicator appears on the bottom dock showing the live virtual sound position.
2. **DJ Engine (Crossfade & Speed)**:
   - Listener clicks the **DJ** toggle on the player dock.
   - A sleek floating popover opens with:
     - Crossfade duration slider (0s to 10s).
     - Speed presets: Normal (1.0x), Nightcore (1.25x), Vaporwave / Slowed (0.85x), Hyper (1.5x).
     - Active speed badge displayed right on the player dock.
3. **Neon Theme Orb Switcher**:
   - Listener clicks any of the 4 color orbs in the TopBar:
     - 🟠 Orange Neon (`#ff5500`)
     - 🔵 Cyan Neon (`#00f2ff`)
     - 🟢 Acid Green (`#39ff14`)
     - 🟣 Sunset Magenta (`#ff007f`)
   - The entire platform smoothly transitions its glowing shadows, borders, canvas visualizer colors, and buttons to the chosen neon tone.
4. **AURA Stats Modal / View**:
   - Listener clicks the "Estadísticas" tab or button.
   - Displays:
     - Total minutes listened in session.
     - Songs played counter.
     - Favorite genre distribution bar.
     - Average session BPM.

---

## 3. Technical Architecture & Audio Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPANDED AUDIO PIPELINE                         │
│                                                                        │
│   HTML5 Audio (with playbackRate support: 0.85x - 1.5x)               │
│                        │                                               │
│                        ▼                                               │
│             [ 5-Band Biquad Equalizer Chain ]                         │
│                        │                                               │
│                        ▼                                               │
│             [ Web Audio StereoPannerNode ] (8D Audio LFO)              │
│                        │                                               │
│                        ▼                                               │
│         [ Crossfade GainNode ] ──► [ AnalyserNode ]                    │
│                                         │                              │
│                                         ▼                              │
│                           [ Destination / Speakers ]                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Components to Create / Update:
1. `src/types/music.ts`:
   - Add `ThemeColor` ('orange' | 'cyan' | 'green' | 'magenta'), `DJSettings`, `AudioStats`.
2. `src/components/DJControlsPopover.tsx`:
   - Floating popover for Crossfade (0-10s) and Speed presets (Normal, Nightcore, Vaporwave, Hyper).
3. `src/components/StatsModal.tsx`:
   - High-fidelity listening metrics dashboard with session time, songs played, and genre breakdown.
4. `src/components/TopBar.tsx`:
   - Add 4 glowing color orbs and Stats navigation button.
5. `src/components/PlayerDock.tsx`:
   - Add quick 8D toggle button and DJ mode button with active speed badges.
6. `src/App.tsx`:
   - Wire `StereoPannerNode` with `requestAnimationFrame` sinusoidal panning, crossfade transition logic, playbackRate control, and live stats accumulator.

---

## Plan Status
Awaiting user review and approval to proceed with execution.

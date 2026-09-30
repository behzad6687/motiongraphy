// theme.ts — single source of truth. Brand tokens captured from esolutify.com.
// Never inline colours, easings or spring configs in components.
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#0A0A0A",
    bgAlt: "#111111",
    surface: "#151515",
    surface2: "#1C1C1C",
    surface3: "#262626",
    line: "rgba(255,255,255,0.09)",
    line2: "rgba(255,255,255,0.16)",
    text: "#F0EDE8",
    muted: "#A39E96",
    dim: "#7A756D",
    // THE hero colour — at most one gold element leads each frame
    gold: "#C8973A",
    gold2: "#DCAE55",
    goldBright: "#E8B84B",
    goldSoft: "rgba(200,151,58,0.14)",
    goldLine: "rgba(200,151,58,0.45)",
    glow: "rgba(220,174,85,0.45)",
    // logo red — logo + the "lost lead" moments only
    red: "#ED1C24",
    redSoft: "rgba(237,28,36,0.14)",
    // success — "Booked" confirmations only
    ok: "#3CCF8E",
    okSoft: "rgba(60,207,142,0.14)",
  },
  gradients: {
    gold: "linear-gradient(135deg, #C8973A 0%, #E8B84B 55%, #F3CF7A 100%)",
    hair: "linear-gradient(to right, transparent, rgba(200,151,58,0.6), transparent)",
    card: "linear-gradient(180deg, rgba(28,28,28,0.92), rgba(18,18,18,0.92))",
  },
  fonts: {
    display: "Red Hat Display",
    body: "DM Sans",
  },
  // THE easing curves. Linear is forbidden.
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo — entrances
    inOut: Easing.bezier(0.83, 0, 0.17, 1), // easeInOutQuint — moves, scrolls
    soft: Easing.bezier(0.45, 0, 0.55, 1), // gentle in-out for long drifts
    in: Easing.bezier(0.7, 0, 0.84, 0), // exits only
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 }, // words, UI pops
    smooth: { damping: 20, stiffness: 90, mass: 1 }, // big elements
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 }, // logo, accents
    counter: { damping: 30, stiffness: 55, mass: 1 }, // number roll-ups
  },
  shadow: {
    card: "0 30px 70px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
    goldGlow: "0 0 60px rgba(220,174,85,0.40), 0 0 120px rgba(220,174,85,0.20)",
  },
  // 120 BPM at 30 fps: every cut and hit sits on this grid
  beat: 15,
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

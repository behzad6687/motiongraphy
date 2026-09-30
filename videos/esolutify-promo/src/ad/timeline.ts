import { Easing, interpolate } from "remotion";
import type { Capture } from "../components/Devices";
import { clamp, theme } from "../theme";

// 9:16 Meta ad — "See your new website before you pay a dollar."
// 1080×1920 @ 30 fps, 120 BPM (15 f per beat). Storyboard: STORYBOARD-META-AD.md
// All frame numbers below are absolute ad frames.

export type Variant = "21" | "15";

export type Timing = {
  duration: number;
  wall: boolean; // S5 phone wall + S6 process list (21s only)
  cta: number; // CTA start
};

export const TIMINGS: Record<Variant, Timing> = {
  "21": { duration: 630, wall: true, cta: 480 },
  "15": { duration: 450, wall: false, cta: 300 },
};

// Montage cuts land on the drop and every second beat after it.
export const CUTS = [180, 210, 240, 270] as const;
export const WALL = 300;
export const PROCESS = 356;

const m = (
  slug: string,
  clipCss: number,
  sticky: number,
  statusBg: string,
): Capture => ({
  slug,
  device: "mobile",
  cssWidth: 390,
  clipCss,
  sticky,
  file: "ad-mobile.jpg",
  statusBg,
});
const d = (slug: string, clipCss: number, sticky: number): Capture => ({
  slug,
  device: "desktop",
  cssWidth: 1440,
  clipCss,
  sticky,
  file: "ad-desktop.jpg",
});

// Crops (scripts/crop_ad_sites.py) double as content guards.
export const SITES = {
  greersmiles: {
    mobile: m("greersmiles", 3100, 69, "#FBFBFB"),
    desktop: d("greersmiles", 2700, 77),
    url: "esolutify.com/demo/greersmiles",
    chip: "Family dental clinic",
  },
  sutebel: {
    mobile: m("sutebel", 2400, 73, "#0A0A0A"),
    desktop: d("sutebel", 2000, 85),
    url: "esolutify.com/demo/sutebel",
    chip: "Luxury fashion house",
  },
  newpc: {
    mobile: m("newpc", 2900, 64, "#0A1117"),
    desktop: d("newpc", 1800, 64),
    url: "esolutify.com/demo/pc",
    chip: "Custom PC studio",
  },
  rielbuild: {
    mobile: m("rielbuild", 4800, 0, "#2B3E4F"),
    desktop: d("rielbuild", 1800, 0),
    url: "esolutify.com/demo/rielbuild",
    chip: "Renovation contractor",
  },
  gincoaluminium: {
    mobile: m("gincoaluminium", 1688, 0, "#172231"),
    desktop: d("gincoaluminium", 1838, 0),
    url: "esolutify.com/demo/gincoaluminium",
    chip: "Façade contractor · UAE",
  },
} as const;

export type SiteKey = keyof typeof SITES;
export const MONTAGE: SiteKey[] = [
  "sutebel",
  "newpc",
  "rielbuild",
  "gincoaluminium",
];

// ---------------------------------------------------------------- scroll paths
// flick: a finger drag that releases into momentum — ONE continuous curve
//   (slow start while the finger accelerates, fast release, long decay), so
//   there is never a velocity jump at the hand-off. `release` = fraction of
//   the segment the finger is down (touch dot visible).
// glide: trackpad-style desktop move. snap: film-chapter snap.
export type Seg =
  | {
      type: "flick";
      f0: number;
      f1: number;
      y0: number;
      y1: number;
      release?: number;
    }
  | { type: "glide" | "snap"; f0: number; f1: number; y0: number; y1: number };

const FLICK = Easing.bezier(0.42, 0, 0.18, 1);
const easeFor = (s: Seg) =>
  s.type === "flick"
    ? FLICK
    : s.type === "glide"
      ? theme.ease.soft
      : theme.ease.inOut;

export const scrollY = (frame: number, segs: Seg[], start = 0): number => {
  let y = start;
  for (const s of segs) {
    if (frame < s.f0) return y;
    y = interpolate(frame, [s.f0, s.f1], [s.y0, s.y1], {
      ...clamp,
      easing: easeFor(s),
    });
    if (frame <= s.f1) return y;
  }
  return y;
};

// css px per frame (for velocity blur)
export const scrollV = (frame: number, segs: Seg[], start = 0) =>
  scrollY(frame + 0.5, segs, start) - scrollY(frame - 0.5, segs, start);

// the flick whose finger is on the glass at `frame` (for the touch dot)
export const activeFlick = (frame: number, segs: Seg[]) =>
  segs.find(
    (s) =>
      s.type === "flick" &&
      frame >= s.f0 - 3 &&
      frame <= s.f0 + (s.f1 - s.f0) * (s.release ?? 0.3) + 6,
  ) as Extract<Seg, { type: "flick" }> | undefined;

// Hero phone (Greer Smiles): S1 thumb flick, S2 two flicks. The desktop
// then catches up, so both devices hold the same section from f156 to f177.
export const GREER_PHONE: Seg[] = [
  { type: "flick", f0: 12, f1: 40, y0: 0, y1: 480 },
  { type: "flick", f0: 64, f1: 90, y0: 480, y1: 960 },
  { type: "flick", f0: 98, f1: 126, y0: 960, y1: 1840 },
];
export const GREER_DESKTOP: Seg[] = [
  { type: "glide", f0: 128, f1: 156, y0: 0, y1: 1700 },
];

// Montage phone + ghost browser, one entry per cut. Each page enters already
// scrolled so its hero headline sits above the Reels UI (y < 1250), flicks,
// then HOLDS on the section it landed on for 6+ frames before the next swap.
export const MONTAGE_START: Record<string, number> = {
  sutebel: 180,
  newpc: 210,
  rielbuild: 260,
  gincoaluminium: 0,
};
export const MONTAGE_PHONE: Record<string, Seg[]> = {
  sutebel: [{ type: "flick", f0: 188, f1: 200, y0: 180, y1: 1060 }],
  newpc: [{ type: "flick", f0: 218, f1: 230, y0: 210, y1: 1090 }],
  rielbuild: [{ type: "snap", f0: 248, f1: 258, y0: 260, y1: 844 }],
  gincoaluminium: [{ type: "snap", f0: 278, f1: 288, y0: 0, y1: 844 }],
};
export const MONTAGE_DESKTOP: Record<string, Seg[]> = {
  sutebel: [{ type: "glide", f0: 188, f1: 200, y0: 0, y1: 913 }],
  newpc: [{ type: "glide", f0: 218, f1: 230, y0: 0, y1: 900 }],
  rielbuild: [{ type: "glide", f0: 248, f1: 258, y0: 0, y1: 900 }],
  gincoaluminium: [{ type: "glide", f0: 278, f1: 288, y0: 0, y1: 938 }],
};

// Wall phones keep reading slowly (S5), then drift once sunk (S6/S7).
export const WALL_PHONES: {
  key: SiteKey;
  cx: number;
  top: number;
  scale: number;
  rotY: number;
  from: number; // fly-in x offset
  at: number;
  segs: Seg[];
}[] = [
  {
    key: "greersmiles",
    cx: -20,
    top: 790,
    scale: 0.8,
    rotY: 24,
    from: -720,
    at: 306,
    segs: [
      { type: "glide", f0: 300, f1: 356, y0: 900, y1: 1180 },
      { type: "glide", f0: 356, f1: 630, y0: 1180, y1: 1500 },
    ],
  },
  {
    key: "sutebel",
    cx: 248,
    top: 740,
    scale: 0.9,
    rotY: 14,
    from: -720,
    at: 302,
    segs: [
      { type: "glide", f0: 300, f1: 356, y0: 880, y1: 1180 },
      { type: "glide", f0: 356, f1: 630, y0: 1180, y1: 1450 },
    ],
  },
  {
    key: "newpc",
    cx: 832,
    top: 740,
    scale: 0.9,
    rotY: -14,
    from: 720,
    at: 305,
    segs: [
      { type: "glide", f0: 300, f1: 356, y0: 1500, y1: 1800 },
      { type: "glide", f0: 356, f1: 630, y0: 1800, y1: 2000 },
    ],
  },
  {
    key: "rielbuild",
    cx: 1100,
    top: 790,
    scale: 0.8,
    rotY: -24,
    from: 720,
    at: 309,
    segs: [
      { type: "glide", f0: 300, f1: 356, y0: 3376, y1: 3620 },
      { type: "glide", f0: 356, f1: 630, y0: 3620, y1: 3900 },
    ],
  },
];

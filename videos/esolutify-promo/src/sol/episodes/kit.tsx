import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import { Sol, type Mood } from "../Sol";

// The "Sol explains" episode kit. Everything is driven by a timeline made by
// scripts/sol_timeline.py from words alone, so the pacing rules hold for
// every episode:
//   - phrases appear one at a time at reading speed (8 frames a word)
//   - the picture plays only after the text is in (beat.showFrom)
//   - then a hold; one idea per bubble; a big signpost card per section
// Layout (1080×1920): tracker y≈250, bubble y 300–520, picture zone y 580–1090,
// Sol y 1120+. Copy stays inside the Reels/Shorts safe zone.

export const INK = "#1E1408";
export const CREAM = "#FFF7E6";
export const MARK_GOLD = "#F7D474";
export const MARK_RED = "#FF8A80";
export const ICE = "#8FD3FF";

export type Word = { w: string; at: number };
export type Phrase = { at: number; words: Word[] };
export type Beat = {
  id: string;
  kind: "say" | "round";
  from: number;
  textEnd: number;
  showFrom: number;
  until: number;
  phrases: Phrase[];
  say?: string;
  round?: string;
};
export type Timeline = {
  id: string;
  fps: number;
  total: number;
  beats: Beat[];
};

export const beatAt = (tl: Timeline, frame: number) =>
  [...tl.beats].reverse().find((b) => frame >= b.from) ?? tl.beats[0];

export const byId = (tl: Timeline) =>
  Object.fromEntries(tl.beats.map((b) => [b.id, b])) as Record<string, Beat>;

const isTalking = (tl: Timeline, frame: number) =>
  tl.beats.some((b) =>
    b.phrases.some((p) =>
      p.words.some((w) => frame >= w.at && frame < w.at + 7),
    ),
  );

// ---------------------------------------------------------------- bubble
const Marked: React.FC<{ raw: string }> = ({ raw }) => {
  const gold = raw.startsWith("*") && raw.endsWith("*");
  const red = raw.startsWith("!") && raw.endsWith("!") && raw.length > 2;
  const text = gold || red ? raw.slice(1, -1) : raw;
  return (
    <span
      style={{
        display: "inline-block",
        padding: gold || red ? "0 8px" : 0,
        margin: gold || red ? "0 -4px" : 0,
        borderRadius: 10,
        background: gold ? MARK_GOLD : red ? MARK_RED : "transparent",
      }}
    >
      {text}
    </span>
  );
};

// Sol's speech bubble: phrases pop in one at a time; the bubble is sized for
// the whole line from the start (later phrases are laid out but invisible),
// so nothing jumps while you read.
export const PhraseBubble: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = tl.beats.find(
    (x) => x.kind === "say" && frame >= x.from - 1 && frame < x.until + 4,
  );
  if (!b) return null;
  const pop = spring({
    frame: frame - b.from + (b.from === 0 ? 12 : 0),
    fps,
    config: theme.spring.bouncy,
  });
  const out = ease(frame, b.until, b.until + 4, theme.ease.in);
  const chars = (b.say ?? "").length;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(pop, [0, 0.3], [0, 1], clamp) * (1 - out),
        scale: interpolate(pop, [0, 1], [0.85, 1]) * (1 - 0.08 * out),
        rotate: `${interpolate(pop, [0, 1], [-3, -1])}deg`,
        transformOrigin: "50% 100%",
        zIndex: 9,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 960,
          padding: "24px 38px 26px",
          borderRadius: 38,
          background: CREAM,
          border: `5px solid ${INK}`,
          boxShadow: `8px 10px 0 ${INK}`,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: chars > 52 ? 54 : 62,
          lineHeight: 1.15,
          color: INK,
        }}
      >
        {b.phrases.map((p, i) => {
          const on = spring({
            frame: frame - p.at,
            fps,
            config: theme.spring.snappy,
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: 14,
                margin: "0 7px",
                opacity:
                  frame >= p.at ? interpolate(on, [0, 0.35], [0, 1], clamp) : 0,
                translate: `0px ${interpolate(on, [0, 1], [14, 0])}px`,
              }}
            >
              {p.words.map((w, j) => (
                <Marked key={j} raw={w.w} />
              ))}
            </span>
          );
        })}
        <svg
          width={70}
          height={48}
          viewBox="0 0 70 48"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -44,
            translate: "-20px 0px",
          }}
        >
          <path d="M0 0 L60 0 L18 44 Z" fill={CREAM} />
          <path
            d="M2 2 L18 44 L58 2"
            fill="none"
            stroke={INK}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- where am I
export type TrackItem = {
  after: string;
  label: string;
  from: string;
  until: string;
  hint?: string; // shown before the item is revealed (default "#n")
};

export const Tracker: React.FC<{
  tl: Timeline;
  items: TrackItem[];
  show: [string, string];
}> = ({ tl, items, show }) => {
  const frame = useCurrentFrame();
  const B = byId(tl);
  const a = B[show[0]];
  const z = B[show[1]];
  if (frame < a.from || frame > z.until + 6) return null;
  const vis =
    ease(frame, a.from, a.from + 10) *
    (1 - ease(frame, z.until, z.until + 6, theme.ease.in));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 236,
        display: "flex",
        justifyContent: "center",
        gap: 12,
        opacity: vis,
      }}
    >
      {items.map((it, i) => {
        const revealed = frame >= B[it.after].from + 8;
        const active = frame >= B[it.from].from && frame <= B[it.until].until;
        return (
          <div
            key={i}
            style={{
              minWidth: 110,
              padding: "8px 16px",
              borderRadius: 99,
              textAlign: "center",
              fontFamily: theme.fonts.body,
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "0.06em",
              background: active
                ? theme.gradients.gold
                : revealed
                  ? theme.colors.surface3
                  : theme.colors.surface,
              color: active
                ? INK
                : revealed
                  ? theme.colors.text
                  : theme.colors.dim,
              border: `2px solid ${active ? INK : theme.colors.line2}`,
              scale: active ? 1.08 : 1,
            }}
          >
            {revealed ? it.label : (it.hint ?? `#${i + 1}`)}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- signposts
export const RoundCard: React.FC<{
  beat: Beat;
  eyebrow: string;
  big: string;
  unit?: string;
  label?: string;
}> = ({ beat, eyebrow, big, unit, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat.from - 1 || frame > beat.until + 6) return null;
  const p = spring({
    frame: frame - beat.from,
    fps,
    config: theme.spring.bouncy,
  });
  const out = ease(frame, beat.until, beat.until + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, zIndex: 8 }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: 330,
          height: 640,
          borderRadius: 48,
          background:
            "radial-gradient(circle at 50% 35%, #2A2214, #120F0A 75%)",
          border: `6px solid ${INK}`,
          outline: `3px solid ${theme.colors.gold2}`,
          boxShadow: `12px 14px 0 ${INK}, ${theme.shadow.goldGlow}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          scale: interpolate(p, [0, 1], [0.6, 1]) * (1 + 0.04 * out),
          rotate: `${interpolate(p, [0, 1], [-6, 0])}deg`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        }}
      >
        <div
          style={{
            padding: "8px 24px",
            borderRadius: 99,
            background: theme.gradients.gold,
            color: INK,
            fontFamily: theme.fonts.body,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: "0.2em",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: big.length > 4 ? 170 : 230,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            backgroundImage: theme.gradients.gold,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 0 30px ${theme.colors.glow})`,
          }}
        >
          {big}
        </div>
        {unit ? (
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 84,
              color: theme.colors.text,
              letterSpacing: "0.04em",
            }}
          >
            {unit}
          </div>
        ) : null}
        {label ? (
          <div
            style={{
              marginTop: 12,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 40,
              color: theme.colors.muted,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// A picture that belongs to one or more beats; fades out after the last one.
export const BeatScene: React.FC<{
  from: Beat;
  until?: Beat;
  children: React.ReactNode;
}> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  const end = (until ?? from).until;
  if (frame < from.from - 1 || frame > end + 6) return null;
  const out = ease(frame, end, end + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, translate: `0px ${-16 * out}px` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Footnote: React.FC<{ text: string; at: number; top?: number }> = ({
  text,
  at,
  top = 1076,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: 24,
        color: theme.colors.dim,
        opacity: ease(frame, at, at + 10),
      }}
    >
      {text}
    </div>
  );
};

export const Stamp: React.FC<{
  at: number;
  text: string;
  color: string;
  x?: number;
  y?: number;
  size?: number;
  rot?: number;
}> = ({ at, text, color, x = 540, y = 840, size = 92, rot = -8 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = frame - at;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rot}deg`,
        scale: interpolate(t, [0, 4, 7], [2.2, 0.92, 1], {
          ...clamp,
          easing: theme.ease.out,
        }),
        opacity: interpolate(t, [0, 2], [0, 1], clamp),
        padding: "12px 30px",
        border: `9px solid ${color}`,
        borderRadius: 20,
        color,
        background: "rgba(10,10,10,0.6)",
        fontFamily: theme.fonts.display,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "0.03em",
        lineHeight: 1.02,
        textAlign: "center",
        whiteSpace: "pre",
        zIndex: 7,
      }}
    >
      {text}
    </div>
  );
};

export const Shake: React.FC<{ hits: number[]; children: React.ReactNode }> = ({
  hits,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = hits.map((h) => frame - h).find((d) => d >= 0 && d < 10);
  const amp = t === undefined ? 0 : (1 - t / 10) * 12;
  return (
    <AbsoluteFill
      style={{
        translate: `${Math.sin(frame * 3.3) * amp}px ${Math.cos(frame * 2.7) * amp}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Sol on stage
export type Pose = {
  mood: Mood;
  arms?: [number, number];
  look?: [number, number];
  spike?: number;
  sweat?: boolean;
  wave?: boolean;
  glasses?: boolean;
};
// per beat: `say` while talking, `after` once the picture plays
export type Blocking = Record<string, { say?: Pose; after?: Pose }>;
export type StageKey = { beat: string; top: number; size: number };

export const SolOnStage: React.FC<{
  tl: Timeline;
  blocking: Blocking;
  keys: StageKey[];
}> = ({ tl, blocking, keys }) => {
  const frame = useCurrentFrame();
  const B = byId(tl);
  const b = beatAt(tl, frame);
  const bl = blocking[b.id] ?? {};
  const fallback: Pose = { mood: "happy", arms: [55, 55] };
  const pose =
    (frame >= b.showFrom && bl.after) || bl.say || bl.after || fallback;
  // stage position: tween between keyed beats
  const ks = keys.map((k) => ({ f: B[k.beat].from, top: k.top, size: k.size }));
  const k1 = [...ks].reverse().find((k) => frame >= k.f) ?? ks[0];
  const k2 = ks.find((k) => k.f > frame) ?? k1;
  const p = k2 === k1 ? 1 : ease(frame, k2.f - 16, k2.f, theme.ease.inOut);
  const top = k1.top + (k2.top - k1.top) * p;
  const size = k1.size + (k2.size - k1.size) * p;
  // a hop on every new beat, a wiggle when the picture lands
  const hopT = frame - b.from;
  const hop = b.from > 0 && hopT >= 0 && hopT < 14 ? hopT : undefined;
  const jump = hop !== undefined ? Math.sin((Math.PI * hop) / 14) * 44 : 0;
  const squash =
    hop !== undefined
      ? hop < 3
        ? -0.6 + hop * 0.3
        : hop > 11
          ? -0.5
          : 0.35
      : 0.06 * Math.sin(frame / 7);
  const land = frame < 10 ? -0.7 * (1 - frame / 10) : 0;
  const arms: [number, number] = pose.wave
    ? [pose.arms?.[0] ?? 55, 140 + 22 * Math.sin(frame / 3)]
    : (pose.arms ?? [55, 55]);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - size / 2,
        top: top - jump + Math.sin(frame / 9) * 5,
        width: size,
        zIndex: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -size * 0.4,
          top: -size * 0.1,
          width: size * 1.8,
          height: size * 1.4,
          background:
            "radial-gradient(closest-side, rgba(255,236,180,0.16), rgba(255,236,180,0))",
        }}
      />
      <Sol
        size={size}
        mood={pose.mood}
        talking={
          isTalking(tl, frame) && pose.mood !== "laugh" && pose.mood !== "pout"
        }
        arms={arms}
        look={pose.look ?? [0, 0]}
        spike={pose.spike ?? 0}
        sweat={pose.sweat}
        glasses={pose.glasses}
        squash={squash + land}
      />
    </div>
  );
};

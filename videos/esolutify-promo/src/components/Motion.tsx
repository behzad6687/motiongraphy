import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, theme } from "../theme";

type SpringName = keyof typeof theme.spring;

export const useEntrance = (delay: number, config: SpringName = "smooth") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: theme.spring[config] });
};

// Premium entrance: fade + rise + scale, together.
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  x?: number;
  from?: number;
  config?: SpringName;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delay = 0,
  y = 40,
  x = 0,
  from = 0.94,
  config = "smooth",
  style,
  children,
}) => {
  const p = useEntrance(delay, config);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
        translate: `${interpolate(p, [0, 1], [x, 0])}px ${interpolate(p, [0, 1], [y, 0])}px`,
        scale: interpolate(p, [0, 1], [from, 1]),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export type Word = {
  text: string;
  tone?: "gold" | "red" | "muted";
  underline?: boolean;
};

// Word-by-word reveal with rise + de-blur. `words` may mark gold/red words.
export const WordReveal: React.FC<{
  words: (string | Word)[];
  delay?: number;
  per?: number;
  size: number;
  weight?: number;
  color?: string;
  gap?: number;
  align?: "flex-start" | "center" | "flex-end";
  font?: string;
  tracking?: string;
  style?: React.CSSProperties;
}> = ({
  words,
  delay = 0,
  per = 3,
  size,
  weight = 800,
  color = theme.colors.text,
  gap,
  align = "center",
  font = theme.fonts.display,
  tracking = "-0.03em",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align,
        columnGap: gap ?? Math.round(size * 0.24),
        rowGap: 0,
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: tracking,
        color,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const word: Word = typeof w === "string" ? { text: w } : w;
        const start = delay + i * per;
        const p = spring({
          frame: frame - start,
          fps,
          config: theme.spring.snappy,
        });
        const under = spring({
          frame: frame - start - 6,
          fps,
          config: theme.spring.smooth,
        });
        const toneStyle: React.CSSProperties =
          word.tone === "gold"
            ? {
                backgroundImage: theme.gradients.gold,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: `drop-shadow(0 0 28px ${theme.colors.glow})`,
              }
            : word.tone === "red"
              ? { color: theme.colors.red }
              : word.tone === "muted"
                ? { color: theme.colors.muted }
                : {};
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              position: "relative",
              paddingBottom: Math.round(size * 0.08),
              opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
              translate: `0px ${interpolate(p, [0, 1], [size * 0.42, 0])}px`,
            }}
          >
            <span style={{ ...toneStyle, display: "inline-block" }}>
              {word.text}
            </span>
            {word.underline ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: Math.round(size * 0.02),
                  height: Math.max(4, Math.round(size * 0.06)),
                  width: `${under * 100}%`,
                  borderRadius: 99,
                  background: theme.gradients.gold,
                  boxShadow: theme.shadow.goldGlow,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

// Scene exit: faster than any entrance, eased-in, lifts + fades.
// `tail` = frames left after the exit completes — the length of the outgoing
// transition — so the old scene is gone before the next one fades in on top.
export const SceneExit: React.FC<{
  frames?: number;
  lift?: number;
  tail?: number;
  children: React.ReactNode;
}> = ({ frames = 12, lift = 40, tail = theme.beat, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const end = durationInFrames - tail;
  const p = interpolate(frame, [end - frames, end - 1], [0, 1], {
    ...clamp,
    easing: theme.ease.in,
  });
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - p,
        translate: `0px ${-lift * p}px`,
        scale: 1 - 0.02 * p,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Eyebrow label: small caps with a gold tick — used above headlines.
export const Eyebrow: React.FC<{
  text: string;
  delay?: number;
  align?: "left" | "center";
}> = ({ text, delay = 0, align = "center" }) => {
  const p = useEntrance(delay, "smooth");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: 14,
        opacity: p,
        translate: `0px ${interpolate(p, [0, 1], [16, 0])}px`,
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.22em",
        color: theme.colors.muted,
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: interpolate(p, [0, 1], [0, 34]),
          height: 2,
          borderRadius: 2,
          background: theme.colors.gold,
        }}
      />
      {text}
    </div>
  );
};

// Diagonal light sweep; place inside an overflow:hidden parent.
export const LightSweep: React.FC<{
  start: number;
  duration?: number;
  width?: number;
  opacity?: number;
}> = ({ start, duration = 30, width = 260, opacity = 0.35 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          bottom: "-50%",
          width,
          left: `${interpolate(p, [0, 1], [-30, 130])}%`,
          rotate: "20deg",
          background: `linear-gradient(90deg, transparent, rgba(255,236,190,${opacity}), transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Idle breathing for anything on screen > 2 s.
export const useBreathe = (speed = 22, amount = 0.012) => {
  const frame = useCurrentFrame();
  return 1 + Math.sin(frame / speed) * amount;
};

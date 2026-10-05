import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Icon, type IconName } from "../components/Icons";
import { LightSweep, useEntrance } from "../components/Motion";
import { clamp, theme } from "../theme";

// Shared building blocks for the 9:16 service reels (1080×1920). Copy sits
// in the Meta/YouTube safe zone (y 290–1160); the phone starts at y 720.

export const ease = (frame: number, a: number, b: number, e = theme.ease.out) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });

// Shows its children from `from`, then lifts and fades them out after `until`.
export const Window: React.FC<{
  from: number;
  until: number;
  children: React.ReactNode;
}> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= until + 6) return null;
  const p = ease(frame, until, until + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - p, translate: `0px ${-24 * p}px` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Head: React.FC<{ top?: number; children: React.ReactNode }> = ({
  top = 392,
  children,
}) => (
  <div style={{ position: "absolute", left: 80, right: 80, top }}>
    {children}
  </div>
);

export const Sub: React.FC<{
  text: string;
  at: number;
  top?: number;
  size?: number;
}> = ({ text, at, top = 652, size = 36 }) => {
  const p = useEntrance(at, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: size,
        color: theme.colors.muted,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [20, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

// Logo at the top; grows into the end card at `cta`.
export const Logo: React.FC<{ cta: number }> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: frame - cta, fps, config: theme.spring.bouncy });
  const w = interpolate(grow, [0, 1], [200, 330]);
  return (
    <Img
      src={staticFile("brand/logo.png")}
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: interpolate(grow, [0, 1], [290, 300]),
        width: w,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
      }}
    />
  );
};

// Gold flash on the drop.
export const Flash: React.FC<{ at: number; peak?: number }> = ({
  at,
  peak = 0.8,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 4, at, at + 8], [0, peak, 0], {
    ...clamp,
    easing: theme.ease.soft,
  });
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 62%, rgba(255,240,205,0.9), rgba(232,184,75,0.45) 40%, rgba(10,10,10,0) 78%)",
        opacity: o,
      }}
    />
  );
};

// The platform caption / UI lands on dark.
export const BottomFade: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 1540,
      bottom: 0,
      background:
        "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.7) 55%, rgba(10,10,10,0.9) 100%)",
    }}
  />
);

export type StatCard = { icon: IconName; title: string; sub: string };

// Three cards that slide in over the (dimmed) phone.
export const StatCards: React.FC<{
  cards: StatCard[];
  at: number;
  until: number;
  top?: number;
}> = ({ cards, at, until, top = 720 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > until + 8) return null;
  const out = ease(frame, until - 6, until + 4, theme.ease.in);
  return (
    <>
      {cards.map((c, i) => {
        const p = spring({
          frame: frame - (at + i * 9),
          fps,
          config: theme.spring.bouncy,
        });
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 150,
              width: 780,
              top: top + i * 128,
              height: 108,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 30px",
              background: theme.gradients.card,
              border: `1px solid ${theme.colors.line2}`,
              boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - out),
              translate: `${interpolate(p, [0, 1], [i % 2 ? 120 : -120, 0])}px 0px`,
              scale: interpolate(p, [0, 1], [0.9, 1]),
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                flexShrink: 0,
                background: theme.colors.goldSoft,
                border: `1.5px solid ${theme.colors.goldLine}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={c.icon}
                size={34}
                color={theme.colors.gold2}
                stroke={2.2}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 38,
                  color: theme.colors.text,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 26,
                  color: theme.colors.muted,
                }}
              >
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// End-card button (gold, light sweeps) and the URL under it.
export const CtaButton: React.FC<{
  label: string;
  at: number;
  top?: number;
  children?: React.ReactNode;
}> = ({ label, at, top = 948, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - at, fps, config: theme.spring.snappy });
  return (
    <div
      style={{
        position: "absolute",
        left: 170,
        width: 740,
        top,
        height: 108,
        borderRadius: 99,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: theme.gradients.gold,
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 44,
        color: "#0A0A0A",
        opacity: interpolate(btn, [0, 0.4], [0, 1], clamp),
        scale: interpolate(btn, [0, 1], [0.85, 1]),
      }}
    >
      {label}
      <Icon name="arrow" size={42} color="#0A0A0A" stroke={2.8} />
      <LightSweep start={at + 26} duration={24} width={130} opacity={0.7} />
      <LightSweep start={at + 80} duration={24} width={130} opacity={0.7} />
      {children}
    </div>
  );
};

export const UrlLine: React.FC<{ url: string; at: number; top?: number }> = ({
  url,
  at,
  top = 1082,
}) => {
  const p = useEntrance(at, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: 34,
        color: theme.colors.text,
        opacity: p,
      }}
    >
      {url}
    </div>
  );
};

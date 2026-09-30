import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Tap } from "../components/Devices";
import { Icon } from "../components/Icons";
import { LightSweep, WordReveal, useEntrance } from "../components/Motion";
import { clamp, theme } from "../theme";
import type { Timing } from "./timeline";

// S7 — one action, matching Meta's "Apply Now" button below it.
export const Cta: React.FC<{ t: Timing }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = t.cta;
  const button = spring({
    frame: frame - (c + 20),
    fps,
    config: theme.spring.snappy,
  });
  const press = interpolate(frame, [c + 72, c + 75, c + 82], [0, 1, 0], {
    ...clamp,
    easing: theme.ease.out,
  });
  const breathe = frame > c + 90 ? 1 + Math.sin((frame - c) / 9.5) * 0.012 : 1;
  const url = useEntrance(c + 30, "smooth");
  const scarcity = useEntrance(c + 40, "smooth");
  const trust = useEntrance(c + 48, "smooth");
  const chevronIn = useEntrance(c + 58, "smooth");
  const beat = ((frame - c) % 15) / 15;
  const bob = Math.sin(beat * Math.PI) * 12;
  const dotPulse = 0.55 + 0.45 * Math.sin(((frame - c) / 30) * Math.PI * 2);
  if (frame < c - 2) return null;

  const row = (p: number): React.CSSProperties => ({
    position: "absolute",
    left: 70,
    right: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
    translate: `0px ${interpolate(p, [0, 1], [22, 0])}px`,
    fontFamily: theme.fonts.body,
  });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 466 }}>
        <WordReveal
          words={["Apply", "for", "a"]}
          delay={c + 4}
          per={3}
          size={100}
        />
        <WordReveal
          words={[
            { text: "free", tone: "gold" },
            { text: "demo.", tone: "gold" },
          ]}
          delay={c + 12}
          per={3}
          size={100}
        />
      </div>

      {/* the in-video button — same words as Meta's CTA */}
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 728,
          width: 700,
          height: 120,
          opacity: interpolate(button, [0, 0.4], [0, 1], clamp),
          scale:
            interpolate(button, [0, 1], [0.8, 1]) *
            breathe *
            (1 - 0.04 * press),
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 99,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            background: theme.gradients.gold,
            boxShadow: theme.shadow.goldGlow,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: "-0.01em",
            color: "#0A0A0A",
          }}
        >
          Apply now
          <Icon name="arrow" size={50} color="#0A0A0A" stroke={2.8} />
          <LightSweep start={c + 34} duration={24} width={130} opacity={0.75} />
          <LightSweep start={c + 94} duration={24} width={130} opacity={0.75} />
        </div>
        <Tap x={350} y={60} at={c + 75} size={96} />
      </div>

      <div
        style={{
          ...row(url),
          top: 876,
          fontWeight: 600,
          fontSize: 44,
          color: theme.colors.text,
        }}
      >
        esolutify.com/free-demo
      </div>
      <div
        style={{
          ...row(scarcity),
          top: 958,
          fontWeight: 500,
          fontSize: 40,
          color: theme.colors.text,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: theme.colors.gold2,
            boxShadow: `0 0 ${8 + dotPulse * 14}px ${theme.colors.glow}`,
          }}
        />
        We take on 5 free demos a week.
      </div>
      <div
        style={{
          ...row(trust),
          top: 1020,
          fontWeight: 500,
          fontSize: 38,
          color: theme.colors.muted,
        }}
      >
        {t.wall ? (
          <>
            <Icon
              name="star"
              size={34}
              color={theme.colors.gold2}
              stroke={2.2}
            />
            5.0 on Google · 500+ projects
          </>
        ) : (
          "No obligation. Don’t love it? Walk away."
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 - 26,
          top: 1106 + bob,
          opacity: chevronIn * 0.75,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={52}
          height={52}
          fill="none"
          stroke={theme.colors.text}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

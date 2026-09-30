import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Icon } from "../components/Icons";
import {
  Eyebrow,
  SceneExit,
  WordReveal,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 7 — Numbers that speak (225f). Figures from the esolutify.com homepage.
type Stat = {
  to: number;
  decimals: number;
  prefix?: string;
  suffix: string;
  label: string;
  hero?: boolean;
  star?: boolean;
};

const STATS: Stat[] = [
  { to: 500, decimals: 0, suffix: "+", label: "Projects delivered" },
  { to: 15, decimals: 0, suffix: "+", label: "Years in business" },
  {
    to: 4.8,
    decimals: 1,
    suffix: "x",
    label: "Avg. ROAS on managed ads",
    hero: true,
  },
  { to: 98, decimals: 0, suffix: "%", label: "Client satisfaction" },
  {
    to: 5.0,
    decimals: 1,
    suffix: "",
    label: "Google rating · 27 reviews",
    star: true,
  },
];
const STAT_AT = 22;

const TICKER = [
  ["Toronto", "+412% organic traffic"],
  ["Dubai", "6.2x ROAS on Meta Ads"],
  ["Los Angeles", "89 leads in the first 30 days"],
  ["Montréal", "#1 Google ranking achieved"],
  ["UAE", "340% increase in website traffic"],
];

const COL_W = 330;

export const S07Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ticker = useEntrance(70, "smooth");

  return (
    <SceneExit frames={12}>
      <AbsoluteFill style={{ top: 130, alignItems: "center" }}>
        <Eyebrow text="Proven results" delay={0} />
        <div style={{ height: 22 }} />
        <WordReveal
          words={["Numbers", "that", "speak."]}
          delay={4}
          per={4}
          size={84}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 420,
          left: (1920 - COL_W * STATS.length) / 2,
          display: "flex",
        }}
      >
        {STATS.map((s, i) => {
          const at = STAT_AT + i * 5;
          const inP = spring({
            frame: frame - at,
            fps,
            config: theme.spring.smooth,
          });
          const roll = spring({
            frame: frame - at,
            fps,
            config: theme.spring.counter,
          });
          const value = interpolate(roll, [0, 1], [0, s.to], clamp);
          return (
            <div
              key={s.label}
              style={{
                width: COL_W,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderLeft: i === 0 ? "none" : `1px solid ${theme.colors.line}`,
                opacity: interpolate(inP, [0, 0.4], [0, 1], clamp),
                translate: `0px ${interpolate(inP, [0, 1], [60, 0])}px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 118,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  fontVariantNumeric: "tabular-nums",
                  ...(s.hero
                    ? {
                        backgroundImage: theme.gradients.gold,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        filter: `drop-shadow(0 0 36px ${theme.colors.glow})`,
                      }
                    : { color: theme.colors.text }),
                }}
              >
                {value.toFixed(s.decimals)}
                {s.suffix}
                {s.star ? (
                  <Icon
                    name="star"
                    size={64}
                    color={theme.colors.text}
                    stroke={2.2}
                    style={{ marginLeft: 4 }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  marginTop: 14,
                  width: 260,
                  textAlign: "center",
                  fontFamily: theme.fonts.body,
                  fontSize: 25,
                  lineHeight: 1.35,
                  color: theme.colors.muted,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* live results ticker */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 820,
          height: 96,
          borderTop: `1px solid ${theme.colors.line}`,
          borderBottom: `1px solid ${theme.colors.line}`,
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
          opacity: ticker,
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            height: 96,
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            translate: `${200 - frame * 3.2}px 0px`,
          }}
        >
          {[...TICKER, ...TICKER].map(([city, result], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginRight: 72,
                fontFamily: theme.fonts.body,
                fontSize: 28,
              }}
            >
              <Icon name="pin" size={26} color={theme.colors.gold2} />
              <span style={{ color: theme.colors.text, fontWeight: 700 }}>
                {city}
              </span>
              <span style={{ color: theme.colors.muted }}>{result}</span>
            </div>
          ))}
        </div>
      </div>

      {new Array(14).fill(true).map((_, i) => (
        <Sfx
          key={i}
          name="tick"
          at={STAT_AT + i * 4}
          volume={0.28}
          rate={1 + i * 0.03}
        />
      ))}
      {STATS.map((s, i) => (
        <Sfx
          key={s.label}
          name="pop"
          at={STAT_AT + 34 + i * 5}
          volume={0.35}
          rate={0.9 + i * 0.06}
        />
      ))}
      <Sfx name="whoosh-soft" at={68} volume={0.35} />
    </SceneExit>
  );
};

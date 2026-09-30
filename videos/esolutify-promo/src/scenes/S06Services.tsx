import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Icon, IconRing, type IconName } from "../components/Icons";
import {
  Eyebrow,
  LightSweep,
  SceneExit,
  WordReveal,
  useBreathe,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 6 — One team, from first click to paying customer (285f)
const SERVICES: { title: string; line: string; icon: IconName }[] = [
  { title: "Meta & Google Ads", line: "4.8x average ROAS", icon: "target" },
  { title: "SEO", line: "Rank higher on Google", icon: "trending" },
  {
    title: "Social Media",
    line: "Instagram · TikTok · LinkedIn",
    icon: "share",
  },
  { title: "Websites", line: "Fast, built to convert", icon: "monitor" },
  {
    title: "Graphic Design",
    line: "Logos · branding · ad creative",
    icon: "pen",
  },
  { title: "Video Production", line: "Script to final cut", icon: "video" },
  { title: "Mobile Apps", line: "iOS · Android · Flutter", icon: "phone" },
  {
    title: "Free Website Demo",
    line: "See it before you pay",
    icon: "sparkle",
  },
];

const LEFT = 150;
const TOP = 330;
const FLAG_W = 560;
const GRID_GAP = 22;
const GRID_LEFT = LEFT + FLAG_W + 30;
const TILE_W = (1920 - LEFT - GRID_LEFT - GRID_GAP * 3) / 4;
const TILE_H = 300;
const TILE_AT = 64;

export const S06Services: React.FC = () => {
  const frame = useCurrentFrame();
  const flag = useEntrance(34, "smooth");
  const breathe = useBreathe(24, 0.008);
  const botPulse = 0.5 + 0.5 * Math.sin(frame / 9);

  return (
    <SceneExit frames={12}>
      <AbsoluteFill style={{ left: LEFT, top: 104 }}>
        <Eyebrow text="What we do" delay={0} align="left" />
        <div style={{ height: 20 }} />
        <WordReveal
          words={[
            "One",
            "team.",
            "From",
            "first",
            "click",
            "to",
            { text: "paying", tone: "gold" },
            { text: "customer.", tone: "gold" },
          ]}
          delay={6}
          per={3}
          size={70}
          align="flex-start"
        />
      </AbsoluteFill>

      {/* flagship */}
      <div
        style={{
          position: "absolute",
          left: LEFT,
          top: TOP,
          width: FLAG_W,
          height: TILE_H * 2 + GRID_GAP,
          borderRadius: 30,
          padding: 2,
          background: `linear-gradient(160deg, ${theme.colors.goldBright}, rgba(200,151,58,0.15) 45%, rgba(200,151,58,0.5))`,
          boxShadow: `0 40px 90px -30px rgba(0,0,0,0.8), 0 0 70px rgba(200,151,58,0.14)`,
          opacity: interpolate(flag, [0, 0.4], [0, 1], clamp),
          translate: `${interpolate(flag, [0, 1], [-90, 0])}px 0px`,
          scale: interpolate(flag, [0, 1], [0.94, 1]) * breathe,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 28,
            overflow: "hidden",
            padding: "46px 46px",
            background:
              "radial-gradient(420px 320px at 30% 10%, rgba(200,151,58,0.22), transparent 70%), linear-gradient(180deg, #1A1712, #121212)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              padding: "9px 18px",
              borderRadius: 99,
              background: theme.gradients.gold,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.2em",
              color: "#0A0A0A",
            }}
          >
            FLAGSHIP SERVICE
          </div>
          <div style={{ marginTop: 44 }}>
            <IconRing name="bot" size={136} lit={0.3 + botPulse * 0.4} />
          </div>
          <div
            style={{
              marginTop: 36,
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 56,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: theme.colors.text,
            }}
          >
            AI Chatbots & Lead Automation
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: theme.fonts.body,
              fontSize: 26,
              lineHeight: 1.45,
              color: theme.colors.muted,
            }}
          >
            AI chat agents, instant lead response and follow-up on WhatsApp,
            Instagram, SMS, phone and web.
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 24,
              color: theme.colors.gold2,
            }}
          >
            <Icon name="zap" size={26} color={theme.colors.gold2} stroke={2} />
            Every lead answered in seconds
          </div>
          <LightSweep start={60} duration={36} width={220} opacity={0.18} />
        </div>
      </div>

      {/* service grid */}
      {SERVICES.map((s, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <Tile
            key={s.title}
            service={s}
            x={GRID_LEFT + col * (TILE_W + GRID_GAP)}
            y={TOP + row * (TILE_H + GRID_GAP)}
            at={TILE_AT + i * 6}
            sweepAt={176 + (col + row) * 5}
          />
        );
      })}

      <Sfx name="whoosh" at={31} volume={0.5} />
      {SERVICES.map((s, i) => (
        <Sfx
          key={s.title}
          name="tick"
          at={TILE_AT + i * 6 - 2}
          volume={0.35}
          rate={1 + i * 0.04}
        />
      ))}
      <Sfx name="shimmer" at={172} volume={0.35} />
    </SceneExit>
  );
};

const Tile: React.FC<{
  service: (typeof SERVICES)[number];
  x: number;
  y: number;
  at: number;
  sweepAt: number;
}> = ({ service, x, y, at, sweepAt }) => {
  const p = useEntrance(at, "snappy");
  const breathe = useBreathe(28, 0.006);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: TILE_W,
        height: TILE_H,
        borderRadius: 24,
        overflow: "hidden",
        padding: "30px 26px",
        background: theme.gradients.card,
        border: `1px solid ${theme.colors.line}`,
        boxShadow: theme.shadow.card,
        display: "flex",
        flexDirection: "column",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [50, 0])}px`,
        scale: interpolate(p, [0, 1], [0.9, 1]) * breathe,
      }}
    >
      <IconRing name={service.icon} size={74} />
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 32,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          color: theme.colors.text,
        }}
      >
        {service.title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: theme.fonts.body,
          fontSize: 21,
          lineHeight: 1.35,
          color: theme.colors.muted,
        }}
      >
        {service.line}
      </div>
      <LightSweep start={sweepAt} duration={30} width={160} opacity={0.16} />
    </div>
  );
};

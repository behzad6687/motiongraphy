import React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

// Layer 1 — drifting gold/red mesh, dot grid and slow gold dust.
// Lives once at the top level so the ground stays continuous across cuts.
const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 60) * 60;
  const d2 = Math.cos(frame / 75) * 50;
  const d3 = Math.sin(frame / 90 + 1) * 40;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 620px at ${12 + d1 / 40}% ${-8 + d3 / 30}%, rgba(200,151,58,0.20), transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 520px at ${96 - d2 / 40}% ${104 + d1 / 50}%, rgba(237,28,36,0.10), transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 700px at ${70 + d3 / 30}% ${40 + d2 / 40}%, rgba(200,151,58,0.06), transparent 70%)`,
        }}
      />
      {/* dot grid, masked to the centre */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.10) 1.2px, transparent 1.3px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${frame * 0.15}px ${frame * 0.1}px`,
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.55), transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.55), transparent 80%)",
        }}
      />
      <GoldDust />
    </AbsoluteFill>
  );
};

const DUST = new Array(38).fill(true).map((_, i) => ({
  x: random(`dx${i}`),
  y: random(`dy${i}`),
  r: 1 + random(`dr${i}`) * 2.6,
  speed: 0.15 + random(`ds${i}`) * 0.45,
  phase: random(`dp${i}`) * Math.PI * 2,
  alpha: 0.12 + random(`da${i}`) * 0.35,
}));

// Positions are normalised, so the dust fills any canvas (16:9 film, 9:16 ad).
const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const count = Math.round((DUST.length * width * height) / (1920 * 1080));
  return (
    <AbsoluteFill>
      {DUST.slice(0, count).map((p, i) => {
        const span = height + 100;
        const y =
          ((((p.y * height - frame * p.speed) % span) + span) % span) - 50;
        const x = p.x * width + Math.sin(frame / 50 + p.phase) * 18;
        const twinkle = 0.6 + 0.4 * Math.sin(frame / 20 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              background: theme.colors.gold2,
              opacity: p.alpha * twinkle,
              boxShadow: `0 0 ${p.r * 6}px ${theme.colors.glow}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Layer 4 — soft-light gold grade unifies UI, photos and screenshots.
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.gold,
        mixBlendMode: "soft-light",
        opacity: 0.12,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.18), transparent 26%, transparent 74%, rgba(0,0,0,0.28))",
      }}
    />
  </AbsoluteFill>
);

// Layer 5a — procedural film grain, zero asset files.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: NOISE,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 71) % 220}px ${(frame * 137) % 220}px`,
        opacity: 0.07,
        mixBlendMode: "overlay",
      }}
    />
  );
};

// Layer 5b — vignette, topmost.
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

// The five-layer stack: mesh → (assets + graphics = children) → grade → grain → vignette
export const Stage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <BgMesh />
    <AbsoluteFill>{children}</AbsoluteFill>
    <Grade />
    <Grain />
    <Vignette />
  </AbsoluteFill>
);

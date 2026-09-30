import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { IconRing, type IconName } from "../components/Icons";
import {
  Eyebrow,
  SceneExit,
  WordReveal,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 4 — How it works: Capture · Converse · Convert (225f)
const STEPS: { n: string; title: string; body: string; icon: IconName }[] = [
  {
    n: "01",
    title: "Capture",
    body: "Ads, SEO, your website and social bring the enquiry in.",
    icon: "funnel",
  },
  {
    n: "02",
    title: "Converse",
    body: "Your AI agent replies in seconds, on the same channel.",
    icon: "chat",
  },
  {
    n: "03",
    title: "Convert",
    body: "It books, reminds and follows up until there’s a yes or a no.",
    icon: "calendarCheck",
  },
];

const CARD_W = 480;
const GAP = 60;
const LEFT = (1920 - (CARD_W * 3 + GAP * 2)) / 2;
const RING_Y = 530; // ring centre line
const CARD_AT = [48, 78, 108];

export const S04System: React.FC = () => {
  const frame = useCurrentFrame();

  const x0 = LEFT + CARD_W / 2;
  const x1 = LEFT + CARD_W * 2.5 + GAP * 2;
  const draw = interpolate(frame, [40, 120], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  // a lead-pulse travels the circuit
  const pulseP = interpolate(frame, [140, 196], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const pulseX = x0 + (x1 - x0) * pulseP;
  const pulseOn = frame >= 138 && frame <= 204;

  return (
    <SceneExit frames={12}>
      <AbsoluteFill style={{ top: 100, alignItems: "center" }}>
        <Eyebrow text="How it works" delay={0} />
        <div style={{ height: 22 }} />
        <WordReveal
          words={[
            { text: "Most", tone: "muted" },
            { text: "agencies", tone: "muted" },
            { text: "stop", tone: "muted" },
            { text: "at", tone: "muted" },
            { text: "the", tone: "muted" },
            { text: "lead.", tone: "muted" },
          ]}
          delay={4}
          per={3}
          size={58}
        />
        <WordReveal
          words={[
            "We",
            "build",
            { text: "what", tone: "gold" },
            { text: "happens", tone: "gold" },
            { text: "next.", tone: "gold" },
          ]}
          delay={20}
          per={4}
          size={72}
        />
      </AbsoluteFill>

      {/* circuit line */}
      <div
        style={{
          position: "absolute",
          left: x0,
          top: RING_Y - 1,
          width: (x1 - x0) * draw,
          height: 2,
          background: `linear-gradient(90deg, ${theme.colors.gold}, ${theme.colors.goldBright})`,
          boxShadow: `0 0 14px ${theme.colors.glow}`,
        }}
      />
      {pulseOn ? (
        <div
          style={{
            position: "absolute",
            left: pulseX - 60,
            top: RING_Y - 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,226,160,0.95) 0%, rgba(232,184,75,0.5) 18%, transparent 60%)`,
          }}
        />
      ) : null}

      {STEPS.map((s, i) => {
        const cx = LEFT + CARD_W * (i + 0.5) + GAP * i;
        const lit = pulseOn ? Math.max(0, 1 - Math.abs(pulseX - cx) / 180) : 0;
        return (
          <StepCard
            key={s.n}
            step={s}
            x={LEFT + (CARD_W + GAP) * i}
            at={CARD_AT[i]}
            lit={lit}
          />
        );
      })}

      <Sfx name="whoosh-soft" at={0} volume={0.35} />
      {CARD_AT.map((f) => (
        <Sfx key={f} name="pop" at={f - 2} volume={0.55} />
      ))}
      <Sfx name="blip" at={140} volume={0.35} rate={0.9} />
      <Sfx name="blip" at={166} volume={0.35} rate={1.1} />
      <Sfx name="blip" at={192} volume={0.35} rate={1.3} />
    </SceneExit>
  );
};

const StepCard: React.FC<{
  step: (typeof STEPS)[number];
  x: number;
  at: number;
  lit: number;
}> = ({ step, x, at, lit }) => {
  const ring = useEntrance(at, "bouncy");
  const body = useEntrance(at + 6, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: RING_Y - 56,
        width: CARD_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        translate: `0px ${-lit * 10}px`,
      }}
    >
      <div
        style={{
          scale: interpolate(ring, [0, 1], [0.3, 1]),
          opacity: interpolate(ring, [0, 0.4], [0, 1], clamp),
          background: theme.colors.bg,
          borderRadius: "50%",
        }}
      >
        <IconRing name={step.icon} size={112} lit={lit} />
      </div>
      <div
        style={{
          marginTop: 30,
          width: "100%",
          padding: "34px 40px 38px",
          borderRadius: 26,
          background: theme.gradients.card,
          border: `1px solid ${lit > 0.2 ? theme.colors.goldLine : theme.colors.line}`,
          boxShadow: theme.shadow.card,
          opacity: interpolate(body, [0, 0.5], [0, 1], clamp),
          translate: `0px ${interpolate(body, [0, 1], [40, 0])}px`,
          scale: interpolate(body, [0, 1], [0.95, 1]),
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "0.2em",
            color: theme.colors.dim,
          }}
        >
          {step.n}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 60,
            letterSpacing: "-0.03em",
            color: theme.colors.text,
            marginTop: 6,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 28,
            lineHeight: 1.35,
            color: theme.colors.muted,
            marginTop: 14,
          }}
        >
          {step.body}
        </div>
      </div>
    </div>
  );
};

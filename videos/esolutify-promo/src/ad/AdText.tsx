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
import { Icon } from "../components/Icons";
import { WordReveal, useEntrance } from "../components/Motion";
import { clamp, theme } from "../theme";
import { CUTS, MONTAGE, PROCESS, SITES, WALL, type Timing } from "./timeline";

// All copy sits in the Meta safe zone: y 290–1160, x 65–960 (see SafeZones).

// Mounts children in [from, until + exit); fades/lifts/blurs them out on exit.
const Window: React.FC<{
  from: number;
  until: number;
  exit?: number;
  lift?: number;
  children: React.ReactNode;
}> = ({ from, until, exit = 6, lift = 30, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= until + exit) return null;
  const p = interpolate(frame, [until, until + exit], [0, 1], {
    ...clamp,
    easing: theme.ease.in,
  });
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - p,
        translate: `0px ${-lift * p}px`,
        filter: p > 0.01 ? `blur(${6 * p}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Line: React.FC<{ top: number; children: React.ReactNode }> = ({
  top,
  children,
}) => (
  <div style={{ position: "absolute", left: 90, right: 90, top }}>
    {children}
  </div>
);

const Sub: React.FC<{
  text: string;
  at: number;
  top: number;
  size?: number;
}> = ({ text, at, top, size = 44 }) => {
  const p = useEntrance(at, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: size,
        lineHeight: 1.2,
        color: theme.colors.muted,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [24, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

// Persistent logo; grows into the CTA lockup.
export const TopLogo: React.FC<{ t: Timing }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame + 6, fps, config: theme.spring.smooth });
  const grow = spring({
    frame: frame - t.cta,
    fps,
    config: theme.spring.bouncy,
  });
  const w = interpolate(grow, [0, 1], [200, 380]);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: interpolate(grow, [0, 1], [290, 300]),
        width: w,
        opacity: interpolate(inP, [0, 0.5], [0, 1], clamp),
        scale: interpolate(inP, [0, 1], [0.96, 1]),
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
      }}
    >
      <Img src={staticFile("brand/logo.png")} style={{ width: "100%" }} />
    </div>
  );
};

// S1 — the offer on frame 0.
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const collapse = interpolate(frame, [24, 31], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const sticker = spring({
    frame: frame - 34,
    fps,
    config: theme.spring.bouncy,
  });
  const stickerOut = interpolate(frame, [54, 60], [0, 1], {
    ...clamp,
    easing: theme.ease.in,
  });
  return (
    <>
      <Window from={-10} until={54}>
        {/* phase 1: big two-line lead, collapses into a small kicker */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 392,
            opacity: 1 - collapse,
            scale: 1 - 0.35 * collapse,
            transformOrigin: "50% 0%",
          }}
        >
          <WordReveal words={["See", "your"]} delay={-12} per={3} size={112} />
          <WordReveal
            words={["new", "website"]}
            delay={-7}
            per={3}
            size={112}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 392,
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 52,
            color: theme.colors.muted,
            opacity: collapse,
          }}
        >
          See your new website
        </div>
        <Line top={466}>
          <WordReveal
            words={["before", "you", "pay"]}
            delay={26}
            per={3}
            size={104}
          />
          <WordReveal
            words={[
              { text: "a", tone: "gold" },
              { text: "dollar.", tone: "gold" },
            ]}
            delay={32}
            per={3}
            size={104}
          />
        </Line>
      </Window>
      {frame < 60 ? (
        <div
          style={{
            position: "absolute",
            left: 170,
            top: 712,
            width: 480,
            height: 72,
            borderRadius: 99,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.gradients.gold,
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: "0.06em",
            color: "#0A0A0A",
            rotate: "-4deg",
            scale: sticker * (1 - 0.1 * stickerOut),
            opacity: 1 - stickerOut,
            zIndex: 2,
          }}
        >
          FREE · NO OBLIGATION
        </div>
      ) : null}
    </>
  );
};

// S2/S3 — a demo, not a mockup.
const DemoNotMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const roll = interpolate(frame, [120, 127], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  return (
    <Window from={58} until={174}>
      <Line top={392}>
        <WordReveal
          words={[
            { text: "A", tone: "gold" },
            { text: "demo,", tone: "gold" },
          ]}
          delay={60}
          per={3}
          size={100}
        />
        <WordReveal
          words={["not", "a", "mockup."]}
          delay={66}
          per={3}
          size={100}
        />
      </Line>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 640,
          height: 64,
          overflow: "hidden",
        }}
      >
        <div style={{ translate: `0px ${-64 * roll}px`, opacity: 1 - roll }}>
          <Sub text="A working site you can click through." at={72} top={4} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 64 * (1 - roll),
            display: "flex",
            justifyContent: "center",
            opacity: roll,
          }}
        >
          <Chip text={`${SITES.greersmiles.chip} · demo`} />
        </div>
      </div>
    </Window>
  );
};

const Chip: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      height: 60,
      padding: "0 28px",
      borderRadius: 99,
      background: theme.colors.surface2,
      border: `1px solid ${theme.colors.goldLine}`,
      fontFamily: theme.fonts.body,
      fontWeight: 600,
      fontSize: 38,
      color: theme.colors.text,
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: theme.colors.gold2,
      }}
    />
    {text}
  </div>
);

// S4 — the montage: we build websites like this.
const Montage: React.FC<{ t: Timing }> = ({ t }) => {
  const frame = useCurrentFrame();
  let idx = 0;
  CUTS.forEach((c, i) => {
    if (frame >= c) idx = i;
  });
  const flip = interpolate(frame, [CUTS[idx], CUTS[idx] + 6], [90, 0], {
    ...clamp,
    easing: theme.ease.out,
  });
  return (
    <Window from={178} until={t.wall ? WALL - 4 : t.cta - 4}>
      <Line top={392}>
        <WordReveal
          words={["We", "build", "websites"]}
          delay={180}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            { text: "like", tone: "gold" },
            { text: "this.", tone: "gold" },
          ]}
          delay={189}
          per={3}
          size={96}
        />
      </Line>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 628,
          display: "flex",
          justifyContent: "center",
          perspective: 600,
        }}
      >
        <div
          style={{
            rotate: `x ${flip}deg`,
            opacity: interpolate(flip, [30, 90], [1, 0], clamp),
          }}
        >
          <Chip text={SITES[MONTAGE[idx]].chip} />
        </div>
      </div>
    </Window>
  );
};

// S5 — your brand, not a theme (21s only).
const YourBrand: React.FC = () => (
  <Window from={WALL} until={PROCESS}>
    <Line top={392}>
      <WordReveal
        words={[
          { text: "Your", tone: "gold" },
          { text: "brand,", tone: "gold" },
        ]}
        delay={WALL}
        per={3}
        size={96}
      />
      <WordReveal
        words={["not", "a", "theme."]}
        delay={WALL + 6}
        per={3}
        size={96}
      />
    </Line>
    <Sub
      text="Your logo · your colours · your customers"
      at={WALL + 12}
      top={630}
    />
  </Window>
);

// S6 — the process in about a week (21s only).
const STEPS = [
  { main: "Apply in 2 minutes", sub: null, at: 375, top: 632 },
  { main: "A 10-minute call", sub: null, at: 390, top: 748 },
  {
    main: "We build your demo",
    sub: "Usually within 5–7 days",
    at: 405,
    top: 864,
  },
  { main: "Love it? Buy it.", sub: "Don’t? Walk away.", at: 420, top: 1010 },
];

const Process: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ringX = 110;
  const RING = 84;
  return (
    <Window from={PROCESS} until={468} exit={12}>
      <Line top={392}>
        <WordReveal
          words={["Your", "demo", "in"]}
          delay={360}
          per={3}
          size={92}
        />
        <WordReveal
          words={[
            { text: "about", tone: "gold" },
            { text: "a", tone: "gold" },
            { text: "week.", tone: "gold" },
          ]}
          delay={366}
          per={3}
          size={92}
        />
      </Line>
      {/* circuit line between the rings */}
      {STEPS.slice(0, -1).map((s, i) => {
        const next = STEPS[i + 1];
        const p = interpolate(frame, [s.at + 3, next.at - 2], [0, 1], {
          ...clamp,
          easing: theme.ease.inOut,
        });
        return (
          <div
            key={s.main}
            style={{
              position: "absolute",
              left: ringX + RING / 2 - 1,
              top: s.top + RING,
              width: 2,
              height: (next.top - s.top - RING) * p,
              background: theme.colors.gold,
              boxShadow: `0 0 10px ${theme.colors.glow}`,
            }}
          />
        );
      })}
      {STEPS.map((s, i) => {
        const pop = spring({
          frame: frame - s.at,
          fps,
          config: theme.spring.snappy,
        });
        const txt = spring({
          frame: frame - s.at + 2,
          fps,
          config: theme.spring.smooth,
        });
        const last = i === STEPS.length - 1;
        return (
          <React.Fragment key={s.main}>
            <div
              style={{
                position: "absolute",
                left: ringX,
                top: s.top,
                width: RING,
                height: RING,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2.5px solid ${last ? theme.colors.ok : theme.colors.gold2}`,
                background: last ? theme.colors.ok : theme.colors.bg,
                boxShadow: last
                  ? `0 0 30px ${theme.colors.okSoft}`
                  : `0 0 20px rgba(200,151,58,0.2)`,
                scale: interpolate(pop, [0, 1], [0.6, 1]),
                opacity: interpolate(pop, [0, 0.3], [0, 1], clamp),
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 40,
                color: theme.colors.text,
              }}
            >
              {last ? (
                <Icon name="check" size={46} color="#0A0A0A" stroke={3} />
              ) : (
                i + 1
              )}
            </div>
            <div
              style={{
                position: "absolute",
                left: ringX + RING + 32,
                top: s.top + (s.sub ? -4 : 14),
                opacity: interpolate(txt, [0, 0.5], [0, 1], clamp),
                translate: `0px ${interpolate(txt, [0, 1], [24, 0])}px`,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 48,
                  color: theme.colors.text,
                  lineHeight: 1.15,
                }}
              >
                {s.main}
              </div>
              {s.sub ? (
                <div
                  style={{
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    fontSize: 40,
                    color: theme.colors.muted,
                    lineHeight: 1.2,
                  }}
                >
                  {s.sub}
                </div>
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
    </Window>
  );
};

export const AdText: React.FC<{ t: Timing }> = ({ t }) => (
  <AbsoluteFill>
    <Hook />
    <DemoNotMockup />
    <Montage t={t} />
    {t.wall ? <YourBrand /> : null}
    {t.wall ? <Process /> : null}
  </AbsoluteFill>
);

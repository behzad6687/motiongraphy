import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PhoneShell, Tap, phoneViewportHeight } from "../components/Devices";
import { Icon, type IconName } from "../components/Icons";
import { WordReveal, useEntrance } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import {
  BottomFade,
  CtaButton,
  Flash,
  Head,
  Logo,
  StatCards,
  Sub,
  UrlLine,
  Window,
  ease,
} from "../reel/kit";
import { clamp, theme } from "../theme";

// Local SEO — 9:16 Reel / Short, 24 s @ 30 fps (720 frames).
// Story (esolutify.com/local-seo, "When Neighbours Search, They Find You
// First"): someone nearby searches "dentist near me" → you're on page two →
// on the drop you jump to #1 on the map and the list → they call, ask for
// directions, visit your site → 300% / page 1 / 500+ → "See who outranks
// you." with the page's free ranking check.
// 90 BPM (20 frames a beat, 80 a bar): the climb lands on the drop (f160);
// each scene starts on a bar. Copy stays in y 290–1160.

export const SEO_DURATION = 720;
const BEAT = 20;
const DROP = 160;
const CALLS = 240;
const PROOF = 400;
const CTA = 560;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;
const VH = phoneViewportHeight(PHONE_W);

const QUERY = "dentist near me";
const TYPE_AT = 4;
const MAP_TOP = 96;
const LIST = 364;
const ROW = 104;
const CARD_H = 92;
const ACTIONS_H = 80;
const slotY = (i: number) => LIST + i * ROW;

type Action = { icon: IconName; label: string; gain: string };
const ACTIONS: Action[] = [
  { icon: "handset", label: "Call", gain: "+1 call" },
  { icon: "directions", label: "Directions", gain: "+1 visit" },
  { icon: "globe", label: "Website", gain: "+1 click" },
];
// customers acting on the #1 listing, one tap a beat
const TAPS = [1, 2, 3, 4, 5, 6].map((b) => CALLS + b * BEAT);

const OTHERS = [
  { stars: 4, meta: "2.1 km · Open" },
  { stars: 4, meta: "3.4 km · Open" },
  { stars: 3, meta: "1.8 km · Closed" },
];

const Stars: React.FC<{ n: number; size?: number }> = ({ n, size = 17 }) => (
  <span style={{ letterSpacing: "0.06em", fontSize: size }}>
    <span style={{ color: theme.colors.gold2 }}>{"★".repeat(n)}</span>
    <span style={{ color: theme.colors.dim }}>{"★".repeat(5 - n)}</span>
  </span>
);

// ---------------------------------------------------------------- text layer
const Copy: React.FC = () => (
  <AbsoluteFill>
    {/* the hook, readable on frame 0 */}
    <Window from={-10} until={74}>
      <Head>
        <WordReveal
          words={["Someone", "nearby"]}
          delay={-12}
          per={3}
          size={100}
        />
        <WordReveal
          words={[
            { text: "needs", tone: "gold" },
            { text: "what", tone: "gold" },
            { text: "you", tone: "gold" },
            { text: "do.", tone: "gold" },
          ]}
          delay={-6}
          per={3}
          size={86}
        />
      </Head>
    </Window>
    {/* the problem (site copy) */}
    <Window from={80} until={DROP - 6}>
      <Head>
        <WordReveal
          words={["But", "you’re", "on"]}
          delay={82}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            { text: "page", tone: "red" },
            { text: "two.", tone: "red" },
          ]}
          delay={90}
          per={3}
          size={112}
        />
      </Head>
      <Sub text="Where nobody looks." at={104} />
    </Window>
    {/* the climb, on the drop */}
    <Window from={DROP} until={CALLS - 6}>
      <Head>
        <WordReveal
          words={["We", "get", "you"]}
          delay={DROP}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            { text: "to", tone: "gold" },
            { text: "the", tone: "gold" },
            { text: "top.", tone: "gold", underline: true },
          ]}
          delay={DROP + 6}
          per={3}
          size={112}
        />
      </Head>
      <Sub text="The first name they see." at={DROP + 18} />
    </Window>
    {/* what #1 brings */}
    <Window from={CALLS} until={PROOF - 6}>
      <Head>
        <WordReveal
          words={["More", "calls."]}
          delay={CALLS}
          per={4}
          size={100}
        />
        <WordReveal
          words={[
            { text: "More", tone: "gold" },
            { text: "visits.", tone: "gold" },
          ]}
          delay={CALLS + 8}
          per={4}
          size={100}
        />
      </Head>
      <Sub text="They were already looking for what you do." at={CALLS + 20} />
    </Window>
    {/* proof */}
    <Window from={PROOF} until={CTA - 6}>
      <Counter />
      <Head top={556}>
        <WordReveal
          words={["more", "organic", "traffic."]}
          delay={PROOF + 6}
          per={3}
          size={76}
        />
      </Head>
      <Sub
        text="Average, within 6 months."
        at={PROOF + 16}
        top={650}
        size={30}
      />
    </Window>
  </AbsoluteFill>
);

const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - PROOF, fps, config: theme.spring.counter });
  const pop = spring({
    frame: frame - PROOF,
    fps,
    config: theme.spring.snappy,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 380,
        textAlign: "center",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 160,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
        backgroundImage: theme.gradients.gold,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 28px ${theme.colors.glow})`,
        opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        scale: interpolate(pop, [0, 1], [0.8, 1]),
      }}
    >
      {Math.round(300 * p)}%
    </div>
  );
};

// ---------------------------------------------------------------- the phone
const Pin: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  dot?: string;
}> = ({ x, y, size, color, dot = "#0A0A0A" }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 24 31"
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size * 1.3,
      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
    }}
  >
    <path
      d="M12 0C5.4 0 0 5.2 0 11.7 0 20.5 12 31 12 31s12-10.5 12-19.3C24 5.2 18.6 0 12 0z"
      fill={color}
    />
    <circle cx={12} cy={11.5} r={4.5} fill={dot} />
  </svg>
);

const MapView: React.FC<{ rise: number }> = ({ rise }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const show = ease(frame, 36, 50);
  const bounce = spring({
    frame: frame - (DROP + 2),
    fps,
    config: theme.spring.bouncy,
  });
  const ring = ((frame - DROP) % 40) / 40;
  const others: [number, number][] = [
    [96, 96],
    [318, 70],
    [392, 176],
  ];
  const you: [number, number] = [214, 158];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: MAP_TOP,
        height: 250,
        overflow: "hidden",
        background: "#15171B",
      }}
    >
      <svg
        width={PHONE_W}
        height={250}
        style={{ position: "absolute", inset: 0 }}
      >
        <rect x={250} y={150} width={120} height={80} rx={10} fill="#16231B" />
        <path
          d="M-10 190 Q120 150 230 205 T470 200"
          stroke="#152536"
          strokeWidth={26}
          fill="none"
        />
        <path d="M-10 52 L470 132" stroke="#262A31" strokeWidth={16} />
        <path d="M150 -10 L262 260" stroke="#262A31" strokeWidth={14} />
        <path d="M-10 236 L470 210" stroke="#22262C" strokeWidth={9} />
        <path d="M360 -10 L420 260" stroke="#22262C" strokeWidth={9} />
        <path d="M40 -10 L20 260" stroke="#1E2227" strokeWidth={7} />
      </svg>
      {others.map(([x, y], i) => (
        <div key={i} style={{ opacity: show * (1 - 0.5 * rise) }}>
          <Pin x={x} y={y} size={30} color="#5B5F66" dot="#2A2D32" />
        </div>
      ))}
      {rise > 0.02 ? (
        <div
          style={{
            position: "absolute",
            left: you[0] - 40,
            top: you[1] - 20,
            width: 80,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${theme.colors.gold2}`,
            scale: 0.5 + ring * 1.2,
            opacity: (1 - ring) * rise,
          }}
        />
      ) : null}
      <div style={{ opacity: show }}>
        <Pin
          x={you[0]}
          y={you[1]}
          size={interpolate(bounce, [0, 1], [26, 46])}
          color={rise > 0.5 ? theme.colors.gold2 : "#45484E"}
          dot={rise > 0.5 ? "#0A0A0A" : "#2A2D32"}
        />
      </div>
    </div>
  );
};

const ResultCard: React.FC<{
  you?: boolean;
  stars: number;
  meta: string;
  top: number;
  height: number;
  opacity: number;
  gold: number;
  scale?: number;
  expand?: number;
}> = ({
  you,
  stars,
  meta,
  top,
  height,
  opacity,
  gold,
  scale = 1,
  expand = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: 20,
      width: 420,
      top,
      height,
      borderRadius: 22,
      overflow: "hidden",
      background:
        gold > 0.5
          ? "linear-gradient(180deg, #241D10, #17130C)"
          : theme.colors.surface2,
      border: `2px ${you && gold < 0.5 ? "dashed" : "solid"} ${
        gold > 0.5
          ? theme.colors.gold2
          : you
            ? "rgba(237,28,36,0.6)"
            : theme.colors.line
      }`,
      boxShadow: gold > 0.5 ? `0 0 40px ${theme.colors.glow}` : "none",
      opacity,
      scale,
      zIndex: you ? 5 : 1,
      fontFamily: theme.fonts.body,
      color: theme.colors.text,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 20,
        width: 52,
        height: 52,
        borderRadius: 14,
        background: gold > 0.5 ? theme.gradients.gold : theme.colors.surface3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        name="pin"
        size={28}
        color={gold > 0.5 ? "#0A0A0A" : theme.colors.dim}
        stroke={2}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: 82,
        top: 16,
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 24,
      }}
    >
      {you ? "Your business" : "Another clinic"}
    </div>
    <div
      style={{
        position: "absolute",
        left: 82,
        top: 50,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 17,
        color: you && gold > 0.5 ? theme.colors.text : theme.colors.muted,
      }}
    >
      <Stars n={stars} />
      {meta}
    </div>
    {you ? (
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 24,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: theme.gradients.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 22,
          color: "#0A0A0A",
          scale: gold,
        }}
      >
        #1
      </div>
    ) : null}
    {you && expand > 0 ? (
      <div
        style={{
          position: "absolute",
          left: 16,
          top: CARD_H,
          display: "flex",
          gap: 8,
          opacity: interpolate(expand, [0.4, 1], [0, 1], clamp),
        }}
      >
        {ACTIONS.map((a) => (
          <div
            key={a.label}
            style={{
              width: 124,
              height: 56,
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: theme.colors.goldSoft,
              border: `1px solid ${theme.colors.goldLine}`,
              fontSize: 17,
              fontWeight: 700,
              color: theme.colors.gold2,
            }}
          >
            <Icon
              name={a.icon}
              size={20}
              color={theme.colors.gold2}
              stroke={2.2}
            />
            {a.label}
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

const MapsScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = Math.max(
    0,
    Math.min(QUERY.length, Math.floor((frame - TYPE_AT) / 2)),
  );
  const caret = frame % 16 < 8;
  const rise = spring({
    frame: frame - (DROP - 4),
    fps,
    config: theme.spring.smooth,
  });
  const expand = spring({
    frame: frame - (CALLS - 4),
    fps,
    config: theme.spring.smooth,
  });
  const youTop = interpolate(rise, [0, 1], [slotY(3) + 46, slotY(0)]);
  const youH = CARD_H + ACTIONS_H * expand;
  const page2 = ease(frame, 58, 66) * (1 - ease(frame, DROP - 4, DROP + 4));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        overflow: "hidden",
        background: "#0F0F10",
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      {/* search bar */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 16,
          width: 420,
          height: 64,
          borderRadius: 32,
          background: theme.colors.surface2,
          border: `1px solid ${theme.colors.line2}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 22px",
          fontSize: 24,
        }}
      >
        <Icon name="search" size={26} color={theme.colors.muted} stroke={2.2} />
        <span>{QUERY.slice(0, typed)}</span>
        {caret && frame < DROP ? (
          <span
            style={{
              width: 2,
              height: 30,
              marginLeft: -12,
              background: theme.colors.gold2,
            }}
          />
        ) : null}
      </div>
      <MapView rise={rise} />
      {OTHERS.map((o, i) => {
        const at = 40 + i * 6;
        const p = ease(frame, at, at + 8);
        const top =
          interpolate(rise, [0, 1], [slotY(i), slotY(i + 1)]) +
          ACTIONS_H * expand;
        return (
          <ResultCard
            key={i}
            stars={o.stars}
            meta={o.meta}
            top={top + (1 - p) * 30}
            height={CARD_H}
            opacity={p * (1 - 0.35 * rise)}
            gold={0}
          />
        );
      })}
      {/* page two, where nobody looks */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: slotY(3),
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#FF6B6B",
          opacity: page2,
        }}
      >
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,107,107,0.4)" }}
        />
        PAGE 2
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,107,107,0.4)" }}
        />
      </div>
      <ResultCard
        you
        stars={5}
        meta="Open now · Call"
        top={youTop}
        height={youH}
        opacity={ease(frame, 60, 68) * (0.55 + 0.45 * rise)}
        gold={rise}
        scale={1 + 0.06 * Math.sin(Math.PI * Math.min(rise, 1))}
        expand={expand}
      />
      {/* customers tapping the #1 listing */}
      {TAPS.map((at, i) => {
        const k = i % 3;
        const x = 20 + 16 + k * 132 + 62;
        const y = slotY(0) + CARD_H + 28;
        const t = ease(frame, at, at + 26, theme.ease.out);
        if (frame < at || frame > at + 28) return null;
        return (
          <div
            key={at}
            style={{
              position: "absolute",
              left: x - 70,
              width: 140,
              top: y - 74 - t * 60,
              display: "flex",
              justifyContent: "center",
              zIndex: 9,
              opacity: interpolate(
                frame - at,
                [0, 3, 20, 28],
                [0, 1, 1, 0],
                clamp,
              ),
              scale: interpolate(t, [0, 0.2], [0.7, 1], clamp),
            }}
          >
            <span
              style={{
                padding: "6px 16px",
                borderRadius: 99,
                background: theme.colors.ok,
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 22,
                color: "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              {ACTIONS[k].gain}
            </span>
          </div>
        );
      })}
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        {TAPS.map((at, i) => (
          <Tap
            key={`t${at}`}
            x={20 + 16 + (i % 3) * 132 + 62}
            y={slotY(0) + CARD_H + 28}
            at={at}
            size={80}
          />
        ))}
      </div>
    </div>
  );
};

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame + 8, fps, config: theme.spring.smooth });
  const sink = ease(frame, CTA, CTA + 18, theme.ease.inOut);
  const dim = 1 - 0.5 * ease(frame, PROOF, PROOF + 10) - 0.15 * sink;
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_LEFT,
        top: PHONE_TOP + interpolate(enter, [0, 1], [220, 0]) + sink * 520,
        opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
        filter:
          dim < 0.99 ? `brightness(${dim}) blur(${4 * sink}px)` : undefined,
      }}
    >
      <PhoneShell
        width={PHONE_W}
        glow={frame >= DROP ? 0.5 : 0.12}
        statusBg="#0F0F10"
      >
        <MapsScreen />
      </PhoneShell>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const SITE = "yourbusiness.com";

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const field = spring({
    frame: frame - (CTA + 20),
    fps,
    config: theme.spring.bouncy,
  });
  const sub = useEntrance(CTA + 34, "smooth");
  const typed = Math.max(
    0,
    Math.min(SITE.length, Math.floor((frame - (CTA + 26)) / 2)),
  );
  if (frame < CTA) return null;
  return (
    <AbsoluteFill>
      <Head top={440}>
        <WordReveal words={["See", "who"]} delay={CTA + 4} per={3} size={92} />
        <WordReveal
          words={[
            { text: "outranks", tone: "gold" },
            { text: "you.", tone: "gold" },
          ]}
          delay={CTA + 10}
          per={3}
          size={112}
        />
      </Head>
      <div
        style={{
          position: "absolute",
          left: 120,
          width: 840,
          top: 716,
          height: 116,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 30px",
          background: theme.colors.surface2,
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 50,
          color: theme.colors.text,
          opacity: interpolate(field, [0, 0.4], [0, 1], clamp),
          scale: interpolate(field, [0, 1], [0.8, 1]),
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            flexShrink: 0,
            background: theme.gradients.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="search" size={34} color="#0A0A0A" stroke={2.6} />
        </div>
        <span>{SITE.slice(0, typed)}</span>
        {typed < SITE.length || frame % 16 < 8 ? (
          <span
            style={{
              width: 3,
              height: 54,
              marginLeft: -18,
              background: theme.colors.gold2,
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 862,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 32,
          color: theme.colors.muted,
          opacity: sub,
        }}
      >
        Free, in about two minutes. Nothing is estimated.
      </div>
      <CtaButton label="Check my rankings" at={CTA + 44}>
        <Tap x={370} y={54} at={CTA + 86} size={100} />
      </CtaButton>
      <UrlLine url="esolutify.com/local-seo" at={CTA + 54} />
    </AbsoluteFill>
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["typing", TYPE_AT, 0.55],
  ["typing", TYPE_AT + 16, 0.5, 1.08],
  ["blip", 38, 0.3, 0.9],
  ["blip", 44, 0.3, 1],
  ["blip", 50, 0.3, 1.1],
  ["thud", 88, 0.45],
  ["whoosh", DROP - 10, 0.45],
  ["ping", DROP + 4, 0.45],
  ["whoosh-soft", CALLS - 6, 0.35],
  ...TAPS.map((t, i): Cue => ["pop", t - 2, 0.4, 1.1 + (i % 3) * 0.12]),
  ["chime", CALLS + 7 * BEAT - 2, 0.4],
  ...[0, 4, 8, 12, 16, 20, 24].map((d): Cue => ["tick", PROOF + d, 0.35]),
  ["pop", PROOF + 20, 0.4],
  ["pop", PROOF + 29, 0.4, 1.1],
  ["pop", PROOF + 38, 0.4, 1.2],
  ["shimmer", CTA, 0.35],
  ["typing", CTA + 26, 0.45],
  ["pop", CTA + 84, 0.45, 1.3],
];

export const SeoReel: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <PhoneLayer />
      <StatCards
        at={PROOF + 20}
        until={CTA}
        cards={[
          {
            icon: "trending",
            title: "Page 1 in 90 days",
            sub: "Average, for primary target keywords",
          },
          {
            icon: "globe",
            title: "500+ websites ranked",
            sub: "Canada, USA & UAE · 15+ years",
          },
          {
            icon: "shield",
            title: "White-hat only",
            sub: "No link farms. No shortcuts.",
          },
        ]}
      />
      <BottomFade />
      <Logo cta={CTA} />
      <Copy />
      <Cta />
      <Flash at={DROP} />
    </Stage>
    <Audio src={staticFile("audio/seo-music-24.wav")} volume={0.8} />
    {CUES.map(([name, at, volume, rate], i) => (
      <Sfx
        key={`${name}-${at}-${i}`}
        name={name}
        at={at}
        volume={volume}
        rate={rate}
      />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

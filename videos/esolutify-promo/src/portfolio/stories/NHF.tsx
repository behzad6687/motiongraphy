import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Icon } from "../../components/Icons";
import { LightSweep } from "../../components/Motion";
import { SafeZones } from "../../components/SafeZones";
import { Sfx } from "../../components/Sfx";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import { LaptopRec, PhoneRec, TabletRec } from "../kit";
import promos from "../../../public/stories/nhfclinics/desktop-promos.json";
import groups from "../../../public/stories/nhfclinics/tablet-groups.json";

// Story: N.H.F Clinics (nhfclinics.com, a live client site), 20 s, 9:16.
// Calm and clinical: soft white, the clinic's green and navy, a newspaper
// serif. The clinic is physician-led, so scenes change on a heartbeat: an
// ECG trace sweeps across the frame and the next scene follows its pen.
//   0–157    phone: the home page, from the hero to the signature treatments
//   157–333  laptop: the live promotions, clicked through
//   333–489  tablet: six treatment groups, one tap each
//   489–600  end card: "Your website, held to a higher standard."
// Music: story-pulse.wav (scripts/gen_story_music.py pulse): the pulse starts
// at 157, a lift at 333, the end card at 489.

export const NHF_DURATION = 600;
const A2 = 157;
const A3 = 333;
const END = 489;
const SRC = "stories/nhfclinics";

const NH = {
  paper: "#F3F6F2",
  paper2: "#E8EEE8",
  green: "#2F6B3A",
  greenLight: "#5E9C67",
  navy: "#132530",
  ink: "#16211C",
  muted: "#6B7A72",
  teal: "#2AA39D",
};
const serif: React.CSSProperties = {
  fontFamily: theme.fonts.news,
  fontWeight: 400,
  letterSpacing: "-0.015em",
};
const label: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 20,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

// ---------------------------------------------------------------- heartbeat
// One beat of an ECG trace, as (x, y) in a 1080-wide strip centred on 0.
const BEAT_SHAPE: [number, number][] = [
  [0, 0],
  [300, 0],
  [330, -18],
  [360, 0],
  [400, 0],
  [418, 22],
  [440, -150],
  [462, 60],
  [482, 0],
  [560, 0],
  [600, -34],
  [650, 0],
  [1080, 0],
];
const ecgY = (x: number) => {
  const nxt = BEAT_SHAPE.find(([bx]) => bx > x);
  const prev = BEAT_SHAPE.filter(([bx]) => bx <= x).pop();
  if (!nxt || !prev) return 0;
  return prev[1] + ((nxt[1] - prev[1]) * (x - prev[0])) / (nxt[0] - prev[0]);
};
const ecgPath = (y0: number, head: number) => {
  const pts = BEAT_SHAPE.filter(([x]) => x <= head).map(([x, y]) => [
    x,
    y0 + y,
  ]);
  // interpolate the segment the pen is on
  const nxt = BEAT_SHAPE.find(([x]) => x > head);
  const prev = BEAT_SHAPE.filter(([x]) => x <= head).pop();
  if (nxt && prev) {
    const k = (head - prev[0]) / (nxt[0] - prev[0]);
    pts.push([head, y0 + prev[1] + (nxt[1] - prev[1]) * k]);
  }
  return `M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")}`;
};
const sweep = (frame: number, at: number) =>
  ease(frame, at - 12, at + 10, theme.ease.inOut);
const Scene: React.FC<{
  from: number;
  to?: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const pin = from === 0 ? 1 : sweep(frame, from);
  if (pin <= 0) return null;
  if (to !== undefined && sweep(frame, to) >= 1) return null;
  return (
    <AbsoluteFill
      style={{
        clipPath: pin < 1 ? `inset(0 ${(1 - pin) * 100}% 0 0)` : undefined,
        isolation: "isolate",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
const Trace: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = sweep(frame, at);
  const fade = 1 - ease(frame, at + 10, at + 22);
  if (p <= 0 || fade <= 0) return null;
  const head = p * 1080;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, zIndex: 9, opacity: fade }}
    >
      <path
        d={ecgPath(960, head)}
        fill="none"
        stroke={NH.teal}
        strokeWidth={6}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 10px rgba(42,163,157,0.9))" }}
      />
      <line
        x1={head}
        y1={0}
        x2={head}
        y2={1920}
        stroke="rgba(42,163,157,0.35)"
        strokeWidth={2}
      />
      <circle
        cx={head}
        cy={960 + ecgY(head)}
        r={9}
        fill="#fff"
        stroke={NH.teal}
        strokeWidth={4}
      />
    </svg>
  );
};

const Caption: React.FC<{
  from: number;
  to: number;
  eyebrow?: string;
  a: string;
  b: string;
}> = ({ from, to, eyebrow, a, b }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from, from + 16);
  const inB = ease(frame, from + 6, from + 22);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 288,
        opacity: 1 - out,
        zIndex: 7,
      }}
    >
      {eyebrow ? (
        <div
          style={{ ...label, color: NH.green, marginBottom: 18, opacity: inA }}
        >
          — {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...serif,
          fontSize: 92,
          lineHeight: 1.0,
          color: NH.ink,
          opacity: inA,
          translate: `0px ${(1 - inA) * 24}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...serif,
          fontStyle: "italic",
          fontSize: 92,
          lineHeight: 1.06,
          color: NH.green,
          opacity: inB,
          translate: `0px ${(1 - inB) * 24}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

const Backdrop: React.FC<{ tone?: string }> = ({ tone = NH.paper }) => (
  <AbsoluteFill style={{ backgroundColor: tone }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 62%, rgba(94,156,103,0.16), transparent 60%)",
      }}
    />
  </AbsoluteFill>
);

const Finger: React.FC<{ x: number; y: number; since: number }> = ({
  x,
  y,
  since,
}) => {
  const ring = interpolate(since, [0, 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 5 }}>
      <div
        style={{
          position: "absolute",
          left: -56 * ring - 12,
          top: -56 * ring - 12,
          width: 112 * ring + 24,
          height: 112 * ring + 24,
          borderRadius: "50%",
          border: `3px solid ${NH.teal}`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -30,
          top: -30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
          border: "3px solid #fff",
          boxShadow: "0 10px 28px rgba(0,0,0,0.3)",
          opacity: 1 - ease(since, 12, 24),
          scale: since < 6 ? 1 - Math.sin((since / 6) * Math.PI) * 0.2 : 1,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------- act 1
const PH_W = 470;
const PH = { x: 540 - (PH_W * 1.07) / 2, y: 600 };
const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  const tag = spring({ frame: frame - 70, fps, config: theme.spring.snappy });
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: PH.x,
          top: PH.y + (1 - rise) * 900,
        }}
      >
        <PhoneRec src={`${SRC}/mobile-tour.mp4`} width={PH_W} from={0} />
      </div>
      {/* the AI assistant: the bubble at the bottom of every page */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 1430,
          padding: "14px 20px",
          borderRadius: 16,
          background: NH.navy,
          color: "#fff",
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 26,
          boxShadow: "0 18px 40px -12px rgba(19,37,48,0.5)",
          opacity:
            interpolate(tag, [0, 0.4], [0, 1], clamp) *
            (1 - ease(frame, A2 - 16, A2 - 6)),
          scale: interpolate(tag, [0, 1], [0.7, 1]),
          transformOrigin: "100% 50%",
          zIndex: 6,
        }}
      >
        An AI assistant
        <br />
        <span style={{ color: "#9FD3CF" }}>on every page</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2
const LAP_W = 900;
const LAP = { x: 540 - (LAP_W * 1.16) / 2, y: 720 };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const PROMO_FROM = A2 - 6;
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  // in close on the promotion card (css x 72–1368, y 170–660)
  const z = 1 + 0.1 * ease(frame, A2 + 10, A2 + 40, theme.ease.inOut);
  const fx = LSCREEN.x + 720 * LSCREEN.s;
  const fy = LSCREEN.y + 415 * LSCREEN.s;
  const tap = [...promos.taps]
    .reverse()
    .find((t) => frame >= PROMO_FROM + t.frame);
  const since = tap ? frame - PROMO_FROM - tap.frame : 99;
  const cursorIn = ease(frame, A2 + 4, A2 + 14);
  return (
    <AbsoluteFill>
      <Backdrop tone={NH.paper2} />
      <AbsoluteFill style={{ transformOrigin: `${fx}px ${fy}px`, scale: z }}>
        <div style={{ position: "absolute", left: LAP.x, top: LAP.y }}>
          <LaptopRec
            src={`${SRC}/desktop-promos.mp4`}
            width={LAP_W}
            from={PROMO_FROM}
            hold
          />
        </div>
        {tap ? (
          <div
            style={{
              position: "absolute",
              left: LSCREEN.x + tap.x * LSCREEN.s,
              top: LSCREEN.y + tap.y * LSCREEN.s,
              opacity: cursorIn,
              zIndex: 5,
            }}
          >
            {since < 14 ? (
              <div
                style={{
                  position: "absolute",
                  left: -26 - 20 * (since / 14),
                  top: -26 - 20 * (since / 14),
                  width: 52 + 40 * (since / 14),
                  height: 52 + 40 * (since / 14),
                  borderRadius: "50%",
                  border: `3px solid ${NH.teal}`,
                  opacity: 1 - since / 14,
                }}
              />
            ) : null}
            <svg
              width={36}
              height={44}
              viewBox="0 0 22 26"
              style={{
                position: "absolute",
                left: -4,
                top: -2,
                scale: since < 4 ? 0.85 : 1,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
              }}
            >
              <path
                d="M2 2 L2 20 L7 15.5 L10.5 23.5 L13.5 22.2 L10 14.5 L17 14.5 Z"
                fill="#fff"
                stroke="#111"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 600;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 580 };
const GROUPS_FROM = A3 - 8;
// the recording opens with a quick pass over every tab so the photos are
// cached; skip it
const GROUPS_TRIM = 27;
const GROUP_TAPS = groups.taps
  .filter((t) => t.frame >= GROUPS_TRIM)
  .map((t) => ({ ...t, frame: t.frame - GROUPS_TRIM }));
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const s = TAB_W / 820;
  const bezel = Math.round(TAB_W * 0.045);
  const last = [...groups.taps]
    .reverse()
    .find((t) => frame >= GROUPS_FROM + t.frame);
  const since = last ? frame - GROUPS_FROM - last.frame : 99;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-groups.mp4`}
          trim={GROUPS_TRIM}
          width={TAB_W}
          from={GROUPS_FROM}
          hold
        />
      </div>
      {last && since < 24 ? (
        <Finger
          x={TAB.x + bezel + last.x * s}
          y={TAB.y + bezel + last.y * s}
          since={since}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - 6 - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 36}px`,
    };
  };
  const bob = Math.sin((frame - END) / 6) * 8;
  // a calm monitor strip: the beat scrolls left
  const shift = ((frame - END) * 9) % 1080;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 300,
          padding: "16px 22px",
          borderRadius: 14,
          background: NH.navy,
          ...up(0),
        }}
      >
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 200, display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", left: 80, right: 60, top: 470 }}>
        <div style={{ ...label, color: NH.green, ...up(3) }}>
          — N.H.F Clinics · built by eSolutify
        </div>
        <div
          style={{
            ...serif,
            marginTop: 28,
            fontSize: 112,
            lineHeight: 1.0,
            color: NH.ink,
            ...up(6),
          }}
        >
          Your website,
        </div>
        <div
          style={{
            ...serif,
            fontStyle: "italic",
            fontSize: 112,
            lineHeight: 1.04,
            color: NH.green,
            ...up(9),
          }}
        >
          held to a
          <br />
          higher standard.
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: NH.muted,
            ...up(12),
          }}
        >
          See your new site free,
          <br />
          before you pay a dollar.
        </div>
      </div>
      <svg
        width={1080}
        height={160}
        style={{
          position: "absolute",
          left: 0,
          top: 1110,
          opacity: ease(frame, END + 10, END + 24),
        }}
      >
        {[0, 1080].map((ox) => (
          <path
            key={ox}
            d={ecgPath(80, 1080)}
            transform={`translate(${ox - shift} 0) scale(1 0.5) translate(0 80)`}
            fill="none"
            stroke={NH.teal}
            strokeWidth={4}
            opacity={0.55}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 1270,
          height: 106,
          padding: "0 44px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: NH.green,
          boxShadow: "0 18px 50px -16px rgba(47,107,58,0.7)",
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 44,
          color: "#fff",
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={40} color="#fff" stroke={2.6} />
        <LightSweep start={END + 50} duration={24} width={140} opacity={0.45} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 1402,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: NH.ink,
          ...up(20),
        }}
      >
        esolutify.com/free-demo
      </div>
      {/* the link sticker goes here */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 1466,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...label,
          color: NH.green,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={NH.green} stroke={2.4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NHFStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: NH.paper }}>
    <Scene from={0} to={A2}>
      <Act1 />
    </Scene>
    <Scene from={A2} to={A3}>
      <Act2 />
    </Scene>
    <Scene from={A3} to={END}>
      <Act3 />
    </Scene>
    <Scene from={END}>
      <EndCard />
    </Scene>
    <Trace at={A2} />
    <Trace at={A3} />
    <Trace at={END} />
    <Caption
      from={4}
      to={A2 - 10}
      eyebrow="N.H.F Clinics · Newmarket, ON"
      a="A clinic website"
      b="with a bedside manner."
    />
    <Caption
      from={A2 + 8}
      to={A3 - 10}
      a="Every offer,"
      b="on the front page."
    />
    <Caption
      from={A3 + 8}
      to={END - 10}
      a="Six groups."
      b="One standard of care."
    />
    <Audio src={staticFile("audio/story-pulse.wav")} volume={0.85} />
    {[A2, A3, END].map((c) => (
      <Sfx key={c} name="whoosh-soft" at={c - 12} volume={0.24} />
    ))}
    {promos.taps.slice(1).map((t) => (
      <Sfx
        key={`p${t.frame}`}
        name="tick"
        at={PROMO_FROM + t.frame - 1}
        volume={0.2}
      />
    ))}
    {GROUP_TAPS.map((t) => (
      <Sfx
        key={`g${t.frame}`}
        name="tick"
        at={GROUPS_FROM + t.frame - 1}
        volume={0.2}
      />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

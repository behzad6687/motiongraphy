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
import { Tap } from "../components/Devices";
import { Icon, type IconName } from "../components/Icons";
import { LightSweep } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { ease } from "../reel/kit";
import { clamp, theme } from "../theme";
import { Sol, type Mood } from "./Sol";
import SCRIPT from "./script.json";

// "AI receptionist vs virtual receptionist vs answering service", explained
// by Sol in a 42 s game show (9:16, 30 fps, 1260 frames). Source: the
// eSolutify blog post of the same name (Sept 30, 2026), costs in CAD.
// Hook: "Your $65 phone plan can turn into $400." Round 1 meets the three
// contestants, round 2 does the per-minute math ("minutes, not months"),
// round 3 picks a winner for three businesses — and Sol admits a human wins
// one of them. Lines, timing and the babble voice come from script.json.
// 120 BPM (15 frames a beat).

export const SOL_DURATION = 1260;
const INK = "#1E1408";
const CREAM = "#FFF7E6";
const MARK_GOLD = "#F7D474";
const MARK_RED = "#FF8A80";
const HUMAN_BLUE = "#7FB2FF";

type Seg = { at: number; per: number; text: string };
type Bubble = {
  from: number;
  until: number;
  segs: Seg[];
  aside?: { at: number; text: string };
};
const BUBBLES = SCRIPT.bubbles as Bubble[];
const [V1, V2, V3] = SCRIPT.verdicts;
const ROLLS = SCRIPT.drumrolls;

const talkingAt = (f: number) =>
  BUBBLES.some(
    (b) =>
      b.segs.some(
        (s) =>
          f >= Math.max(0, s.at) &&
          f < Math.max(0, s.at) + s.text.split(" ").length * s.per + 2,
      ) ||
      (b.aside &&
        f >= b.aside.at &&
        f < b.aside.at + b.aside.text.split(" ").length * 3 + 2),
  );

// ---------------------------------------------------------------- speech bubble
const Word: React.FC<{ raw: string; on: number }> = ({ raw, on }) => {
  const gold = raw.startsWith("*") && raw.endsWith("*");
  const red = raw.startsWith("!") && raw.endsWith("!") && raw.length > 2;
  const text = gold || red ? raw.slice(1, -1) : raw;
  return (
    <span
      style={{
        display: "inline-block",
        padding: gold || red ? "0 8px" : 0,
        margin: gold || red ? "0 -4px" : 0,
        borderRadius: 10,
        background: gold ? MARK_GOLD : red ? MARK_RED : "transparent",
        opacity: 0.12 + 0.88 * on,
        translate: `0px ${(1 - on) * 10}px`,
      }}
    >
      {text}
    </span>
  );
};

const SpeechBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = BUBBLES.find((x) => frame >= x.from - 2 && frame < x.until + 5);
  if (!b) return null;
  const pop = spring({
    frame: frame - b.from + (b.from === 0 ? 10 : 0),
    fps,
    config: theme.spring.bouncy,
  });
  const out = ease(frame, b.until, b.until + 5, theme.ease.in);
  const words = b.segs.flatMap((s) =>
    s.text.split(" ").map((w, i) => ({ w, at: s.at + i * s.per })),
  );
  const chars = b.segs.reduce((n, s) => n + s.text.length, 0);
  const asideOn = b.aside
    ? spring({ frame: frame - b.aside.at, fps, config: theme.spring.snappy })
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 296,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(pop, [0, 0.3], [0, 1], clamp) * (1 - out),
        scale: interpolate(pop, [0, 1], [0.8, 1]) * (1 - 0.1 * out),
        rotate: `${interpolate(pop, [0, 1], [-4, -1])}deg`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 960,
          padding: "26px 36px 28px",
          borderRadius: 38,
          background: CREAM,
          border: `5px solid ${INK}`,
          boxShadow: `8px 10px 0 ${INK}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 14,
            rowGap: 4,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: chars > 46 ? 50 : 58,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: INK,
          }}
        >
          {words.map(({ w, at }, i) => (
            <Word key={i} raw={w} on={ease(frame, at, at + 4)} />
          ))}
        </div>
        {b.aside && frame >= b.aside.at ? (
          <div
            style={{
              marginTop: 12,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: 33,
              color: "#7A5B2E",
              opacity: interpolate(asideOn, [0, 0.4], [0, 1], clamp),
              scale: interpolate(asideOn, [0, 1], [0.85, 1]),
            }}
          >
            {b.aside.text}
          </div>
        ) : null}
        {/* tail */}
        <svg
          width={70}
          height={48}
          viewBox="0 0 70 48"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -44,
            translate: "-20px 0px",
          }}
        >
          <path d="M0 0 L60 0 L18 44 Z" fill={CREAM} />
          <path
            d="M2 2 L18 44 L58 2"
            fill="none"
            stroke={INK}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Sol's blocking
type Pose = {
  f: number;
  mood: Mood;
  arms?: [number, number];
  look?: [number, number];
  spike?: number;
  glasses?: boolean;
  sweat?: boolean;
  wave?: boolean;
};
const POSES: Pose[] = [
  { f: 0, mood: "talk", arms: [55, 55] },
  { f: 42, mood: "shock", arms: [165, 165], spike: 1 },
  { f: 92, mood: "happy", arms: [55, 150], wave: true },
  { f: 138, mood: "wink", arms: [55, 55] },
  { f: 182, mood: "talk", arms: [55, 135], glasses: true, look: [-0.6, -0.8] },
  { f: 222, mood: "laugh", arms: [55, 150], glasses: true },
  { f: 262, mood: "talk", arms: [55, 135], look: [0, -0.8] },
  { f: 300, mood: "happy", arms: [150, 55] },
  { f: 342, mood: "talk", arms: [55, 135], look: [0.6, -0.8] },
  { f: 384, mood: "smug", arms: [40, 40] },
  { f: 422, mood: "talk", arms: [55, 55], look: [0.4, -0.9] },
  { f: 482, mood: "happy", arms: [55, 160], look: [0.3, -0.9] },
  { f: 542, mood: "worried", arms: [55, 55], look: [0.4, -0.8] },
  {
    f: 596,
    mood: "worried",
    arms: [70, 70],
    sweat: true,
    spike: 0.3,
    look: [0, -0.9],
  },
  { f: 640, mood: "shock", arms: [165, 165], spike: 0.8, look: [-0.6, -0.8] },
  { f: 664, mood: "smug", arms: [40, 150], look: [0.6, -0.8] },
  { f: 690, mood: "laugh", arms: [160, 160] },
  { f: 722, mood: "talk", arms: [55, 55], look: [0, -0.9] },
  { f: 742, mood: "worried", arms: [70, 70], look: [0, -0.9] },
  { f: V1, mood: "laugh", arms: [160, 160], spike: 0.4 },
  { f: 822, mood: "talk", arms: [55, 55], look: [0, -0.9] },
  { f: 842, mood: "worried", arms: [70, 70], look: [0, -0.9] },
  { f: V2, mood: "pout", arms: [30, 30], look: [-0.4, 0.5] },
  { f: 896, mood: "happy", arms: [150, 150] },
  { f: 922, mood: "talk", arms: [55, 55], look: [0, -0.9] },
  { f: 942, mood: "worried", arms: [70, 70], look: [0, -0.9] },
  { f: V3, mood: "laugh", arms: [160, 160], spike: 0.4 },
  { f: 1022, mood: "happy", arms: [55, 55] },
  { f: 1048, mood: "wink", arms: [55, 150] },
  { f: 1112, mood: "talk", arms: [55, 150], wave: true },
  { f: 1160, mood: "wink", arms: [55, 150], wave: true },
];
const KEYS = [
  { f: 0, top: 800, size: 420 },
  { f: 84, top: 800, size: 420 },
  { f: 100, top: 1120, size: 330 },
  { f: 1100, top: 1120, size: 330 },
  { f: 1116, top: 560, size: 300 },
];
// little hops at the start of each bubble
const HOPS = BUBBLES.map((b) => b.from).filter((f) => f > 0);

const SolActor: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = [...POSES].reverse().find((p) => frame >= p.f) ?? POSES[0];
  const k1 = [...KEYS].reverse().find((k) => frame >= k.f) ?? KEYS[0];
  const k2 = KEYS.find((k) => k.f > frame) ?? k1;
  const p = k2 === k1 ? 1 : ease(frame, k1.f, k2.f, theme.ease.inOut);
  const top = k1.top + (k2.top - k1.top) * p;
  const size = k1.size + (k2.size - k1.size) * p;
  const hop = HOPS.map((h) => frame - h).find((t) => t >= 0 && t < 14);
  const jump = hop !== undefined ? Math.sin((Math.PI * hop) / 14) * 46 : 0;
  const squash =
    hop !== undefined
      ? hop < 3
        ? -0.6 + hop * 0.3
        : hop > 11
          ? -0.5
          : 0.35
      : 0.06 * Math.sin(frame / 7);
  // landing at frame 0: arrive already squashed, spring up
  const land = frame < 10 ? -0.7 * (1 - frame / 10) : 0;
  const bob = Math.sin(frame / 9) * 5;
  const arms: [number, number] = pose.wave
    ? [pose.arms?.[0] ?? 55, 140 + 22 * Math.sin(frame / 3)]
    : (pose.arms ?? [55, 55]);
  const look: [number, number] =
    pose.mood === "worried" && ROLLS.some((r) => frame >= r && frame < r + 28)
      ? [Math.sin(frame / 2.5), -0.6]
      : (pose.look ?? [0, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - size / 2,
        top: top - jump + bob,
        width: size,
        zIndex: 6,
      }}
    >
      {/* spotlight */}
      <div
        style={{
          position: "absolute",
          left: -size * 0.4,
          top: -size * 0.1,
          width: size * 1.8,
          height: size * 1.4,
          background:
            "radial-gradient(closest-side, rgba(255,236,180,0.18), rgba(255,236,180,0))",
        }}
      />
      <Sol
        size={size}
        mood={pose.mood}
        talking={
          talkingAt(frame) && pose.mood !== "laugh" && pose.mood !== "pout"
        }
        arms={arms}
        look={look}
        spike={pose.spike ?? 0}
        glasses={pose.glasses}
        sweat={pose.sweat}
        squash={squash + land}
      />
    </div>
  );
};

// ---------------------------------------------------------------- shared bits
const RoundChip: React.FC<{ from: number; until: number; text: string }> = ({
  from,
  until,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame > until + 5) return null;
  const p = spring({ frame: frame - from, fps, config: theme.spring.bouncy });
  const out = ease(frame, until, until + 5, theme.ease.in);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 604,
        display: "flex",
        justifyContent: "center",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - out),
        scale: interpolate(p, [0, 1], [0.6, 1]),
      }}
    >
      <div
        style={{
          padding: "8px 22px",
          borderRadius: 99,
          background: theme.gradients.gold,
          color: INK,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "0.16em",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Scene: React.FC<{
  from: number;
  until: number;
  children: React.ReactNode;
}> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  if (frame < from - 2 || frame > until + 6) return null;
  const out = ease(frame, until, until + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, translate: `0px ${-20 * out}px` }}>
      {children}
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{
  at: number;
  text: string;
  color: string;
  x: number;
  y: number;
  size?: number;
  rot?: number;
}> = ({ at, text, color, x, y, size = 64, rot = -10 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = frame - at;
  const slam = interpolate(t, [0, 4, 7], [2.2, 0.92, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rot}deg`,
        scale: slam,
        opacity: interpolate(t, [0, 2], [0, 1], clamp),
        padding: "10px 26px",
        border: `8px solid ${color}`,
        borderRadius: 18,
        color,
        background: "rgba(10,10,10,0.55)",
        fontFamily: theme.fonts.display,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "0.04em",
        lineHeight: 1,
        textAlign: "center",
        whiteSpace: "pre",
        zIndex: 8,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------- hook: the price tag
const PriceTag: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 92) return null;
  const flip = ease(frame, 42, 52, theme.ease.inOut);
  const swing =
    Math.sin(frame / 6) * 4 * (1 - flip) + (flip > 0 && flip < 1 ? 0 : 0);
  const out = ease(frame, 84, 92, theme.ease.in);
  const face = (back: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: 28,
    border: `6px solid ${INK}`,
    background: back ? "#E5484D" : CREAM,
    color: back ? "#fff" : INK,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    transform: back ? "rotateY(180deg)" : undefined,
    boxShadow: `8px 10px 0 ${INK}`,
    fontFamily: theme.fonts.display,
    fontWeight: 900,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 210,
        top: 556,
        width: 420,
        height: 190,
        perspective: 1200,
        rotate: `${-6 + swing}deg`,
        opacity: 1 - out,
        zIndex: 7,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${flip * 180}deg)`,
        }}
      >
        <div style={face(false)}>
          <div
            style={{ fontSize: 26, letterSpacing: "0.2em", fontWeight: 800 }}
          >
            ANSWERING PLAN
          </div>
          <div style={{ fontSize: 96, lineHeight: 1 }}>
            $65<span style={{ fontSize: 40 }}>/mo</span>
          </div>
        </div>
        <div style={face(true)}>
          <div
            style={{ fontSize: 26, letterSpacing: "0.2em", fontWeight: 800 }}
          >
            AFTER OVERAGE
          </div>
          <div style={{ fontSize: 96, lineHeight: 1 }}>
            $400<span style={{ fontSize: 40 }}>/mo</span>
          </div>
        </div>
      </div>
      {/* the string and hole */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 74,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: theme.colors.bg,
          border: `5px solid ${INK}`,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------- round 1: podiums
type Contestant = {
  name: string;
  icon: IconName;
  price: string;
  model: string;
  flat: boolean;
  at: number;
  color: string;
};
const CONTESTANTS: Contestant[] = [
  {
    name: "Answering\nservice",
    icon: "handset",
    price: "$100–$700",
    model: "mostly per-minute",
    flat: false,
    at: 182,
    color: "#C9C2B6",
  },
  {
    name: "Virtual\nreceptionist",
    icon: "user",
    price: "$200–$1,000+",
    model: "base + overage",
    flat: false,
    at: 262,
    color: HUMAN_BLUE,
  },
  {
    name: "AI\nreceptionist",
    icon: "sparkle",
    price: "$50–$500",
    model: "mostly flat",
    flat: true,
    at: 342,
    color: theme.colors.gold2,
  },
];

const Podiums: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active =
    frame < 182 ? -1 : frame < 262 ? 0 : frame < 342 ? 1 : frame < 416 ? 2 : -1;
  return (
    <>
      {CONTESTANTS.map((c, i) => {
        const cx = 200 + i * 340;
        const inP = spring({
          frame: frame - (118 + i * 15),
          fps,
          config: theme.spring.bouncy,
        });
        const on = active === i;
        const revealed = frame >= c.at + 10;
        const priceP = spring({
          frame: frame - (c.at + 10),
          fps,
          config: theme.spring.bouncy,
        });
        const dim = active >= 0 && !on ? 0.45 : 1;
        return (
          <div
            key={c.name}
            style={{
              position: "absolute",
              left: cx - 150,
              top: 668,
              width: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: interpolate(inP, [0, 0.4], [0, 1], clamp) * dim,
              translate: `0px ${interpolate(inP, [0, 1], [120, 0])}px`,
              scale: on ? 1.06 : 1,
            }}
          >
            {on ? (
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  width: 300,
                  height: 420,
                  background:
                    "linear-gradient(180deg, rgba(255,236,180,0.28), rgba(255,236,180,0))",
                  clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
                }}
              />
            ) : null}
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: on ? theme.gradients.gold : theme.colors.surface3,
                border: `5px solid ${INK}`,
                boxShadow: `5px 6px 0 ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={c.icon}
                size={52}
                color={on ? INK : c.color}
                stroke={2.2}
              />
            </div>
            <div
              style={{
                marginTop: 12,
                height: 76,
                whiteSpace: "pre",
                textAlign: "center",
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1.1,
                color: theme.colors.text,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                marginTop: 10,
                width: 270,
                height: 150,
                borderRadius: "18px 18px 6px 6px",
                background: on
                  ? "linear-gradient(180deg, #2A2214, #17130C)"
                  : theme.colors.surface2,
                border: `4px solid ${on ? theme.colors.gold2 : theme.colors.line2}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {revealed ? (
                <>
                  <div
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 900,
                      fontSize: c.price.length > 9 ? 28 : 38,
                      whiteSpace: "nowrap",
                      color: theme.colors.text,
                      scale: priceP,
                    }}
                  >
                    {c.price}
                    <span style={{ fontSize: 22, color: theme.colors.muted }}>
                      /mo
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      fontFamily: theme.fonts.body,
                      fontWeight: 800,
                      fontSize: 19,
                      background: c.flat
                        ? theme.colors.okSoft
                        : "rgba(229,72,77,0.16)",
                      border: `1.5px solid ${c.flat ? "rgba(60,207,142,0.6)" : "rgba(229,72,77,0.6)"}`,
                      color: c.flat ? theme.colors.ok : "#FF8A80",
                      scale: priceP,
                    }}
                  >
                    {c.model}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    fontSize: 60,
                    color: theme.colors.dim,
                  }}
                >
                  ?
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- round 2: the math
const Tile: React.FC<{
  at: number;
  children: React.ReactNode;
  gold?: boolean;
  plain?: boolean;
}> = ({ at, children, gold, plain }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: theme.spring.bouncy });
  if (frame < at) return <span style={{ width: plain ? 40 : 0 }} />;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: plain ? "0 4px" : "14px 22px",
        borderRadius: 20,
        background: plain ? "transparent" : gold ? theme.gradients.gold : CREAM,
        border: plain ? "none" : `5px solid ${INK}`,
        boxShadow: plain ? "none" : `5px 6px 0 ${INK}`,
        color: plain ? theme.colors.text : INK,
        fontFamily: theme.fonts.display,
        fontWeight: 900,
        fontSize: plain ? 64 : 48,
        scale: p,
      }}
    >
      {children}
    </span>
  );
};

const Equation: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 730,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    }}
  >
    <Tile at={486}>42 calls</Tile>
    <Tile at={494} plain>
      ×
    </Tile>
    <Tile at={498}>3 min</Tile>
    <Tile at={506} plain>
      =
    </Tile>
    <Tile at={512} gold>
      126 min
    </Tile>
  </div>
);

const MinuteTank: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tp = ease(frame, 548, 628, theme.ease.soft); // the month passing
  const used = 126 * tp;
  const left = Math.max(0, 50 - used);
  const empty = left <= 0;
  const extra = Math.max(0, used - 50);
  const over = spring({ frame: frame - 600, fps, config: theme.spring.bouncy });
  const W = 800;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 664,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 30,
          color: theme.colors.text,
        }}
      >
        Your “50-minute” plan
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 712,
          width: W,
          height: 96,
          borderRadius: 22,
          border: `6px solid ${empty ? "#E5484D" : INK}`,
          background: theme.colors.surface2,
          overflow: "hidden",
          boxShadow: `6px 8px 0 ${INK}`,
        }}
      >
        <div
          style={{
            width: `${(left / 50) * 100}%`,
            height: "100%",
            background:
              left / 50 > 0.3
                ? "linear-gradient(90deg, #3CCF8E, #7BE0B0)"
                : "linear-gradient(90deg, #E8B84B, #F3CF7A)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 44,
            color: empty ? "#FF8A80" : INK,
          }}
        >
          {empty ? "EMPTY" : `${Math.ceil(left)} min left`}
        </div>
      </div>
      {/* the month */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 830,
          width: W,
          height: 50,
        }}
      >
        {[0, 1, 2, 3].map((w) => (
          <div
            key={w}
            style={{
              position: "absolute",
              left: (w * W) / 4,
              width: W / 4 - 6,
              height: 46,
              borderRadius: 12,
              background:
                tp * 4 > w ? theme.colors.surface3 : theme.colors.surface,
              border: `2px solid ${theme.colors.line2}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 22,
              color: theme.colors.muted,
            }}
          >
            Week {w + 1}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: tp * W - 3,
            top: -14,
            width: 6,
            height: 74,
            borderRadius: 3,
            background: theme.colors.gold2,
          }}
        />
      </div>
      {frame >= 600 ? (
        <div
          style={{
            position: "absolute",
            left: 140,
            width: W,
            top: 910,
            padding: "16px 24px",
            borderRadius: 22,
            background: "rgba(229,72,77,0.14)",
            border: "4px solid #E5484D",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            color: "#FF8A80",
            textAlign: "center",
            scale: interpolate(over, [0, 1], [0.8, 1]),
            opacity: interpolate(over, [0, 0.4], [0, 1], clamp),
          }}
        >
          <div style={{ fontSize: 34 }}>
            +{Math.round(extra)} extra min × $1.25–$2.50
          </div>
          <div style={{ fontSize: 50, color: "#fff" }}>
            = ${Math.round(extra * 1.25)}–${Math.round(extra * 2.5)} more
          </div>
        </div>
      ) : null}
    </>
  );
};

const Balloon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = ease(frame, 642, 676, theme.ease.out);
  const r = 50 + 120 * grow + 6 * Math.sin(frame / 3) * grow;
  const flat = spring({ frame: frame - 650, fps, config: theme.spring.bouncy });
  const cy = 860;
  return (
    <>
      {/* per-minute balloon */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        <path
          d={`M300 ${cy + r} Q280 ${cy + r + 60} 300 1060`}
          stroke={theme.colors.muted}
          strokeWidth={4}
          fill="none"
        />
        <ellipse
          cx={300}
          cy={cy}
          rx={r}
          ry={r * 1.12}
          fill="#E5484D"
          stroke={INK}
          strokeWidth={6}
        />
        <ellipse
          cx={300 - r * 0.35}
          cy={cy - r * 0.45}
          rx={r * 0.18}
          ry={r * 0.28}
          fill="rgba(255,255,255,0.45)"
        />
        <path
          d={`M290 ${cy + r * 1.12} L310 ${cy + r * 1.12} L300 ${cy + r * 1.12 + 14} Z`}
          fill="#B5353A"
        />
        <text
          x={300}
          y={cy + 18}
          textAnchor="middle"
          fontFamily={theme.fonts.display}
          fontWeight={900}
          fontSize={30 + 40 * grow}
          fill="#fff"
        >
          $400+
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 120,
          width: 360,
          top: 1070,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 28,
          color: "#FF8A80",
        }}
      >
        Per-minute plan
        <br />
        <span style={{ color: theme.colors.muted, fontWeight: 600 }}>
          100 calls a month
        </span>
      </div>
      {/* flat line */}
      <div
        style={{
          position: "absolute",
          left: 620,
          top: 880,
          width: 340,
          opacity: interpolate(flat, [0, 0.4], [0, 1], clamp),
          scale: interpolate(flat, [0, 1], [0.8, 1]),
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 52,
            color: theme.colors.ok,
          }}
        >
          $199–$499
        </div>
        <div
          style={{
            marginTop: 10,
            height: 26,
            borderRadius: 13,
            background: theme.colors.ok,
            border: `5px solid ${INK}`,
            boxShadow: `5px 6px 0 ${INK}`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: 28,
            color: theme.colors.ok,
          }}
        >
          Flat AI plan
          <br />
          <span style={{ color: theme.colors.muted, fontWeight: 600 }}>
            stays flat
          </span>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- round 3: who wins
type Case = {
  from: number;
  until: number;
  verdict: number;
  icon: IconName;
  title: string;
  facts: string[];
  win: string;
  color: string;
};
const CASES: Case[] = [
  {
    from: 722,
    until: 816,
    verdict: V1,
    icon: "calendarCheck",
    title: "Dental clinic",
    facts: ["150+ calls a month", "Bookings, FAQs, reminders"],
    win: "AI WINS",
    color: theme.colors.gold2,
  },
  {
    from: 822,
    until: 916,
    verdict: V2,
    icon: "shield",
    title: "Law firm",
    facts: ["Fewer calls, higher stakes", "Needs a human voice"],
    win: "HUMAN WINS",
    color: HUMAN_BLUE,
  },
  {
    from: 922,
    until: 1016,
    verdict: V3,
    icon: "handset",
    title: "Contractor",
    facts: ["Up a ladder mid-job", "Missed call = lost quote"],
    win: "AI +\nTEXT-BACK",
    color: theme.colors.gold2,
  },
];

const CaseCard: React.FC<{ c: Case }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - (c.from + 4),
    fps,
    config: theme.spring.bouncy,
  });
  const rolling = frame >= c.verdict - 28 && frame < c.verdict;
  const shake = rolling ? Math.sin(frame * 2.3) * 3 : 0;
  return (
    <Scene from={c.from} until={c.until}>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: 676,
          height: 300,
          borderRadius: 34,
          background: theme.gradients.card,
          border: `5px solid ${INK}`,
          outline: `3px solid ${theme.colors.line2}`,
          boxShadow: `10px 12px 0 ${INK}`,
          display: "flex",
          alignItems: "center",
          gap: 34,
          padding: "0 44px",
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          translate: `${interpolate(p, [0, 1], [300, 0]) + shake}px 0px`,
          rotate: `${interpolate(p, [0, 1], [6, 0])}deg`,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            flexShrink: 0,
            borderRadius: "50%",
            background: theme.colors.surface3,
            border: `5px solid ${INK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={c.icon} size={70} color={theme.colors.text} stroke={2} />
        </div>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 58,
              color: theme.colors.text,
            }}
          >
            {c.title}
          </div>
          {c.facts.map((f) => (
            <div
              key={f}
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: 32,
                color: theme.colors.muted,
                marginTop: 6,
              }}
            >
              • {f}
            </div>
          ))}
        </div>
        {rolling ? (
          <div
            style={{
              position: "absolute",
              right: 40,
              top: -40,
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 110,
              color: theme.colors.gold2,
              scale: 1 + 0.15 * Math.sin(frame * 0.9),
            }}
          >
            ?
          </div>
        ) : null}
      </div>
      <Stamp
        at={c.verdict}
        text={c.win}
        color={c.color}
        x={760}
        y={c.win.includes("\n") ? 1030 : 1010}
        size={c.win.includes("\n") ? 54 : 66}
      />
    </Scene>
  );
};

// ---------------------------------------------------------------- the honest answer
const Hybrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows: {
    icon: IconName;
    who: string;
    what: string;
    color: string;
    at: number;
  }[] = [
    {
      icon: "sparkle",
      who: "AI",
      what: "Routine calls & bookings, 24/7",
      color: theme.colors.gold2,
      at: 1030,
    },
    {
      icon: "user",
      who: "Human",
      what: "Sensitive calls & judgment",
      color: HUMAN_BLUE,
      at: 1040,
    },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const p = spring({
          frame: frame - r.at,
          fps,
          config: theme.spring.bouncy,
        });
        return (
          <div
            key={r.who}
            style={{
              position: "absolute",
              left: 110,
              width: 860,
              top: 690 + i * 160,
              height: 130,
              borderRadius: 30,
              background: theme.gradients.card,
              border: `5px solid ${INK}`,
              boxShadow: `8px 10px 0 ${INK}`,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 30px",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `${interpolate(p, [0, 1], [i ? 300 : -300, 0])}px 0px`,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: r.color,
                border: `5px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={r.icon} size={44} color={INK} stroke={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 900,
                  fontSize: 46,
                  color: r.color,
                }}
              >
                {r.who}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 30,
                  color: theme.colors.text,
                }}
              >
                {r.what}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- CTA
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < 1150) return null;
  const pill = spring({
    frame: frame - 1150,
    fps,
    config: theme.spring.bouncy,
  });
  const btn = spring({ frame: frame - 1170, fps, config: theme.spring.snappy });
  const tail = ease(frame, 1180, 1190);
  const ring = ((frame - 1150) % 40) / 40;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 120,
          width: 840,
          top: 934,
          height: 110,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: theme.colors.surface2,
          border: `5px solid ${INK}`,
          outline: `3px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 54,
          color: theme.colors.text,
          opacity: interpolate(pill, [0, 0.4], [0, 1], clamp),
          scale: interpolate(pill, [0, 1], [0.8, 1]),
        }}
      >
        <div style={{ position: "relative", width: 62, height: 62 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${theme.colors.gold2}`,
              scale: 1 + ring * 0.8,
              opacity: 1 - ring,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: theme.gradients.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="handset" size={32} color={INK} stroke={2.4} />
          </div>
        </div>
        Call Sol: +1 365 360 3545
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1064,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 32,
          color: theme.colors.muted,
          opacity: tail,
        }}
      >
        He answers eSolutify’s own line. 24/7.
      </div>
      <div
        style={{
          position: "absolute",
          left: 170,
          width: 740,
          top: 1124,
          height: 104,
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: theme.gradients.gold,
          border: `5px solid ${INK}`,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 40,
          color: INK,
          opacity: interpolate(btn, [0, 0.4], [0, 1], clamp),
          scale: interpolate(btn, [0, 1], [0.85, 1]),
        }}
      >
        Read the full comparison
        <Icon name="arrow" size={38} color={INK} stroke={2.8} />
        <LightSweep start={1196} duration={24} width={130} opacity={0.7} />
        <Tap x={370} y={52} at={1214} size={100} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1252,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          opacity: ease(frame, 1182, 1192),
        }}
      >
        <Img src={staticFile("brand/logo.png")} style={{ width: 170 }} />
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 30,
            color: theme.colors.text,
          }}
        >
          Link in bio
        </span>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- sound
type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["boing", 0, 0.3, 1.1],
  ["wahwah", 42, 0.55],
  ["boing", 86, 0.4],
  ["pop", 118, 0.4, 1.1],
  ["pop", 133, 0.4, 1.2],
  ["pop", 148, 0.4, 1.3],
  ["ping", 180, 0.35],
  ["boing", 220, 0.35, 1.3],
  ["ping", 260, 0.35, 1.1],
  ["ping", 340, 0.35, 1.2],
  ["pop", 192, 0.35],
  ["pop", 272, 0.35],
  ["pop", 352, 0.35],
  ["ping", 420, 0.35],
  ["pop", 484, 0.4],
  ["pop", 496, 0.4, 1.1],
  ["pop", 510, 0.45, 1.25],
  ["thud", 590, 0.45],
  ["cash", 600, 0.45],
  ["inflate", 640, 0.5],
  ["stamp", 690, 0.42],
  ["impact", 690, 0.2],
  ["whoosh", 720, 0.35],
  ...ROLLS.map((r): Cue => ["drumroll", r, 0.55]),
  ...SCRIPT.verdicts.map((v): Cue => ["tada", v, 0.55]),
  ["stamp", V1, 0.45],
  ["stamp", V2, 0.45],
  ["wahwah", V2 + 4, 0.22, 1.2],
  ["stamp", V3, 0.45],
  ["shimmer", 1022, 0.3],
  ["pop", 1030, 0.35],
  ["pop", 1040, 0.35, 1.15],
  ["boing", 1100, 0.4, 0.9],
  ["ring", 1150, 0.3],
  ["pop", 1170, 0.4],
  ["pop", 1212, 0.45, 1.3],
];

const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const hits = [44, 690, V1, V2, V3];
  const t = hits.map((h) => frame - h).find((d) => d >= 0 && d < 10);
  const amp = t === undefined ? 0 : (1 - t / 10) * 14;
  return (
    <AbsoluteFill
      style={{
        translate: `${Math.sin(frame * 3.3) * amp}px ${Math.cos(frame * 2.7) * amp}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const SolExplainer: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake>
        <PriceTag />
        <Scene from={112} until={416}>
          <Podiums />
        </Scene>
        <RoundChip
          from={182}
          until={416}
          text="ROUND 1 · MEET THE CONTESTANTS"
        />
        <RoundChip from={422} until={716} text="ROUND 2 · THE MATH" />
        <RoundChip from={722} until={1016} text="ROUND 3 · WHO WINS?" />
        <Scene from={482} until={536}>
          <Equation />
        </Scene>
        <Scene from={542} until={636}>
          <MinuteTank />
        </Scene>
        <Scene from={640} until={684}>
          <Balloon />
        </Scene>
        <Scene from={690} until={716}>
          <Stamp
            at={690}
            text={"MINUTES,\nNOT MONTHS."}
            color="#E5484D"
            x={540}
            y={860}
            size={92}
            rot={-8}
          />
        </Scene>
        {CASES.map((c) => (
          <CaseCard key={c.title} c={c} />
        ))}
        <Scene from={1022} until={1106}>
          <Hybrid />
        </Scene>
        <SolActor />
        <Cta />
        <SpeechBubble />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-music-42.wav")} volume={0.62} />
    <Audio src={staticFile("audio/sol-voice-42.wav")} volume={0.6} />
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

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
import { Tap } from "../../components/Devices";
import { Icon, type IconName } from "../../components/Icons";
import { LightSweep } from "../../components/Motion";
import { SafeZones } from "../../components/SafeZones";
import { Sfx, type SfxName } from "../../components/Sfx";
import { Stage } from "../../components/Stage";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import {
  type Beat,
  BeatScene,
  type Blocking,
  CREAM,
  Footnote,
  INK,
  PhraseBubble,
  RoundCard,
  Shake,
  SolOnStage,
  Stamp,
  type Timeline,
  Tracker,
  byId,
  speechDuck,
} from "./kit";
import MOUTH from "./receptionist.mouth.json";
import TIMELINE from "./receptionist.timeline.json";

// Sol explains: AI receptionist vs virtual receptionist vs answering service.
// Episode 1, re-cut with the pacing rules and Sol's voice (Luna): words live
// in receptionist.json, timing comes from the recorded lines
// (scripts/sol_timeline.py), and each picture plays only after its line.
// Game show: the $65 hook → round 1, the contestants → round 2, the math
// ("minutes, not months") → round 3, who wins → often both → call Sol.

const TL = TIMELINE as unknown as Timeline;
const B = byId(TL);
export const RECEPTIONIST_DURATION = TL.total;
const HUMAN_BLUE = "#7FB2FF";

const useSpring = (at: number, cfg: keyof typeof theme.spring = "bouncy") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: theme.spring[cfg] });
};

const card: React.CSSProperties = {
  borderRadius: 30,
  background: theme.gradients.card,
  border: `5px solid ${INK}`,
  boxShadow: `8px 10px 0 ${INK}`,
};

// ---------------------------------------------------------------- hook: the price tag
const PriceTag: React.FC = () => {
  const frame = useCurrentFrame();
  const flip = ease(
    frame,
    B.hook.showFrom,
    B.hook.showFrom + 10,
    theme.ease.inOut,
  );
  const face = (back: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: 30,
    border: `6px solid ${INK}`,
    background: back ? "#E5484D" : CREAM,
    color: back ? "#fff" : INK,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    transform: back ? "rotateY(180deg)" : undefined,
    boxShadow: `10px 12px 0 ${INK}`,
    fontFamily: theme.fonts.display,
    fontWeight: 900,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 250,
        top: 640,
        width: 500,
        height: 240,
        perspective: 1400,
        rotate: `${-6 + Math.sin(frame / 6) * 3 * (1 - flip)}deg`,
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
            style={{ fontSize: 30, letterSpacing: "0.2em", fontWeight: 800 }}
          >
            PHONE PLAN
          </div>
          <div style={{ fontSize: 120, lineHeight: 1 }}>
            $65<span style={{ fontSize: 48 }}>/mo</span>
          </div>
        </div>
        <div style={face(true)}>
          <div
            style={{ fontSize: 30, letterSpacing: "0.2em", fontWeight: 800 }}
          >
            AFTER OVERAGE
          </div>
          <div style={{ fontSize: 120, lineHeight: 1 }}>
            $400<span style={{ fontSize: 48 }}>/mo</span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 96,
          width: 30,
          height: 30,
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
  beat: string;
  name: string;
  icon: IconName;
  price: string;
  model: string;
  flat: boolean;
  color: string;
};
const CONTESTANTS: Contestant[] = [
  {
    beat: "c1",
    name: "Answering\nservice",
    icon: "handset",
    price: "$100–$700",
    model: "mostly per-minute",
    flat: false,
    color: "#C9C2B6",
  },
  {
    beat: "c2",
    name: "Virtual\nreceptionist",
    icon: "user",
    price: "$200–$1,000+",
    model: "base + overage",
    flat: false,
    color: HUMAN_BLUE,
  },
  {
    beat: "c3",
    name: "AI\nreceptionist",
    icon: "sparkle",
    price: "$50–$500",
    model: "mostly flat",
    flat: true,
    color: theme.colors.gold2,
  },
];

const Podiums: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CONTESTANTS.findIndex(
    (c) => frame >= B[c.beat].from && frame < B[c.beat].until + 4,
  );
  return (
    <>
      {CONTESTANTS.map((c, i) => (
        <Podium
          key={c.beat}
          c={c}
          i={i}
          on={active === i}
          dim={active >= 0 && active !== i}
        />
      ))}
    </>
  );
};
const Podium: React.FC<{
  c: Contestant;
  i: number;
  on: boolean;
  dim: boolean;
}> = ({ c, i, on, dim }) => {
  const frame = useCurrentFrame();
  const inP = useSpring(B.c1.from + i * 5);
  const reveal = B[c.beat].showFrom;
  const priceP = useSpring(reveal);
  const cx = 200 + i * 340;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - 150,
        top: 640,
        width: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: interpolate(inP, [0, 0.4], [0, 1], clamp) * (dim ? 0.45 : 1),
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
            height: 430,
            background:
              "linear-gradient(180deg, rgba(255,236,180,0.28), rgba(255,236,180,0))",
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
          }}
        />
      ) : null}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: on ? theme.gradients.gold : theme.colors.surface3,
          border: `5px solid ${INK}`,
          boxShadow: `5px 6px 0 ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={c.icon} size={56} color={on ? INK : c.color} stroke={2.2} />
      </div>
      <div
        style={{
          marginTop: 12,
          height: 80,
          whiteSpace: "pre",
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 34,
          lineHeight: 1.1,
          color: theme.colors.text,
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          marginTop: 10,
          width: 280,
          height: 160,
          borderRadius: "18px 18px 6px 6px",
          background: on
            ? "linear-gradient(180deg, #2A2214, #17130C)"
            : theme.colors.surface2,
          border: `4px solid ${on ? theme.colors.gold2 : theme.colors.line2}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {frame >= reveal ? (
          <>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: c.price.length > 9 ? 30 : 40,
                whiteSpace: "nowrap",
                color: theme.colors.text,
                scale: priceP,
              }}
            >
              {c.price}
              <span style={{ fontSize: 20, color: theme.colors.muted }}>
                /mo
              </span>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                fontFamily: theme.fonts.body,
                fontWeight: 800,
                fontSize: 21,
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
              fontSize: 64,
              color: theme.colors.dim,
            }}
          >
            ?
          </div>
        )}
      </div>
    </div>
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
  const p = useSpring(at);
  if (frame < at) return null;
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
        fontSize: plain ? 64 : 50,
        scale: p,
      }}
    >
      {children}
    </span>
  );
};

const Equation: React.FC = () => {
  const at = B.m1.from + 6; // the sum builds as Sol says it
  const v = B.m1.voice;
  const step = v ? v.frames / 5 : 10;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 760,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Tile at={at}>42 calls</Tile>
      <Tile at={at + step} plain>
        ×
      </Tile>
      <Tile at={at + step * 1.6}>3 min</Tile>
      <Tile at={at + step * 2.6} plain>
        =
      </Tile>
      <Tile at={B.m1.showFrom} gold>
        126 min
      </Tile>
    </div>
  );
};

const MinuteTank: React.FC = () => {
  const frame = useCurrentFrame();
  const b = B.m2;
  const tp = ease(frame, b.from + 6, b.textEnd + 20, theme.ease.soft);
  const used = 126 * tp;
  const left = Math.max(0, 50 - used);
  const empty = left <= 0;
  const extra = Math.max(0, used - 50);
  const overAt = b.showFrom;
  const over = useSpring(overAt);
  const W = 800;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 640,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 32,
          color: theme.colors.text,
        }}
      >
        Your “50-minute” plan
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 690,
          width: W,
          height: 100,
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
            fontSize: 46,
            color: empty ? "#FF8A80" : INK,
          }}
        >
          {empty ? "EMPTY" : `${Math.ceil(left)} min left`}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 812,
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
              height: 48,
              borderRadius: 12,
              background:
                tp * 4 > w ? theme.colors.surface3 : theme.colors.surface,
              border: `2px solid ${theme.colors.line2}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 24,
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
            height: 76,
            borderRadius: 3,
            background: theme.colors.gold2,
          }}
        />
      </div>
      {frame >= overAt ? (
        <div
          style={{
            position: "absolute",
            left: 140,
            width: W,
            top: 900,
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
          <div style={{ fontSize: 52, color: "#fff" }}>
            = ${Math.round(extra * 1.25)}–${Math.round(extra * 2.5)} more
          </div>
        </div>
      ) : null}
    </>
  );
};

const Balloon: React.FC = () => {
  const frame = useCurrentFrame();
  const b = B.m4;
  const grow = ease(frame, b.from + 10, b.textEnd, theme.ease.out);
  const r = 50 + 120 * grow + 6 * Math.sin(frame / 3) * grow;
  const flat = useSpring(b.showFrom);
  const cy = 850;
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        <path
          d={`M300 ${cy + r} Q280 ${cy + r + 60} 300 1050`}
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
        <text
          x={300}
          y={cy + 18}
          textAnchor="middle"
          fontFamily={theme.fonts.display}
          fontWeight={900}
          fontSize={30 + 42 * grow}
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
          top: 1056,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 30,
          color: "#FF8A80",
        }}
      >
        Per-minute plan
      </div>
      <div
        style={{
          position: "absolute",
          left: 620,
          top: 860,
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
            fontSize: 54,
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
            marginTop: 34,
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: 30,
            color: theme.colors.ok,
          }}
        >
          Flat AI plan
        </div>
      </div>
      <Footnote
        text="At 100 calls a month, 3 minutes each"
        at={b.showFrom}
        top={1110}
      />
    </>
  );
};

// ---------------------------------------------------------------- round 3: who wins
type Case = {
  beat: string;
  icon: IconName;
  title: string;
  facts: string[];
  win: string;
  color: string;
};
const CASES: Case[] = [
  {
    beat: "w1",
    icon: "calendarCheck",
    title: "Dental clinic",
    facts: ["150+ calls a month", "Bookings, FAQs, reminders"],
    win: "AI WINS",
    color: theme.colors.gold2,
  },
  {
    beat: "w2",
    icon: "shield",
    title: "Law firm",
    facts: ["Fewer calls, higher stakes", "Needs a human voice"],
    win: "HUMAN WINS",
    color: HUMAN_BLUE,
  },
  {
    beat: "w3",
    icon: "handset",
    title: "Contractor",
    facts: ["Up a ladder mid-job", "Missed call = lost quote"],
    win: "AI +\nTEXT-BACK",
    color: theme.colors.gold2,
  },
];

const CaseCard: React.FC<{ c: Case; b: Beat }> = ({ c, b }) => {
  const frame = useCurrentFrame();
  const p = useSpring(b.from + 4);
  const rolling = frame >= b.showFrom - 20 && frame < b.showFrom;
  const shake = rolling ? Math.sin(frame * 2.3) * 3 : 0;
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 90,
          width: 900,
          top: 660,
          height: 300,
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
              fontSize: 60,
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
                fontSize: 34,
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
              top: -44,
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
        at={b.showFrom}
        text={c.win}
        color={c.color}
        x={760}
        y={c.win.includes("\n") ? 1010 : 990}
        size={c.win.includes("\n") ? 56 : 68}
        rot={-10}
      />
    </>
  );
};

// ---------------------------------------------------------------- often both
const Hybrid: React.FC = () => {
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
      at: B.both.from + 20,
    },
    {
      icon: "user",
      who: "Human",
      what: "Sensitive calls & judgment",
      color: HUMAN_BLUE,
      at: B.both.showFrom - 10,
    },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <HybridRow key={r.who} {...r} i={i} />
      ))}
    </>
  );
};
const HybridRow: React.FC<{
  icon: IconName;
  who: string;
  what: string;
  color: string;
  at: number;
  i: number;
}> = ({ icon, who, what, color, at, i }) => {
  const p = useSpring(at);
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 110,
        width: 860,
        top: 680 + i * 170,
        height: 140,
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
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: color,
          border: `5px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={46} color={INK} stroke={2.2} />
      </div>
      <div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 50,
            color,
          }}
        >
          {who}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 32,
            color: theme.colors.text,
          }}
        >
          {what}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.cta.showFrom - 10;
  const pill = useSpring(at);
  const btn = useSpring(at + 16, "snappy");
  const ring = ((frame - at) % 40) / 40;
  if (frame < at) return null;
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
          opacity: ease(frame, at + 10, at + 20),
        }}
      >
        Sol answers eSolutify’s own line. 24/7.
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
        <LightSweep start={at + 30} duration={24} width={130} opacity={0.7} />
        <Tap x={370} y={52} at={at + 50} size={100} />
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
          opacity: ease(frame, at + 24, at + 34),
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

// ---------------------------------------------------------------- Sol's blocking
const BLOCKING: Blocking = {
  hook: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "shock", arms: [165, 165], spike: 1 },
  },
  intro: {
    say: { mood: "talk", arms: [55, 150], wave: true },
    after: { mood: "wink", arms: [55, 55] },
  },
  r1: { say: { mood: "laugh", arms: [160, 160] } },
  c1: {
    say: { mood: "talk", arms: [55, 135], glasses: true, look: [-0.6, -0.8] },
    after: { mood: "happy", arms: [55, 150], glasses: true },
  },
  c2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 55] },
  },
  c3: {
    say: { mood: "talk", arms: [55, 135], look: [0.6, -0.8] },
    after: { mood: "smug", arms: [40, 40] },
  },
  r2: { say: { mood: "laugh", arms: [160, 160] } },
  m1: {
    say: { mood: "talk", arms: [55, 160], look: [0.3, -0.9] },
    after: { mood: "happy", arms: [55, 160] },
  },
  m2: {
    say: { mood: "worried", arms: [70, 70], look: [0.4, -0.8] },
    after: {
      mood: "worried",
      arms: [70, 70],
      sweat: true,
      spike: 0.3,
      look: [0, -0.9],
    },
  },
  m4: {
    say: { mood: "shock", arms: [165, 165], spike: 0.6, look: [-0.6, -0.8] },
    after: { mood: "smug", arms: [40, 150], look: [0.6, -0.8] },
  },
  m5: {
    say: { mood: "talk", arms: [55, 55] },
    after: { mood: "laugh", arms: [160, 160] },
  },
  r3: { say: { mood: "laugh", arms: [160, 160] } },
  w1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "laugh", arms: [160, 160], spike: 0.4 },
  },
  w2: {
    say: { mood: "pout", arms: [30, 30], look: [-0.4, 0.5] },
    after: { mood: "happy", arms: [150, 150] },
  },
  w3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "laugh", arms: [160, 160], spike: 0.4 },
  },
  both: {
    say: { mood: "talk", arms: [55, 55] },
    after: { mood: "wink", arms: [55, 150] },
  },
  cta: {
    say: { mood: "talk", arms: [55, 150], wave: true },
    after: { mood: "wink", arms: [55, 150], wave: true },
  },
};

// ---------------------------------------------------------------- sound
type Cue = [SfxName, number, number, number?];
const ROUNDS = TL.beats.filter((b) => b.kind === "round");
const DUCK = speechDuck(TL);
const CUES: Cue[] = [
  ["boing", 0, 0.25, 1.1],
  ["wahwah", B.hook.showFrom + 4, 0.4],
  ...TL.beats
    .filter((b) => b.kind === "say" && b.id !== "hook")
    .map((b): Cue => ["boing", b.from - 2, 0.12, 1.2]),
  ...ROUNDS.map((b): Cue => ["tada", b.from - 1, 0.4]),
  ["pop", B.c1.from, 0.3],
  ["pop", B.c1.from + 5, 0.3, 1.1],
  ["pop", B.c1.from + 10, 0.3, 1.2],
  ...["c1", "c2", "c3"].map((id): Cue => ["ping", B[id].showFrom, 0.3, 1.1]),
  ["pop", B.m1.showFrom, 0.4, 1.25],
  ["thud", B.m2.textEnd - 10, 0.35],
  ["cash", B.m2.showFrom, 0.35],
  ["inflate", B.m4.from + 10, 0.3],
  ["stamp", B.m5.showFrom, 0.45],
  ...["w1", "w2", "w3"].flatMap((id): Cue[] => [
    ["drumroll", B[id].showFrom - 28, 0.3],
    ["tada", B[id].showFrom, 0.4],
    ["stamp", B[id].showFrom, 0.35],
  ]),
  ["pop", B.both.from + 20, 0.3],
  ["pop", B.both.showFrom - 10, 0.3, 1.15],
  ["ring", B.cta.showFrom - 10, 0.25],
  ["pop", B.cta.showFrom + 38, 0.35, 1.3],
];

export const Receptionist: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake
        hits={[
          B.hook.showFrom + 6,
          B.m5.showFrom,
          B.w1.showFrom,
          B.w2.showFrom,
          B.w3.showFrom,
        ]}
      >
        <Tracker
          tl={TL}
          show={["r1", "both"]}
          items={[
            {
              after: "r1",
              label: "CONTESTANTS",
              from: "r1",
              until: "c3",
              hint: "ROUND 1",
            },
            {
              after: "r2",
              label: "THE MATH",
              from: "r2",
              until: "m5",
              hint: "ROUND 2",
            },
            {
              after: "r3",
              label: "WHO WINS",
              from: "r3",
              until: "w3",
              hint: "ROUND 3",
            },
          ]}
        />
        <BeatScene from={B.hook}>
          <PriceTag />
        </BeatScene>
        <BeatScene from={B.c1} until={B.c3}>
          <Podiums />
        </BeatScene>
        <BeatScene from={B.m1}>
          <Equation />
        </BeatScene>
        <BeatScene from={B.m2}>
          <MinuteTank />
        </BeatScene>
        <BeatScene from={B.m4}>
          <Balloon />
        </BeatScene>
        <BeatScene from={B.m5}>
          <Stamp
            at={B.m5.showFrom}
            text={"MINUTES,\nNOT MONTHS."}
            color="#E5484D"
            y={840}
          />
        </BeatScene>
        {CASES.map((c) => (
          <BeatScene key={c.beat} from={B[c.beat]}>
            <CaseCard c={c} b={B[c.beat]} />
          </BeatScene>
        ))}
        <BeatScene from={B.both}>
          <Hybrid />
        </BeatScene>
        <SolOnStage
          tl={TL}
          blocking={BLOCKING}
          mouth={MOUTH as number[]}
          keys={[
            { beat: "hook", top: 1120, size: 330 },
            { beat: "both", top: 1120, size: 330 },
            { beat: "cta", top: 560, size: 300 },
          ]}
        />
        <Cta />
        <RoundCard beat={B.r1} eyebrow="ROUND 1" big="3" unit="CONTESTANTS" />
        <RoundCard beat={B.r2} eyebrow="ROUND 2" big="×" unit="THE MATH" />
        <RoundCard beat={B.r3} eyebrow="ROUND 3" big="?" unit="WHO WINS" />
        <PhraseBubble tl={TL} />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-receptionist-music.wav")} volume={0.5} />
    <Audio src={staticFile("audio/sol-receptionist-voice.wav")} volume={0.9} />
    {CUES.map(([name, at, volume, rate], i) => (
      <Sfx
        key={`${name}-${at}-${i}`}
        name={name}
        at={at}
        volume={volume}
        rate={rate}
        duck={DUCK}
      />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

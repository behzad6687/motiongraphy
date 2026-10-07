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
import { Icon } from "../../components/Icons";
import { LightSweep } from "../../components/Motion";
import { SafeZones } from "../../components/SafeZones";
import { Sfx, type SfxName } from "../../components/Sfx";
import { Stage } from "../../components/Stage";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import {
  BeatScene,
  type Blocking,
  CREAM,
  Footnote,
  ICE,
  INK,
  PhraseBubble,
  RoundCard,
  Shake,
  SolOnStage,
  Stamp,
  type Timeline,
  Tracker,
  byId,
} from "./kit";
import TIMELINE from "./speed-to-lead.timeline.json";

// Sol explains: Speed to lead (blog: esolutify.com/speed-to-lead-small-business-2026).
// Words live in speed-to-lead.json; scripts/sol_timeline.py turns them into
// frames at reading speed, so this file only draws the pictures for each beat.
// Structure that's easy to follow: hook → "3 numbers" → a big card per number
// (5 MINUTES · 29 HOURS · 78%) → the fix → a recap to screenshot → call Sol.

const TL = TIMELINE as unknown as Timeline;
const B = byId(TL);
export const SPEED_TO_LEAD_DURATION = TL.total;

const card: React.CSSProperties = {
  borderRadius: 30,
  background: theme.gradients.card,
  border: `5px solid ${INK}`,
  boxShadow: `8px 10px 0 ${INK}`,
};

const useSpring = (at: number, cfg: keyof typeof theme.spring = "bouncy") => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: theme.spring[cfg] });
};

// ---------------------------------------------------------------- hook: the 5-minute clock
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = B.hook;
  // real time for the first seconds, then it races to 0:00 when the line lands
  const race = ease(frame, b.showFrom, b.showFrom + 24, theme.ease.inOut);
  const left = Math.max(0, (300 - frame / 30) * (1 - race));
  const cold = race;
  const mm = Math.floor(left / 60);
  const ss = Math.floor(left % 60);
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 110,
          width: 860,
          top: 600,
          height: 136,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 28px",
          filter: `grayscale(${cold * 0.8}) brightness(${1 - cold * 0.25})`,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: theme.gradients.gold,
            border: `4px solid ${INK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="chat" size={40} color={INK} stroke={2.4} />
        </div>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "0.1em",
              color: theme.colors.gold2,
            }}
          >
            NEW LEAD · JUST NOW
          </div>
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 38,
              color: theme.colors.text,
            }}
          >
            “Hi! Are you free this week?”
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 770,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 210,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: cold > 0.5 ? ICE : theme.colors.gold2,
          textShadow:
            cold > 0.5
              ? "0 0 40px rgba(143,211,255,0.5)"
              : `0 0 40px ${theme.colors.glow}`,
        }}
      >
        {mm}:{String(ss).padStart(2, "0")}
      </div>
      {cold > 0.95 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 990,
            textAlign: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 44,
            color: ICE,
            letterSpacing: "0.1em",
          }}
        >
          LEAD GONE COLD
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- intro: 3 mystery numbers
const Mystery: React.FC = () => {
  const b = B.intro;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <MysteryCard key={i} i={i} at={b.showFrom + i * 6} />
      ))}
    </>
  );
};
const MysteryCard: React.FC<{ i: number; at: number }> = ({ i, at }) => {
  const p = useSpring(at);
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 100 + i * 300,
        top: 640,
        width: 280,
        height: 330,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [120, 0])}px`,
        rotate: `${(i - 1) * 4}deg`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "0.16em",
          color: theme.colors.gold2,
        }}
      >
        #{i + 1}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 170,
          color: theme.colors.text,
          lineHeight: 1,
        }}
      >
        ?
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- #1: 100× more likely
const Bars: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.n1.showFrom;
  const g = ease(frame, at, at + 30, theme.ease.out);
  const bar = (
    x: number,
    h: number,
    color: string,
    top: string,
    label: string,
    sub: string,
  ) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 960 - h,
        width: 220,
        height: h,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -90,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 70,
          color,
          opacity: g,
        }}
      >
        {top}
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "18px 18px 6px 6px",
          background: color,
          border: `5px solid ${INK}`,
          boxShadow: `6px 8px 0 ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          top: h + 14,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 36,
          color: theme.colors.text,
        }}
      >
        {label}
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 24,
            color: theme.colors.muted,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
  return (
    <>
      {bar(
        250,
        20 + 250 * g,
        theme.colors.gold2,
        "100×",
        "Reply in 5 min",
        "chance you reach them",
      )}
      {bar(610, 20, "#5B5F66", "1×", "Wait 30 min", "")}
      <Footnote
        text="Harvard Business Review, 2011 · 1.25 million leads"
        at={at + 20}
        top={1072}
      />
    </>
  );
};

// ---------------------------------------------------------------- #2: 29 hours / 63% never
const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.n2a.showFrom;
  const spin = ease(frame, at, at + 34, theme.ease.inOut) * 29 * 360;
  return (
    <>
      <svg
        width={360}
        height={360}
        viewBox="-180 -180 360 360"
        style={{ position: "absolute", left: 360, top: 620 }}
      >
        <circle r={170} fill={CREAM} stroke={INK} strokeWidth={10} />
        {new Array(12).fill(0).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={-150}
            x2={0}
            y2={-128}
            stroke={INK}
            strokeWidth={8}
            strokeLinecap="round"
            transform={`rotate(${i * 30})`}
          />
        ))}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-90}
          stroke={INK}
          strokeWidth={12}
          strokeLinecap="round"
          transform={`rotate(${spin / 12})`}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-130}
          stroke="#E5484D"
          strokeWidth={7}
          strokeLinecap="round"
          transform={`rotate(${spin})`}
        />
        <circle r={14} fill={INK} />
      </svg>
      <Footnote
        text="Average reply time · study of 1,000+ companies"
        at={at + 20}
        top={1010}
      />
    </>
  );
};

const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.n2b.showFrom;
  // deterministic "random" 63 of 100
  const order = new Array(100)
    .fill(0)
    .map((_, i) => ({
      i,
      k: Math.sin(i * 91.7) * 1000 - Math.floor(Math.sin(i * 91.7) * 1000),
    }))
    .sort((a, b) => a.k - b.k);
  const dead = new Set(order.slice(0, 63).map((o) => o.i));
  const p = ease(frame, at, at + 30, theme.ease.inOut);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 600,
          width: 420,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {new Array(100).fill(0).map((_, i) => {
          const rank = order.findIndex((o) => o.i === i);
          const gone = dead.has(i) && p * 63 > rank;
          return (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: gone ? "#3A3A3A" : theme.colors.gold2,
                border: `3px solid ${gone ? "#555" : INK}`,
                opacity: gone ? 0.55 : 1,
                scale: gone ? 0.8 : 1,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1040,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 36,
          opacity: ease(frame, at + 20, at + 30),
        }}
      >
        <span style={{ color: "#FF8A80" }}>63 never reply</span>
        <span style={{ color: theme.colors.gold2 }}>37 do</span>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- #3: first to answer wins
const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.n3a.showFrom;
  const lanes = [
    { name: "Firm A", t: "3 hours later", win: false },
    { name: "Firm B", t: "Answered in 2 min", win: true },
    { name: "Firm C", t: "Next day", win: false },
  ];
  return (
    <>
      {lanes.map((l, i) => {
        const p = ease(frame, at + i * 6, at + i * 6 + 14);
        const ring = frame < at && Math.sin(frame * 1.4 + i) > 0;
        return (
          <div
            key={l.name}
            style={{
              ...card,
              position: "absolute",
              left: 110,
              width: 860,
              top: 610 + i * 150,
              height: 124,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 26px",
              border: `5px solid ${l.win && p > 0.5 ? theme.colors.gold2 : INK}`,
              background:
                l.win && p > 0.5
                  ? "linear-gradient(180deg, #2A2214, #17130C)"
                  : theme.gradients.card,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: theme.colors.surface3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                rotate: ring ? "12deg" : "0deg",
              }}
            >
              <Icon
                name="handset"
                size={38}
                color={theme.colors.text}
                stroke={2.2}
              />
            </div>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 42,
                color: theme.colors.text,
                width: 200,
              }}
            >
              {l.name}
            </div>
            <div
              style={{
                flex: 1,
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 30,
                color: l.win ? theme.colors.ok : "#FF8A80",
                opacity: p,
              }}
            >
              {l.t}
            </div>
            {l.win ? (
              <div
                style={{
                  padding: "8px 18px",
                  borderRadius: 99,
                  background: theme.gradients.gold,
                  color: INK,
                  fontFamily: theme.fonts.display,
                  fontWeight: 900,
                  fontSize: 30,
                  scale: p,
                  border: `4px solid ${INK}`,
                }}
              >
                HIRED
              </div>
            ) : null}
          </div>
        );
      })}
      <Footnote
        text="78% of legal clients hire the first firm that answers · 2025 research"
        at={at + 20}
        top={1052}
      />
    </>
  );
};

// ---------------------------------------------------------------- the fix
const PhoneCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      ...card,
      position: "absolute",
      left: 150,
      width: 780,
      top: 600,
      height: 470,
      padding: 30,
      display: "flex",
      flexDirection: "column",
      gap: 18,
    }}
  >
    {children}
  </div>
);
const Bubble: React.FC<{
  at: number;
  me?: boolean;
  gold?: boolean;
  children: React.ReactNode;
}> = ({ at, me, gold, children }) => {
  const p = useSpring(at, "snappy");
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [0.85, 1]),
      }}
    >
      <div
        style={{
          maxWidth: 560,
          padding: "16px 22px",
          borderRadius: 26,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 32,
          lineHeight: 1.25,
          background: gold ? theme.gradients.gold : theme.colors.surface3,
          color: gold ? INK : theme.colors.text,
          border: gold ? `4px solid ${INK}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
const Chip: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const p = useSpring(at);
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        alignSelf: "center",
        padding: "10px 22px",
        borderRadius: 99,
        background: theme.colors.ok,
        color: INK,
        fontFamily: theme.fonts.display,
        fontWeight: 900,
        fontSize: 30,
        scale: p,
        border: `4px solid ${INK}`,
      }}
    >
      {children}
    </div>
  );
};

const Fix1: React.FC = () => {
  const at = B.fix1.showFrom;
  return (
    <PhoneCard>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 38,
          color: "#FF8A80",
        }}
      >
        <Icon name="phoneMissed" size={42} color="#FF8A80" stroke={2.4} />
        Missed call · 6:50 pm
      </div>
      <Bubble at={at + 4} me gold>
        Sorry we missed you! What can we help with?
      </Bubble>
      <Chip at={at + 18}>Sent in 3 seconds</Chip>
    </PhoneCard>
  );
};

const Fix2: React.FC = () => {
  const at = B.fix2.showFrom;
  return (
    <PhoneCard>
      <Bubble at={B.fix2.from + 4}>Do you have anything this week?</Bubble>
      <Bubble at={at + 4} me gold>
        Tue 10:30 or Thu 2:15?
      </Bubble>
      <Bubble at={at + 14}>Tue please!</Bubble>
      <Chip at={at + 24}>Booked · Tue 10:30</Chip>
    </PhoneCard>
  );
};

const Fix3: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.fix3.showFrom;
  const p = useSpring(B.fix3.from + 2);
  const sticker = useSpring(at + 10);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 610,
          width: 680,
          height: 400,
          padding: "40px 44px",
          background: "#FFE88A",
          boxShadow: `10px 12px 0 ${INK}`,
          border: `5px solid ${INK}`,
          rotate: `${interpolate(p, [0, 1], [-14, -3])}deg`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
          fontFamily: theme.fonts.hand,
          fontWeight: 700,
          color: INK,
        }}
      >
        <div style={{ fontSize: 58, lineHeight: 1 }}>OUR RULE:</div>
        <div style={{ fontSize: 52, lineHeight: 1.15, marginTop: 14 }}>
          Every lead gets a real reply in 5 minutes. 7 days a week.
        </div>
      </div>
      {frame >= at + 10 ? (
        <div
          style={{
            position: "absolute",
            left: 730,
            top: 840,
            width: 230,
            height: 230,
            borderRadius: "50%",
            background: theme.colors.ok,
            border: `6px solid ${INK}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            rotate: "10deg",
            scale: sticker,
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            color: INK,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          <div style={{ fontSize: 66 }}>+25</div>
          <div style={{ fontSize: 26 }}>POINTS</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            on time
          </div>
        </div>
      ) : null}
      <Footnote
        text="With a written rule: 55% on time vs 30% without · 2026 study"
        at={at + 20}
        top={1060}
      />
    </>
  );
};

// ---------------------------------------------------------------- recap
const RECAP = [
  { big: "5 min", label: "the window" },
  { big: "29 h", label: "the average" },
  { big: "78%", label: "hire the first" },
];
const Recap: React.FC = () => {
  const at = B.recap.showFrom;
  return (
    <>
      {RECAP.map((r, i) => (
        <RecapCard key={r.big} i={i} at={B.recap.from + 4 + i * 8} {...r} />
      ))}
      <Footnote text="Speed to lead · Sol explains" at={at} top={1010} />
    </>
  );
};
const RecapCard: React.FC<{
  i: number;
  at: number;
  big: string;
  label: string;
}> = ({ i, at, big, label }) => {
  const p = useSpring(at);
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 100 + i * 300,
        top: 650,
        width: 280,
        height: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `5px solid ${INK}`,
        outline: `3px solid ${theme.colors.gold2}`,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [0.7, 1]),
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: "0.16em",
          color: theme.colors.gold2,
        }}
      >
        #{i + 1}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 84,
          color: theme.colors.text,
          lineHeight: 1.05,
        }}
      >
        {big}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 30,
          color: theme.colors.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const b = B.cta;
  const at = b.showFrom;
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
        He answers eSolutify’s own line in seconds. 24/7.
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
        Read the full guide
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
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "shock", arms: [165, 165], spike: 1 },
  },
  intro: {
    say: { mood: "happy", arms: [55, 150], wave: true },
    after: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
  },
  r1: { say: { mood: "laugh", arms: [160, 160] } },
  n1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 160], look: [-0.5, -0.9] },
  },
  r2: { say: { mood: "shock", arms: [160, 160], spike: 0.8 } },
  n2a: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "worried", arms: [70, 70], look: [0, -0.9], sweat: true },
  },
  n2b: {
    say: { mood: "worried", arms: [70, 70], look: [0, -0.9] },
    after: { mood: "pout", arms: [30, 30], look: [0, -0.6] },
  },
  r3: { say: { mood: "laugh", arms: [160, 160] } },
  n3a: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150], look: [0.3, -0.9] },
  },
  n3b: { say: { mood: "laugh", arms: [160, 160], spike: 0.4 } },
  r4: { say: { mood: "happy", arms: [150, 150] } },
  fix1: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150] },
  },
  fix2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "wink", arms: [55, 150] },
  },
  fix3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  recap: {
    say: { mood: "happy", arms: [150, 150] },
    after: { mood: "wink", arms: [55, 150] },
  },
  cta: {
    say: { mood: "smug", arms: [40, 40] },
    after: { mood: "wink", arms: [55, 150], wave: true },
  },
};

// ---------------------------------------------------------------- sound
const SAY_BEATS = TL.beats.filter((b) => b.kind === "say");
const ROUNDS = TL.beats.filter((b) => b.kind === "round");
const CUES: [SfxName, number, number, number?][] = [
  ["boing", 0, 0.3, 1.1],
  ["tick", 10, 0.3],
  ["tick", 40, 0.3],
  ["tick", 70, 0.3],
  ["wahwah", B.hook.showFrom + 18, 0.4],
  ...SAY_BEATS.filter((b) => b.id !== "hook").map(
    (b): [SfxName, number, number, number?] => ["boing", b.from - 2, 0.16, 1.2],
  ),
  ...ROUNDS.map((b): [SfxName, number, number, number?] => [
    "tada",
    b.from - 1,
    0.45,
  ]),
  ["pop", B.intro.showFrom, 0.35],
  ["pop", B.intro.showFrom + 6, 0.35, 1.1],
  ["pop", B.intro.showFrom + 12, 0.35, 1.2],
  ["inflate", B.n1.showFrom, 0.35, 1.3],
  ["whoosh", B.n2a.showFrom, 0.35],
  ["wahwah", B.n2b.showFrom + 10, 0.3, 1.1],
  ["ping", B.n3a.showFrom + 8, 0.4],
  ["stamp", B.n3b.showFrom, 0.45],
  ["ping", B.fix1.showFrom + 4, 0.35],
  ["chime", B.fix1.showFrom + 18, 0.35],
  ["ping", B.fix2.showFrom + 4, 0.35, 1.1],
  ["chime", B.fix2.showFrom + 24, 0.35],
  ["pop", B.fix3.showFrom + 10, 0.4],
  ["pop", B.recap.from + 4, 0.35],
  ["pop", B.recap.from + 12, 0.35, 1.1],
  ["pop", B.recap.from + 20, 0.35, 1.2],
  ["shutter", B.recap.showFrom + 10, 0.45],
  ["ring", B.cta.showFrom, 0.3],
  ["pop", B.cta.showFrom + 48, 0.4, 1.3],
];

export const SpeedToLead: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake
        hits={[
          B.hook.showFrom + 24,
          B.n3b.showFrom,
          ...ROUNDS.map((r) => r.from),
        ]}
      >
        <Tracker
          tl={TL}
          show={["intro", "recap"]}
          items={[
            { after: "r1", label: "5 MIN", from: "r1", until: "n1" },
            { after: "r2", label: "29 H", from: "r2", until: "n2b" },
            { after: "r3", label: "78%", from: "r3", until: "n3b" },
            {
              after: "r4",
              label: "FIX",
              from: "r4",
              until: "fix3",
              hint: "FIX",
            },
          ]}
        />
        <BeatScene from={B.hook}>
          <Hook />
        </BeatScene>
        <BeatScene from={B.intro}>
          <Mystery />
        </BeatScene>
        <BeatScene from={B.n1}>
          <Bars />
        </BeatScene>
        <BeatScene from={B.n2a}>
          <Clock />
        </BeatScene>
        <BeatScene from={B.n2b}>
          <DotGrid />
        </BeatScene>
        <BeatScene from={B.n3a}>
          <Race />
        </BeatScene>
        <BeatScene from={B.n3b}>
          <Stamp
            at={B.n3b.showFrom}
            text={"FIRST TO\nANSWER WINS."}
            color={theme.colors.gold2}
            y={820}
          />
        </BeatScene>
        <BeatScene from={B.fix1}>
          <Fix1 />
        </BeatScene>
        <BeatScene from={B.fix2}>
          <Fix2 />
        </BeatScene>
        <BeatScene from={B.fix3}>
          <Fix3 />
        </BeatScene>
        <BeatScene from={B.recap}>
          <Recap />
        </BeatScene>
        <SolOnStage
          tl={TL}
          blocking={BLOCKING}
          keys={[
            { beat: "hook", top: 1120, size: 330 },
            { beat: "recap", top: 1120, size: 330 },
            { beat: "cta", top: 560, size: 300 },
          ]}
        />
        <Cta />
        <RoundCard beat={B.r1} eyebrow="NUMBER 1" big="5" unit="MINUTES" />
        <RoundCard beat={B.r2} eyebrow="NUMBER 2" big="29" unit="HOURS" />
        <RoundCard beat={B.r3} eyebrow="NUMBER 3" big="78%" />
        <RoundCard beat={B.r4} eyebrow="THE FIX" big="3" unit="EASY WINS" />
        <PhraseBubble tl={TL} />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-speed-to-lead-music.wav")} volume={0.6} />
    <Audio
      src={staticFile("audio/sol-speed-to-lead-voice.wav")}
      volume={0.42}
    />
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

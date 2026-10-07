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
import { Icon, type IconName } from "../../components/Icons";
import { SafeZones } from "../../components/SafeZones";
import { Sfx, type SfxName } from "../../components/Sfx";
import { Stage } from "../../components/Stage";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import {
  BeatScene,
  type Blocking,
  CallSolCta,
  CREAM,
  Footnote,
  INK,
  MARK_RED,
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
import MOUTH from "./dental.mouth.json";
import TIMELINE from "./dental.timeline.json";

// Sol explains: AI receptionist for dental clinics -- cost, limits, privacy
// and a 30-day rollout (blog: esolutify.com/ai-receptionist-for-dental-clinics-cost-rollout-plan).
// Words live in dental.json; scripts/sol_timeline.py turns them into frames
// (each phrase appears as Sol says it), so this file only draws the pictures.
// Easy to follow: hook (ad price vs real bill) → "4 things before you buy" →
// a numbered part per thing, with a tracker → recap → call Sol.

const TL = TIMELINE as unknown as Timeline;
const B = byId(TL);
export const DENTAL_DURATION = TL.total;

const RED = "#E5484D";

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

// when the n-th on-screen word of a beat is spoken
const wordAt = (id: string, n: number) =>
  B[id].phrases.flatMap((p) => p.words)[n]?.at ?? B[id].from;
const phraseAt = (id: string, n: number) => B[id].phrases[n]?.at ?? B[id].from;

const Tooth: React.FC<{ size: number; color?: string }> = ({
  size,
  color = CREAM,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50 18 C38 6 14 8 12 32 C10 50 20 58 24 74 C27 88 30 94 36 94 C44 94 42 70 50 70 C58 70 56 94 64 94 C70 94 73 88 76 74 C80 58 90 50 88 32 C86 8 62 6 50 18 Z"
      fill={color}
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <path
      d="M30 30 C32 24 38 22 42 24"
      fill="none"
      stroke={INK}
      strokeWidth={4}
      strokeLinecap="round"
      opacity={0.35}
    />
  </svg>
);

// ---------------------------------------------------------------- hook: ad vs bill
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const b = B.hook;
  const ad = useSpring(4);
  const at = b.showFrom;
  const print = ease(frame, at, at + 26, theme.ease.out);
  const lines = [
    ["Base plan", "$300"],
    ["Booking software link", "+$300"],
    ["Extra minutes", "+$650"],
    ["Setup, amortized", "+$150"],
  ];
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 90,
          top: 610,
          width: 400,
          height: 400,
          padding: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: theme.gradients.gold,
          rotate: `${interpolate(ad, [0, 1], [-14, -5])}deg`,
          scale: interpolate(ad, [0, 1], [0.6, 1]),
          opacity: interpolate(ad, [0, 0.3], [0, 1], clamp),
          color: INK,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: "0.12em" }}>
          AI RECEPTIONIST
        </div>
        <div style={{ fontSize: 40 }}>only</div>
        <div style={{ fontSize: 138, lineHeight: 1 }}>$300</div>
        <div style={{ fontSize: 40 }}>/month*</div>
        <div
          style={{
            marginTop: 10,
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 18,
            opacity: 0.7,
          }}
        >
          *plus fees
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 630,
          width: 450,
          height: 40 + 420 * print,
          overflow: "hidden",
          background: CREAM,
          border: `5px solid ${INK}`,
          borderRadius: "8px 8px 0 0",
          boxShadow: `8px 10px 0 ${INK}`,
          padding: "22px 26px",
          fontFamily: theme.fonts.body,
          color: INK,
          opacity: frame >= at - 2 ? 1 : 0,
          rotate: "3deg",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: "0.14em",
            textAlign: "center",
          }}
        >
          THE REAL BILL
        </div>
        <div
          style={{ borderTop: `3px dashed ${INK}`, margin: "12px 0 10px" }}
        />
        {lines.map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 26,
              lineHeight: 1.7,
              opacity: frame >= at + 4 + i * 4 ? 1 : 0,
            }}
          >
            <span>{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: `3px dashed ${INK}`, margin: "10px 0 6px" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 34,
            opacity: frame >= at + 22 ? 1 : 0,
          }}
        >
          <span>TOTAL</span>
          <span style={{ color: RED, fontSize: 58 }}>$1,400</span>
        </div>
      </div>
      <Footnote
        text="Example: mid-tier plan with booking link and overage · CAD"
        at={at + 26}
        top={1090}
      />
    </>
  );
};

// ---------------------------------------------------------------- intro: the 4 things
const PARTS: { icon: IconName | "dollar"; label: string }[] = [
  { icon: "dollar", label: "REAL\nCOST" },
  { icon: "check", label: "CAN /\nCAN’T" },
  { icon: "shield", label: "PRIVACY" },
  { icon: "calendarCheck", label: "30-DAY\nPLAN" },
];
const Agenda: React.FC = () => {
  const at = phraseAt("intro", 1);
  return (
    <>
      {PARTS.map((p, i) => (
        <AgendaCard key={p.label} i={i} at={at + 4 + i * 5} {...p} />
      ))}
    </>
  );
};
const AgendaCard: React.FC<{
  i: number;
  at: number;
  icon: IconName | "dollar";
  label: string;
}> = ({ i, at, icon, label }) => {
  const p = useSpring(at);
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 70 + i * 240,
        top: 660,
        width: 220,
        height: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [120, 0])}px`,
        rotate: `${(i - 1.5) * 3}deg`,
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
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: theme.gradients.gold,
          border: `4px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon === "dollar" ? (
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 58,
              color: INK,
            }}
          >
            $
          </span>
        ) : (
          <Icon name={icon} size={50} color={INK} stroke={2.6} />
        )}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 32,
          lineHeight: 1.05,
          color: theme.colors.text,
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- #1: the receipt
const RECEIPT = [
  { beat: "k1", k: "Base plan", v: "$300–$800" },
  { beat: "k2", k: "Booking software link", v: "+$99–$300" },
  { beat: "k3", k: "Extra minutes", v: "12–35¢ each" },
];
const Receipt: React.FC = () => {
  const frame = useCurrentFrame();
  const totalAt = B.k3.showFrom + 14;
  const shown = RECEIPT.filter((r) => frame >= B[r.beat].showFrom - 2).length;
  const h = 130 + 80 * shown + (frame >= totalAt ? 124 : 0);
  const enter = useSpring(B.k1.from);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 624,
          width: 780,
          height: interpolate(enter, [0, 1], [60, h], clamp),
          overflow: "hidden",
          background: CREAM,
          border: `5px solid ${INK}`,
          borderRadius: 12,
          boxShadow: `10px 12px 0 ${INK}`,
          padding: "22px 34px",
          fontFamily: theme.fonts.body,
          color: INK,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: "0.14em",
          }}
        >
          <Tooth size={46} />
          SMILE DENTAL · AI RECEPTIONIST
        </div>
        <div style={{ borderTop: `3px dashed ${INK}`, margin: "16px 0 6px" }} />
        {RECEIPT.map((r) => {
          const at = B[r.beat].showFrom - 2;
          if (frame < at) return null;
          const live = frame >= B[r.beat].from && frame <= B[r.beat].until;
          const p = ease(frame, at, at + 8);
          return (
            <div
              key={r.k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: 80,
                margin: "0 -14px",
                padding: "0 14px",
                borderRadius: 14,
                background: live ? "rgba(247,212,116,0.55)" : "transparent",
                opacity: p,
                translate: `${(1 - p) * -30}px 0px`,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 36 }}>{r.k}</span>
              <span
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 900,
                  fontSize: 44,
                  color: r.beat === "k1" ? INK : "#B3261E",
                }}
              >
                {r.v}
              </span>
            </div>
          );
        })}
        {frame >= totalAt ? (
          <>
            <div
              style={{ borderTop: `3px dashed ${INK}`, margin: "10px 0 6px" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: theme.fonts.display,
                fontWeight: 900,
              }}
            >
              <span style={{ fontSize: 40 }}>REAL TOTAL</span>
              <span
                style={{
                  fontSize: 58,
                  color: "#B3261E",
                  display: "inline-block",
                  scale: 1 + 0.25 * (1 - ease(frame, totalAt, totalAt + 10)),
                }}
              >
                $700–$1,400
              </span>
            </div>
            <div
              style={{
                textAlign: "right",
                fontWeight: 700,
                fontSize: 26,
                opacity: 0.7,
              }}
            >
              per month, all-in (CAD)
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- payback
const Payback: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.k6.showFrom;
  const grow = ease(frame, at - 10, at + 30, theme.ease.out);
  const COST = 110; // px: what the AI costs over the period
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 100,
          top: 610,
          width: 880,
          height: 440,
        }}
      />
      {new Array(8).fill(0).map((_, i) => {
        const h = Math.min(290, 40 + i * 40) * grow;
        const paid = h > COST + 4;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: 160 + i * 100,
                top: 960 - h,
                width: 70,
                height: h,
                borderRadius: "12px 12px 4px 4px",
                background: paid ? theme.colors.ok : theme.colors.gold2,
                border: `4px solid ${INK}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 150 + i * 100,
                width: 90,
                top: 972,
                textAlign: "center",
                fontFamily: theme.fonts.body,
                fontWeight: 800,
                fontSize: 22,
                color: theme.colors.muted,
              }}
            >
              wk {i + 1}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 130,
          width: 820,
          top: 960 - COST,
          borderTop: `5px dashed ${MARK_RED}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 960 - COST - 50,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 30,
          color: MARK_RED,
        }}
      >
        what it costs
      </div>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 640,
          padding: "8px 20px",
          borderRadius: 99,
          background: theme.colors.ok,
          border: `4px solid ${INK}`,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 32,
          color: INK,
          scale: ease(frame, at + 24, at + 32, theme.ease.out),
        }}
      >
        PAID BACK: WEEK 3–8
      </div>
      <Footnote
        text="Booked calls you used to miss · 1 new patient ≈ $1,200+ lifetime"
        at={at + 20}
        top={1066}
      />
    </>
  );
};

// ---------------------------------------------------------------- #2: can / can't
const CAN = [
  "Book & reschedule, live calendar",
  "Hours, parking, insurance basics",
  "New-patient intake",
  "Confirmations & reminders",
  "After-hours & overflow calls",
];
const CanList: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.can.showFrom - 14;
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 120,
        top: 600,
        width: 840,
        padding: "26px 34px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 36,
          color: theme.colors.gold2,
          letterSpacing: "0.06em",
        }}
      >
        SOL HANDLES, 24/7:
      </div>
      {CAN.map((c, i) => {
        const t = at + i * 7;
        const p = ease(frame, t, t + 8, theme.ease.out);
        return (
          <div
            key={c}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: frame >= t ? 1 : 0.25,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 34,
              color: theme.colors.text,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                border: `4px solid ${frame >= t ? INK : theme.colors.line2}`,
                background: frame >= t ? theme.colors.ok : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: frame >= t ? 0.7 + 0.3 * p : 1,
              }}
            >
              {frame >= t ? (
                <Icon name="check" size={32} color={INK} stroke={3.2} />
              ) : null}
            </div>
            {c}
          </div>
        );
      })}
    </div>
  );
};

const QUESTIONS = ["“Is this a dry socket?”", "“Should I take antibiotics?”"];
const Cant: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {QUESTIONS.map((q, i) => {
        const at = B.cant.from + 4 + i * 8;
        const p = ease(frame, at, at + 10, theme.ease.out);
        return (
          <div
            key={q}
            style={{
              ...card,
              position: "absolute",
              left: i === 0 ? 110 : 250,
              top: 620 + i * 190,
              width: 720,
              height: 140,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 28px",
              opacity: p,
              translate: `${(1 - p) * (i ? 60 : -60)}px 0px`,
              filter:
                frame >= B.cant.showFrom + i * 10 ? "grayscale(0.7)" : "none",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: theme.colors.surface3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <Icon name="user" size={42} color={theme.colors.text} />
            </div>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 40,
                color: theme.colors.text,
              }}
            >
              {q}
            </div>
          </div>
        );
      })}
      {QUESTIONS.map((q, i) => (
        <Stamp
          key={q}
          at={B.cant.showFrom + i * 10}
          text="NOT FOR AI"
          color={RED}
          x={i === 0 ? 660 : 800}
          y={770 + i * 190}
          size={40}
          rot={-8 + i * 12}
        />
      ))}
      <Footnote
        text="Clinical questions always go to your team"
        at={B.cant.showFrom + 20}
        top={1040}
      />
    </>
  );
};

const TRIGGERS = ["pain", "swelling", "bleeding"];
const Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.emerg.showFrom;
  const go = ease(frame, at, at + 16, theme.ease.inOut);
  const human = useSpring(at + 12);
  return (
    <>
      {TRIGGERS.map((w, i) => {
        const t = wordAt("emerg", i);
        const p = springAt(frame, t);
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              left: 120 + i * 290,
              top: 640,
              width: 260,
              padding: "16px 0",
              borderRadius: 99,
              textAlign: "center",
              background: MARK_RED,
              border: `5px solid ${INK}`,
              boxShadow: `6px 8px 0 ${INK}`,
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 44,
              color: INK,
              opacity: frame >= t ? 1 : 0,
              scale: frame >= t ? p : 0,
            }}
          >
            {w}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 535,
          top: 742,
          width: 10,
          height: 100 * go,
          background: theme.colors.gold2,
          borderRadius: 5,
        }}
      />
      <div
        style={{
          ...card,
          position: "absolute",
          left: 160,
          top: 850,
          width: 760,
          height: 190,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 30px",
          border: `5px solid ${theme.colors.ok}`,
          opacity: interpolate(human, [0, 0.4], [0, 1], clamp),
          scale: interpolate(human, [0, 1], [0.8, 1]),
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: theme.colors.ok,
            border: `4px solid ${INK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            rotate: `${Math.sin(frame * 1.3) * 10}deg`,
          }}
        >
          <Icon name="handset" size={52} color={INK} stroke={2.6} />
        </div>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 44,
              color: theme.colors.text,
            }}
          >
            On-call human
          </div>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 28,
              color: theme.colors.muted,
            }}
          >
            “Connecting you to our team now.”
          </div>
        </div>
      </div>
    </>
  );
};
// a spring that can be used inside a loop (not a hook)
const springAt = (frame: number, at: number) =>
  spring({ frame: frame - at, fps: 30, config: theme.spring.bouncy });

// ---------------------------------------------------------------- #3: privacy
const Privacy: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.p1.showFrom;
  const shield = useSpring(B.p1.from + 4);
  const badges = [
    { t: "PIPEDA", s: "all of Canada" },
    { t: "PHIPA", s: "Ontario, health data" },
  ];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 405,
          top: 650,
          width: 270,
          height: 270,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: shield,
        }}
      >
        <svg width={270} height={270} viewBox="0 0 100 100">
          <path
            d="M50 6 L86 18 L86 46 C86 70 70 86 50 94 C30 86 14 70 14 46 L14 18 Z"
            fill={theme.colors.gold2}
            stroke={INK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <rect x={36} y={44} width={28} height={24} rx={4} fill={INK} />
          <path
            d="M41 44 L41 37 C41 29 59 29 59 37 L59 44"
            fill="none"
            stroke={INK}
            strokeWidth={5}
          />
        </svg>
      </div>
      {badges.map((b, i) => {
        const p = ease(frame, at + i * 8, at + i * 8 + 10, theme.ease.out);
        return (
          <div
            key={b.t}
            style={{
              ...card,
              position: "absolute",
              left: i === 0 ? 110 : 560,
              top: 940,
              width: 410,
              height: 124,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: p,
              translate: `0px ${(1 - p) * 40}px`,
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 50,
                color: theme.colors.gold2,
                lineHeight: 1,
              }}
            >
              {b.t}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 26,
                color: theme.colors.muted,
              }}
            >
              {b.s}
            </div>
          </div>
        );
      })}
    </>
  );
};

const ASK = [
  "Is patient data stored in Canada?",
  "Does every call open with consent?",
  "What’s your breach-report plan?",
  "How long are recordings kept?",
  "Who else touches the data?",
];
const Clipboard: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.p2.showFrom - 18;
  const enter = useSpring(B.p2.from + 2);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 600,
          width: 820,
          height: 440,
          padding: "96px 36px 20px",
          background: CREAM,
          border: `5px solid ${INK}`,
          borderRadius: 24,
          boxShadow: `10px 12px 0 ${INK}`,
          rotate: `${interpolate(enter, [0, 1], [-8, -1.5])}deg`,
          opacity: interpolate(enter, [0, 0.3], [0, 1], clamp),
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 290,
            top: -24,
            width: 240,
            height: 64,
            borderRadius: 14,
            background: "#8A8F98",
            border: `5px solid ${INK}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            top: 50,
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: "0.08em",
            color: INK,
          }}
        >
          ASK YOUR VENDOR · IN WRITING
        </div>
        {ASK.map((q, i) => {
          const t = at + i * 8;
          return (
            <div
              key={q}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: theme.fonts.hand,
                fontWeight: 700,
                fontSize: 42,
                lineHeight: 1.1,
                color: INK,
                opacity: frame >= t ? 1 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 900,
                  fontSize: 30,
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: theme.colors.gold2,
                  border: `3px solid ${INK}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {i + 1}
              </span>
              {q}
            </div>
          );
        })}
      </div>
      <Stamp
        at={B.p2.showFrom + 30}
        text={"VAGUE? KEEP SHOPPING."}
        color={RED}
        x={560}
        y={1056}
        size={42}
        rot={-4}
      />
    </>
  );
};

// ---------------------------------------------------------------- #4: 30 days
const WEEKS: { icon: IconName; title: string; sub: string }[] = [
  {
    icon: "phoneMissed",
    title: "Audit & script",
    sub: "Count missed calls · script your top 10",
  },
  {
    icon: "layers",
    title: "Connect & consent",
    sub: "Link your booking system · add consent line",
  },
  {
    icon: "clock",
    title: "After-hours only",
    sub: "Read every transcript, fix the gaps",
  },
  { icon: "zap", title: "Go live", sub: "Daytime overflow · 90-day check" },
];
const Plan: React.FC = () => {
  const frame = useCurrentFrame();
  // which week is being talked about (week 4 starts mid-line in w3)
  const w4 = phraseAt("w3", 1);
  const active =
    frame >= w4 ? 3 : frame >= B.w3.from ? 2 : frame >= B.w2.from ? 1 : 0;
  return (
    <>
      {WEEKS.map((w, i) => {
        const on = i === active;
        const done = i < active;
        const p = springAt(frame, B.w1.from + 2 + i * 5);
        return (
          <div
            key={w.title}
            style={{
              ...card,
              position: "absolute",
              left: 90,
              top: 612 + i * 116,
              width: 900,
              height: 106,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 24px",
              border: `5px solid ${on ? theme.colors.gold2 : INK}`,
              background: on
                ? "linear-gradient(180deg, #2A2214, #17130C)"
                : theme.gradients.card,
              opacity: interpolate(
                p,
                [0, 0.4],
                [0, done || on ? 1 : 0.55],
                clamp,
              ),
              translate: `${interpolate(p, [0, 1], [-140, 0])}px 0px`,
              scale: on ? 1.03 : 1,
            }}
          >
            <div
              style={{
                width: 120,
                fontFamily: theme.fonts.body,
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: "0.1em",
                color: on ? theme.colors.gold2 : theme.colors.muted,
              }}
            >
              WEEK {i + 1}
            </div>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: done
                  ? theme.colors.ok
                  : on
                    ? theme.gradients.gold
                    : theme.colors.surface3,
                border: `4px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <Icon
                name={done ? "check" : w.icon}
                size={34}
                color={done || on ? INK : theme.colors.text}
                stroke={2.6}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 900,
                  fontSize: 38,
                  color: theme.colors.text,
                  lineHeight: 1.05,
                }}
              >
                {w.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 24,
                  color: theme.colors.muted,
                }}
              >
                {w.sub}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- recap
const RECAP = [
  { big: "$700–1.4k", label: "a month, all-in" },
  { big: "No advice", label: "humans for clinical" },
  { big: "In writing", label: "5 privacy answers" },
  { big: "30 days", label: "after-hours first" },
];
const Recap: React.FC = () => (
  <>
    {RECAP.map((r, i) => (
      <RecapCard
        key={r.big}
        i={i}
        at={wordAt("recap", [0, 2, 4, 5][i])}
        {...r}
      />
    ))}
    <Footnote
      text="AI receptionist for dental clinics · Sol explains"
      at={B.recap.showFrom}
      top={1050}
    />
  </>
);
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
        left: 110 + (i % 2) * 440,
        top: 610 + Math.floor(i / 2) * 210,
        width: 420,
        height: 190,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        outline: `3px solid ${theme.colors.gold2}`,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [0.7, 1]),
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 900,
          fontSize: 22,
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
          fontSize: 60,
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
          fontSize: 28,
          color: theme.colors.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Sol's blocking
const BLOCKING: Blocking = {
  hook: {
    say: { mood: "talk", arms: [55, 55], look: [-0.6, -0.9] },
    after: { mood: "shock", arms: [165, 165], spike: 1, look: [0.6, -0.9] },
  },
  intro: {
    say: { mood: "happy", arms: [55, 150], wave: true },
    after: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
  },
  r1: { say: { mood: "laugh", arms: [160, 160] } },
  k1: { say: { mood: "talk", arms: [55, 55], look: [0, -0.9] } },
  k2: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "worried", arms: [70, 70], look: [0, -0.9] },
  },
  k3: {
    say: { mood: "worried", arms: [70, 70], look: [0, -0.9], sweat: true },
    after: { mood: "shock", arms: [160, 160], spike: 0.8 },
  },
  k6: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  r2: { say: { mood: "smug", arms: [40, 40] } },
  can: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150], look: [0, -0.9] },
  },
  cant: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "pout", arms: [30, 30], look: [0, -0.6] },
  },
  emerg: {
    say: { mood: "worried", arms: [70, 70], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150], look: [0, -0.9] },
  },
  r3: { say: { mood: "talk", arms: [55, 55], glasses: true } },
  p1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9], glasses: true },
    after: { mood: "smug", arms: [40, 40], glasses: true },
  },
  p2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9], glasses: true },
    after: { mood: "wink", arms: [55, 150], glasses: true },
  },
  r4: { say: { mood: "laugh", arms: [160, 160] } },
  w1: { say: { mood: "talk", arms: [55, 135], look: [0, -0.9] } },
  w2: { say: { mood: "talk", arms: [55, 135], look: [0, -0.9] } },
  w3: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
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
type Cue = [SfxName, number, number, number?];
const SAY_BEATS = TL.beats.filter((b) => b.kind === "say");
const ROUNDS = TL.beats.filter((b) => b.kind === "round");
const DUCK = speechDuck(TL);
const CUES: Cue[] = [
  ["boing", 0, 0.3, 1.1],
  ["pop", 4, 0.35],
  ["typing", B.hook.showFrom, 0.35],
  ["wahwah", B.hook.showFrom + 24, 0.4],
  ...SAY_BEATS.filter((b) => b.id !== "hook").map(
    (b): Cue => ["boing", b.from - 2, 0.16, 1.2],
  ),
  ...ROUNDS.map((b): Cue => ["tada", b.from - 1, 0.45]),
  ...[0, 1, 2, 3].map(
    (i): Cue => ["pop", phraseAt("intro", 1) + 4 + i * 5, 0.35, 1 + i * 0.08],
  ),
  ...RECEIPT.map((r): Cue => ["typing", B[r.beat].showFrom - 2, 0.3]),
  ["stamp", B.k3.showFrom + 20, 0.45],
  ["cash", B.k6.showFrom + 22, 0.4],
  ...CAN.map(
    (_, i): Cue => ["ping", B.can.showFrom - 14 + i * 7, 0.3, 1 + i * 0.06],
  ),
  ["stamp", B.cant.showFrom, 0.4],
  ["stamp", B.cant.showFrom + 10, 0.4, 1.1],
  ...TRIGGERS.map((_, i): Cue => ["pop", wordAt("emerg", i), 0.3, 1 + i * 0.1]),
  ["whoosh", B.emerg.showFrom, 0.35],
  ["ring", B.emerg.showFrom + 12, 0.3],
  ["pencil", B.p2.showFrom - 18, 0.3],
  ["stamp", B.p2.showFrom + 30, 0.4],
  ...[0, 1, 2, 3].map(
    (i): Cue => ["pop", B.w1.from + 2 + i * 5, 0.25, 1 + i * 0.08],
  ),
  ["chime", B.w2.from, 0.3],
  ["chime", B.w3.from, 0.3],
  ["chime", phraseAt("w3", 1), 0.3, 1.1],
  ...[0, 2, 4, 5].map(
    (n, i): Cue => ["pop", wordAt("recap", n), 0.35, 1 + i * 0.08],
  ),
  ["shutter", B.recap.showFrom + 10, 0.45],
  ["ring", B.cta.showFrom, 0.3],
  ["pop", B.cta.showFrom + 48, 0.4, 1.3],
];

export const Dental: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake
        hits={[
          B.hook.showFrom + 24,
          B.k3.showFrom + 20,
          ...ROUNDS.map((r) => r.from),
        ]}
      >
        <Tracker
          tl={TL}
          show={["r1", "w3"]}
          items={[
            { after: "r1", label: "COST", from: "r1", until: "k6" },
            { after: "r2", label: "CAN / CAN’T", from: "r2", until: "emerg" },
            { after: "r3", label: "PRIVACY", from: "r3", until: "p2" },
            { after: "r4", label: "30 DAYS", from: "r4", until: "w3" },
          ]}
        />
        <BeatScene from={B.hook}>
          <Hook />
        </BeatScene>
        <BeatScene from={B.intro}>
          <Agenda />
        </BeatScene>
        <BeatScene from={B.k1} until={B.k3}>
          <Receipt />
        </BeatScene>
        <BeatScene from={B.k6}>
          <Payback />
        </BeatScene>
        <BeatScene from={B.can}>
          <CanList />
        </BeatScene>
        <BeatScene from={B.cant}>
          <Cant />
        </BeatScene>
        <BeatScene from={B.emerg}>
          <Handoff />
        </BeatScene>
        <BeatScene from={B.p1}>
          <Privacy />
        </BeatScene>
        <BeatScene from={B.p2}>
          <Clipboard />
        </BeatScene>
        <BeatScene from={B.w1} until={B.w3}>
          <Plan />
        </BeatScene>
        <BeatScene from={B.recap}>
          <Recap />
        </BeatScene>
        <SolOnStage
          tl={TL}
          blocking={BLOCKING}
          mouth={MOUTH as number[]}
          keys={[
            { beat: "hook", top: 1120, size: 330 },
            { beat: "recap", top: 1120, size: 330 },
            { beat: "cta", top: 590, size: 290 },
          ]}
        />
        <CallSolCta
          at={B.cta.showFrom}
          line="Send us your quote. We’ll walk you through it."
        />
        <RoundCard beat={B.r1} eyebrow="PART 1 OF 4" big="1" unit="REAL COST" />
        <RoundCard
          beat={B.r2}
          eyebrow="PART 2 OF 4"
          big="2"
          unit="CAN / CAN’T"
        />
        <RoundCard beat={B.r3} eyebrow="PART 3 OF 4" big="3" unit="PRIVACY" />
        <RoundCard beat={B.r4} eyebrow="PART 4 OF 4" big="30" unit="DAY PLAN" />
        <PhraseBubble tl={TL} />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-dental-music.wav")} volume={0.5} />
    <Audio src={staticFile("audio/sol-dental-voice.wav")} volume={0.9} />
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

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
  Footnote,
  INK,
  MARK_RED,
  PhraseBubble,
  RoundCard,
  Shake,
  SolOnStage,
  type Timeline,
  Tracker,
  byId,
  speechDuck,
} from "./kit";
import MOUTH from "./contractors.mouth.json";
import TIMELINE from "./contractors.timeline.json";

// Sol explains: missed call text back for contractors
// (blog: esolutify.com/missed-call-text-back-for-contractors).
// Words live in contractors.json; scripts/sol_timeline.py turns them into
// frames (each phrase appears as Sol says it), so this file only draws.
// Easy to follow: hook (ladder, phone, voicemail) → "4 things to plug the
// leak" → the leak · the cost · how it works · the rules → recap → call Sol.

const TL = TIMELINE as unknown as Timeline;
const B = byId(TL);
export const CONTRACTORS_DURATION = TL.total;

const RED = "#E5484D";
const BIZ = "Northside Plumbing";

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
// a spring that can be used inside a loop (not a hook)
const springAt = (frame: number, at: number) =>
  spring({ frame: frame - at, fps: 30, config: theme.spring.bouncy });

// when the n-th on-screen word / phrase of a beat is spoken
const wordAt = (id: string, n: number) =>
  B[id].phrases.flatMap((p) => p.words)[n]?.at ?? B[id].from;
const phraseAt = (id: string, n: number) => B[id].phrases[n]?.at ?? B[id].from;

// ---------------------------------------------------------------- shared bits
const Phone: React.FC<{
  top?: number;
  height?: number;
  children: React.ReactNode;
}> = ({ top = 600, height = 470, children }) => (
  <div
    style={{
      ...card,
      position: "absolute",
      left: 150,
      width: 780,
      top,
      height,
      padding: "26px 30px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    {children}
  </div>
);

const Text: React.FC<{
  at: number;
  me?: boolean;
  children: React.ReactNode;
  size?: number;
}> = ({ at, me, children, size = 30 }) => {
  const frame = useCurrentFrame();
  const p = springAt(frame, at);
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
          maxWidth: 600,
          padding: "14px 22px",
          borderRadius: 24,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.28,
          background: me ? theme.gradients.gold : theme.colors.surface3,
          color: me ? INK : theme.colors.text,
          border: me ? `4px solid ${INK}` : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Chip: React.FC<{
  at: number;
  color?: string;
  children: React.ReactNode;
}> = ({ at, color = theme.colors.ok, children }) => {
  const frame = useCurrentFrame();
  const p = springAt(frame, at);
  if (frame < at) return null;
  return (
    <div
      style={{
        alignSelf: "center",
        padding: "10px 22px",
        borderRadius: 99,
        background: color,
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

const Mark: React.FC<{ on: boolean; children: React.ReactNode }> = ({
  on,
  children,
}) => (
  <span
    style={{
      padding: "0 6px",
      margin: "0 -6px",
      borderRadius: 8,
      background: on ? "rgba(247,212,116,0.55)" : "transparent",
      boxShadow: on ? `inset 0 -4px 0 ${theme.colors.gold2}` : "none",
    }}
  >
    {children}
  </span>
);

// ---------------------------------------------------------------- hook
const Ladder: React.FC = () => (
  <svg width={240} height={470} viewBox="0 0 240 470">
    {[40, 200].map((x) => (
      <rect
        key={x}
        x={x - 12}
        y={0}
        width={24}
        height={470}
        rx={8}
        fill={theme.colors.gold2}
        stroke={INK}
        strokeWidth={6}
      />
    ))}
    {[50, 130, 210, 290, 370, 450].map((y) => (
      <rect
        key={y}
        x={40}
        y={y - 10}
        width={160}
        height={20}
        rx={6}
        fill={theme.colors.gold2}
        stroke={INK}
        strokeWidth={6}
      />
    ))}
  </svg>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = phraseAt("hook", 1);
  const at = B.hook.showFrom;
  const ladder = useSpring(2);
  const phone = useSpring(ring - 2);
  const missed = frame >= at;
  const buzz = frame >= ring && !missed ? Math.sin(frame * 2.6) * 6 : 0;
  const next = ease(frame, at + 12, at + 22);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 600,
          translate: `0px ${interpolate(ladder, [0, 1], [500, 0])}px`,
          rotate: "-6deg",
        }}
      >
        <Ladder />
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 380,
          top: 640,
          width: 600,
          height: 230,
          padding: "24px 28px",
          opacity: interpolate(phone, [0, 0.3], [0, 1], clamp),
          scale: interpolate(phone, [0, 1], [0.7, 1]),
          rotate: `${buzz * 0.4}deg`,
          translate: `${buzz}px 0px`,
          border: `5px solid ${missed ? RED : INK}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: theme.fonts.body,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.1em",
            color: missed ? MARK_RED : theme.colors.gold2,
          }}
        >
          <Icon
            name={missed ? "phoneMissed" : "handset"}
            size={34}
            color={missed ? MARK_RED : theme.colors.gold2}
            stroke={2.4}
          />
          {missed ? "MISSED CALL" : "INCOMING CALL"}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 44,
            color: theme.colors.text,
          }}
        >
          Homeowner · burst pipe
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 28,
            color: theme.colors.muted,
          }}
        >
          {missed ? "Voicemail · no message left" : "(905) 555-0142"}
        </div>
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 380,
          top: 900,
          width: 600,
          height: 120,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 26px",
          opacity: next,
          translate: `0px ${(1 - next) * 30}px`,
        }}
      >
        <Icon name="search" size={40} color={theme.colors.text} stroke={2.4} />
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 30,
            color: theme.colors.text,
          }}
        >
          Calling the next plumber on Google…
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- intro: the 4 things
const PARTS: { icon: IconName | "dollar"; label: string }[] = [
  { icon: "phoneMissed", label: "THE\nLEAK" },
  { icon: "dollar", label: "THE\nCOST" },
  { icon: "sms", label: "HOW IT\nWORKS" },
  { icon: "shield", label: "THE\nRULES" },
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

// ---------------------------------------------------------------- #1: the leak
const Gauge: React.FC<{
  x: number;
  at: number;
  pct: number;
  title: string;
  sub: string;
}> = ({ x, at, pct, title, sub }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + 24, theme.ease.out);
  const r = 130;
  const c = 2 * Math.PI * r;
  const shown = frame >= at - 6;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 620,
        width: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: shown ? ease(frame, at - 6, at + 2) : 0,
      }}
    >
      <div style={{ position: "relative", width: 300, height: 300 }}>
        <svg width={300} height={300} viewBox="-150 -150 300 300">
          <circle
            r={r}
            fill="none"
            stroke={theme.colors.surface3}
            strokeWidth={34}
          />
          <circle
            r={r}
            fill="none"
            stroke={RED}
            strokeWidth={34}
            strokeDasharray={`${(c * pct * p) / 100} ${c}`}
            transform="rotate(-90)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            color: theme.colors.text,
          }}
        >
          <div style={{ fontSize: 84, lineHeight: 1 }}>
            {Math.round(pct * p)}%
          </div>
          <div
            style={{
              fontSize: 26,
              color: MARK_RED,
              letterSpacing: "0.1em",
            }}
          >
            MISSED
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 40,
          color: theme.colors.text,
        }}
      >
        {title}
      </div>
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
  );
};
const Leak: React.FC = () => (
  <>
    <Gauge
      x={100}
      at={wordAt("m1", 2)}
      pct={27}
      title="All calls"
      sub="industry average"
    />
    <Gauge
      x={580}
      at={phraseAt("m1", 1)}
      pct={82}
      title="After hours"
      sub="pickup drops below 18%"
    />
    <Footnote
      text="2026 contractor call data (Phone2)"
      at={B.m1.showFrom}
      top={1066}
    />
  </>
);

const Voicemail: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.m2.showFrom - 10;
  // deterministic "random" 3 of 100 who leave a message
  const keep = new Set([17, 54, 86]);
  const p = ease(frame, at, at + 30, theme.ease.inOut);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 610,
          width: 420,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {new Array(100).fill(0).map((_, i) => {
          const stays = keep.has(i);
          const gone = !stays && p * 100 > (i * 37) % 100;
          return (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: stays
                  ? theme.colors.gold2
                  : gone
                    ? "#3A3A3A"
                    : theme.colors.text,
                border: `3px solid ${stays ? INK : gone ? "#555" : INK}`,
                opacity: gone ? 0.45 : 1,
                scale: stays && p > 0.5 ? 1.25 : gone ? 0.8 : 1,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 600,
          top: 620,
          width: 360,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: ease(frame, at + 20, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 76,
            color: theme.colors.gold2,
            lineHeight: 1,
          }}
        >
          3
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 28,
            color: theme.colors.text,
          }}
        >
          leave a voicemail
        </div>
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 600,
          top: 840,
          width: 360,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: ease(frame, at + 28, at + 38),
          border: `5px solid ${RED}`,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 76,
            color: MARK_RED,
            lineHeight: 1,
          }}
        >
          97
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 28,
            color: theme.colors.text,
          }}
        >
          call someone else
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- #2: the cost
const JOBS = [
  { t: "Burst pipe", icon: "zap" as IconName },
  { t: "Dead furnace", icon: "clock" as IconName },
  { t: "Roof leak", icon: "pin" as IconName },
];
const WinBack: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.c2.showFrom;
  const count = ease(frame, at, at + 26, theme.ease.out);
  return (
    <>
      {JOBS.map((j, i) => {
        const t = wordAt("c2", 3) + i * 5;
        const p = springAt(frame, t);
        return (
          <div
            key={j.t}
            style={{
              ...card,
              position: "absolute",
              left: 90 + i * 310,
              top: 610,
              width: 280,
              height: 210,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: frame >= t ? interpolate(p, [0, 0.4], [0, 1], clamp) : 0,
              translate: `0px ${interpolate(p, [0, 1], [-80, 0])}px`,
              rotate: `${(i - 1) * 4}deg`,
            }}
          >
            <Icon
              name={j.icon}
              size={48}
              color={theme.colors.gold2}
              stroke={2.4}
            />
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 36,
                color: theme.colors.text,
              }}
            >
              {j.t}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 40,
                color: theme.colors.ok,
              }}
            >
              $800
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 120,
          color: theme.colors.ok,
          textShadow: "0 0 40px rgba(60,207,142,0.35)",
          opacity: frame >= at - 4 ? 1 : 0,
        }}
      >
        +${Math.round(2400 * count).toLocaleString("en-US")}
        <span style={{ fontSize: 48, color: theme.colors.text }}> /mo</span>
      </div>
      <Footnote
        text="Example: 50 calls a month, 25% missed, 1 in 4 won back, $800 average job"
        at={at + 10}
        top={1040}
      />
    </>
  );
};

const Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.c3.showFrom;
  const tilt = interpolate(
    spring({ frame: frame - at, fps: 30, config: theme.spring.bouncy }),
    [0, 1],
    [0, -14],
  );
  const rad = (tilt * Math.PI) / 180;
  const pan = (side: -1 | 1, label: string, sub: string, color: string) => {
    const x = 540 + side * 300 * Math.cos(rad);
    const y = 760 + side * 300 * Math.sin(rad);
    return (
      <div
        style={{
          position: "absolute",
          left: x - 170,
          top: y + 20,
          width: 340,
          height: 170,
          ...card,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `5px solid ${color}`,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 54,
            color,
            lineHeight: 1.05,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 26,
            color: theme.colors.muted,
          }}
        >
          {sub}
        </div>
      </div>
    );
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 525,
          top: 760,
          width: 30,
          height: 300,
          borderRadius: 10,
          background: theme.colors.gold2,
          border: `5px solid ${INK}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 745,
          width: 640,
          height: 30,
          borderRadius: 15,
          background: theme.colors.gold2,
          border: `5px solid ${INK}`,
          rotate: `${tilt}deg`,
        }}
      />
      {pan(-1, "+$2,400", "won back a month", theme.colors.ok)}
      {pan(1, "$20–$150", "the tool, a month", theme.colors.gold2)}
    </>
  );
};

// ---------------------------------------------------------------- #3: how it works
const TextBack: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.h1.showFrom - 6;
  const secs = Math.min(28, Math.max(0, Math.round((frame - B.h1.from) * 0.9)));
  const sent = frame >= at;
  return (
    <Phone top={640} height={430}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 34,
          color: MARK_RED,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="phoneMissed" size={40} color={MARK_RED} stroke={2.4} />
          Missed call · 6:12 pm
        </span>
        <span
          style={{
            fontVariantNumeric: "tabular-nums",
            color: sent ? theme.colors.ok : theme.colors.gold2,
          }}
        >
          0:{String(sent ? 28 : secs).padStart(2, "0")}
        </span>
      </div>
      <Text at={at} me size={29}>
        Hi, this is {BIZ}. Sorry we missed your call! Leak or no water? Reply
        URGENT and we’ll call within 10 min. Reply STOP to opt out.
      </Text>
      <Chip at={at + 14}>Sent automatically in 28 seconds</Chip>
    </Phone>
  );
};

const Opened: React.FC = () => {
  const frame = useCurrentFrame();
  const at = wordAt("h2", 0);
  const p = ease(frame, at, at + 26, theme.ease.out);
  const r = 140;
  const c = 2 * Math.PI * r;
  const vm = ease(frame, phraseAt("h2", 1), phraseAt("h2", 1) + 10);
  return (
    <>
      <div style={{ position: "absolute", left: 100, top: 620 }}>
        <svg width={330} height={330} viewBox="-165 -165 330 330">
          <circle
            r={r}
            fill="none"
            stroke={theme.colors.surface3}
            strokeWidth={36}
          />
          <circle
            r={r}
            fill="none"
            stroke={theme.colors.ok}
            strokeWidth={36}
            strokeDasharray={`${c * 0.98 * p} ${c}`}
            transform="rotate(-90)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            color: theme.colors.text,
          }}
        >
          <div style={{ fontSize: 90, lineHeight: 1 }}>
            {Math.round(98 * p)}%
          </div>
          <div style={{ fontSize: 28, color: theme.colors.ok }}>OPENED</div>
        </div>
      </div>
      {[
        {
          t: "Text",
          v: "read in ~3 min",
          c: theme.colors.ok,
          icon: "sms" as IconName,
        },
        {
          t: "Voicemail",
          v: "callback in hours",
          c: MARK_RED,
          icon: "phone" as IconName,
        },
      ].map((row, i) => (
        <div
          key={row.t}
          style={{
            ...card,
            position: "absolute",
            left: 480,
            top: 640 + i * 160,
            width: 500,
            height: 136,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "0 26px",
            opacity: vm,
            translate: `${(1 - vm) * 60}px 0px`,
            border: `5px solid ${row.c}`,
          }}
        >
          <Icon name={row.icon} size={46} color={row.c} stroke={2.4} />
          <div>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 40,
                color: theme.colors.text,
              }}
            >
              {row.t}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 28,
                color: row.c,
              }}
            >
              {row.v}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const Urgent: React.FC = () => {
  const at = B.h3.showFrom;
  return (
    <Phone>
      <Text at={B.h3.from + 2} me size={26}>
        …Reply URGENT and we’ll call within 10 min.
      </Text>
      <Text at={wordAt("h3", 2)} size={34}>
        URGENT. Water everywhere!!
      </Text>
      <Chip at={phraseAt("h3", 1)} color={theme.colors.gold2}>
        Flagged: call back now
      </Chip>
      <Chip at={at + 10}>Called back in 6 min · Booked</Chip>
    </Phone>
  );
};

// ---------------------------------------------------------------- #4: the rules
const Casl: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useSpring(phraseAt("l1", 1));
  const sub = ease(frame, B.l1.showFrom, B.l1.showFrom + 10);
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 190,
          top: 640,
          width: 700,
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          outline: `3px solid ${theme.colors.gold2}`,
          scale: interpolate(p, [0, 1], [0.7, 1]),
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Icon
            name="shield"
            size={90}
            color={theme.colors.gold2}
            stroke={2.2}
          />
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 130,
              lineHeight: 1,
              color: theme.colors.text,
            }}
          >
            CASL
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 32,
            color: theme.colors.muted,
          }}
        >
          Canada’s Anti-Spam Legislation
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 980,
          textAlign: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 36,
          color: theme.colors.text,
          opacity: sub,
        }}
      >
        Covers every automated business text.
      </div>
    </>
  );
};

const Template: React.FC = () => {
  const frame = useCurrentFrame();
  const who = phraseAt("l2", 0);
  const stop = phraseAt("l2", 1);
  return (
    <>
      <Phone height={330}>
        <Text at={B.l2.from + 2} me size={34}>
          <Mark on={frame >= who}>Hi, this is {BIZ}.</Mark> Sorry we missed your
          call. What can we help with?{" "}
          <Mark on={frame >= stop}>Reply STOP to opt out.</Mark>
        </Text>
      </Phone>
      {[
        { at: who + 6, t: "WHO YOU ARE", x: 150 },
        { at: stop + 6, t: "EASY OPT-OUT", x: 560 },
      ].map((c) => (
        <div
          key={c.t}
          style={{
            position: "absolute",
            left: c.x,
            top: 960,
            width: 370,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 22px",
              borderRadius: 99,
              background: theme.colors.ok,
              border: `4px solid ${INK}`,
              fontFamily: theme.fonts.display,
              fontWeight: 900,
              fontSize: 30,
              color: INK,
              scale: springAt(frame, c.at),
            }}
          >
            <Icon name="check" size={28} color={INK} stroke={3.2} />
            {c.t}
          </div>
        </div>
      ))}
    </>
  );
};

const Consent: React.FC = () => {
  const at = B.l3.showFrom;
  return (
    <Phone height={430}>
      <Text at={B.l3.from + 4} me size={30}>
        Want seasonal tune-up deals by text? Reply YES to opt in.
      </Text>
      <Text at={wordAt("l3", 6)} size={40}>
        YES
      </Text>
      <Chip at={at + 6}>Consent logged · date & time saved</Chip>
    </Phone>
  );
};

// ---------------------------------------------------------------- recap
const RECAP = [
  { big: "30 sec", label: "text back fast" },
  { big: "URGENT", label: "flag emergencies" },
  { big: "Name + STOP", label: "on every text" },
];
const Recap: React.FC = () => (
  <>
    {RECAP.map((r, i) => (
      <RecapCard key={r.big} i={i} at={wordAt("recap", [0, 2, 4][i])} {...r} />
    ))}
    <Footnote
      text="Missed call text back for contractors · Sol explains"
      at={B.recap.showFrom}
      top={1000}
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
        left: 140,
        top: 600 + i * 128,
        width: 800,
        height: 112,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 30px",
        outline: `3px solid ${theme.colors.gold2}`,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `${interpolate(p, [0, 1], [-120, 0])}px 0px`,
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
          fontSize: 54,
          color: theme.colors.text,
          lineHeight: 1,
        }}
      >
        {big}
      </div>
      <div
        style={{
          marginLeft: "auto",
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

// ---------------------------------------------------------------- Sol's blocking
const BLOCKING: Blocking = {
  hook: {
    say: { mood: "talk", arms: [55, 55], look: [0.5, -0.9] },
    after: { mood: "shock", arms: [165, 165], spike: 1, look: [0.5, -0.9] },
  },
  intro: {
    say: { mood: "happy", arms: [55, 150], wave: true },
    after: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
  },
  r1: { say: { mood: "laugh", arms: [160, 160] } },
  m1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "worried", arms: [70, 70], look: [0.4, -0.9], sweat: true },
  },
  m2: {
    say: { mood: "worried", arms: [70, 70], look: [0, -0.9] },
    after: { mood: "pout", arms: [30, 30], look: [0, -0.6] },
  },
  r2: { say: { mood: "smug", arms: [40, 40] } },
  c2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  c3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "wink", arms: [55, 150] },
  },
  r3: { say: { mood: "laugh", arms: [160, 160] } },
  h1: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150], look: [0, -0.9] },
  },
  h2: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "smug", arms: [40, 40] },
  },
  h3: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  r4: { say: { mood: "talk", arms: [55, 55], glasses: true } },
  l1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9], glasses: true },
    after: { mood: "smug", arms: [40, 40], glasses: true },
  },
  l2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9], glasses: true },
    after: { mood: "wink", arms: [55, 150], glasses: true },
  },
  l3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9], glasses: true },
    after: { mood: "happy", arms: [55, 150], glasses: true },
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
  ["whoosh", 0, 0.3],
  ["ring", phraseAt("hook", 1) - 2, 0.45],
  ["wahwah", B.hook.showFrom, 0.4],
  ...SAY_BEATS.filter((b) => b.id !== "hook").map(
    (b): Cue => ["boing", b.from - 2, 0.16, 1.2],
  ),
  ...ROUNDS.map((b): Cue => ["tada", b.from - 1, 0.45]),
  ...[0, 1, 2, 3].map(
    (i): Cue => ["pop", phraseAt("intro", 1) + 4 + i * 5, 0.35, 1 + i * 0.08],
  ),
  ["riser", wordAt("m1", 2) - 4, 0.25],
  ["thud", phraseAt("m1", 1) + 20, 0.4],
  ["whoosh-soft", B.m2.showFrom - 10, 0.35],
  ["wahwah", B.m2.showFrom + 26, 0.3, 1.1],
  ...[0, 1, 2].map(
    (i): Cue => ["pop", wordAt("c2", 3) + i * 5, 0.35, 1 + i * 0.1],
  ),
  ["cash", B.c2.showFrom + 20, 0.4],
  ["thud", B.c3.showFrom + 2, 0.4],
  ["typing", B.h1.showFrom - 12, 0.3],
  ["ping", B.h1.showFrom - 6, 0.4],
  ["chime", B.h1.showFrom + 14, 0.35],
  ["riser", wordAt("h2", 0) - 4, 0.25],
  ["ping", wordAt("h3", 2), 0.4, 1.1],
  ["ring", B.h3.showFrom + 8, 0.3],
  ["stamp", phraseAt("l1", 1) + 2, 0.4],
  ["pencil", phraseAt("l2", 0) + 4, 0.3],
  ["pencil", phraseAt("l2", 1) + 4, 0.3, 1.1],
  ["ping", wordAt("l3", 6), 0.4, 1.15],
  ["chime", B.l3.showFrom + 6, 0.35],
  ...[0, 2, 4].map(
    (n, i): Cue => ["pop", wordAt("recap", n), 0.35, 1 + i * 0.08],
  ),
  ["shutter", B.recap.showFrom + 10, 0.45],
  ["ring", B.cta.showFrom, 0.3],
  ["pop", B.cta.showFrom + 48, 0.4, 1.3],
];

export const Contractors: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake hits={[B.hook.showFrom, ...ROUNDS.map((r) => r.from)]}>
        <Tracker
          tl={TL}
          show={["r1", "l3"]}
          items={[
            { after: "r1", label: "THE LEAK", from: "r1", until: "m2" },
            { after: "r2", label: "THE COST", from: "r2", until: "c3" },
            { after: "r3", label: "HOW", from: "r3", until: "h3" },
            { after: "r4", label: "THE RULES", from: "r4", until: "l3" },
          ]}
        />
        <BeatScene from={B.hook}>
          <Hook />
        </BeatScene>
        <BeatScene from={B.intro}>
          <Agenda />
        </BeatScene>
        <BeatScene from={B.m1}>
          <Leak />
        </BeatScene>
        <BeatScene from={B.m2}>
          <Voicemail />
        </BeatScene>
        <BeatScene from={B.c2}>
          <WinBack />
        </BeatScene>
        <BeatScene from={B.c3}>
          <Scale />
        </BeatScene>
        <BeatScene from={B.h1}>
          <TextBack />
        </BeatScene>
        <BeatScene from={B.h2}>
          <Opened />
        </BeatScene>
        <BeatScene from={B.h3}>
          <Urgent />
        </BeatScene>
        <BeatScene from={B.l1}>
          <Casl />
        </BeatScene>
        <BeatScene from={B.l2}>
          <Template />
        </BeatScene>
        <BeatScene from={B.l3}>
          <Consent />
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
          line="Sol answers, or texts back in seconds. 24/7."
        />
        <RoundCard beat={B.r1} eyebrow="PART 1 OF 4" big="1" unit="THE LEAK" />
        <RoundCard beat={B.r2} eyebrow="PART 2 OF 4" big="2" unit="THE COST" />
        <RoundCard
          beat={B.r3}
          eyebrow="PART 3 OF 4"
          big="3"
          unit="HOW IT WORKS"
        />
        <RoundCard beat={B.r4} eyebrow="PART 4 OF 4" big="4" unit="THE RULES" />
        <PhraseBubble tl={TL} />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-contractors-music.wav")} volume={0.5} />
    <Audio src={staticFile("audio/sol-contractors-voice.wav")} volume={0.9} />
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

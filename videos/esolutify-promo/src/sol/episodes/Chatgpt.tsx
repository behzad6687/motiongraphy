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
import { Tap } from "../../components/Devices";
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
import MOUTH from "./chatgpt.mouth.json";
import TIMELINE from "./chatgpt.timeline.json";

// Sol explains: how to get recommended by ChatGPT
// (blog: esolutify.com/how-to-get-recommended-by-chatgpt).
// Sol is an AI, so this one is told from the inside: "here's how we pick".
// Words live in chatgpt.json; scripts/sol_timeline.py turns them into frames
// (each phrase appears as Sol says it), so this file only draws.
// Easy to follow: hook (an AI answer without you) → why it's hard → where AI
// looks → the checklist → the monthly test → recap → call Sol.

const TL = TIMELINE as unknown as Timeline;
const B = byId(TL);
export const CHATGPT_DURATION = TL.total;

const RED = "#E5484D";
const NAP = "Bright Smile Dental · 120 Main St, Suite 200 · (905) 555-0188";

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

const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
}> = ({ children, color = theme.colors.text, size = 36 }) => (
  <div
    style={{
      fontFamily: theme.fonts.display,
      fontWeight: 900,
      fontSize: size,
      color,
      lineHeight: 1.1,
    }}
  >
    {children}
  </div>
);
const Sub: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = theme.colors.muted,
}) => (
  <div
    style={{
      fontFamily: theme.fonts.body,
      fontWeight: 700,
      fontSize: 26,
      color,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- an AI chat window
const ANSWER = [
  { n: "Lakeshore Family Dentistry", r: "4.7" },
  { n: "Maple Dental Care", r: "4.6" },
  { n: "Harbour Smiles", r: "4.5" },
];
const AiChat: React.FC<{
  ask: string;
  askAt: number;
  answerAt: number;
  you?: { at: number; rank: number }; // you join the list at `rank`
  top?: number;
}> = ({ ask, askAt, answerAt, you, top = 600 }) => {
  const frame = useCurrentFrame();
  const list =
    you && frame >= you.at
      ? [
          ...ANSWER.slice(0, you.rank),
          { n: "Bright Smile Dental (you)", r: "4.6" },
          ...ANSWER.slice(you.rank, 2),
        ]
      : ANSWER;
  return (
    <div
      style={{
        ...card,
        position: "absolute",
        left: 110,
        top,
        width: 860,
        padding: "22px 28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "0.12em",
          color: theme.colors.dim,
        }}
      >
        <Icon
          name="sparkle"
          size={26}
          color={theme.colors.gold2}
          stroke={2.2}
        />
        AI ASSISTANT
      </div>
      {frame >= askAt ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              padding: "12px 22px",
              borderRadius: 22,
              background: theme.colors.surface3,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 32,
              color: theme.colors.text,
              scale: springAt(frame, askAt),
            }}
          >
            {ask}
          </div>
        </div>
      ) : null}
      {list.map((a, i) => {
        const t = answerAt + i * 5;
        const me = a.n.endsWith("(you)");
        return (
          <div
            key={a.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "10px 16px",
              borderRadius: 16,
              background: me ? "rgba(60,207,142,0.18)" : "transparent",
              border: me
                ? `3px solid ${theme.colors.ok}`
                : "3px solid transparent",
              opacity: frame >= t ? ease(frame, t, t + 6) : 0,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 32,
              color: theme.colors.text,
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                color: theme.colors.gold2,
                width: 34,
              }}
            >
              {i + 1}.
            </span>
            <span style={{ flex: 1 }}>{a.n}</span>
            <span style={{ color: theme.colors.gold2 }}>★ {a.r}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.hook.showFrom;
  const miss = springAt(frame, at + 4);
  return (
    <>
      <AiChat
        ask="Best family dentist near me?"
        askAt={6}
        answerAt={phraseAt("hook", 1) + 6}
      />
      {frame >= at + 4 ? (
        <div
          style={{
            ...card,
            position: "absolute",
            left: 180,
            top: 1000,
            width: 720,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            border: `5px solid ${RED}`,
            scale: miss,
          }}
        >
          <Icon name="search" size={40} color={MARK_RED} stroke={2.6} />
          <Label color={MARK_RED} size={40}>
            Your business: not mentioned
          </Label>
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- intro: the 4 parts
const PARTS: { icon: IconName; label: string }[] = [
  { icon: "trending", label: "WHY IT’S\nHARD" },
  { icon: "search", label: "WHERE\nWE LOOK" },
  { icon: "check", label: "THE\nCHECKLIST" },
  { icon: "chat", label: "THE\nTEST" },
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
  icon: IconName;
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
        <Icon name={icon} size={50} color={INK} stroke={2.6} />
      </div>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          fontSize: 30,
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

// ---------------------------------------------------------------- #1: why it's hard
const Bar: React.FC<{
  x: number;
  h: number;
  color: string;
  value: string;
  label: string;
  sub?: string;
  show: number;
}> = ({ x, h, color, value, label, sub, show }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 980 - h,
      width: 240,
      height: h,
      opacity: show,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: -40,
        right: -40,
        top: -84,
        textAlign: "center",
      }}
    >
      <Label color={color} size={66}>
        {value}
      </Label>
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
        left: -60,
        right: -60,
        top: h + 12,
        textAlign: "center",
      }}
    >
      <Label size={32}>{label}</Label>
      {sub ? <Sub>{sub}</Sub> : null}
    </div>
  </div>
);

const Adoption: React.FC = () => {
  const frame = useCurrentFrame();
  const at = wordAt("a1", 0);
  const g = ease(frame, at, at + 30, theme.ease.out);
  return (
    <>
      <Bar
        x={250}
        h={20 + 24 * g}
        color="#5B5F66"
        value="6%"
        label="Last year"
        show={ease(frame, at - 4, at + 4)}
      />
      <Bar
        x={590}
        h={20 + 300 * g}
        color={theme.colors.gold2}
        value={`${Math.round(6 + 39 * g)}%`}
        label="2026"
        show={ease(frame, at - 4, at + 4)}
      />
      <Footnote
        text="Use ChatGPT or another AI to find local businesses · BrightLocal 2026"
        at={B.a1.showFrom}
        top={1070}
      />
    </>
  );
};

const Visibility: React.FC = () => {
  const frame = useCurrentFrame();
  const g1 = ease(frame, wordAt("a2", 0), wordAt("a2", 0) + 26, theme.ease.out);
  const g2 = ease(
    frame,
    phraseAt("a2", 1),
    phraseAt("a2", 1) + 20,
    theme.ease.out,
  );
  return (
    <>
      <Bar
        x={250}
        h={20 + 300 * g1}
        color={theme.colors.ok}
        value="35.9%"
        label="Google top 3"
        show={frame >= wordAt("a2", 0) - 4 ? 1 : 0}
      />
      <Bar
        x={590}
        h={20 + 10 * g2}
        color={RED}
        value="1.2%"
        label="ChatGPT"
        show={frame >= phraseAt("a2", 1) - 4 ? 1 : 0}
      />
      <Stamp
        at={B.a2.showFrom + 4}
        text={"~30×\nHARDER"}
        color={RED}
        x={790}
        y={700}
        size={54}
        rot={10}
      />
      <Footnote
        text="Share of eligible locations shown or recommended · SOCi 2026"
        at={B.a2.showFrom}
        top={1080}
      />
    </>
  );
};

// ---------------------------------------------------------------- #2: where we look
const Sources: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    {
      t: "Google’s index",
      s: "not where ChatGPT searches",
      ok: false,
      at: wordAt("b1", 3),
    },
    {
      t: "Bing’s index",
      s: "what ChatGPT pulls from",
      ok: true,
      at: phraseAt("b1", 1),
    },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const p = springAt(frame, r.at);
        return (
          <div
            key={r.t}
            style={{
              ...card,
              position: "absolute",
              left: 150,
              top: 640 + i * 200,
              width: 780,
              height: 170,
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "0 34px",
              border: `5px solid ${r.ok ? theme.colors.ok : RED}`,
              opacity:
                frame >= r.at ? interpolate(p, [0, 0.4], [0, 1], clamp) : 0,
              translate: `${interpolate(p, [0, 1], [i ? 100 : -100, 0])}px 0px`,
              filter: r.ok
                ? "none"
                : `grayscale(${ease(frame, B.b1.showFrom, B.b1.showFrom + 8) * 0.6})`,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: r.ok ? theme.colors.ok : RED,
                border: `4px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              {r.ok ? (
                <Icon name="check" size={50} color={INK} stroke={3.2} />
              ) : (
                <span
                  style={{
                    fontFamily: theme.fonts.display,
                    fontWeight: 900,
                    fontSize: 56,
                    color: INK,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </span>
              )}
            </div>
            <div>
              <Label size={48}>{r.t}</Label>
              <Sub>{r.s}</Sub>
            </div>
          </div>
        );
      })}
    </>
  );
};

const YelpRing: React.FC = () => {
  const frame = useCurrentFrame();
  const at = wordAt("b2", 5);
  const p = ease(frame, at, at + 26, theme.ease.out);
  const r = 150;
  const c = 2 * Math.PI * r;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 365,
          top: 610,
          width: 350,
          height: 350,
          opacity: ease(frame, B.b2.from, B.b2.from + 8),
        }}
      >
        <svg width={350} height={350} viewBox="-175 -175 350 350">
          <circle
            r={r}
            fill="none"
            stroke={theme.colors.surface3}
            strokeWidth={38}
          />
          <circle
            r={r}
            fill="none"
            stroke={RED}
            strokeWidth={38}
            strokeDasharray={`${c * 0.96 * p} ${c}`}
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
          }}
        >
          <Label size={96}>{Math.round(96 * p)}%</Label>
          <Sub color={MARK_RED}>cite Yelp data</Sub>
        </div>
      </div>
      <Footnote
        text="Yelp in ChatGPT’s business-card data for 95.83% of local answers · Driven Metrics, ~3,000 prompts"
        at={B.b2.showFrom}
        top={990}
      />
    </>
  );
};

const Mismatch: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.b3.showFrom;
  const listings = [
    { src: "Website", addr: "120 Main St, Suite 200" },
    { src: "Yelp", addr: "120 Main St, Ste. 200" },
  ];
  const out = ease(frame, at, at + 14);
  return (
    <>
      {listings.map((l, i) => (
        <div
          key={l.src}
          style={{
            ...card,
            position: "absolute",
            left: 110 + i * 450,
            top: 620,
            width: 410,
            height: 190,
            padding: "22px 26px",
            opacity: ease(frame, B.b3.from + 2 + i * 6, B.b3.from + 10 + i * 6),
          }}
        >
          <Sub color={theme.colors.gold2}>{l.src.toUpperCase()}</Sub>
          <Label size={34}>Bright Smile Dental</Label>
          <div
            style={{
              marginTop: 8,
              fontFamily: theme.fonts.body,
              fontWeight: 700,
              fontSize: 28,
              color: theme.colors.text,
            }}
          >
            120 Main St,{" "}
            <span
              style={{
                padding: "0 6px",
                borderRadius: 8,
                background:
                  frame >= phraseAt("b3", 0) + 10
                    ? "rgba(229,72,77,0.35)"
                    : "transparent",
              }}
            >
              {l.addr.split(", ")[1]}
            </span>
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 500,
          top: 670,
          width: 80,
          textAlign: "center",
          opacity: ease(frame, phraseAt("b3", 0) + 10, phraseAt("b3", 0) + 16),
        }}
      >
        <Label color={RED} size={80}>
          ≠
        </Label>
      </div>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 200,
          top: 860,
          width: 680,
          height: 150,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 28px",
          opacity: 1 - 0.6 * out,
          filter: `grayscale(${out})`,
          border: `5px dashed ${out > 0.5 ? RED : INK}`,
        }}
      >
        <Icon
          name="sparkle"
          size={44}
          color={theme.colors.gold2}
          stroke={2.2}
        />
        <div>
          <Label size={36}>
            {out > 0.5 ? "Left out of the answer" : "AI checks: do they match?"}
          </Label>
          <Sub>Only 68% of AI contact details match (SOCi)</Sub>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- #3: the checklist
const PLACES = [
  "Website footer",
  "Google Business Profile",
  "Bing Places",
  "Yelp",
  "Industry directory",
];
const NapCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const at = phraseAt("c1", 1) - 4;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 600,
          padding: "14px 20px",
          borderRadius: 18,
          background: CREAM,
          border: `4px solid ${INK}`,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          fontSize: 27,
          color: INK,
          opacity: ease(frame, B.c1.from + 4, B.c1.from + 12),
        }}
      >
        {NAP}
      </div>
      {PLACES.map((p, i) => {
        const t = at + i * 6;
        const on = frame >= t;
        return (
          <div
            key={p}
            style={{
              position: "absolute",
              left: 150,
              width: 780,
              top: 700 + i * 76,
              height: 64,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 22px",
              borderRadius: 16,
              background: on ? "rgba(60,207,142,0.14)" : theme.colors.surface,
              border: `3px solid ${on ? theme.colors.ok : theme.colors.line2}`,
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 32,
              color: theme.colors.text,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: on ? theme.colors.ok : "transparent",
                border: `3px solid ${on ? INK : theme.colors.line2}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: on ? 0.7 + 0.3 * ease(frame, t, t + 6) : 1,
              }}
            >
              {on ? (
                <Icon name="check" size={26} color={INK} stroke={3.2} />
              ) : null}
            </div>
            {p}
            <span
              style={{
                marginLeft: "auto",
                fontFamily: theme.fonts.body,
                fontSize: 24,
                color: on ? theme.colors.ok : theme.colors.dim,
              }}
            >
              {on ? "matches" : "checking…"}
            </span>
          </div>
        );
      })}
    </>
  );
};

const BingClaim: React.FC = () => {
  const frame = useCurrentFrame();
  const at = B.c2.showFrom;
  const done = frame >= at + 10;
  const enter = useSpring(B.c2.from + 2);
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 170,
          top: 620,
          width: 740,
          height: 400,
          padding: "30px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          scale: interpolate(enter, [0, 1], [0.8, 1]),
          opacity: interpolate(enter, [0, 0.3], [0, 1], clamp),
        }}
      >
        <Sub color={theme.colors.gold2}>BING PLACES FOR BUSINESS</Sub>
        <Label size={44}>Bright Smile Dental</Label>
        <Sub>120 Main St, Suite 200 · Dentist</Sub>
        <div
          style={{
            position: "relative",
            marginTop: 14,
            alignSelf: "flex-start",
            padding: "16px 34px",
            borderRadius: 99,
            background: done ? theme.colors.ok : theme.gradients.gold,
            border: `4px solid ${INK}`,
            fontFamily: theme.fonts.display,
            fontWeight: 900,
            fontSize: 36,
            color: INK,
          }}
        >
          {done ? "✓ Claimed" : "Claim this business"}
          <Tap x={170} y={34} at={at + 2} size={90} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 700,
          top: 860,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: theme.colors.ok,
          border: `6px solid ${INK}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          rotate: "10deg",
          scale: springAt(frame, wordAt("c2", 4)),
          fontFamily: theme.fonts.display,
          fontWeight: 900,
          color: INK,
          lineHeight: 1,
        }}
      >
        <div style={{ fontSize: 48 }}>FREE</div>
        <div style={{ fontSize: 30, marginTop: 6 }}>15 min</div>
      </div>
    </>
  );
};

const REVIEWS = [
  {
    who: "Priya K.",
    when: "2 days ago",
    t: "Gentle, on time, explained everything.",
  },
  {
    who: "Marc D.",
    when: "3 weeks ago",
    t: "Fit me in the same day for a cracked tooth.",
  },
  { who: "Sam L.", when: "2 months ago", t: "Kids actually like coming here." },
];
const Reviews: React.FC = () => {
  const frame = useCurrentFrame();
  const at = wordAt("c3", 0);
  const n = Math.round(interpolate(frame, [at, at + 20], [3, 24], clamp));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 610,
          width: 860,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          opacity: ease(frame, at - 4, at + 4),
        }}
      >
        <Label color={theme.colors.gold2} size={80}>
          ★ 4.6
        </Label>
        <Label size={44}>{n} reviews</Label>
      </div>
      {REVIEWS.map((r, i) => {
        const t = phraseAt("c3", 1) + i * 6;
        const p = springAt(frame, t);
        return (
          <div
            key={r.who}
            style={{
              ...card,
              position: "absolute",
              left: 110,
              top: 720 + i * 120,
              width: 860,
              height: 104,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 24px",
              opacity: frame >= t ? interpolate(p, [0, 0.4], [0, 1], clamp) : 0,
              translate: `${interpolate(p, [0, 1], [80, 0])}px 0px`,
            }}
          >
            <Icon
              name="user"
              size={40}
              color={theme.colors.text}
              stroke={2.2}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 800,
                  fontSize: 26,
                  color: theme.colors.text,
                }}
              >
                {r.who} <span style={{ color: theme.colors.gold2 }}>★★★★★</span>
              </div>
              <Sub>{r.t}</Sub>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                background: "rgba(60,207,142,0.2)",
                fontFamily: theme.fonts.body,
                fontWeight: 800,
                fontSize: 22,
                color: theme.colors.ok,
              }}
            >
              {r.when}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Plainly: React.FC = () => {
  const frame = useCurrentFrame();
  const after = frame >= phraseAt("c4", 1) + 6;
  const flip = springAt(frame, phraseAt("c4", 1) + 6);
  return (
    <>
      <div
        style={{
          ...card,
          position: "absolute",
          left: 130,
          top: 610,
          width: 820,
          height: 380,
          padding: "26px 34px",
          border: `5px solid ${after ? theme.colors.ok : RED}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[RED, theme.colors.gold2, theme.colors.ok].map((c) => (
            <div
              key={c}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <Sub color={after ? theme.colors.ok : MARK_RED}>
          {after ? "HOMEPAGE · AFTER" : "HOMEPAGE · BEFORE"}
        </Sub>
        <div
          style={{
            scale: after ? interpolate(flip, [0, 1], [0.9, 1]) : 1,
            transformOrigin: "0% 50%",
          }}
        >
          {after ? (
            <>
              <Label size={58}>Family dentist in Oakville, Ontario.</Label>
              <div style={{ marginTop: 12 }}>
                <Sub>Cleanings, fillings and same-day emergencies.</Sub>
              </div>
            </>
          ) : (
            <>
              <Label size={74}>Smiles, reimagined.</Label>
              <div style={{ marginTop: 12 }}>
                <Sub>Experience the difference.</Sub>
              </div>
            </>
          )}
        </div>
      </div>
      <Footnote
        text={
          after
            ? "What you do, who for, and where, in plain sentences"
            : "Nice branding. But what is it, and where?"
        }
        at={B.c4.from + 6}
        top={1020}
      />
    </>
  );
};

// ---------------------------------------------------------------- #4: the test
const TABS = ["ChatGPT", "Gemini", "Perplexity"];
const Test: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 600,
          width: 860,
          display: "flex",
          gap: 10,
        }}
      >
        {TABS.map((t, i) => {
          const on = frame >= wordAt("t1", 0) + i * 6;
          return (
            <div
              key={t}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: "18px 18px 0 0",
                textAlign: "center",
                background:
                  i === 0 ? theme.colors.surface3 : theme.colors.surface,
                border: `3px solid ${theme.colors.line2}`,
                fontFamily: theme.fonts.display,
                fontWeight: 900,
                fontSize: 30,
                color: theme.colors.text,
                opacity: on ? 1 : 0,
                translate: `0px ${on ? 0 : 20}px`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      <AiChat
        top={662}
        ask="Best dentist in Oakville?"
        askAt={phraseAt("t1", 1)}
        answerAt={B.t1.showFrom}
        you={{ at: B.t2.from + 1_000_000, rank: 1 }}
      />
    </>
  );
};

const Result: React.FC = () => {
  const frame = useCurrentFrame();
  const weeks = phraseAt("t2", 1);
  return (
    <>
      <AiChat
        top={600}
        ask="Best dentist in Oakville?"
        askAt={B.t2.from}
        answerAt={B.t2.from + 2}
        you={{ at: B.t2.showFrom, rank: 1 }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 990,
          width: 860,
          display: "flex",
          gap: 8,
        }}
      >
        {new Array(8).fill(0).map((_, i) => {
          const on = frame >= weeks + i * 3;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: on
                  ? i >= 3
                    ? theme.colors.ok
                    : theme.colors.surface3
                  : theme.colors.surface,
                border: `3px solid ${INK}`,
                fontFamily: theme.fonts.body,
                fontWeight: 800,
                fontSize: 20,
                color: on && i >= 3 ? INK : theme.colors.muted,
              }}
            >
              wk {i + 1}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- recap
const RECAP = [
  { big: "Match", label: "name, address, phone" },
  { big: "Claim Bing", label: "free, 15 minutes" },
  { big: "20+ reviews", label: "fresh ones monthly" },
  { big: "Test monthly", label: "ask AI about you" },
];
const Recap: React.FC = () => (
  <>
    {RECAP.map((r, i) => (
      <RecapRow
        key={r.big}
        i={i}
        at={wordAt("recap", [0, 3, 5, 7][i])}
        {...r}
      />
    ))}
    <Footnote
      text="How to get recommended by ChatGPT · Sol explains"
      at={B.recap.showFrom}
      top={1080}
    />
  </>
);
const RecapRow: React.FC<{
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
        top: 600 + i * 116,
        width: 800,
        height: 100,
        display: "flex",
        alignItems: "center",
        gap: 24,
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
      <Label size={48}>{big}</Label>
      <div style={{ marginLeft: "auto" }}>
        <Sub>{label}</Sub>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Sol's blocking
const BLOCKING: Blocking = {
  hook: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "worried", arms: [70, 70], look: [0, -0.9], sweat: true },
  },
  intro: {
    say: { mood: "happy", arms: [55, 150], wave: true },
    after: { mood: "wink", arms: [55, 135], look: [0, -0.9] },
  },
  r1: { say: { mood: "talk", arms: [55, 55] } },
  a1: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  a2: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "shock", arms: [165, 165], spike: 0.8 },
  },
  r2: { say: { mood: "smug", arms: [40, 40], glasses: true } },
  b1: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9], glasses: true },
    after: { mood: "smug", arms: [40, 40], glasses: true },
  },
  b2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9], glasses: true },
    after: { mood: "happy", arms: [55, 150], glasses: true },
  },
  b3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9], glasses: true },
    after: { mood: "pout", arms: [30, 30], look: [0, -0.6], glasses: true },
  },
  r3: { say: { mood: "laugh", arms: [160, 160] } },
  c1: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "happy", arms: [55, 150], look: [0, -0.9] },
  },
  c2: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "wink", arms: [55, 150] },
  },
  c3: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150] },
  },
  c4: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "smug", arms: [40, 40] },
  },
  r4: { say: { mood: "laugh", arms: [160, 160] } },
  t1: {
    say: { mood: "talk", arms: [55, 135], look: [0, -0.9] },
    after: { mood: "worried", arms: [70, 70], look: [0, -0.9] },
  },
  t2: {
    say: { mood: "talk", arms: [55, 55], look: [0, -0.9] },
    after: { mood: "happy", arms: [150, 150], look: [0, -0.9] },
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
  ["boing", 0, 0.25, 1.1],
  ["typing", 4, 0.3],
  ...[0, 1, 2].map(
    (i): Cue => ["pop", phraseAt("hook", 1) + 6 + i * 5, 0.3, 1 + i * 0.08],
  ),
  ["wahwah", B.hook.showFrom + 4, 0.4],
  ...SAY_BEATS.filter((b) => b.id !== "hook").map(
    (b): Cue => ["boing", b.from - 2, 0.16, 1.2],
  ),
  ...ROUNDS.map((b): Cue => ["tada", b.from - 1, 0.45]),
  ...[0, 1, 2, 3].map(
    (i): Cue => ["pop", phraseAt("intro", 1) + 4 + i * 5, 0.35, 1 + i * 0.08],
  ),
  ["riser", wordAt("a1", 0) - 4, 0.25],
  ["thud", phraseAt("a2", 1) - 2, 0.4],
  ["stamp", B.a2.showFrom + 4, 0.4],
  ["thud", wordAt("b1", 3), 0.35],
  ["ping", phraseAt("b1", 1), 0.4],
  ["riser", wordAt("b2", 5) - 4, 0.25],
  ["wahwah", B.b3.showFrom, 0.35],
  ...PLACES.map(
    (_, i): Cue => ["ping", phraseAt("c1", 1) - 4 + i * 6, 0.3, 1 + i * 0.06],
  ),
  ["pop", B.c2.showFrom + 2, 0.4],
  ["chime", B.c2.showFrom + 10, 0.35],
  ...[0, 1, 2].map(
    (i): Cue => ["pop", phraseAt("c3", 1) + i * 6, 0.3, 1 + i * 0.08],
  ),
  ["whoosh", phraseAt("c4", 1) + 4, 0.35],
  ["typing", phraseAt("t1", 1), 0.3],
  ...[0, 1, 2].map(
    (i): Cue => ["pop", B.t1.showFrom + i * 5, 0.3, 1 + i * 0.08],
  ),
  ["chime", B.t2.showFrom, 0.4],
  ...[0, 3, 5, 7].map(
    (n, i): Cue => ["pop", wordAt("recap", n), 0.35, 1 + i * 0.08],
  ),
  ["shutter", B.recap.showFrom + 10, 0.45],
  ["ring", B.cta.showFrom, 0.3],
  ["pop", B.cta.showFrom + 48, 0.4, 1.3],
];

export const Chatgpt: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Shake
        hits={[
          B.hook.showFrom + 4,
          B.a2.showFrom + 4,
          ...ROUNDS.map((r) => r.from),
        ]}
      >
        <Tracker
          tl={TL}
          show={["r1", "t2"]}
          items={[
            { after: "r1", label: "WHY", from: "r1", until: "a2" },
            { after: "r2", label: "WHERE", from: "r2", until: "b3" },
            { after: "r3", label: "CHECKLIST", from: "r3", until: "c4" },
            { after: "r4", label: "THE TEST", from: "r4", until: "t2" },
          ]}
        />
        <BeatScene from={B.hook}>
          <Hook />
        </BeatScene>
        <BeatScene from={B.intro}>
          <Agenda />
        </BeatScene>
        <BeatScene from={B.a1}>
          <Adoption />
        </BeatScene>
        <BeatScene from={B.a2}>
          <Visibility />
        </BeatScene>
        <BeatScene from={B.b1}>
          <Sources />
        </BeatScene>
        <BeatScene from={B.b2}>
          <YelpRing />
        </BeatScene>
        <BeatScene from={B.b3}>
          <Mismatch />
        </BeatScene>
        <BeatScene from={B.c1}>
          <NapCheck />
        </BeatScene>
        <BeatScene from={B.c2}>
          <BingClaim />
        </BeatScene>
        <BeatScene from={B.c3}>
          <Reviews />
        </BeatScene>
        <BeatScene from={B.c4}>
          <Plainly />
        </BeatScene>
        <BeatScene from={B.t1}>
          <Test />
        </BeatScene>
        <BeatScene from={B.t2}>
          <Result />
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
          line="We’ll check your listings, and what AI says about you."
        />
        <RoundCard
          beat={B.r1}
          eyebrow="PART 1 OF 4"
          big="1"
          unit="WHY IT’S HARD"
        />
        <RoundCard
          beat={B.r2}
          eyebrow="PART 2 OF 4"
          big="2"
          unit="WHERE WE LOOK"
        />
        <RoundCard
          beat={B.r3}
          eyebrow="PART 3 OF 4"
          big="3"
          unit="THE CHECKLIST"
        />
        <RoundCard beat={B.r4} eyebrow="PART 4 OF 4" big="4" unit="THE TEST" />
        <PhraseBubble tl={TL} />
      </Shake>
    </Stage>
    <Audio src={staticFile("audio/sol-chatgpt-music.wav")} volume={0.5} />
    <Audio src={staticFile("audio/sol-chatgpt-voice.wav")} volume={0.9} />
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

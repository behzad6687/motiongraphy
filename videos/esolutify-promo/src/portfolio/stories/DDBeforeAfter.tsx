import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
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
import { LaptopRec, PhoneRec } from "../kit";
import picker from "../../../public/stories/ddnew/desktop-picker.json";
import words from "./ddba-words.json";

// Before and after: Dental Defenders, Houston. The office's old website
// (dentaldefendershouston.com) next to the one we built
// (esolutify.com/demo/dentaldefenders), 43 s, 9:16, set in the new site's
// own comic-book look: Archivo italic, navy, hero red and gold. A narrator
// carries it (public/audio/ddba/v1-v8.wav), with word-by-word subtitles for
// people watching muted; every scene is timed to its line.
//   0–75       hook: "Same dentist. Brand-new website."
//   75–270     before: the old homepage scrolls
//   270–285    the swipe: the new site wipes across the same laptop, POW
//   285–450    after: "Tell us what's going on. We'll point the way.", three taps
//   450–870    Shield, the AI agent, on a phone: a real conversation from the
//              live demo (Medicaid question, after-school times, booked with a
//              reference), then the same agent answering in Spanish
//   870–990    the visit as a comic, the hero film on the phone
//   990–1140   the scorecard, before vs after
//   1140–1290  end card
// The chat is redrawn from the real session, word for word, with the site's
// own chat header and input bar (screenshots of it) so it types smoothly.
// Music: story-defenders.wav (scripts/gen_story_music.py defenders): a dull
// lounge loop for the old site, the hit at 285, lifts at 450, 870 and 990,
// the end card at 1140; it ducks under the narrator.

export const DD_BA_DURATION = 1290;
const BEF = 75;
const SWIPE = 270;
const HIT = 285;
const CHAT = 450;
const KIDS = 870;
const SCORE = 990;
const END = 1140;

const DD = {
  navy: "#0B1638",
  navy2: "#14224F",
  red: "#E3242F",
  gold: "#FFC93C",
  text: "#EEF2FF",
  muted: "#A8B2D6",
  line: "rgba(168,178,214,0.22)",
  grey: "#8A8F9C",
};
const head: React.CSSProperties = {
  fontFamily: theme.fonts.archivo,
  fontStyle: "italic",
  fontWeight: 850,
  fontVariationSettings: "'wdth' 78",
  textTransform: "uppercase",
  letterSpacing: "-0.01em",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 21,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};
const body: React.CSSProperties = { fontFamily: theme.fonts.figtree };

// ---------------------------------------------------------------- backdrop
const Halftone: React.FC<{ tint?: string }> = ({ tint = DD.navy }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: tint }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(31,79,209,0.45), transparent 65%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2.5px)",
          backgroundSize: "22px 22px",
          backgroundPosition: `${frame * 0.3}px ${frame * 0.2}px`,
        }}
      />
      {/* comic speed lines from the top corner */}
      <AbsoluteFill
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 100% 0%, rgba(255,255,255,0.025) 0deg 3deg, transparent 3deg 9deg)",
        }}
      />
    </AbsoluteFill>
  );
};

// a comic starburst with a word in it
const Burst: React.FC<{
  at: number;
  x: number;
  y: number;
  word: string;
  size?: number;
  rot?: number;
}> = ({ at, x, y, word, size = 260, rot = -10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({
    frame: frame - at,
    fps,
    config: { damping: 9, stiffness: 220 },
  });
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 0.62 : 1;
    return `${50 + 50 * r * Math.cos(a)}% ${50 + 50 * r * Math.sin(a)}%`;
  }).join(",");
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        scale: s,
        rotate: `${rot}deg`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -10,
          background: DD.red,
          clipPath: `polygon(${pts})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: DD.gold,
          clipPath: `polygon(${pts})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.comic,
          fontSize: size * 0.3,
          color: DD.red,
          WebkitTextStroke: `${size * 0.012}px ${DD.navy}`,
          letterSpacing: "0.02em",
        }}
      >
        {word}
      </div>
    </div>
  );
};

const Caption: React.FC<{
  from: number;
  to: number;
  eyebrow?: string;
  eyebrowColor?: string;
  a: string;
  b: string;
  bColor?: string;
  size?: number;
}> = ({
  from,
  to,
  eyebrow,
  eyebrowColor = DD.gold,
  a,
  b,
  bColor = DD.gold,
  size = 104,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from, from + 12);
  const inB = ease(frame, from + 5, from + 17);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 190,
        opacity: 1 - out,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            ...mono,
            color: eyebrowColor,
            marginBottom: 16,
            opacity: inA,
          }}
        >
          /// {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...head,
          fontSize: size,
          lineHeight: 0.95,
          color: DD.text,
          opacity: inA,
          translate: `${(1 - inA) * -40}px 0px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...head,
          fontSize: size,
          lineHeight: 0.98,
          color: bColor,
          opacity: inB,
          translate: `${(1 - inB) * -40}px 0px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// a scene enters as a comic panel slamming in on a diagonal
const Panel: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame >= to + 12) return null;
  const p = from === 0 ? 1 : ease(frame, from - 2, from + 10, theme.ease.inOut);
  const x = (1 - p) * 1400;
  return (
    <AbsoluteFill
      style={{
        clipPath: `polygon(${x}px 0px, 1080px 0px, 1080px 1920px, ${x - 300}px 1920px)`,
        isolation: "isolate",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
const PanelEdge: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > at + 12) return null;
  const p = ease(frame, at - 2, at + 10, theme.ease.inOut);
  const x = (1 - p) * 1400;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", zIndex: 30 }}
    >
      <line
        x1={x}
        y1={0}
        x2={x - 300}
        y2={1920}
        stroke={DD.gold}
        strokeWidth={22}
      />
      <line
        x1={x + 16}
        y1={0}
        x2={x - 284}
        y2={1920}
        stroke={DD.navy}
        strokeWidth={10}
      />
    </svg>
  );
};

// a gliding mouse pointer between taps (css px of a 1440 recording)
const Pointer: React.FC<{
  taps: { frame: number; x: number; y: number }[];
  from: number;
  screen: { x: number; y: number; s: number };
  show: number;
}> = ({ taps, from, screen, show }) => {
  const frame = useCurrentFrame();
  const tap = [...taps].reverse().find((t) => frame >= from + t.frame);
  const since = tap ? frame - from - tap.frame : 99;
  let cx = taps[0].x + 220;
  let cy = taps[0].y + 140;
  for (const t of taps) {
    const p = ease(
      frame,
      from + t.frame - 12,
      from + t.frame - 1,
      theme.ease.inOut,
    );
    cx += (t.x - cx) * p;
    cy += (t.y - cy) * p;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: screen.x + cx * screen.s,
        top: screen.y + cy * screen.s,
        opacity: ease(frame, show, show + 8),
        zIndex: 5,
      }}
    >
      {since < 14 ? (
        <div
          style={{
            position: "absolute",
            left: -24 - 22 * (since / 14),
            top: -24 - 22 * (since / 14),
            width: 48 + 44 * (since / 14),
            height: 48 + 44 * (since / 14),
            borderRadius: "50%",
            border: `4px solid ${DD.red}`,
            opacity: 1 - since / 14,
          }}
        />
      ) : null}
      <svg
        width={34}
        height={42}
        viewBox="0 0 22 26"
        style={{
          position: "absolute",
          left: -4,
          top: -2,
          scale: since < 4 ? 0.85 : 1,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
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
  );
};

// ---------------------------------------------------------------- the laptop (0–420)
const LAP_W = 900;
const LAP = { x: 540 - (LAP_W * 1.16) / 2, y: 620 };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const OLD_FROM = BEF - 4;
const PICK_FROM = HIT - 4;
const BEFORE_NOTES: { at: number; t: string }[] = [];
const PICKED = [
  "My child’s first dental visit",
  "My child is scared of the dentist",
  "We have Medicaid or CHIP",
];

const LaptopAct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  // the swipe: the new site wipes over the old one, left to right
  const sw = ease(frame, SWIPE, HIT + 4, theme.ease.inOut);
  const edgeX = -200 + sw * 1500;
  const before = frame < HIT + 6;
  const after = frame >= SWIPE;
  const fade = frame < BEF ? 0 : ease(frame, BEF, BEF + 20);
  return (
    <>
      <Caption
        from={2}
        to={BEF - 4}
        eyebrow="Before → After · Dental Defenders, Houston"
        a="Same dentist."
        b="New website."
        size={128}
      />
      <Caption
        from={BEF}
        to={SWIPE - 2}
        eyebrow="Before · their old website"
        eyebrowColor={DD.grey}
        a="It looked busy."
        b="And it couldn’t book."
        bColor={DD.muted}
      />
      <Caption
        from={HIT + 2}
        to={CHAT - 4}
        eyebrow="After · not sure where to start?"
        eyebrowColor={DD.red}
        a="Tell us what’s going on."
        b="We’ll point the way."
        size={80}
      />
      <div
        style={{
          position: "absolute",
          left: LAP.x,
          top: LAP.y + (1 - rise) * 200,
          opacity: interpolate(rise, [0, 0.3], [0, 1], clamp),
        }}
      >
        {before ? (
          <div
            style={{
              position: "absolute",
              filter: `saturate(${1 - 0.35 * fade}) brightness(${1 - 0.06 * fade})`,
            }}
          >
            <LaptopRec
              src="stories/ddold/desktop-scroll.mp4"
              width={LAP_W}
              from={OLD_FROM}
              hold
            />
          </div>
        ) : null}
        {after ? (
          <div
            style={{
              position: "absolute",
              clipPath:
                frame < HIT + 6
                  ? `polygon(0px 0px, ${edgeX}px 0px, ${edgeX - 200}px 1000px, 0px 1000px)`
                  : undefined,
            }}
          >
            <LaptopRec
              src="stories/ddnew/desktop-picker.mp4"
              width={LAP_W}
              from={PICK_FROM}
              hold
            />
          </div>
        ) : null}
        {frame >= SWIPE && frame < HIT + 6 ? (
          <svg
            width={1100}
            height={700}
            style={{ position: "absolute", left: 0, top: 0, zIndex: 3 }}
          >
            <line
              x1={edgeX}
              y1={0}
              x2={edgeX - 140}
              y2={700}
              stroke="#fff"
              strokeWidth={10}
            />
          </svg>
        ) : null}
        {/* BEFORE / AFTER tape on the lid */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: -34,
            padding: "8px 18px",
            rotate: "-4deg",
            background: frame < HIT ? DD.grey : DD.red,
            color: "#fff",
            ...mono,
            fontSize: 24,
            fontWeight: 700,
            opacity: ease(frame, BEF, BEF + 10),
            boxShadow: "4px 4px 0 rgba(0,0,0,0.35)",
            zIndex: 4,
          }}
        >
          {frame < HIT ? "Before" : "After"}
        </div>
      </div>
      {frame >= HIT ? (
        <Pointer
          taps={picker.taps}
          from={PICK_FROM}
          screen={{ ...LSCREEN }}
          show={PICK_FROM + 40}
        />
      ) : null}
      <Burst at={HIT} x={930} y={1190} word="POW!" size={230} rot={12} />
      {/* what the old site could not do */}
      <div style={{ position: "absolute", left: 50, right: 50, top: 1290 }}>
        {frame < SWIPE + 6
          ? BEFORE_NOTES.map((n) =>
              frame >= n.at ? (
                <div
                  key={n.t}
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                    marginBottom: 22,
                    opacity:
                      ease(frame, n.at, n.at + 8) *
                      (1 - ease(frame, SWIPE - 4, SWIPE + 6)),
                    translate: `${(1 - ease(frame, n.at, n.at + 10)) * 40}px 0px`,
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "rgba(138,143,156,0.25)",
                      color: "#C9CDD6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: theme.fonts.display,
                      fontWeight: 800,
                      fontSize: 28,
                    }}
                  >
                    ✕
                  </span>
                  <span
                    style={{
                      ...body,
                      fontSize: 36,
                      lineHeight: 1.2,
                      color: "#D3D7E2",
                    }}
                  >
                    {n.t}
                  </span>
                </div>
              ) : null,
            )
          : PICKED.map((p, i) => {
              const at = PICK_FROM + picker.taps[i].frame;
              if (frame < at) return null;
              return (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                    marginBottom: 20,
                    opacity: ease(frame, at, at + 8),
                    translate: `${(1 - ease(frame, at, at + 10)) * 40}px 0px`,
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: DD.gold,
                      color: DD.navy,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: theme.fonts.display,
                      fontWeight: 900,
                      fontSize: 28,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      ...body,
                      fontWeight: 600,
                      fontSize: 36,
                      color: DD.text,
                    }}
                  >
                    {p}
                  </span>
                </div>
              );
            })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- the chat (450–870)
// The real conversation with Shield on the live demo, 28 Oct 2026. Two turns
// where the server hiccuped are left out; the contact details given were
// made-up test details.
type Msg =
  | { k: "u"; at: number; t: string; typed?: boolean }
  | { k: "a"; at: number; t: string }
  | { k: "act"; at: number; t: string }
  | { k: "booked"; at: number }
  | { k: "note"; at: number; t: string };
const C = (f: number) => CHAT + f;
const GREETING =
  "Hi, I’m Shield, the Dental Defenders AI agent! I can answer questions about visits, Medicaid and insurance, and book an appointment for you or your kids right here. What can I help with?";
const T1 =
  "Do you take Medicaid? My son is 6 and needs a check-up after school";
const T2 = "Yes please, what after-school times do you have this week?";
const T5 = "¿Hablan español? Mi hija tiene dolor de muela";
const TYPE_RATE = 3; // characters per frame
const typeEnd = (start: number, t: string) =>
  start + Math.ceil(t.length / TYPE_RATE);
const U1 = C(14);
const U2 = C(100);
const U3 = C(170);
const U4 = C(215);
const U5 = C(292);
const MSGS: Msg[] = [
  { k: "u", at: typeEnd(U1, T1) + 3, t: T1, typed: true },
  {
    k: "a",
    at: typeEnd(U1, T1) + 22,
    t: "Yes, we accept Texas Medicaid and CHIP dental, including DentaQuest and MCNA! For your son's check-up, we'd book him a Kids Check-up and Cleaning (45 min). After-school slots fill fast, so let's grab one soon. Want me to check available times?",
  },
  { k: "act", at: typeEnd(U1, T1) + 26, t: "Book online →" },
  { k: "u", at: typeEnd(U2, T2) + 3, t: T2, typed: true },
  {
    k: "a",
    at: typeEnd(U2, T2) + 20,
    t: "We have today, Wed Oct 28 at 5:45 or 6:00 PM, or tomorrow Thu Oct 29 at 2:45 PM, all good after-school times. Which works best for your son?",
  },
  { k: "u", at: U3 + 4, t: "Thu 2:45 PM" },
  {
    k: "a",
    at: U3 + 20,
    t: "Great choice, Thursday at 2:45 PM it is! Can I get your first and last name, and your son's first name, please?",
  },
  { k: "note", at: U4, t: "name, phone and email shared" },
  {
    k: "a",
    at: U4 + 16,
    t: "You’re booked! Kids check-up and cleaning on Thursday, October 29 at 2:45 PM for Leo. A confirmation is on its way to your email.",
  },
  { k: "booked", at: U4 + 24 },
  { k: "u", at: typeEnd(U5, T5) + 3, t: T5, typed: true },
  {
    k: "a",
    at: typeEnd(U5, T5) + 20,
    t: "¡Sí, hablamos español! Lamento que su hija tenga dolor de muela. Podemos verla hoy mismo a las 5:45 pm o 6:00 pm. ¿Le funciona alguno de estos horarios?",
  },
];
const CHIPS: {
  from: number;
  to: number;
  rows: string[][];
  pick?: { row: number; i: number; at: number };
}[] = [
  {
    from: C(0),
    to: U1 + 2,
    rows: [
      ["Book a kids check-up", "Do you take Medicaid?"],
      ["A tooth hurts", "Are you open Saturday?"],
    ],
  },
  {
    from: typeEnd(U2, T2) + 24,
    to: U3 + 4,
    rows: [["Today 5:45 PM", "Today 6:00 PM"], ["Thu 2:45 PM"]],
    pick: { row: 1, i: 0, at: U3 },
  },
];
const TYPING: [number, number][] = [
  [typeEnd(U1, T1) + 5, typeEnd(U1, T1) + 22],
  [typeEnd(U2, T2) + 5, typeEnd(U2, T2) + 20],
  [U3 + 6, U3 + 20],
  [U4 + 4, U4 + 16],
  [typeEnd(U5, T5) + 5, typeEnd(U5, T5) + 20],
];
const INPUTS: [number, string][] = [
  [U1, T1],
  [U2, T2],
  [U5, T5],
];

const Avatar: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <span
    style={{
      position: "relative",
      flex: "none",
      width: size,
      height: size,
      borderRadius: "50%",
      background:
        "radial-gradient(circle,#1f4fd1 0 30%,#fff 30% 45%,#e3242f 45% 62%,#fff 62% 77%,#e3242f 77% 100%)",
      boxShadow: "0 0 14px rgba(255,201,60,.4)",
      alignSelf: "flex-end",
    }}
  >
    <span
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size * 0.35,
        height: size * 0.35,
        translate: "-50% -50%",
        background: "#fff",
        clipPath:
          "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
      }}
    />
  </span>
);

const pop = (frame: number, at: number): React.CSSProperties => {
  const p = ease(frame, at, at + 8);
  return { opacity: p, translate: `0px ${(1 - p) * 10}px` };
};

const ChatScreen: React.FC<{ at?: number }> = ({ at }) => {
  const now = useCurrentFrame();
  const frame = at ?? now;
  const shown = MSGS.filter((m) => frame >= m.at);
  const typing = TYPING.some(([a, b]) => frame >= a && frame < b);
  const chips = CHIPS.find((c) => frame >= c.from && frame < c.to);
  const input = INPUTS.find(
    ([s, t]) => frame >= s && frame < typeEnd(s, t) + 3,
  );
  const typed = input
    ? input[1].slice(0, Math.max(0, Math.floor((frame - input[0]) * TYPE_RATE)))
    : "";
  const sendTap = INPUTS.map(([s, t]) => typeEnd(s, t) + 1).find(
    (f) => frame >= f && frame < f + 10,
  );
  const fresh = frame < U1 + 2;
  return (
    <div
      style={{
        position: "relative",
        width: 390,
        height: 844,
        background: "#0C1639",
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile("stories/ddnew/chat-top.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 390,
          height: 193,
        }}
      />
      {/* the panel body */}
      <div
        style={{
          position: "absolute",
          left: 1.5,
          right: 1.5,
          top: 193,
          height: 544,
          overflow: "hidden",
          background: "#0C1639",
          backgroundImage:
            "radial-gradient(rgba(168,178,214,0.08) 1px, transparent 1.2px)",
          backgroundSize: "14px 14px",
          borderLeft: "1px solid rgba(255,201,60,0.25)",
          borderRight: "1px solid rgba(255,201,60,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            ...body,
          }}
        >
          {/* the opening greeting */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              maxWidth: "88%",
            }}
          >
            <Avatar />
            <div
              style={{
                padding: "10px 13px",
                borderRadius: 16,
                borderBottomLeftRadius: 5,
                background: DD.navy2,
                border: `1px solid ${DD.line}`,
                color: DD.text,
                fontSize: 14.5,
                lineHeight: 1.5,
              }}
            >
              {GREETING}
            </div>
          </div>
          {fresh ? (
            <div
              style={{
                marginLeft: 34,
                padding: "10px 13px",
                borderRadius: 16,
                border: `1px solid ${DD.line}`,
                background: "rgba(20,34,79,0.5)",
                color: DD.text,
                fontSize: 13.5,
                lineHeight: 1.45,
              }}
            >
              <b>I’m an AI agent, not a menu of canned answers. I can:</b>
              {[
                "Answer questions about visits, hours and insurance",
                "Find a free time and book it in the chat",
                "Help after a dental emergency",
                "Talk in English, Spanish and more",
              ].map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    gap: 8,
                    color: DD.muted,
                    marginTop: 3,
                  }}
                >
                  <span style={{ color: DD.red }}>●</span>
                  {c}
                </div>
              ))}
            </div>
          ) : null}
          {shown.map((m, i) => {
            if (m.k === "u")
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-end",
                    maxWidth: "80%",
                    padding: "10px 13px",
                    borderRadius: 16,
                    borderBottomRightRadius: 5,
                    background: DD.red,
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    ...pop(frame, m.at),
                  }}
                >
                  {m.t}
                </div>
              );
            if (m.k === "a")
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    maxWidth: "88%",
                    ...pop(frame, m.at),
                  }}
                >
                  <Avatar />
                  <div
                    style={{
                      padding: "10px 13px",
                      borderRadius: 16,
                      borderBottomLeftRadius: 5,
                      background: DD.navy2,
                      border: `1px solid ${DD.line}`,
                      color: DD.text,
                      fontSize: 14.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.t}
                  </div>
                </div>
              );
            if (m.k === "act")
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: "flex-start",
                    marginLeft: 34,
                    padding: "9px 15px",
                    borderRadius: 100,
                    background: "linear-gradient(180deg,#ffd75e,#ffc93c)",
                    color: DD.navy,
                    fontWeight: 700,
                    fontSize: 13.5,
                    boxShadow: "0 4px 0 #c99412",
                    ...pop(frame, m.at),
                  }}
                >
                  {m.t}
                </div>
              );
            if (m.k === "note")
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: "center",
                    fontFamily: theme.fonts.mono,
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: DD.muted,
                    padding: "4px 10px",
                    border: `1px dashed ${DD.line}`,
                    borderRadius: 99,
                    ...pop(frame, m.at),
                  }}
                >
                  {m.t}
                </div>
              );
            const s = spring({
              frame: frame - m.at,
              fps: 30,
              config: { damping: 11, stiffness: 180 },
            });
            return (
              <div
                key={i}
                style={{
                  marginLeft: 34,
                  padding: "13px 14px",
                  borderRadius: 16,
                  background: "#fff",
                  color: "#121a33",
                  border: `3px solid ${DD.gold}`,
                  boxShadow: "5px 5px 0 rgba(0,0,0,.35)",
                  display: "grid",
                  gap: 2,
                  fontSize: 13.5,
                  scale: interpolate(s, [0, 1], [0.6, 1]),
                  opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                  transformOrigin: "20% 50%",
                }}
              >
                <b
                  style={{
                    ...head,
                    fontSize: 17,
                    lineHeight: 1.15,
                    color: DD.navy,
                  }}
                >
                  Kids check-up and cleaning
                </b>
                <span style={{ color: "#434b66" }}>
                  Thursday, October 29 at 2:45 PM
                </span>
                <span style={{ color: "#434b66" }}>
                  5341 Antoine Dr · ref 8B31EA47
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 6,
                    color: DD.red,
                    fontWeight: 700,
                  }}
                >
                  <span>New patient form</span>
                  <span>Change or cancel</span>
                </div>
              </div>
            );
          })}
          {typing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <Avatar />
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  padding: "12px 14px",
                  borderRadius: 16,
                  borderBottomLeftRadius: 5,
                  background: DD.navy2,
                  border: `1px solid ${DD.line}`,
                }}
              >
                {[0, 1, 2].map((d) => (
                  <i
                    key={d}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: DD.gold,
                      opacity:
                        0.35 +
                        0.65 * Math.max(0, Math.sin((frame - d * 3) / 3)),
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {chips ? (
            <div style={{ display: "grid", gap: 7, marginLeft: 0 }}>
              {chips.rows.map((row, r) => (
                <div key={r} style={{ display: "flex", gap: 7 }}>
                  {row.map((c, i) => {
                    const picked =
                      chips.pick &&
                      chips.pick.row === r &&
                      chips.pick.i === i &&
                      frame >= chips.pick.at;
                    return (
                      <span
                        key={c}
                        style={{
                          position: "relative",
                          border: "1px solid rgba(255,201,60,.55)",
                          background: picked ? DD.gold : "rgba(255,201,60,.08)",
                          color: picked ? DD.navy : DD.text,
                          borderRadius: 100,
                          padding: "7px 12px",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {c}
                        {picked ? (
                          <span
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              width: 30 + (frame - chips.pick!.at) * 4,
                              height: 30 + (frame - chips.pick!.at) * 4,
                              translate: "-50% -50%",
                              borderRadius: "50%",
                              border: `2px solid ${DD.gold}`,
                              opacity: Math.max(
                                0,
                                1 - (frame - chips.pick!.at) / 10,
                              ),
                            }}
                          />
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <Img
        src={staticFile("stories/ddnew/chat-bottom.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 737,
          width: 390,
          height: 107,
        }}
      />
      {/* what is being typed, over the input's placeholder */}
      {input ? (
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 737 + 13,
            width: 255,
            height: 36,
            borderRadius: 18,
            background: "#13214E",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ ...body, fontSize: 14.5, color: DD.text }}>
            {typed}
            <span
              style={{
                opacity: Math.floor(frame / 8) % 2 ? 1 : 0,
                color: DD.gold,
              }}
            >
              |
            </span>
          </span>
        </div>
      ) : null}
      {sendTap !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 355 - 30 - (frame - sendTap) * 2,
            top: 737 + 32 - 30 - (frame - sendTap) * 2,
            width: 60 + (frame - sendTap) * 4,
            height: 60 + (frame - sendTap) * 4,
            borderRadius: "50%",
            border: "3px solid #fff",
            opacity: 1 - (frame - sendTap) / 10,
          }}
        />
      ) : null}
    </div>
  );
};

const PH_W = 440;
const PH_K = PH_W / 390;
const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bezel = Math.round(PH_W * 0.035);
  const r = Math.round(PH_W * 0.14);
  return (
    <div
      style={{
        position: "relative",
        width: PH_W + bezel * 2,
        height: 844 * PH_K + bezel * 2,
        padding: bezel,
        borderRadius: r + bezel,
        background: "linear-gradient(150deg, #3A3A3A, #0E0E0E 45%, #262626)",
        boxShadow:
          "0 80px 140px -40px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.08), 0 0 90px rgba(255,201,60,0.18)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: PH_W,
          height: 844 * PH_K,
          borderRadius: r,
          overflow: "hidden",
        }}
      >
        <div style={{ scale: PH_K, transformOrigin: "0 0" }}>{children}</div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: PH_W * 0.025,
            width: PH_W * 0.3,
            height: PH_W * 0.085,
            translate: "-50% 0px",
            borderRadius: 99,
            background: "#050505",
          }}
        />
      </div>
    </div>
  );
};

const STICKERS = [
  {
    at: typeEnd(U1, T1) + 26,
    t: "Knows their insurance",
    x: 24,
    y: 760,
    rot: -6,
  },
  {
    at: typeEnd(U2, T2) + 24,
    t: "Finds a real free time",
    x: 806,
    y: 1020,
    rot: 5,
  },
  { at: U4 + 28, t: "Booked, with a reference", x: 24, y: 1300, rot: -4 },
];

const ChatAct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({
    frame: frame - CHAT,
    fps,
    config: theme.spring.smooth,
  });
  // a punch-in on the booking card, then back out
  const punch =
    ease(frame, U4 + 22, U4 + 34, theme.ease.inOut) *
    (1 - ease(frame, U5 - 14, U5 - 2, theme.ease.inOut));
  return (
    <>
      <Halftone />
      <div style={{ opacity: 1 - punch }}>
        <Caption
          from={CHAT + 6}
          to={U5 - 6}
          eyebrow="After · meet Shield"
          eyebrowColor={DD.red}
          a="An AI agent"
          b="that books the visit."
          size={96}
        />
        <Caption
          from={U5 - 2}
          to={KIDS - 4}
          eyebrow="24/7, in their language"
          eyebrowColor={DD.red}
          a="English, Spanish"
          b="and more."
          size={96}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 - (PH_W * 1.07) / 2,
          top: 470 + (1 - rise) * 300,
          scale: 1 + 0.14 * punch,
          transformOrigin: "50% 85%",
        }}
      >
        <Phone>
          <ChatScreen />
        </Phone>
      </div>
      {STICKERS.map((s) =>
        frame >= s.at && frame < KIDS ? (
          <div
            key={s.t}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: 250,
              padding: "14px 18px",
              background: DD.gold,
              color: DD.navy,
              ...head,
              fontSize: 36,
              lineHeight: 1.0,
              rotate: `${s.rot}deg`,
              boxShadow: "6px 6px 0 rgba(0,0,0,0.45)",
              border: `4px solid ${DD.navy}`,
              scale: spring({
                frame: frame - s.at,
                fps,
                config: { damping: 10, stiffness: 200 },
              }),
              opacity: 1 - punch,
              zIndex: 8,
            }}
          >
            {s.t}
          </div>
        ) : null,
      )}
    </>
  );
};

// ---------------------------------------------------------------- kids (720–825)
const KidsAct: React.FC = () => (
  <>
    <Halftone />
    <Caption
      from={KIDS + 6}
      to={SCORE - 4}
      eyebrow="After · read it before you come"
      eyebrowColor={DD.red}
      a="The visit,"
      b="as a comic."
      size={110}
    />
    <div style={{ position: "absolute", left: 30, top: 560 }}>
      <LaptopRec
        src="stories/ddnew/desktop-panels.mp4"
        width={760}
        from={KIDS - 6}
        hold
      />
    </div>
    <div style={{ position: "absolute", left: 700, top: 740, rotate: "4deg" }}>
      <PhoneRec
        src="stories/ddnew/mobile-film.mp4"
        width={300}
        from={KIDS - 30}
        trim={20}
        hold
      />
    </div>
    <Burst at={KIDS + 30} x={170} y={1420} word="ZAP!" size={200} rot={-12} />
  </>
);

// ---------------------------------------------------------------- scorecard (825–945)
const ROWS = [
  {
    k: "Booking",
    b: "A request form on another site",
    a: "Pick a time, booked in the chat",
  },
  { k: "Questions at 10 pm", b: "No chat", a: "Shield, the AI agent, 24/7" },
  { k: "Languages", b: "English only", a: "English, Spanish and more" },
  {
    k: "Not sure where to start?",
    b: "Dig through the menus",
    a: "Tap what’s going on, see the right visit",
  },
];
const ScoreAct: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Halftone />
      <Caption
        from={SCORE + 4}
        to={END - 4}
        eyebrow="Dental Defenders · the scorecard"
        eyebrowColor={DD.red}
        a="Before"
        b="vs after."
        size={128}
      />
      <div style={{ position: "absolute", left: 40, right: 40, top: 520 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 18,
            ...mono,
            fontSize: 22,
          }}
        >
          <span style={{ color: DD.grey }}>Before</span>
          <span style={{ color: DD.gold }}>After</span>
        </div>
        {ROWS.map((r, i) => {
          const at = SCORE + 14 + i * 22;
          const p = ease(frame, at, at + 10);
          return (
            <div
              key={r.k}
              style={{
                marginBottom: 26,
                opacity: p,
                translate: `0px ${(1 - p) * 30}px`,
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: 18,
                  color: DD.muted,
                  marginBottom: 10,
                }}
              >
                {r.k}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "18px 18px",
                    borderRadius: 14,
                    background: "rgba(138,143,156,0.16)",
                    ...body,
                    fontSize: 30,
                    lineHeight: 1.15,
                    color: "#C9CDD6",
                  }}
                >
                  <span
                    style={{ color: DD.red, fontWeight: 900, fontSize: 32 }}
                  >
                    ✕
                  </span>
                  {r.b}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "18px 18px",
                    borderRadius: 14,
                    background: DD.navy2,
                    border: `2px solid ${DD.gold}`,
                    ...body,
                    fontWeight: 600,
                    fontSize: 30,
                    lineHeight: 1.15,
                    color: DD.text,
                    boxShadow: "5px 5px 0 rgba(0,0,0,0.35)",
                  }}
                >
                  <span
                    style={{ color: DD.gold, fontWeight: 900, fontSize: 32 }}
                  >
                    ✓
                  </span>
                  {r.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - 4 - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 34}px`,
    };
  };
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <>
      <Halftone />
      <div style={{ position: "absolute", left: 50, top: 230, ...up(0) }}>
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 230, display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 400 }}>
        <div style={{ ...mono, color: DD.red, ...up(3) }}>
          /// Before → after, built by eSolutify
        </div>
        <div
          style={{
            ...head,
            marginTop: 22,
            fontSize: 124,
            lineHeight: 0.94,
            color: DD.text,
            ...up(6),
          }}
        >
          Give your website
        </div>
        <div
          style={{
            ...head,
            fontSize: 124,
            lineHeight: 0.98,
            color: DD.gold,
            ...up(9),
          }}
        >
          a superhero upgrade.
        </div>
        <div
          style={{
            ...body,
            marginTop: 30,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.3,
            color: DD.muted,
            ...up(12),
          }}
        >
          See your new site free,
          <br />
          before you pay a dollar.
        </div>
      </div>
      <Burst at={END + 24} x={900} y={330} word="WOW!" size={200} rot={10} />
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 1230,
          height: 104,
          padding: "0 42px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: DD.red,
          boxShadow: "0 6px 0 #9c1018, 0 18px 40px -14px rgba(227,36,47,0.6)",
          ...body,
          fontWeight: 700,
          fontSize: 44,
          color: "#fff",
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={40} color="#fff" stroke={2.6} />
        <LightSweep start={END + 50} duration={24} width={140} opacity={0.4} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 1366,
          ...body,
          fontWeight: 600,
          fontSize: 34,
          color: DD.text,
          ...up(20),
        }}
      >
        esolutify.com/free-demo
      </div>
      {/* the link sticker goes here */}
      <div
        style={{
          position: "absolute",
          right: 50,
          top: 1434,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...mono,
          fontSize: 24,
          color: DD.gold,
          ...up(24),
        }}
      >
        tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={DD.gold} stroke={2.6} />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- narrator
// One line per scene. "on" is where the speech starts in the file (s), so
// the first word's subtitle lands on it; word times come from a Whisper pass
// over each line (src/portfolio/stories/ddba-words.json).
const VO = [
  { f: "v1.wav", at: 8, on: 0.26 },
  { f: "v2.wav", at: BEF + 6, on: 0.25 },
  { f: "v3.wav", at: HIT + 10, on: 0.25 },
  { f: "v4.wav", at: CHAT + 8, on: 0.29 },
  { f: "v5.wav", at: CHAT + 296, on: 0.11 },
  { f: "v6.wav", at: KIDS + 8, on: 0.49 },
  { f: "v7.wav", at: SCORE + 12, on: 0.41 },
  { f: "v8.wav", at: END + 12, on: 0.28 },
];
type Word = { w: string; s: number; e: number };
const WORDS = words as Record<string, Word[]>;
const SUBS = VO.flatMap((v) => {
  const ws = WORDS[v.f].map((w) => ({
    w: w.w,
    s: v.at + Math.round(Math.max(w.s, v.on) * 30),
    e: v.at + Math.round(w.e * 30),
  }));
  // chunks of up to four words, broken after punctuation
  const chunks: (typeof ws)[] = [];
  let cur: typeof ws = [];
  for (const w of ws) {
    cur.push(w);
    if (cur.length >= 4 || /[,.?!:]$/.test(w.w)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  // never leave one word on its own: fold it into the chunk before
  for (let k = chunks.length - 1; k > 0; k--) {
    if (chunks[k].length === 1 && chunks[k - 1].length <= 4) {
      chunks[k - 1] = [...chunks[k - 1], ...chunks[k]];
      chunks.splice(k, 1);
    }
  }
  if (chunks.length > 1 && chunks[0].length === 1) {
    chunks[1] = [...chunks[0], ...chunks[1]];
    chunks.shift();
  }
  return chunks;
});
const SPEECH = VO.map((v) => {
  const ws = WORDS[v.f];
  return [
    v.at + Math.round(v.on * 30),
    v.at + Math.round(ws[ws.length - 1].e * 30),
  ];
});
const musicVolume = (f: number) => {
  let duck = 0;
  for (const [a, b] of SPEECH) {
    duck = Math.max(
      duck,
      interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], clamp),
    );
  }
  return 0.85 - 0.5 * duck;
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const i = SUBS.findIndex((c, k) => {
    const next = SUBS[k + 1];
    const end =
      next && next[0].s - c[c.length - 1].e < 20
        ? next[0].s - 1
        : c[c.length - 1].e + 8;
    return frame >= c[0].s - 2 && frame <= end;
  });
  if (i < 0) return null;
  const c = SUBS[i];
  const p = ease(frame, c[0].s - 2, c[0].s + 4);
  const y = frame >= END ? 1110 : 1530;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: y,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0px 16px",
        zIndex: 40,
        scale: 0.9 + 0.1 * p,
        opacity: p,
      }}
    >
      {c.map((w, k) => {
        const on = frame >= w.s - 1;
        const now = on && (k === c.length - 1 || frame < c[k + 1].s - 1);
        return (
          <span
            key={k}
            style={{
              ...head,
              fontSize: 64,
              lineHeight: 1.12,
              color: now ? DD.gold : "#fff",
              opacity: on ? 1 : 0.55,
              WebkitTextStroke: `12px ${DD.navy}`,
              paintOrder: "stroke fill",
              textShadow: "0 6px 0 rgba(0,0,0,0.35)",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

export const DDBeforeAfter: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => {
  const frame = useCurrentFrame();
  const oldFade = frame < HIT ? ease(frame, BEF, BEF + 20) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: DD.navy }}>
      <Panel from={0} to={CHAT}>
        <Halftone />
        {/* the old site's part reads greyer */}
        <AbsoluteFill
          style={{ background: "#1A1D26", opacity: 0.55 * oldFade }}
        />
        <LaptopAct />
      </Panel>
      <Panel from={CHAT} to={KIDS}>
        <ChatAct />
      </Panel>
      <Panel from={KIDS} to={SCORE}>
        <KidsAct />
      </Panel>
      <Panel from={SCORE} to={END}>
        <ScoreAct />
      </Panel>
      <Panel from={END} to={10_000}>
        <EndCard />
      </Panel>
      {[CHAT, KIDS, SCORE, END].map((c) => (
        <PanelEdge key={c} at={c} />
      ))}
      <Audio
        src={staticFile("audio/story-defenders.wav")}
        volume={musicVolume}
      />
      {VO.map((v) => (
        <Sequence key={v.f} from={v.at} layout="none">
          <Audio src={staticFile(`audio/ddba/${v.f}`)} volume={1} />
        </Sequence>
      ))}
      <Subtitles />
      <Sfx name="whoosh" at={SWIPE} volume={0.35} />
      <Sfx name="impact" at={HIT} volume={0.45} />
      {[CHAT, KIDS, SCORE, END].map((c) => (
        <Sfx key={c} name="whoosh-soft" at={c - 6} volume={0.3} />
      ))}
      {picker.taps.map((t) => (
        <Sfx
          key={t.frame}
          name="tick"
          at={PICK_FROM + t.frame - 1}
          volume={0.22}
        />
      ))}
      {MSGS.filter((m) => m.k === "a").map((m) => (
        <Sfx key={m.at} name="pop" at={m.at} volume={0.18} />
      ))}
      <Sfx name="cash" at={U4 + 24} volume={0.25} />
      {safeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnail
// The cover: old site up top (greyed, BEFORE), the new one below (AFTER),
// and Shield's booking card on a phone. Key content sits inside the 4:5 crop
// the profile grid shows (y 285–1635).
const Stamp: React.FC<{ text: string; color: string; rot: number }> = ({
  text,
  color,
  rot,
}) => (
  <div
    style={{
      padding: "4px 26px",
      border: `8px solid ${color}`,
      borderRadius: 14,
      color,
      ...head,
      fontStyle: "normal",
      fontSize: 92,
      lineHeight: 1,
      rotate: `${rot}deg`,
      background: "rgba(11,22,56,0.35)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    }}
  >
    {text}
  </div>
);

export const DDBeforeAfterThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DD.navy }}>
    <Halftone />
    <div style={{ position: "absolute", left: 50, right: 50, top: 300 }}>
      <div style={{ ...mono, color: DD.red, marginBottom: 14 }}>
        /// Before → after · Dental Defenders
      </div>
      <div style={{ ...head, fontSize: 132, lineHeight: 0.92, color: DD.text }}>
        Same dentist.
      </div>
      <div style={{ ...head, fontSize: 132, lineHeight: 0.98, color: DD.gold }}>
        New website.
      </div>
    </div>
    {/* before */}
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 640,
        rotate: "-4deg",
        filter: "saturate(0.6) brightness(0.9)",
      }}
    >
      <LaptopRec
        src="stories/ddold/desktop-scroll.mp4"
        width={560}
        from={0}
        trim={2}
      />
    </div>
    <div style={{ position: "absolute", left: 120, top: 740 }}>
      <Stamp text="Before" color={DD.red} rot={-10} />
    </div>
    {/* after */}
    <div style={{ position: "absolute", left: 300, top: 1010, rotate: "3deg" }}>
      <LaptopRec
        src="stories/ddnew/desktop-picker.mp4"
        width={640}
        from={0}
        trim={6}
      />
    </div>
    <div style={{ position: "absolute", left: 360, top: 1200 }}>
      <Stamp text="After" color={DD.gold} rot={8} />
    </div>
    {/* Shield's booking card, on a phone */}
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 640,
        scale: 0.6,
        transformOrigin: "0 0",
        rotate: "6deg",
      }}
    >
      <Phone>
        <ChatScreen at={U4 + 60} />
      </Phone>
    </div>
    <Burst at={-30} x={300} y={1080} word="POW!" size={200} rot={-12} />
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 1490,
        padding: "16px 26px",
        background: DD.red,
        color: "#fff",
        ...head,
        fontSize: 44,
        boxShadow: "6px 6px 0 rgba(0,0,0,0.4)",
        rotate: "-2deg",
      }}
    >
      + an AI agent that books the visit
    </div>
  </AbsoluteFill>
);

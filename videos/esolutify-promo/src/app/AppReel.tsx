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
import { PhoneShell, Tap, phoneViewportHeight } from "../components/Devices";
import { Icon, type IconName } from "../components/Icons";
import { LightSweep, WordReveal, useEntrance } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { clamp, theme } from "../theme";

// Mobile App Development — 9:16 Reel / Short, 24 s @ 30 fps (720 frames).
// Story (esolutify.com/mobile-app-development, "From a Sketch to the App
// Store"): got an app idea? → step 1, we sketch it with you → step 2, the
// sketch becomes a real app you can tap (book a visit) → step 3, it's in the
// App Store & Google Play and the bookings roll in → 50+ apps → "Don't
// imagine it. Tap it." (the page's two live demo apps).
// 100 BPM (18 frames a beat, 72 a bar): the sketch turns real on the drop
// (f144); each step and the CTA start on a bar. Copy stays in y 290–1160.

export const APP_DURATION = 720;
const BEAT = 18;
const DROP = 144;
const STORE = 288;
const PROOF = 432;
const CTA = 576;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;
const VH = phoneViewportHeight(PHONE_W);

// taps in the app, on the beat
const TAP_CARD = DROP + BEAT;
const TAP_SLOT = DROP + 3 * BEAT;
const TAP_BOOK = DROP + 5 * BEAT;
const TAP_GET = STORE + BEAT;
const OPEN_AT = STORE + 2.5 * BEAT;
const NOTES_AT = [3, 4, 5, 6].map((b) => STORE + b * BEAT);

const PAPER = "#F2EDE3";
const GRAPHITE = "#3B3833";
const APP_BG = "#0E0D0B";
const STORE_BLUE = "#0A84FF";

const ease = (frame: number, a: number, b: number, e = theme.ease.out) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });

// ---------------------------------------------------------------- text layer
const Window: React.FC<{
  from: number;
  until: number;
  children: React.ReactNode;
}> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= until + 6) return null;
  const p = ease(frame, until, until + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - p, translate: `0px ${-24 * p}px` }}>
      {children}
    </AbsoluteFill>
  );
};

const Head: React.FC<{ top?: number; children: React.ReactNode }> = ({
  top = 420,
  children,
}) => (
  <div style={{ position: "absolute", left: 80, right: 80, top }}>
    {children}
  </div>
);

const Sub: React.FC<{ text: string; at: number; top?: number }> = ({
  text,
  at,
  top = 652,
}) => {
  const p = useEntrance(at, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: 36,
        color: theme.colors.muted,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [20, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

// "STEP 2 OF 3" with a three-dot progress track.
const StepTag: React.FC<{ n: number; at: number }> = ({ n, at }) => {
  const frame = useCurrentFrame();
  const p = useEntrance(at, "snappy");
  const grow = ease(frame, at + 2, at + 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 368,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        fontFamily: theme.fonts.body,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: "0.22em",
        color: theme.colors.gold2,
        opacity: p,
        translate: `0px ${(1 - p) * 14}px`,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: i === n ? 12 + 26 * grow : 12,
              height: 12,
              borderRadius: 99,
              background: i <= n ? theme.colors.gold2 : theme.colors.line2,
            }}
          />
        ))}
      </div>
      STEP {n} OF 3
    </div>
  );
};

const Copy: React.FC = () => (
  <AbsoluteFill>
    {/* the hook, readable on frame 0 */}
    <Window from={-10} until={66}>
      <Head top={392}>
        <WordReveal words={["Got", "an"]} delay={-12} per={3} size={104} />
        <WordReveal
          words={[
            { text: "app", tone: "gold" },
            { text: "idea?", tone: "gold" },
          ]}
          delay={-6}
          per={3}
          size={116}
        />
      </Head>
      <Sub text="An app sounds complicated." at={20} />
    </Window>
    {/* step 1 — the sketch */}
    <Window from={72} until={138}>
      <StepTag n={1} at={72} />
      <Head>
        <WordReveal
          words={["We", "sketch", "it"]}
          delay={74}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            { text: "with", tone: "gold" },
            { text: "you.", tone: "gold" },
          ]}
          delay={82}
          per={3}
          size={96}
        />
      </Head>
      <Sub text="Every screen, before a single line of code." at={92} />
    </Window>
    {/* step 2 — the real app, on the drop */}
    <Window from={DROP} until={STORE - 6}>
      <StepTag n={2} at={DROP} />
      <Head>
        <WordReveal
          words={["A", "real", "app"]}
          delay={DROP}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            "you",
            "can",
            { text: "tap.", tone: "gold", underline: true },
          ]}
          delay={DROP + 6}
          per={3}
          size={96}
        />
      </Head>
      <Sub
        text="Designed, built and tested on iPhone & Android."
        at={DROP + 16}
      />
    </Window>
    {/* step 3 — the stores */}
    <Window from={STORE} until={PROOF - 6}>
      <StepTag n={3} at={STORE} />
      <Head>
        <WordReveal
          words={["In", "the", "App", "Store"]}
          delay={STORE}
          per={3}
          size={92}
        />
        <WordReveal
          words={[
            { text: "&", tone: "gold" },
            { text: "Google", tone: "gold" },
            { text: "Play.", tone: "gold" },
          ]}
          delay={STORE + 10}
          per={3}
          size={92}
        />
      </Head>
      <Sub
        text="Customers download it. You hear from them daily."
        at={STORE + 22}
      />
    </Window>
    {/* proof */}
    <Window from={PROOF} until={CTA - 6}>
      <Head top={400}>
        <WordReveal
          words={[
            { text: "50+", tone: "gold" },
            { text: "apps", tone: "gold" },
          ]}
          delay={PROOF}
          per={4}
          size={112}
        />
        <WordReveal
          words={["in", "the", "stores."]}
          delay={PROOF + 8}
          per={3}
          size={92}
        />
      </Head>
    </Window>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- step 1: the sketch
// Deterministic jitter so every stroke wobbles like a hand-drawn line.
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

type Mark = {
  kind: "rect" | "line" | "text";
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  dur: number;
  text?: string;
  size?: number;
  gold?: boolean;
};

// Laid out over the real app below, so the drop reads as "the sketch, built".
const MARKS: Mark[] = [
  { kind: "rect", x: 30, y: 24, w: 56, h: 56, at: 3, dur: 7 },
  {
    kind: "text",
    x: 102,
    y: 20,
    w: 170,
    h: 56,
    at: 9,
    dur: 8,
    text: "Your App",
    size: 50,
  },
  { kind: "rect", x: 30, y: 100, w: 400, h: 52, at: 18, dur: 8 },
  { kind: "line", x: 30, y: 206, w: 330, h: 8, at: 26, dur: 7 },
  { kind: "line", x: 30, y: 254, w: 390, h: 3, at: 32, dur: 5 },
  { kind: "line", x: 30, y: 284, w: 280, h: 3, at: 36, dur: 4 },
  { kind: "rect", x: 30, y: 330, w: 400, h: 196, at: 42, dur: 9 },
  { kind: "rect", x: 52, y: 352, w: 50, h: 50, at: 50, dur: 4 },
  { kind: "line", x: 52, y: 446, w: 220, h: 6, at: 54, dur: 4 },
  { kind: "line", x: 52, y: 476, w: 340, h: 3, at: 57, dur: 4 },
  { kind: "rect", x: 30, y: 544, w: 120, h: 56, at: 62, dur: 4 },
  {
    kind: "text",
    x: 52,
    y: 546,
    w: 80,
    h: 50,
    at: 65,
    dur: 4,
    text: "9:30",
    size: 40,
  },
  { kind: "rect", x: 170, y: 544, w: 120, h: 56, at: 68, dur: 4 },
  {
    kind: "text",
    x: 190,
    y: 546,
    w: 84,
    h: 50,
    at: 71,
    dur: 4,
    text: "11:00",
    size: 40,
  },
  { kind: "rect", x: 310, y: 544, w: 120, h: 56, at: 74, dur: 4 },
  {
    kind: "text",
    x: 336,
    y: 546,
    w: 70,
    h: 50,
    at: 77,
    dur: 4,
    text: "2:15",
    size: 40,
  },
  { kind: "rect", x: 30, y: 626, w: 400, h: 74, at: 82, dur: 8 },
  {
    kind: "text",
    x: 186,
    y: 630,
    w: 90,
    h: 64,
    at: 89,
    dur: 6,
    text: "Book",
    size: 54,
  },
  { kind: "line", x: 20, y: 834, w: 420, h: 3, at: 96, dur: 5 },
  {
    kind: "text",
    x: 118,
    y: 712,
    w: 300,
    h: 56,
    at: 104,
    dur: 10,
    text: "← one tap, booked!",
    size: 42,
    gold: true,
  },
];

const markPath = (m: Mark, seed: number) => {
  const j = (k: number, amp = 3.5) => rnd(seed * 31 + k) * amp;
  if (m.kind === "line") {
    return `M${m.x + j(1)} ${m.y + j(2)} Q${m.x + m.w / 2} ${m.y + j(3, 8)} ${m.x + m.w + j(4)} ${m.y + j(5)}`;
  }
  const { x, y, w, h } = m;
  return `M${x - 4 + j(1)} ${y + j(2)} L${x + w + j(3)} ${y + j(4)} L${x + w + j(5)} ${y + h + j(6)} L${x + j(7)} ${y + h + j(8)} L${x + j(9)} ${y - 5 + j(10)}`;
};

// Where the pencil tip is while it draws a mark.
const tipOf = (m: Mark, p: number): [number, number] => {
  if (m.kind !== "rect")
    return [m.x + m.w * p, m.y + m.h * (m.kind === "text" ? 0.75 : 0)];
  const per = 2 * (m.w + m.h);
  let d = p * per;
  if (d < m.w) return [m.x + d, m.y];
  d -= m.w;
  if (d < m.h) return [m.x + m.w, m.y + d];
  d -= m.h;
  if (d < m.w) return [m.x + m.w - d, m.y + m.h];
  return [m.x, m.y + m.h - (d - m.w)];
};

const Pencil: React.FC<{ x: number; y: number; opacity: number }> = ({
  x,
  y,
  opacity,
}) => (
  <svg
    width={60}
    height={170}
    viewBox="0 0 60 170"
    style={{
      position: "absolute",
      left: x - 30,
      top: y - 170,
      opacity,
      rotate: "28deg",
      transformOrigin: "30px 170px",
      filter: "drop-shadow(-6px 10px 8px rgba(0,0,0,0.25))",
    }}
  >
    <rect x={18} y={10} width={24} height={110} fill="#F2B632" />
    <rect x={18} y={10} width={8} height={110} fill="#F7CD62" />
    <rect x={18} y={0} width={24} height={14} rx={3} fill="#D98C8C" />
    <rect x={18} y={12} width={24} height={8} fill="#B9B2A6" />
    <path d="M18 120 L42 120 L30 166 Z" fill="#E9CFA3" />
    <path d="M26 150 L34 150 L30 168 Z" fill={GRAPHITE} />
  </svg>
);

const SketchScreen: React.FC = () => {
  const frame = useCurrentFrame();
  // the sketch is wiped away top-down as the real app takes its place
  const wipe = ease(frame, DROP - 6, DROP + 6, theme.ease.inOut);
  const active = MARKS.find((m) => frame >= m.at && frame < m.at + m.dur);
  const last = MARKS[MARKS.length - 1];
  const idle = frame >= last.at + last.dur;
  const tip = active
    ? tipOf(
        active,
        ease(frame, active.at, active.at + active.dur, theme.ease.soft),
      )
    : idle
      ? tipOf(last, 1)
      : tipOf(MARKS[0], 0);
  const lift = idle
    ? ease(frame, last.at + last.dur, last.at + last.dur + 14)
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        clipPath: `inset(${wipe * 100}% 0 0 0)`,
        background: PAPER,
        backgroundImage:
          "radial-gradient(circle, rgba(59,56,51,0.14) 1.4px, transparent 1.6px)",
        backgroundSize: "26px 26px",
      }}
    >
      <svg
        width={PHONE_W}
        height={VH}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {MARKS.filter((m) => m.kind !== "text").map((m, i) => {
          const p = ease(frame, m.at, m.at + m.dur, theme.ease.soft);
          if (p <= 0) return null;
          return [0, 1].map((pass) => (
            <path
              key={`${i}-${pass}`}
              d={markPath(m, i * 2 + pass)}
              pathLength={1}
              fill="none"
              stroke={GRAPHITE}
              strokeWidth={pass ? 1.6 : m.kind === "line" ? m.h : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 1"
              strokeDashoffset={1 - p}
              opacity={pass ? 0.35 : 0.85}
            />
          ));
        })}
      </svg>
      {MARKS.filter((m) => m.kind === "text").map((m, i) => {
        const p = ease(frame, m.at, m.at + m.dur, theme.ease.soft);
        if (p <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: m.x,
              top: m.y,
              height: m.h,
              whiteSpace: "nowrap",
              fontFamily: theme.fonts.hand,
              fontWeight: 700,
              fontSize: m.size,
              lineHeight: `${m.h}px`,
              color: m.gold ? "#B07A1E" : GRAPHITE,
              clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`,
            }}
          >
            {m.text}
          </div>
        );
      })}
      {wipe < 0.02 ? (
        <Pencil
          x={tip[0] + lift * 60}
          y={tip[1] + lift * 140}
          opacity={1 - lift}
        />
      ) : null}
      {/* the "build" line sweeping down */}
      {wipe > 0 && wipe < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: wipe * VH - 3,
            height: 6,
            background: theme.gradients.gold,
            boxShadow: `0 0 30px 10px ${theme.colors.glow}`,
          }}
        />
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- step 2: the app
// A recreation of the page's live "Northline Studio" demo. `f` is the frame
// the screen is shown at, so the store can show stills of it as screenshots.
const SLOTS = ["9:30 am", "11:00 am", "2:15 pm"];

const AppScreen: React.FC<{ f: number; taps?: boolean }> = ({ f, taps }) => {
  const { fps } = useVideoConfig();
  const picked = f >= TAP_CARD;
  const slotIn = spring({
    frame: f - (TAP_CARD + 4),
    fps,
    config: theme.spring.snappy,
  });
  const slot = f >= TAP_SLOT;
  const press = (at: number) =>
    1 - 0.05 * interpolate(f - at, [-3, 0, 5], [0, 1, 0], clamp);
  const check = spring({
    frame: f - TAP_CARD,
    fps,
    config: theme.spring.bouncy,
  });
  const sheet = spring({
    frame: f - (TAP_BOOK + 4),
    fps,
    config: theme.spring.smooth,
  });
  const tick = spring({
    frame: f - (TAP_BOOK + 12),
    fps,
    config: theme.spring.bouncy,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        overflow: "hidden",
        background: `radial-gradient(380px 300px at 50% 0%, rgba(200,151,58,0.16), transparent 70%), ${APP_BG}`,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      {/* header */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 24,
          width: 56,
          height: 56,
          borderRadius: 16,
          background: theme.gradients.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 34,
          color: "#0A0A0A",
        }}
      >
        n
      </div>
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 22,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 32,
        }}
      >
        northline.
      </div>
      <div
        style={{
          position: "absolute",
          left: 102,
          top: 62,
          fontSize: 13,
          letterSpacing: "0.2em",
          color: theme.colors.muted,
        }}
      >
        WELLNESS STUDIO
      </div>
      {/* customer / business toggle */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 100,
          width: 400,
          height: 52,
          borderRadius: 99,
          background: "#1A1916",
          border: `1px solid ${theme.colors.line}`,
          display: "flex",
          padding: 5,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: 99,
            background: theme.gradients.gold,
            color: "#0A0A0A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Customer view
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.muted,
          }}
        >
          Business view
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 176,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: theme.colors.gold2,
        }}
      >
        NORTHLINE WELLNESS STUDIO
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 198,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 38,
          letterSpacing: "-0.02em",
        }}
      >
        A little time for you.
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 250,
          width: 390,
          fontSize: 19,
          lineHeight: 1.45,
          color: theme.colors.muted,
        }}
      >
        Choose your care. We’ll make room for the rest.
      </div>
      {/* service card */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 330,
          width: 400,
          height: 196,
          borderRadius: 22,
          background: picked
            ? "linear-gradient(180deg, #221C11, #17140E)"
            : theme.colors.surface2,
          border: `2px solid ${picked ? theme.colors.gold2 : theme.colors.line2}`,
          scale: press(TAP_CARD),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 22,
            width: 50,
            height: 50,
            borderRadius: 14,
            background: theme.colors.goldSoft,
            border: `1.5px solid ${theme.colors.goldLine}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="sparkle"
            size={28}
            color={theme.colors.gold2}
            stroke={2}
          />
        </div>
        {picked ? (
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 22,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: theme.colors.gold2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: check,
            }}
          >
            <Icon name="check" size={22} color="#0A0A0A" stroke={3} />
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 88,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: theme.colors.muted,
          }}
        >
          SKIN & SELF-CARE
        </div>
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 108,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 28,
          }}
        >
          Signature facial
        </div>
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 18,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 19,
            color: theme.colors.muted,
          }}
        >
          <span>60 min</span>
          <span style={{ color: theme.colors.text, fontWeight: 700 }}>
            $120.00
          </span>
        </div>
      </div>
      {/* time slots */}
      {SLOTS.map((s, i) => {
        const on = slot && i === 0;
        return (
          <div
            key={s}
            style={{
              position: "absolute",
              left: 30 + i * 140,
              top: 544,
              width: 120,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              background: on ? theme.gradients.gold : theme.colors.surface2,
              color: on ? "#0A0A0A" : theme.colors.text,
              border: `1px solid ${on ? "transparent" : theme.colors.line2}`,
              opacity: interpolate(slotIn, [0, 0.4], [0, 1], clamp),
              translate: `0px ${interpolate(slotIn, [0, 1], [24, 0])}px`,
              scale: i === 0 ? press(TAP_SLOT) : 1,
            }}
          >
            {s}
          </div>
        );
      })}
      {/* book */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 626,
          width: 400,
          height: 74,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 26,
          background: slot ? theme.gradients.gold : theme.colors.surface3,
          color: slot ? "#0A0A0A" : theme.colors.dim,
          boxShadow: slot ? `0 0 40px ${theme.colors.glow}` : "none",
          scale: press(TAP_BOOK),
        }}
      >
        <Icon
          name="calendarCheck"
          size={28}
          color={slot ? "#0A0A0A" : theme.colors.dim}
          stroke={2.2}
        />
        Book a visit
      </div>
      {/* tab bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: VH - 120,
          height: 120,
          background: "#121110",
          borderTop: `1px solid ${theme.colors.line}`,
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 16,
          fontSize: 16,
          color: theme.colors.muted,
        }}
      >
        {(
          [
            ["calendarCheck", "Book a visit", true],
            ["clock", "My appointments", false],
          ] as const
        ).map(([icon, label, on]) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "8px 22px",
              borderRadius: 16,
              background: on ? theme.colors.goldSoft : "transparent",
              color: on ? theme.colors.gold2 : theme.colors.muted,
            }}
          >
            <Icon
              name={icon}
              size={28}
              color={on ? theme.colors.gold2 : theme.colors.muted}
              stroke={2}
            />
            {label}
          </div>
        ))}
      </div>
      {/* booked: the confirmation sheet */}
      {f >= TAP_BOOK + 4 ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              opacity: sheet,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: interpolate(sheet, [0, 1], [VH, 300]),
              height: VH - 300,
              borderRadius: "34px 34px 0 0",
              background: "#171614",
              borderTop: `1px solid ${theme.colors.line2}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: theme.colors.ok,
                boxShadow: "0 0 50px rgba(60,207,142,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: tick,
              }}
            >
              <Icon name="check" size={56} color="#0A0A0A" stroke={3} />
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 44,
              }}
            >
              Booked!
            </div>
            <div
              style={{ marginTop: 8, fontSize: 22, color: theme.colors.muted }}
            >
              Signature facial · $120.00
            </div>
            <div
              style={{
                marginTop: 14,
                padding: "10px 22px",
                borderRadius: 99,
                background: theme.colors.goldSoft,
                border: `1px solid ${theme.colors.goldLine}`,
                fontSize: 22,
                fontWeight: 700,
                color: theme.colors.gold2,
              }}
            >
              Tomorrow · 9:30 am
            </div>
          </div>
        </>
      ) : null}
      {taps ? (
        <>
          <Tap x={250} y={430} at={TAP_CARD} size={90} />
          <Tap x={90} y={572} at={TAP_SLOT} size={80} />
          <Tap x={230} y={663} at={TAP_BOOK} size={90} />
        </>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- step 3: the store
type Note = { title: string; body: string; icon: IconName };
const NOTES: Note[] = [
  {
    title: "New booking",
    body: "Signature facial · tomorrow 9:30 am",
    icon: "bell",
  },
  { title: "Order paid", body: "$120.00 · Signature facial", icon: "check" },
  { title: "New booking", body: "Massage · Friday 2:15 pm", icon: "bell" },
  { title: "Order paid", body: "$85.00 · Massage", icon: "check" },
];

const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: size * 0.23,
      background: theme.gradients.gold,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: theme.fonts.display,
      fontWeight: 800,
      fontSize: size * 0.4,
      letterSpacing: "-0.02em",
      color: "#0A0A0A",
    }}
  >
    YB
  </div>
);

const Shot: React.FC<{ f: number; left: number }> = ({ f, left }) => {
  const w = 128;
  const s = w / PHONE_W;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 336,
        width: w,
        height: VH * s,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${theme.colors.line2}`,
      }}
    >
      <div
        style={{
          width: PHONE_W,
          height: VH,
          scale: s,
          transformOrigin: "0 0",
          position: "relative",
        }}
      >
        <AppScreen f={f} />
      </div>
    </div>
  );
};

const StoreScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loading = ease(frame, TAP_GET + 2, OPEN_AT, theme.ease.soft);
  const open = frame >= OPEN_AT;
  const getPress =
    1 - 0.08 * interpolate(frame - TAP_GET, [-3, 0, 5], [0, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        overflow: "hidden",
        background: "#0B0B0C",
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 22,
          fontSize: 21,
          color: STORE_BLUE,
        }}
      >
        ‹ Search
      </div>
      <div style={{ position: "absolute", left: 28, top: 68 }}>
        <AppIcon size={140} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 192,
          top: 74,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 34,
        }}
      >
        Your App
      </div>
      <div
        style={{
          position: "absolute",
          left: 192,
          top: 118,
          fontSize: 19,
          color: theme.colors.muted,
        }}
      >
        Your Business
      </div>
      <div
        style={{
          position: "absolute",
          left: 192,
          top: 160,
          width: 108,
          height: 44,
          borderRadius: 99,
          background: open || loading <= 0 ? STORE_BLUE : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 20,
          color: "#fff",
          scale: getPress,
        }}
      >
        {open ? (
          "OPEN"
        ) : loading > 0 ? (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `conic-gradient(${STORE_BLUE} ${loading * 360}deg, rgba(255,255,255,0.15) 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#0B0B0C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  background: STORE_BLUE,
                }}
              />
            </div>
          </div>
        ) : (
          "GET"
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 236,
          height: 1,
          background: theme.colors.line2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 252,
          display: "flex",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        {[
          ["RATINGS", "★★★★★"],
          ["APP STORE", "iPhone"],
          ["GOOGLE PLAY", "Android"],
        ].map(([k, v], i) => (
          <div key={k} style={{ width: 128 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: theme.colors.dim,
              }}
            >
              {k}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: i === 0 ? 22 : 24,
                fontWeight: 800,
                color: i === 0 ? theme.colors.gold2 : theme.colors.text,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <Shot f={DROP + 10} left={24} />
      <Shot f={TAP_SLOT + 6} left={166} />
      <Shot f={TAP_BOOK + 40} left={308} />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 622,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 24,
        }}
      >
        What’s New
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 656,
          fontSize: 19,
          color: theme.colors.muted,
        }}
      >
        Book in one tap. Pay in the app.
      </div>
      {/* notifications roll in over a dimmed store page, newest on top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5,5,5,0.6)",
          backdropFilter: "blur(5px)",
          opacity: ease(frame, NOTES_AT[0] - 2, NOTES_AT[0] + 8),
        }}
      />
      {NOTES.map((n, i) => {
        const at = NOTES_AT[i];
        if (frame < at - 2) return null;
        const p = spring({
          frame: frame - at,
          fps,
          config: theme.spring.snappy,
        });
        const below = NOTES_AT.filter((t, k) => k > i && frame >= t).length;
        const slide = NOTES_AT.slice(i + 1).reduce(
          (acc, t) =>
            acc +
            spring({ frame: frame - t, fps, config: theme.spring.snappy }),
          0,
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 12 + slide * 106 + interpolate(p, [0, 1], [-120, 0]),
              height: 96,
              borderRadius: 26,
              background: "rgba(40,39,37,0.94)",
              border: `1px solid ${theme.colors.line2}`,
              boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 18px",
              opacity:
                interpolate(p, [0, 0.3], [0, 1], clamp) * (below >= 3 ? 0 : 1),
              zIndex: 10 + i,
            }}
          >
            <AppIcon size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: theme.colors.dim,
                }}
              >
                <span>YOUR APP</span>
                <span>now</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 21,
                  fontWeight: 800,
                }}
              >
                <Icon
                  name={n.icon}
                  size={20}
                  color={
                    n.icon === "check" ? theme.colors.ok : theme.colors.gold2
                  }
                  stroke={2.4}
                />
                {n.title}
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: theme.colors.muted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {n.body}
              </div>
            </div>
          </div>
        );
      })}
      <Tap x={246} y={182} at={TAP_GET} size={80} />
    </div>
  );
};

// ---------------------------------------------------------------- the phone
const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame + 8, fps, config: theme.spring.smooth });
  const sink = ease(frame, CTA, CTA + 18, theme.ease.inOut);
  const push = ease(frame, STORE - 4, STORE + 10, theme.ease.inOut);
  const real = frame >= DROP - 6;
  const dim = 1 - 0.45 * ease(frame, PROOF, PROOF + 10) - 0.2 * sink;
  // a small pop as the sketch turns real
  const pop = interpolate(
    frame,
    [DROP - 2, DROP + 4, DROP + 14],
    [1, 1.04, 1],
    {
      ...clamp,
      easing: theme.ease.soft,
    },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_LEFT,
        top: PHONE_TOP + interpolate(enter, [0, 1], [220, 0]) + sink * 520,
        opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
        scale: pop,
        filter:
          dim < 0.99 ? `brightness(${dim}) blur(${4 * sink}px)` : undefined,
      }}
    >
      <PhoneShell
        width={PHONE_W}
        glow={real ? 0.5 : 0.12}
        statusBg={frame < DROP ? PAPER : push > 0.5 ? "#0B0B0C" : APP_BG}
      >
        {push < 1 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `${-push * 35}% 0px`,
              opacity: 1 - push * 0.7,
            }}
          >
            {real ? <AppScreen f={frame} taps /> : null}
            {frame < DROP + 8 ? <SketchScreen /> : null}
          </div>
        ) : null}
        {push > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `${(1 - push) * 100}% 0px`,
              boxShadow: "-20px 0 40px rgba(0,0,0,0.5)",
            }}
          >
            <StoreScreen />
          </div>
        ) : null}
      </PhoneShell>
    </div>
  );
};

// ---------------------------------------------------------------- proof cards
const CARDS: { icon: IconName; title: string; sub: string }[] = [
  { icon: "layers", title: "iOS & Android", sub: "Native or cross-platform" },
  {
    icon: "code",
    title: "You own the code",
    sub: "Source, designs and repo are yours",
  },
  {
    icon: "star",
    title: "5.0 on Google",
    sub: "15+ years · 98% client satisfaction",
  },
];

const ProofCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < PROOF || frame > CTA + 8) return null;
  const out = ease(frame, CTA - 6, CTA + 4, theme.ease.in);
  return (
    <>
      {CARDS.map((c, i) => {
        const p = spring({
          frame: frame - (PROOF + 12 + i * 9),
          fps,
          config: theme.spring.bouncy,
        });
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 150,
              width: 780,
              top: 720 + i * 128,
              height: 108,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 30px",
              background: theme.gradients.card,
              border: `1px solid ${theme.colors.line2}`,
              boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - out),
              translate: `${interpolate(p, [0, 1], [i % 2 ? 120 : -120, 0])}px 0px`,
              scale: interpolate(p, [0, 1], [0.9, 1]),
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                flexShrink: 0,
                background: theme.colors.goldSoft,
                border: `1.5px solid ${theme.colors.goldLine}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={c.icon}
                size={34}
                color={theme.colors.gold2}
                stroke={2.2}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 38,
                  color: theme.colors.text,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 26,
                  color: theme.colors.muted,
                }}
              >
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- CTA
const DemoTile: React.FC<{
  letter: string;
  bg: string;
  name: string;
  kind: string;
}> = ({ letter, bg, name, kind }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div
      style={{
        width: 70,
        height: 70,
        borderRadius: 18,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 40,
        color: letter === "n" ? "#0A0A0A" : "#fff",
      }}
    >
      {letter}
    </div>
    <div style={{ textAlign: "left" }}>
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 34,
          color: theme.colors.text,
          lineHeight: 1.1,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontSize: 22,
          color: theme.colors.muted,
        }}
      >
        {kind}
      </div>
    </div>
  </div>
);

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pill = spring({
    frame: frame - (CTA + 22),
    fps,
    config: theme.spring.bouncy,
  });
  const btn = spring({
    frame: frame - (CTA + 44),
    fps,
    config: theme.spring.snappy,
  });
  const sub = useEntrance(CTA + 32, "smooth");
  const url = useEntrance(CTA + 54, "smooth");
  const live = 0.6 + 0.4 * Math.sin((frame - CTA) / 5);
  if (frame < CTA) return null;
  return (
    <AbsoluteFill>
      <Head top={440}>
        <WordReveal
          words={["Don’t", "imagine", "it."]}
          delay={CTA + 4}
          per={3}
          size={88}
        />
        <WordReveal
          words={[
            { text: "Tap", tone: "gold" },
            { text: "it.", tone: "gold" },
          ]}
          delay={CTA + 12}
          per={3}
          size={112}
        />
      </Head>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: 706,
          height: 144,
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: theme.colors.surface2,
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          opacity: interpolate(pill, [0, 0.4], [0, 1], clamp),
          scale: interpolate(pill, [0, 1], [0.8, 1]),
        }}
      >
        <DemoTile
          letter="n"
          bg={theme.gradients.gold}
          name="Northline"
          kind="Book a visit"
        />
        <div style={{ width: 1, height: 84, background: theme.colors.line2 }} />
        <DemoTile
          letter="f"
          bg="#2F4A7A"
          name="Fieldwork"
          kind="Build a quote"
        />
        <div
          style={{
            position: "absolute",
            right: 30,
            top: -20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 99,
            background: "#112019",
            border: "1px solid rgba(60,207,142,0.5)",
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 22,
            color: theme.colors.ok,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: theme.colors.ok,
              opacity: live,
            }}
          />
          Live demo
        </div>
        <Tap x={160} y={72} at={CTA + 80} size={100} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 872,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 32,
          color: theme.colors.muted,
          opacity: sub,
        }}
      >
        Two of our apps, running. No account needed.
      </div>
      <div
        style={{
          position: "absolute",
          left: 170,
          width: 740,
          top: 948,
          height: 108,
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: theme.gradients.gold,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 44,
          color: "#0A0A0A",
          opacity: interpolate(btn, [0, 0.4], [0, 1], clamp),
          scale: interpolate(btn, [0, 1], [0.85, 1]),
        }}
      >
        Get a free app demo
        <Icon name="arrow" size={42} color="#0A0A0A" stroke={2.8} />
        <LightSweep start={CTA + 70} duration={24} width={130} opacity={0.7} />
        <LightSweep start={CTA + 120} duration={24} width={130} opacity={0.7} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1082,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: theme.colors.text,
          opacity: url,
        }}
      >
        esolutify.com/mobile-app-development
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: frame - CTA, fps, config: theme.spring.bouncy });
  const w = interpolate(grow, [0, 1], [200, 330]);
  return (
    <Img
      src={staticFile("brand/logo.png")}
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: interpolate(grow, [0, 1], [290, 300]),
        width: w,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
      }}
    />
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [DROP - 4, DROP, DROP + 8], [0, 0.8, 0], {
    ...clamp,
    easing: theme.ease.soft,
  });
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 62%, rgba(255,240,205,0.9), rgba(232,184,75,0.45) 40%, rgba(10,10,10,0) 78%)",
        opacity: o,
      }}
    />
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["pencil", 3, 0.5],
  ["pencil", 18, 0.45, 1.1],
  ["pencil", 42, 0.5, 0.95],
  ["pencil", 62, 0.45, 1.15],
  ["pencil", 82, 0.5],
  ["pencil", 104, 0.45, 1.05],
  ["whoosh", DROP - 10, 0.45],
  ["pop", TAP_CARD - 2, 0.45, 1.2],
  ["pop", TAP_SLOT - 2, 0.45, 1.35],
  ["pop", TAP_BOOK - 2, 0.5, 1.1],
  ["chime", TAP_BOOK + 8, 0.5],
  ["whoosh-soft", STORE - 6, 0.4],
  ["pop", TAP_GET - 2, 0.45, 1.2],
  ["blip", OPEN_AT - 1, 0.35, 1.3],
  ...NOTES_AT.map((t, i): Cue => ["ping", t - 2, 0.32, 1 + (i % 2) * 0.12]),
  ["whoosh-soft", PROOF + 8, 0.3],
  ["pop", PROOF + 12, 0.4],
  ["pop", PROOF + 21, 0.4, 1.1],
  ["pop", PROOF + 30, 0.4, 1.2],
  ["shimmer", CTA, 0.35],
  ["pop", CTA + 20, 0.5],
  ["pop", CTA + 78, 0.4, 1.3],
];

export const AppReel: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <PhoneLayer />
      <ProofCards />
      {/* the platform caption/UI lands on dark */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1540,
          bottom: 0,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.7) 55%, rgba(10,10,10,0.9) 100%)",
        }}
      />
      <Logo />
      <Copy />
      <Cta />
      <Flash />
    </Stage>
    <Audio src={staticFile("audio/app-music-24.wav")} volume={0.8} />
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

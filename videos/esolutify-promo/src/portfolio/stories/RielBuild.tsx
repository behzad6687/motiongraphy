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
import plumb from "../../../public/stories/rielbuild/desktop-plumb.json";

// Story: Riel Build (esolutify.com/demo/rielbuild), 20 s, 9:16.
// A blueprint: the site's charcoal and gold on a drafting grid, with
// dimension lines drawing themselves around each device. The site's idea is
// the plumb line ("your home, built plumb"), so a plumb bob opens the Story
// and gold construction lines sweep between scenes.
//   0–150    a plumb bob drops and settles (angle read-out); the phone rises
//            along the line playing the dusk scroll film
//   150–300  laptop: the cursor presses and holds the site's plumb button;
//            the ring fills, the bob settles, four promises light up
//   300–487  tablet: the four-step process and the project gallery
//   487–600  end card, drafted like a plan
// Music: story-workshop.wav (scripts/gen_story_music.py workshop): the bob
// settles 1.9 s, drop 5 s (150), lift 10 s (300), end card 16.2 s (487).

export const RIEL_DURATION = 600;
const ACT2 = 150;
const ACT3 = 300;
const END = 487;
const SRC = "stories/rielbuild";

const RB = {
  night: "#131A17",
  gold: "#C9963C",
  goldLight: "#E2B866",
  cream: "#F1ECE3",
  muted: "#97A39C",
  line: "rgba(201,150,60,0.75)",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 22,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};
const heavy: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

// ---------------------------------------------------------------- drafting
const Grid: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RB.night }}>
    <AbsoluteFill
      style={{
        backgroundImage: [
          "linear-gradient(rgba(241,236,227,0.07) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(241,236,227,0.07) 1px, transparent 1px)",
          "linear-gradient(rgba(241,236,227,0.03) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(241,236,227,0.03) 1px, transparent 1px)",
        ].join(","),
        backgroundSize: "200px 200px, 200px 200px, 40px 40px, 40px 40px",
        backgroundPosition: "-60px -40px",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 55%, rgba(201,150,60,0.10), transparent 60%)",
      }}
    />
  </AbsoluteFill>
);

// A dimension line with end ticks and a label, drawn in from `at`.
const Dim: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  at: number;
  out?: number;
}> = ({ x1, y1, x2, y2, label, at, out = 9999 }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + 24, theme.ease.inOut);
  const fade = 1 - ease(frame, out, out + 10);
  if (p <= 0 || fade <= 0) return null;
  const vertical = x1 === x2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const tick = 14;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0, opacity: fade }}
      >
        <g stroke={RB.line} strokeWidth={2} fill="none">
          <path
            d={`M ${x1} ${y1} L ${x2} ${y2}`}
            strokeDasharray={len}
            strokeDashoffset={len * (1 - p)}
          />
          {vertical ? (
            <>
              <path d={`M ${x1 - tick} ${y1} L ${x1 + tick} ${y1}`} />
              <path
                d={`M ${x2 - tick} ${y2} L ${x2 + tick} ${y2}`}
                opacity={p >= 0.98 ? 1 : 0}
              />
            </>
          ) : (
            <>
              <path d={`M ${x1} ${y1 - tick} L ${x1} ${y1 + tick}`} />
              <path
                d={`M ${x2} ${y2 - tick} L ${x2} ${y2 + tick}`}
                opacity={p >= 0.98 ? 1 : 0}
              />
            </>
          )}
        </g>
      </svg>
      <div
        style={{
          ...mono,
          fontSize: 20,
          position: "absolute",
          left: mx,
          top: my,
          translate: "-50% -50%",
          rotate: vertical ? "-90deg" : undefined,
          padding: "2px 10px",
          background: RB.night,
          color: RB.goldLight,
          opacity: ease(frame, at + 14, at + 24) * fade,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
};

const Caption: React.FC<{
  from: number;
  to: number;
  eyebrow?: string;
  a: string;
  b: string;
  width?: number;
  size?: number;
}> = ({ from, to, eyebrow, a, b, width = 940, size = 88 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from + 2, from + 16);
  const inB = ease(frame, from + 8, from + 22);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        width,
        top: 290,
        opacity: 1 - out,
        zIndex: 6,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            ...mono,
            color: RB.gold,
            marginBottom: 18,
            opacity: ease(frame, from, from + 12),
          }}
        >
          — {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...heavy,
          fontSize: size,
          lineHeight: 1,
          color: RB.cream,
          opacity: inA,
          translate: `0px ${(1 - inA) * 26}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...heavy,
          fontSize: size,
          lineHeight: 1.06,
          color: RB.gold,
          opacity: inB,
          translate: `0px ${(1 - inB) * 26}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// Scene changes: a gold construction line sweeps across and the next scene
// is drawn in behind it.
const sweep = (frame: number, at: number) =>
  ease(frame, at, at + 16, theme.ease.inOut);
const Scene: React.FC<{
  from: number;
  to?: number;
  dir: "down" | "right";
  outDir?: "down" | "right";
  children: React.ReactNode;
}> = ({ from, to, dir, outDir = "right", children }) => {
  const frame = useCurrentFrame();
  const pin = from === 0 ? 1 : sweep(frame, from - 8);
  const pout = to === undefined ? 0 : sweep(frame, to - 8);
  if (pin <= 0 || pout >= 1) return null;
  const clipIn =
    dir === "down"
      ? `inset(0 0 ${(1 - pin) * 100}% 0)`
      : `inset(0 ${(1 - pin) * 100}% 0 0)`;
  const clipOut =
    outDir === "down"
      ? `inset(${pout * 100}% 0 0 0)`
      : `inset(0 0 0 ${pout * 100}%)`;
  return (
    <AbsoluteFill style={{ clipPath: pout > 0 ? clipOut : clipIn }}>
      {children}
    </AbsoluteFill>
  );
};
const SweepLine: React.FC<{ at: number; dir: "down" | "right" }> = ({
  at,
  dir,
}) => {
  const frame = useCurrentFrame();
  const p = sweep(frame, at - 8);
  if (p <= 0 || p >= 1) return null;
  const glow = "0 0 24px rgba(226,184,102,0.9), 0 0 60px rgba(201,150,60,0.6)";
  return dir === "down" ? (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: p * 1920 - 2,
        height: 4,
        background: RB.goldLight,
        boxShadow: glow,
        zIndex: 9,
      }}
    />
  ) : (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: p * 1080 - 2,
        width: 4,
        background: RB.goldLight,
        boxShadow: glow,
        zIndex: 9,
      }}
    />
  );
};

// ---------------------------------------------------------------- act 1
const BOB_Y = 470;
const angleAt = (frame: number) => {
  const t = Math.max(0, frame - 8);
  return 14 * Math.exp(-t / 16) * Math.cos((2 * Math.PI * t) / 26);
};
const Plumb: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = ease(frame, 0, 18, theme.ease.out);
  const len = BOB_Y * drop;
  const a = angleAt(frame);
  return (
    <div
      style={{
        position: "absolute",
        left: 540,
        top: 0,
        transformOrigin: "0 0",
        rotate: `${a}deg`,
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -1,
          top: 0,
          width: 2,
          height: len,
          background: RB.goldLight,
        }}
      />
      <svg
        width={44}
        height={64}
        viewBox="0 0 30 44"
        style={{ position: "absolute", left: -22, top: len - 8 }}
      >
        <path d="M15 0v10" stroke={RB.goldLight} strokeWidth={2} />
        <path
          d="M15 10c-6.4 0-11 5-11 10.2C4 25.3 15 44 15 44s11-18.7 11-23.8C26 15 21.4 10 15 10z"
          fill={RB.gold}
        />
      </svg>
    </div>
  );
};
const AngleReadout: React.FC = () => {
  const frame = useCurrentFrame();
  const a = Math.abs(angleAt(frame));
  const settled = frame > 57;
  return (
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 300,
        textAlign: "right",
        zIndex: 6,
        opacity: ease(frame, 6, 16),
      }}
    >
      <div style={{ ...mono, fontSize: 20, color: RB.muted }}>Angle</div>
      <div
        style={{
          ...mono,
          fontSize: 44,
          letterSpacing: "0.04em",
          color: settled ? RB.goldLight : RB.cream,
          marginTop: 8,
        }}
      >
        {settled ? "0.0°" : `${a.toFixed(1)}°`}
      </div>
      <div
        style={{
          ...mono,
          fontSize: 20,
          marginTop: 8,
          color: RB.gold,
          opacity: ease(frame, 57, 64),
        }}
      >
        Plumb ✓
      </div>
    </div>
  );
};

const PHONE_W = 450;
const PHONE_X = 540 - (PHONE_W * 1.07) / 2;
const PHONE_Y = 600;
const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 26, fps, config: theme.spring.smooth });
  const outerH = (PHONE_W * 844) / 390 + PHONE_W * 0.07;
  return (
    <AbsoluteFill>
      <Grid />
      <div
        style={{
          position: "absolute",
          left: PHONE_X,
          top: PHONE_Y + (1 - rise) * 1300,
        }}
      >
        <PhoneRec src={`${SRC}/mobile-film.mp4`} width={PHONE_W} from={20} />
      </div>
      <Dim
        x1={PHONE_X}
        y1={PHONE_Y - 34}
        x2={PHONE_X + PHONE_W * 1.07}
        y2={PHONE_Y - 34}
        label="390 px"
        at={64}
      />
      <Dim
        x1={PHONE_X + PHONE_W * 1.07 + 46}
        y1={PHONE_Y}
        x2={PHONE_X + PHONE_W * 1.07 + 46}
        y2={PHONE_Y + outerH}
        label="844 px · built plumb"
        at={74}
      />
      <Plumb />
      <AngleReadout />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2
const LAP_W = 1000;
const LAP_X = 540 - (LAP_W * 1.16) / 2;
const LAP_Y = 720;
const LAP_SCREEN = {
  x: LAP_X + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP_Y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const PLUMB_FROM = ACT2 - 4;
const press = plumb.taps[0];
const PRESS_AT = PLUMB_FROM + press.frame;
const RELEASE_AT = PRESS_AT + (press.hold ?? 80);

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = ease(frame, PRESS_AT - 18, PRESS_AT - 2, theme.ease.inOut);
  const leave = ease(frame, RELEASE_AT + 4, RELEASE_AT + 22, theme.ease.inOut);
  const tx = LAP_SCREEN.x + press.x * LAP_SCREEN.s;
  const ty = LAP_SCREEN.y + press.y * LAP_SCREEN.s;
  const x = tx + (1 - arrive) * 260 + leave * 300;
  const y = ty + (1 - arrive) * 240 + leave * 160;
  const down = frame >= PRESS_AT && frame < RELEASE_AT;
  const held = interpolate(frame, [PRESS_AT, RELEASE_AT], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 5,
        opacity:
          ease(frame, PRESS_AT - 20, PRESS_AT - 12) *
          (1 - ease(frame, RELEASE_AT + 14, RELEASE_AT + 24)),
      }}
    >
      {down ? (
        <svg
          width={92}
          height={92}
          style={{
            position: "absolute",
            left: -46,
            top: -46,
            rotate: "-90deg",
          }}
        >
          <circle
            cx={46}
            cy={46}
            r={40}
            fill="none"
            stroke="rgba(241,236,227,0.25)"
            strokeWidth={4}
          />
          <circle
            cx={46}
            cy={46}
            r={40}
            fill="none"
            stroke={RB.goldLight}
            strokeWidth={4}
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - held)}
          />
        </svg>
      ) : null}
      <svg
        width={44}
        height={52}
        viewBox="0 0 22 26"
        style={{
          position: "absolute",
          left: -4,
          top: -2,
          scale: down ? 0.88 : 1,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
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

const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const push = ease(frame, ACT2, ACT3, theme.ease.soft);
  const lapH = LAP_W * 0.625 + LAP_W * 0.052 + LAP_W * 0.035;
  return (
    <AbsoluteFill>
      <Grid />
      <AbsoluteFill
        style={{ scale: 1 + push * 0.06, transformOrigin: "50% 60%" }}
      >
        <div style={{ position: "absolute", left: LAP_X, top: LAP_Y }}>
          <LaptopRec
            src={`${SRC}/desktop-plumb.mp4`}
            width={LAP_W}
            from={PLUMB_FROM}
          />
        </div>
        <Dim
          x1={LAP_SCREEN.x}
          y1={LAP_Y + lapH + 40}
          x2={LAP_SCREEN.x + 1440 * LAP_SCREEN.s}
          y2={LAP_Y + lapH + 40}
          label="1440 px · press and hold"
          at={ACT2 + 14}
        />
        <Cursor />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 560;
const TAB_X = 540 - (TAB_W * 1.09) / 2 + 40;
const TAB_Y = 600;
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({
    frame: frame - ACT3 + 6,
    fps,
    config: theme.spring.smooth,
  });
  const tabH = (TAB_W * 1180) / 820 + TAB_W * 0.09;
  return (
    <AbsoluteFill>
      <Grid />
      <div
        style={{
          position: "absolute",
          left: TAB_X,
          top: TAB_Y + (1 - rise) * 300,
          opacity: interpolate(rise, [0, 0.3], [0, 1], clamp),
        }}
      >
        <TabletRec
          src={`${SRC}/tablet-steps.mp4`}
          width={TAB_W}
          from={ACT3 - 4}
          hold
        />
      </div>
      <Dim
        x1={TAB_X - 50}
        y1={TAB_Y}
        x2={TAB_X - 50}
        y2={TAB_Y + tabH}
        label="4 steps · no surprises"
        at={ACT3 + 16}
      />
      <Dim
        x1={TAB_X}
        y1={TAB_Y + tabH + 40}
        x2={TAB_X + TAB_W * 1.09}
        y2={TAB_Y + tabH + 40}
        label="820 px"
        at={ACT3 + 26}
      />
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
      translate: `0px ${(1 - t) * 40}px`,
    };
  };
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill>
      <Grid />
      <Dim x1={70} y1={250} x2={1010} y2={250} label="your website" at={END} />
      <Dim
        x1={1040}
        y1={290}
        x2={1040}
        y2={1560}
        label="built plumb"
        at={END + 6}
      />
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          position: "absolute",
          left: 80,
          top: 320,
          width: 230,
          ...up(0),
        }}
      />
      <div style={{ position: "absolute", left: 80, right: 90, top: 480 }}>
        <div style={{ ...mono, color: RB.gold, ...up(3) }}>
          — Riel Build · built by eSolutify
        </div>
        <div
          style={{
            ...heavy,
            marginTop: 26,
            fontSize: 116,
            lineHeight: 0.98,
            color: RB.cream,
            ...up(6),
          }}
        >
          Let&apos;s build
          <br />
          your website
          <br />
          <span style={{ color: RB.gold }}>right.</span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: RB.muted,
            ...up(12),
          }}
        >
          See your new site free,
          <br />
          before you pay a dollar.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 1250,
          height: 108,
          padding: "0 44px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: RB.gold,
          boxShadow: "0 20px 60px -20px rgba(201,150,60,0.7)",
          ...heavy,
          letterSpacing: "-0.01em",
          fontSize: 46,
          color: RB.night,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={42} color={RB.night} stroke={2.8} />
        <LightSweep start={END + 44} duration={24} width={140} opacity={0.6} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 1392,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: RB.cream,
          ...up(20),
        }}
      >
        esolutify.com/free-demo
      </div>
      {/* the link sticker goes here */}
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 1460,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...mono,
          color: RB.gold,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={RB.gold} stroke={2.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RielBuildStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: RB.night }}>
    <Scene from={0} to={ACT2} dir="down" outDir="down">
      <Act1 />
    </Scene>
    <Scene from={ACT2} to={ACT3} dir="down" outDir="right">
      <Act2 />
    </Scene>
    <Scene from={ACT3} to={END} dir="right" outDir="down">
      <Act3 />
    </Scene>
    <Scene from={END} dir="down">
      <EndCard />
    </Scene>
    <SweepLine at={ACT2} dir="down" />
    <SweepLine at={ACT3} dir="right" />
    <SweepLine at={END} dir="down" />
    <Caption
      from={2}
      to={ACT2 - 10}
      eyebrow="Riel Build · Toronto"
      a="A website"
      b="built plumb."
      width={430}
      size={74}
    />
    <Caption
      from={ACT2 + 4}
      to={PRESS_AT + 50}
      a="Press and hold."
      b="Watch it settle."
    />
    <Caption
      from={PRESS_AT + 52}
      to={ACT3 - 10}
      a="Four promises,"
      b="in writing."
    />
    <Caption from={ACT3 + 4} to={END - 10} a="Every step," b="on the page." />
    <Audio src={staticFile("audio/story-workshop.wav")} volume={0.85} />
    <Sfx name="whoosh-soft" at={ACT2 - 10} volume={0.3} />
    <Sfx name="whoosh-soft" at={ACT3 - 10} volume={0.3} />
    <Sfx name="whoosh" at={END - 10} volume={0.26} />
    <Sfx name="tick" at={PRESS_AT - 1} volume={0.25} />
    <Sfx name="chime" at={PRESS_AT + 44} volume={0.2} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
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
import { LaptopRec, PhoneRec, TabletRec } from "../kit";
import studio from "../../../public/stories/crown/desktop-studio.json";

// Story: Crown (esolutify.com/demo/crown), 20 s, 9:16. Black and champagne,
// cut like a luxury product film. Scenes change with "rib cuts": the frame
// splits into vertical slats, like the suitcase's ribbed shell.
//   0–140    the phone's scroll film on a slow 3D turntable
//   140–405  the 3D studio on a laptop; its model and its options panel lift
//            off the screen as two floating cards, and the suitcase is
//            customised live: shell, frame, handles, tag, initials
//   405–506  the 3D showcase on a tablet
//   506–600  end card: "Your website, made to measure."
// Music: story-atelier.wav (scripts/gen_story_music.py atelier): drop 4.5 s
// (frame 135), lift 13.5 s (405), end card 16.9 s (506).

export const CROWN_DURATION = 600;
const STUDIO = 140;
const SHOW = 405;
const END = 506;
const SRC = "stories/crown";

const CR = {
  ink: "#0D0C0B",
  ink2: "#191715",
  champ: "#CDB892",
  champLight: "#EADFC8",
  paper: "#F3EEE6",
  muted: "#8F877C",
};
const CHAMP = "linear-gradient(135deg, #A88F63 0%, #EADFC8 50%, #BFA678 100%)";
const champText: React.CSSProperties = {
  backgroundImage: CHAMP,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 24,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};
const didone: React.CSSProperties = {
  fontFamily: theme.fonts.serif,
  fontWeight: 400,
  letterSpacing: "0.005em",
};

// ---------------------------------------------------------------- rib cuts
// Renders its children as vertical slats that slide in (from alternate
// ends) between `inAt` and `inAt + 20`, and out after `outAt`.
const SLATS = 6;
const Ribs: React.FC<{
  inAt?: number;
  outAt?: number;
  children: React.ReactNode;
}> = ({ inAt, outAt, children }) => {
  const frame = useCurrentFrame();
  if (outAt !== undefined && frame > outAt + 26) return null;
  if (inAt !== undefined && frame < inAt) return null;
  return (
    <AbsoluteFill>
      {new Array(SLATS).fill(0).map((_, i) => {
        const dir = i % 2 ? -1 : 1;
        const pin =
          inAt === undefined
            ? 1
            : ease(frame, inAt + i * 2, inAt + 14 + i * 2, theme.ease.out);
        const pout =
          outAt === undefined
            ? 0
            : ease(frame, outAt + i * 2, outAt + 14 + i * 2, theme.ease.in);
        const w = 100 / SLATS;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(0 ${100 - (i + 1) * w}% 0 ${i * w}%)`,
              translate: `0px ${dir * ((1 - pin) * 1920 + pout * 1920)}px`,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: CR.ink, overflow: "hidden" }}>
      {/* faint ribbed shell, drifting */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 3px, transparent 3px 46px)",
          backgroundPosition: `${frame * 0.4}px 0px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(205,184,146,0.13), transparent 62%)",
        }}
      />
    </AbsoluteFill>
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
  const inA = ease(frame, from + 4, from + 20);
  const inB = ease(frame, from + 12, from + 28);
  const typed = eyebrow
    ? Math.floor(
        interpolate(frame, [from, from + 24], [0, eyebrow.length], clamp),
      )
    : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 286,
        opacity: 1 - out,
        zIndex: 5,
      }}
    >
      {eyebrow ? (
        <div style={{ ...mono, color: CR.champ, height: 34 }}>
          {eyebrow.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>_</span>
        </div>
      ) : null}
      <div
        style={{
          ...didone,
          marginTop: eyebrow ? 18 : 0,
          fontSize: 92,
          lineHeight: 1.02,
          color: CR.paper,
          opacity: inA,
          translate: `0px ${(1 - inA) * 24}px`,
          filter: `blur(${(1 - inA) * 8}px)`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...didone,
          fontStyle: "italic",
          fontSize: 92,
          lineHeight: 1.08,
          ...champText,
          opacity: inB,
          clipPath: `inset(0 ${(1 - inB) * 100}% 0 0)`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- act 1
const Turntable: React.FC = () => {
  const frame = useCurrentFrame();
  const t = ease(frame, 0, 120, theme.ease.soft);
  const ry = -34 + 34 * t + Math.sin(frame / 50) * 2;
  const rx = 12 - 12 * t;
  const sweep = interpolate(frame, [8, 70], [-0.6, 1.6], clamp);
  const W = 500;
  const outerW = W * 1.07;
  const outerH = ((W * 844) / 390) * 1.035 + W * 0.035;
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          left: 540 - outerW / 2,
          top: 540,
          transform: `rotateY(${ry}deg) rotateX(${rx}deg) translateZ(${(1 - t) * -120}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        <PhoneRec src={`${SRC}/mobile-film.mp4`} width={W} from={0} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: W * 0.175,
            background: `linear-gradient(105deg, transparent ${sweep * 100 - 18}%, rgba(234,223,200,0.32) ${sweep * 100}%, transparent ${sweep * 100 + 18}%)`,
            mixBlendMode: "screen",
            height: outerH,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2
// The laptop is shown whole, then its 3D model and options panel lift off
// as cards. A card shows one crop of the same recording.
const LAP = { x: 540 - (980 * 1.16) / 2, y: 720, w: 980 };
const LAP_SCREEN = {
  x: LAP.x + (980 * 1.16 - 980 * 1.044) / 2 + 980 * 0.022,
  y: LAP.y + 980 * 0.03,
  s: 980 / 1440,
};
const RATE = 1.2; // the studio recording plays a little faster
const LIFT = STUDIO + 34;
type Crop = { x: number; y: number; w: number; h: number };
const MODEL_CROP: Crop = { x: 90, y: 40, w: 780, h: 840 };
const PANEL_CROP: Crop = { x: 985, y: 40, w: 430, h: 620 };
const MODEL_TO = { x: 50, y: 470, w: 740 };
const PANEL_TO = { x: 610, y: 1090, w: 430 };

const recFrame = (frame: number) => (frame - STUDIO) * RATE;

const cardRect = (
  frame: number,
  crop: Crop,
  to: { x: number; y: number; w: number },
) => {
  const p = spring({
    frame: frame - LIFT,
    fps: 30,
    config: theme.spring.smooth,
  });
  const from = {
    x: LAP_SCREEN.x + crop.x * LAP_SCREEN.s,
    y: LAP_SCREEN.y + crop.y * LAP_SCREEN.s,
    w: crop.w * LAP_SCREEN.s,
  };
  const w = from.w + (to.w - from.w) * p;
  const k = w / crop.w;
  return {
    p,
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p,
    w,
    h: crop.h * k,
    k,
  };
};

const Card: React.FC<{
  crop: Crop;
  to: { x: number; y: number; w: number };
  z: number;
}> = ({ crop, to, z }) => {
  const frame = useCurrentFrame();
  const r = cardRect(frame, crop, to);
  if (frame < LIFT - 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        overflow: "hidden",
        borderRadius: 18 * r.p,
        boxShadow: `0 ${50 * r.p}px ${110 * r.p}px -30px rgba(0,0,0,0.85), 0 0 0 ${r.p}px rgba(234,223,200,0.25)`,
        zIndex: z,
      }}
    >
      <Sequence from={STUDIO} layout="none">
        <OffthreadVideo
          src={staticFile(`${SRC}/desktop-studio.mp4`)}
          playbackRate={RATE}
          muted
          style={{
            position: "absolute",
            left: -crop.x * r.k,
            top: -crop.y * r.k,
            width: 1440 * r.k,
            height: 900 * r.k,
          }}
        />
      </Sequence>
    </div>
  );
};

// the cursor follows the recorded clicks and drags (css px of the studio)
type Pt = { frame: number; x: number; y: number; tap?: boolean };
const PATH: Pt[] = [
  // the two letters were typed into fields the recorder found off-panel;
  // point at the panel's letter boxes instead
  ...studio.taps.map((t, i) => ({
    ...t,
    ...(i === 10 ? { x: 1120, y: 400 } : i === 11 ? { x: 1200, y: 400 } : {}),
    tap: true,
  })),
  ...studio.drags,
].sort((a, b) => a.frame - b.frame);
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < LIFT + 6 || frame > SHOW + 4) return null;
  const rf = recFrame(frame);
  // where the pointer is: glide into each point over the 10 recorded frames before it
  let x = PATH[0].x;
  let y = PATH[0].y + 160;
  for (const pt of PATH) {
    const p = ease(rf, pt.frame - 10, pt.frame, theme.ease.inOut);
    x += (pt.x - x) * p;
    y += (pt.y - y) * p;
  }
  const inPanel = x > 960;
  const crop = inPanel ? PANEL_CROP : MODEL_CROP;
  const r = cardRect(frame, crop, inPanel ? PANEL_TO : MODEL_TO);
  const last = [...studio.taps].reverse().find((t) => rf >= t.frame);
  const since = last ? rf - last.frame : 99;
  const ring = interpolate(since, [0, 14], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: r.x + (x - crop.x) * r.k,
        top: r.y + (y - crop.y) * r.k,
        zIndex: 7,
        opacity:
          ease(frame, LIFT + 6, LIFT + 16) * (1 - ease(frame, SHOW - 10, SHOW)),
      }}
    >
      {since < 14 ? (
        <div
          style={{
            position: "absolute",
            left: -40 * ring - 10,
            top: -40 * ring - 10,
            width: 80 * ring + 20,
            height: 80 * ring + 20,
            borderRadius: "50%",
            border: `3px solid ${CR.champ}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <svg
        width={44}
        height={52}
        viewBox="0 0 22 26"
        style={{
          position: "absolute",
          left: -4,
          top: -2,
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

// the spec sheet: what each recorded click picked
const PICKS: { at: number; key: string; v: string; add: number }[] = [
  { at: 0, key: "Shell", v: "Ivory Sand", add: 0 },
  { at: 1, key: "Shell", v: "Rose Clay", add: 0 },
  { at: 2, key: "Shell", v: "Midnight Navy", add: 0 },
  { at: 4, key: "Frame", v: "Champagne Gold", add: 150 },
  { at: 6, key: "Handles", v: "Cognac Leather", add: 220 },
  { at: 8, key: "Tag", v: "Cognac", add: 150 },
  { at: 10, key: "Initials", v: "L", add: 0 },
  { at: 11, key: "Initials", v: "LM", add: 0 },
];
const ROWS = ["Shell", "Frame", "Handles", "Tag", "Initials"];
const BASE = 2450;
const Spec: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < LIFT || frame > SHOW + 4) return null;
  const rf = recFrame(frame);
  const show =
    ease(frame, LIFT + 14, LIFT + 30) * (1 - ease(frame, SHOW - 8, SHOW + 2));
  const done = PICKS.filter((p) => rf >= studio.taps[p.at].frame);
  const total = BASE + done.reduce((s, p) => s + p.add, 0);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 1290,
        width: 500,
        opacity: show,
        zIndex: 6,
      }}
    >
      {ROWS.map((key) => {
        const mine = done.filter((p) => p.key === key);
        const cur = mine[mine.length - 1];
        const since = cur ? rf - studio.taps[cur.at].frame : 99;
        const flash = cur ? 1 - ease(since, 4, 24) : 0;
        return (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "12px 0",
              borderBottom: "1px solid rgba(234,223,200,0.16)",
            }}
          >
            <span style={{ ...mono, fontSize: 21, color: CR.muted }}>
              {key}
            </span>
            <span
              style={{
                ...didone,
                fontStyle: "italic",
                fontSize: 36,
                color:
                  flash > 0.05
                    ? CR.champLight
                    : cur
                      ? CR.paper
                      : "rgba(243,238,230,0.3)",
                textShadow:
                  flash > 0.05
                    ? `0 0 ${24 * flash}px rgba(234,223,200,0.8)`
                    : undefined,
              }}
            >
              {cur ? cur.v : "—"}
            </span>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span style={{ ...mono, fontSize: 21, color: CR.champ }}>Total</span>
        <span style={{ ...didone, fontSize: 52, ...champText }}>
          AED {total.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
};

const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lap = spring({
    frame: frame - STUDIO + 6,
    fps,
    config: theme.spring.smooth,
  });
  const lapOut = ease(frame, LIFT, LIFT + 18);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: LAP.x,
          top: LAP.y,
          opacity: 1 - lapOut,
          scale: 0.92 + 0.08 * lap - lapOut * 0.04,
          filter: lapOut > 0 ? `blur(${lapOut * 6}px)` : undefined,
        }}
      >
        <LaptopRec
          src={`${SRC}/desktop-studio.mp4`}
          width={LAP.w}
          from={STUDIO}
          rate={RATE}
        />
      </div>
      <Card crop={MODEL_CROP} to={MODEL_TO} z={2} />
      <Card crop={PANEL_CROP} to={PANEL_TO} z={3} />
      <Spec />
      <Cursor />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3
const FACTS = ["Free UAE delivery", "10-year warranty", "Shop in AED"];
// recording frames that show Matte Black, Rose Clay, Midnight Navy, Sage
const COLOURWAYS = [60, 0, 10, 90];
const BEAT = 67.5 / 4;
const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colourway =
    Math.max(0, Math.floor((frame - SHOW - 8) / (BEAT * 1.5))) %
    COLOURWAYS.length;
  return (
    <AbsoluteFill>
      <div
        style={{ position: "absolute", left: 540 - (600 * 1.09) / 2, top: 560 }}
      >
        {/* the showcase cycles colours faster than it can be recorded, so
            hold one colourway per beat, stop-motion style */}
        <Freeze frame={COLOURWAYS[colourway]}>
          <TabletRec src={`${SRC}/tablet-showcase.mp4`} width={600} from={0} />
        </Freeze>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1520,
          display: "flex",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {FACTS.map((f, i) => {
          const p = spring({
            frame: frame - SHOW - 22 - i * 6,
            fps,
            config: theme.spring.snappy,
          });
          return (
            <div
              key={f}
              style={{
                ...mono,
                fontSize: 19,
                padding: "12px 18px",
                border: `1px solid rgba(205,184,146,0.5)`,
                color: CR.champLight,
                background: "rgba(13,12,11,0.7)",
                opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
                translate: `0px ${(1 - p) * 30}px`,
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - 8 - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 40}px`,
    };
  };
  const line = ease(frame, END + 22, END + 44);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          position: "absolute",
          left: 80,
          top: 300,
          width: 230,
          ...up(0),
        }}
      />
      <div style={{ position: "absolute", left: 80, right: 60, top: 470 }}>
        <div style={{ ...mono, color: CR.champ, ...up(3) }}>
          Crown — built by eSolutify
        </div>
        <div
          style={{
            ...didone,
            marginTop: 26,
            fontSize: 116,
            lineHeight: 1.0,
            color: CR.paper,
            ...up(6),
          }}
        >
          Your website,
        </div>
        <div
          style={{
            ...didone,
            fontStyle: "italic",
            fontSize: 116,
            lineHeight: 1.08,
            ...champText,
            ...up(9),
          }}
        >
          made to
          <br />
          measure.
        </div>
        <div
          style={{
            marginTop: 28,
            width: 420 * line,
            height: 2,
            background: CHAMP,
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: CR.muted,
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
          padding: "0 46px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: CHAMP,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: "0.02em",
          color: CR.ink,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={42} color={CR.ink} stroke={2.8} />
        <LightSweep start={END + 46} duration={24} width={140} opacity={0.6} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 1392,
          ...mono,
          fontSize: 26,
          color: CR.paper,
          letterSpacing: "0.08em",
          textTransform: "none",
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
          top: 1450,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...mono,
          fontSize: 22,
          color: CR.champ,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={CR.champ} stroke={2.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CrownStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: CR.ink }}>
    <Backdrop />
    <Ribs outAt={STUDIO - 14}>
      <Turntable />
    </Ribs>
    <Caption
      from={4}
      to={STUDIO - 14}
      eyebrow="Crown — luxury luggage, Dubai"
      a="Built like"
      b="the luggage."
    />
    <Ribs inAt={STUDIO - 8} outAt={SHOW - 14}>
      <Studio />
    </Ribs>
    <Caption
      from={STUDIO + 6}
      to={SHOW - 14}
      a="Then design yours,"
      b="in live 3D."
    />
    <Ribs inAt={SHOW - 8} outAt={END - 14}>
      <Showcase />
    </Ribs>
    <Caption
      from={SHOW + 4}
      to={END - 14}
      a="First class,"
      b="on every screen."
    />
    <Ribs inAt={END - 8}>
      <EndCard />
    </Ribs>
    <Audio src={staticFile("audio/story-atelier.wav")} volume={0.85} />
    <Sfx name="whoosh-soft" at={STUDIO - 14} volume={0.32} />
    <Sfx name="whoosh-soft" at={SHOW - 14} volume={0.32} />
    <Sfx name="whoosh" at={END - 14} volume={0.28} />
    {studio.taps.map((t) => (
      <Sfx
        key={t.frame}
        name="tick"
        at={Math.round(STUDIO + t.frame / RATE) - 1}
        volume={0.2}
      />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

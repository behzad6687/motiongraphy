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
import picker from "../../../public/stories/masera/desktop-picker.json";

// Story: Masera Dentistry (esolutify.com/demo/masera), 20 s, 9:16. Warm and
// homely, like the site ("Like having a relative as a dentist"): every scene
// is a photo print dropped onto a cream table, with handwritten notes, in the
// site's cream and teal.
//   0–180    phone: the sunlit scroll film, the patients' words on cards
//   180–360  laptop: "Tell us what's going on", three taps, three answers
//   360–486  tablet: 583 five-star Google reviews
//   486–600  end card: "Make your website feel like home."
// Music: story-hearth.wav (scripts/gen_story_music.py hearth): the band at
// 180, a lift at 360, the end card at 486.

export const MASERA_DURATION = 600;
const A2 = 180;
const A3 = 360;
const END = 486;
const SRC = "stories/masera";

const MA = {
  table: "#EFE6D8",
  cream: "#FBF7F0",
  teal: "#1F5E5B",
  tealLight: "#3E8C86",
  ink: "#1F2A2A",
  muted: "#6F7B78",
  sand: "#E6D9C3",
};
const serif: React.CSSProperties = {
  fontFamily: theme.fonts.news,
  fontWeight: 500,
  letterSpacing: "-0.015em",
};
const hand: React.CSSProperties = {
  fontFamily: theme.fonts.hand,
  fontWeight: 600,
  color: MA.teal,
};
const label: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 20,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

// ---------------------------------------------------------------- the table
const Table: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: MA.table }}>
    {/* soft window light falling across the table */}
    <AbsoluteFill
      style={{
        background:
          "repeating-linear-gradient(115deg, rgba(255,250,235,0.0) 0 120px, rgba(255,248,230,0.35) 120px 190px, rgba(255,250,235,0.0) 190px 300px)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.5), transparent 70%)",
      }}
    />
  </AbsoluteFill>
);

// A print: a cream card with a white border, dropped onto the table.
const Print: React.FC<{
  at: number;
  tilt: number;
  children: React.ReactNode;
}> = ({ at, tilt, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at - 2) return null;
  const p =
    at === 0
      ? 1
      : spring({
          frame: frame - at,
          fps,
          config: { damping: 16, stiffness: 120, mass: 0.9 },
        });
  return (
    <AbsoluteFill
      style={{
        padding: 28,
        opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
        scale: 1 + (1 - p) * 0.14,
        rotate: `${tilt + (1 - p) * tilt * 4}deg`,
        translate: `0px ${(1 - p) * -60}px`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: 22,
          background: "#FFFFFF",
          boxShadow: `0 ${30 + (1 - p) * 60}px ${70 + (1 - p) * 60}px -20px rgba(60,45,25,0.35)`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            background: MA.cream,
          }}
        >
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(62,140,134,0.10), transparent 65%)",
            }}
          />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
// print coordinates: the inner area starts at (50, 50) in Story px
const IN = 50;

// a handwritten note with a little drawn arrow
const Note: React.FC<{
  x: number;
  y: number;
  text: string;
  at: number;
  arrow?: "left" | "right" | "down";
  rot?: number;
  size?: number;
}> = ({ x, y, text, at, arrow, rot = -4, size = 48 }) => {
  const frame = useCurrentFrame();
  const write = ease(frame, at, at + 16);
  const draw = ease(frame, at + 10, at + 24);
  if (frame < at) return null;
  const arrows = {
    left: "M 110 10 C 80 30, 40 30, 10 18 M 10 18 L 26 6 M 10 18 L 24 32",
    right: "M 10 10 C 40 30, 80 30, 110 18 M 110 18 L 94 6 M 110 18 L 96 32",
    down: "M 20 6 C 34 30, 34 60, 24 92 M 24 92 L 12 76 M 24 92 L 38 78",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${rot}deg`,
        zIndex: 6,
      }}
    >
      <div
        style={{
          ...hand,
          fontSize: size,
          lineHeight: 1,
          whiteSpace: "nowrap",
          clipPath: `inset(0 ${(1 - write) * 100}% 0 0)`,
        }}
      >
        {text}
      </div>
      {arrow ? (
        <svg
          width={arrow === "down" ? 50 : 120}
          height={arrow === "down" ? 100 : 40}
          style={{
            display: "block",
            marginTop: 6,
            marginLeft: arrow === "left" ? -20 : 40,
          }}
        >
          <path
            d={arrows[arrow]}
            fill="none"
            stroke={MA.teal}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={260}
            strokeDashoffset={260 * (1 - draw)}
          />
        </svg>
      ) : null}
    </div>
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
  const inA = ease(frame, from, from + 16);
  const inB = ease(frame, from + 6, from + 22);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 240 - IN,
        opacity: 1 - out,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            ...label,
            color: MA.tealLight,
            marginBottom: 16,
            opacity: inA,
          }}
        >
          — {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...serif,
          fontSize: 86,
          lineHeight: 1.02,
          color: MA.ink,
          opacity: inA,
          translate: `0px ${(1 - inA) * 22}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...serif,
          fontSize: 86,
          lineHeight: 1.06,
          color: MA.teal,
          opacity: inB,
          translate: `0px ${(1 - inB) * 22}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- act 1
const PH_W = 460;
const Act1: React.FC = () => (
  <>
    <Caption
      from={4}
      to={A2 - 6}
      eyebrow="Masera Dentistry · Houston"
      a="Gentle dentistry,"
      b="gentle website."
    />
    <div
      style={{
        position: "absolute",
        left: 540 - IN - (PH_W * 1.07) / 2 + 60,
        top: 560 - IN,
        rotate: "-3deg",
      }}
    >
      <PhoneRec src={`${SRC}/mobile-film.mp4`} width={PH_W} from={0} />
    </div>
    <Note
      x={24}
      y={760}
      text="sunlight & calm"
      at={40}
      arrow="right"
      rot={-6}
    />
    <Note x={20} y={1180} text="patients' words," at={96} rot={-5} size={42} />
    <Note
      x={36}
      y={1230}
      text="right on screen"
      at={104}
      arrow="right"
      rot={-5}
      size={42}
    />
  </>
);

// ---------------------------------------------------------------- act 2
const LAP_W = 900;
const LAP = { x: 540 - IN - (LAP_W * 1.16) / 2, y: 640 - IN };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const PICK_FROM = A2 - 6;
const ANSWERS = ["A tooth hurts", "I get anxious", "Straighter teeth"];
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = [...picker.taps]
    .reverse()
    .find((t) => frame >= PICK_FROM + t.frame);
  const ti = tap ? picker.taps.indexOf(tap) : -1;
  const since = tap ? frame - PICK_FROM - tap.frame : 99;
  // glide between taps
  let cx = picker.taps[0].x + 200;
  let cy = picker.taps[0].y + 160;
  for (const t of picker.taps) {
    const p = ease(
      frame,
      PICK_FROM + t.frame - 12,
      PICK_FROM + t.frame - 1,
      theme.ease.inOut,
    );
    cx += (t.x - cx) * p;
    cy += (t.y - cy) * p;
  }
  return (
    <>
      <Caption
        from={A2 + 8}
        to={A3 - 6}
        a="Tell us what's wrong."
        b="It points the way."
      />
      <div style={{ position: "absolute", left: LAP.x, top: LAP.y }}>
        <LaptopRec
          src={`${SRC}/desktop-picker.mp4`}
          width={LAP_W}
          from={PICK_FROM}
          hold
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: LSCREEN.x + cx * LSCREEN.s,
          top: LSCREEN.y + cy * LSCREEN.s,
          opacity: ease(frame, A2 + 6, A2 + 14),
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
              border: `3px solid ${MA.tealLight}`,
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
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
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
      {/* what was tapped, noted by hand */}
      <div style={{ position: "absolute", left: 40, top: 1300 - IN }}>
        {ANSWERS.map((a, i) => {
          const at = PICK_FROM + picker.taps[i].frame;
          if (frame < at) return null;
          return (
            <div
              key={a}
              style={{
                ...hand,
                fontSize: 46,
                lineHeight: 1.25,
                opacity: ease(frame, at, at + 8),
                color: i === ti ? MA.teal : "rgba(31,94,91,0.45)",
              }}
            >
              ✓ {a}
            </div>
          );
        })}
      </div>
      <Note
        x={560}
        y={1320}
        text="nothing is sent,"
        at={A2 + 60}
        rot={-3}
        size={40}
      />
      <Note
        x={600}
        y={1366}
        text="it just helps"
        at={A2 + 68}
        rot={-3}
        size={40}
      />
    </>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 560;
const Act3: React.FC = () => (
  <>
    <Caption from={A3 + 8} to={END - 6} a="583 reviews." b="All five stars." />
    <div
      style={{
        position: "absolute",
        left: 540 - IN - (TAB_W * 1.09) / 2 - 30,
        top: 600 - IN,
        rotate: "2deg",
      }}
    >
      <TabletRec
        src={`${SRC}/tablet-reviews.mp4`}
        width={TAB_W}
        from={A3 - 4}
        hold
      />
    </div>
    <Note
      x={500}
      y={1490}
      text="“like family”"
      at={A3 + 40}
      rot={-4}
      size={56}
    />
  </>
);

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
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 250 - IN,
          padding: "14px 20px",
          borderRadius: 14,
          background: MA.teal,
          ...up(0),
        }}
      >
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 200, display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 420 - IN }}>
        <div style={{ ...label, color: MA.tealLight, ...up(3) }}>
          — Masera Dentistry · built by eSolutify
        </div>
        <div
          style={{
            ...serif,
            marginTop: 24,
            fontSize: 108,
            lineHeight: 1.0,
            color: MA.ink,
            ...up(6),
          }}
        >
          Make your
          <br />
          website feel
        </div>
        <div
          style={{
            ...serif,
            fontSize: 108,
            lineHeight: 1.04,
            color: MA.teal,
            ...up(9),
          }}
        >
          like home.
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: MA.muted,
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
          left: 40,
          top: 1220 - IN,
          height: 104,
          padding: "0 42px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: MA.teal,
          boxShadow: "0 18px 40px -14px rgba(31,94,91,0.6)",
          fontFamily: theme.fonts.body,
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
          left: 46,
          top: 1350 - IN,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: MA.ink,
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
          top: 1420 - IN,
          display: "flex",
          alignItems: "center",
          gap: 10,
          ...hand,
          fontSize: 48,
          ...up(24),
        }}
      >
        tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={36} color={MA.teal} stroke={2.6} />
        </div>
      </div>
    </>
  );
};

export const MaseraStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: MA.table }}>
      <Table />
      {/* each print stays under the next one until it is fully covered */}
      {frame < A2 + 40 ? (
        <Print at={0} tilt={-1.2}>
          <Act1 />
        </Print>
      ) : null}
      {frame >= A2 - 2 && frame < A3 + 40 ? (
        <Print at={A2} tilt={1.4}>
          <Act2 />
        </Print>
      ) : null}
      {frame >= A3 - 2 && frame < END + 40 ? (
        <Print at={A3} tilt={-0.9}>
          <Act3 />
        </Print>
      ) : null}
      {frame >= END - 2 ? (
        <Print at={END} tilt={0.6}>
          <EndCard />
        </Print>
      ) : null}
      <Audio src={staticFile("audio/story-hearth.wav")} volume={0.85} />
      {[A2, A3, END].map((c) => (
        <Sfx key={c} name="whoosh-soft" at={c - 6} volume={0.26} />
      ))}
      {picker.taps.map((t) => (
        <Sfx
          key={t.frame}
          name="tick"
          at={PICK_FROM + t.frame - 1}
          volume={0.2}
        />
      ))}
      {safeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
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
import { LaptopRec, TabletRec } from "../kit";
import assemble from "../../../public/stories/gincoaluminium/desktop-assemble.json";
import systems from "../../../public/stories/gincoaluminium/tablet-systems.json";

// Story: National Aluminium / Ginco (esolutify.com/demo/gincoaluminium),
// 20 s, 9:16. The Story is built like a curtain wall: an aluminium mullion
// grid sits over the frame and every scene is "glazed in" pane by pane.
//   0–169    through the façade: the phone's scroll film, full-bleed behind
//            the mullions ("We build the skin of the skyline.")
//   169–290  laptop: the desktop film, a tower above the clouds
//   290–394  the camera moves in on "Hold to build a unit": a cursor holds,
//            the unit assembles in four steps
//   394–506  tablet: 15 systems, filtered by tapping the tabs
//   506–600  end card that assembles like the unit: frame, glass, anchors
// Music: story-skyline.wav (scripts/gen_story_music.py skyline): drop 5.63 s
// (169), lift 13.1 s (394), end card 16.9 s (506).

export const GINCO_DURATION = 600;
const S2 = 169;
const S3 = 290;
const S4 = 394;
const END = 506;
const SRC = "stories/gincoaluminium";

const NA = {
  navy: "#121A23",
  navy2: "#1C2733",
  alu: "#CFD1D2",
  aluLight: "#EEF0F1",
  red: "#D8443F",
  copper: "#C77A52",
  muted: "#8D99A6",
};
const ALU =
  "linear-gradient(135deg, #9EA4AA 0%, #F2F4F5 45%, #B9BEC3 70%, #E3E6E8 100%)";
const heavy: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 22,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};
const aluText: React.CSSProperties = {
  backgroundImage: ALU,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---------------------------------------------------------------- the façade
const COLS = 3;
const ROWS = 5;
const CW = 1080 / COLS;
const CH = 1920 / ROWS;

// Each pane grows from its centre, starting at the top-left and running
// diagonally, as an SVG mask over the scene.
const glazeMask = (frame: number, at: number) => {
  let rects = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = ease(
        frame,
        at + (r + c) * 2,
        at + (r + c) * 2 + 12,
        theme.ease.inOut,
      );
      if (s <= 0) continue;
      const w = CW * s;
      const h = CH * s;
      rects += `<rect x='${c * CW + (CW - w) / 2}' y='${r * CH + (CH - h) / 2}' width='${w + 1}' height='${h + 1}' fill='white'/>`;
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'>${rects}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};
const GLAZE_LEN = (ROWS + COLS - 2) * 2 + 12;

const Glazed: React.FC<{
  at: number;
  until?: number;
  children: React.ReactNode;
}> = ({ at, until, children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  if (until !== undefined && frame >= until + GLAZE_LEN) return null;
  const done = frame >= at + GLAZE_LEN;
  const mask = done ? undefined : glazeMask(frame, at);
  return (
    <AbsoluteFill
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// The mullions: always there in the opening, then they flash in for each
// glazing and fade back out.
const CUTS = [S2, S3, S4, END];
const Mullions: React.FC = () => {
  const frame = useCurrentFrame();
  const opening = 0.6 * (1 - ease(frame, S2 + 10, S2 + 30));
  const flash = Math.max(
    opening,
    ...CUTS.slice(1).map(
      (c) =>
        ease(frame, c - 8, c) *
        (1 - ease(frame, c + GLAZE_LEN, c + GLAZE_LEN + 14)),
    ),
  );
  if (flash <= 0.01) return null;
  const lines: React.ReactNode[] = [];
  for (let c = 1; c < COLS; c++)
    lines.push(
      <rect
        key={`c${c}`}
        x={c * CW - 7}
        y={0}
        width={14}
        height={1920}
        fill="url(#mul)"
      />,
    );
  for (let r = 1; r < ROWS; r++)
    lines.push(
      <rect
        key={`r${r}`}
        x={0}
        y={r * CH - 6}
        width={1080}
        height={12}
        fill="url(#tr)"
      />,
    );
  const anchors: React.ReactNode[] = [];
  for (let c = 1; c < COLS; c++)
    for (let r = 1; r < ROWS; r++)
      anchors.push(
        <rect
          key={`a${c}${r}`}
          x={c * CW - 14}
          y={r * CH - 5}
          width={28}
          height={10}
          rx={2}
          fill={NA.red}
          opacity={0.9}
        />,
      );
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, opacity: flash, zIndex: 8 }}
    >
      <defs>
        <linearGradient id="mul" x1="0" x2="1">
          <stop offset="0" stopColor="#6E767E" />
          <stop offset="0.45" stopColor="#F2F4F5" />
          <stop offset="1" stopColor="#8A9198" />
        </linearGradient>
        <linearGradient id="tr" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7A8188" />
          <stop offset="0.5" stopColor="#ECEEF0" />
          <stop offset="1" stopColor="#80878E" />
        </linearGradient>
      </defs>
      {lines}
      {anchors}
    </svg>
  );
};

const Caption: React.FC<{ from: number; to: number; a: string; b: string }> = ({
  from,
  to,
  a,
  b,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from, from + 14);
  const inB = ease(frame, from + 6, from + 20);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 290,
        opacity: 1 - out,
        zIndex: 7,
      }}
    >
      <div
        style={{
          ...heavy,
          fontSize: 90,
          lineHeight: 1,
          color: NA.aluLight,
          opacity: inA,
          translate: `0px ${(1 - inA) * 24}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...heavy,
          fontSize: 90,
          lineHeight: 1.06,
          ...aluText,
          opacity: inB,
          translate: `0px ${(1 - inB) * 24}px`,
        }}
      >
        {b}
      </div>
      <div
        style={{
          marginTop: 18,
          width: 120 * inB,
          height: 6,
          background: NA.red,
        }}
      />
    </div>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 58%, ${NA.navy2}, ${NA.navy} 70%)`,
    }}
  />
);

// ---------------------------------------------------------------- scene 1
const FILM_H = (1080 * 844) / 390;
const Scene1: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <OffthreadVideo
      src={staticFile(`${SRC}/mobile-film.mp4`)}
      muted
      style={{
        position: "absolute",
        left: 0,
        top: (1920 - FILM_H) / 2,
        width: 1080,
        height: FILM_H,
      }}
    />
    {/* glass: a faint tint and reflection over the view */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(115deg, rgba(120,150,180,0.10) 0%, transparent 35%, rgba(255,255,255,0.06) 52%, transparent 60%)",
      }}
    />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- scene 2
const LAP_W = 1000;
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const push = ease(frame, S2, S3, theme.ease.soft);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: 540 - (LAP_W * 1.16) / 2,
          top: 720,
          scale: 1 + push * 0.06,
        }}
      >
        <LaptopRec
          src={`${SRC}/desktop-film.mp4`}
          width={LAP_W}
          from={S2 - 20}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scene 3
// The laptop again, the camera in close on the unit and its four steps.
const ASM_RATE = 0.55; // the unit assembles in under a second; slow it down
const ASM_FROM = S3 - 6;
const press = assemble.taps[0];
const pressAt = ASM_FROM + press.frame / ASM_RATE;
const LAP3 = { x: 540 - (LAP_W * 1.16) / 2, y: 760 };
const SCREEN3 = {
  x: LAP3.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP3.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = 1.08 + 0.12 * ease(frame, S3, S4, theme.ease.soft);
  const fx = SCREEN3.x + 725 * SCREEN3.s;
  const fy = SCREEN3.y + 420 * SCREEN3.s;
  const tx = SCREEN3.x + press.x * SCREEN3.s;
  const ty = SCREEN3.y + press.y * SCREEN3.s;
  const arrive = ease(frame, pressAt - 16, pressAt - 2, theme.ease.inOut);
  const down = frame >= pressAt && frame < pressAt + 30;
  const held = interpolate(frame, [pressAt, pressAt + 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          transformOrigin: `${fx}px ${fy}px`,
          scale: zoom,
          translate: `${540 - fx}px ${1010 - fy}px`,
        }}
      >
        <div style={{ position: "absolute", left: LAP3.x, top: LAP3.y }}>
          <LaptopRec
            src={`${SRC}/desktop-assemble.mp4`}
            width={LAP_W}
            from={ASM_FROM}
            rate={ASM_RATE}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: tx + (1 - arrive) * 220,
            top: ty + (1 - arrive) * 200,
            opacity: arrive * (1 - ease(frame, pressAt + 46, pressAt + 56)),
          }}
        >
          {down ? (
            <svg
              width={80}
              height={80}
              style={{
                position: "absolute",
                left: -40,
                top: -40,
                rotate: "-90deg",
              }}
            >
              <circle
                cx={40}
                cy={40}
                r={34}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={4}
              />
              <circle
                cx={40}
                cy={40}
                r={34}
                fill="none"
                stroke={NA.red}
                strokeWidth={4}
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - held)}
              />
            </svg>
          ) : null}
          <svg
            width={40}
            height={48}
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scene 4
const TAB_W = 600;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 600 };
const TAB_FROM = S4 - 8;
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const s = TAB_W / 820;
  const bezel = Math.round(TAB_W * 0.045);
  const last = [...systems.taps]
    .reverse()
    .find((t) => frame >= TAB_FROM + t.frame);
  const since = last ? frame - TAB_FROM - last.frame : 99;
  const ring = interpolate(since, [0, 16], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-systems.mp4`}
          width={TAB_W}
          from={TAB_FROM}
          hold
        />
      </div>
      {last && since < 24 ? (
        <div
          style={{
            position: "absolute",
            left: TAB.x + bezel + last.x * s,
            top: TAB.y + bezel + last.y * s,
            zIndex: 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -60 * ring - 14,
              top: -60 * ring - 14,
              width: 120 * ring + 28,
              height: 120 * ring + 28,
              borderRadius: "50%",
              border: `4px solid ${NA.red}`,
              opacity: 1 - ring,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.55)",
              border: "3px solid #fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              opacity: 1 - ease(since, 12, 24),
              scale: since < 6 ? 1 - Math.sin((since / 6) * Math.PI) * 0.2 : 1,
            }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
// It assembles like the site's unit: frame, glass, anchors, then the words.
const UNIT = { x: 70, y: 260, w: 940, h: 1330 };
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frameDraw = ease(frame, END + 4, END + 30, theme.ease.inOut);
  const glass = ease(frame, END + 24, END + 40);
  const anchors = spring({
    frame: frame - END - 36,
    fps,
    config: theme.spring.bouncy,
  });
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - 30 - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 36}px`,
    };
  };
  const per = 2 * (UNIT.w + UNIT.h);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill>
      <Backdrop />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="endglass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5d7288" stopOpacity="0.32" />
            <stop offset="0.55" stopColor="#2c3a48" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c77a52" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="endalu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9EA4AA" />
            <stop offset="0.45" stopColor="#F2F4F5" />
            <stop offset="1" stopColor="#B9BEC3" />
          </linearGradient>
        </defs>
        <rect
          x={UNIT.x}
          y={UNIT.y}
          width={UNIT.w}
          height={UNIT.h}
          fill="url(#endglass)"
          opacity={glass}
        />
        <rect
          x={UNIT.x}
          y={UNIT.y}
          width={UNIT.w}
          height={UNIT.h}
          fill="none"
          stroke="url(#endalu)"
          strokeWidth={10}
          strokeLinejoin="round"
          strokeDasharray={per}
          strokeDashoffset={per * (1 - frameDraw)}
        />
        <path
          d={`M ${UNIT.x + 30} ${UNIT.y + 60} L ${UNIT.x + 230} ${UNIT.y + 60} L ${UNIT.x + 30} ${UNIT.y + 340} Z`}
          fill="#fff"
          opacity={0.06 * glass}
        />
        {[0.15, 0.85].flatMap((fy) =>
          [-1, 1].map((side) => (
            <rect
              key={`${fy}${side}`}
              x={side < 0 ? UNIT.x - 34 : UNIT.x + UNIT.w + 4}
              y={UNIT.y + UNIT.h * fy - 9}
              width={30 * anchors}
              height={18}
              rx={3}
              fill={NA.red}
            />
          )),
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: UNIT.x + 60,
          right: 1080 - UNIT.x - UNIT.w + 50,
          top: UNIT.y + 70,
        }}
      >
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 220, ...up(0) }}
        />
        <div style={{ ...mono, color: NA.muted, marginTop: 34, ...up(3) }}>
          National Aluminium · built by eSolutify
        </div>
        <div
          style={{
            ...heavy,
            marginTop: 24,
            fontSize: 112,
            lineHeight: 0.98,
            color: NA.aluLight,
            ...up(6),
          }}
        >
          Your website,
          <br />
          <span style={aluText}>engineered.</span>
        </div>
        <div
          style={{
            marginTop: 22,
            width: 160,
            height: 6,
            background: NA.red,
            ...up(8),
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: NA.muted,
            ...up(12),
          }}
        >
          See your new site free,
          <br />
          before you pay a dollar.
        </div>
        <div
          style={{
            marginTop: 50,
            height: 108,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "0 44px",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
            background: NA.red,
            ...heavy,
            letterSpacing: "-0.01em",
            fontSize: 46,
            color: "#fff",
            ...up(16),
          }}
        >
          Get your free demo
          <Icon name="arrow" size={42} color="#fff" stroke={2.8} />
          <LightSweep
            start={END + 70}
            duration={24}
            width={140}
            opacity={0.4}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 34,
            color: NA.aluLight,
            ...up(20),
          }}
        >
          esolutify.com/free-demo
        </div>
      </div>
      {/* the link sticker goes inside the unit's lower pane */}
      <div
        style={{
          position: "absolute",
          right: UNIT.x + 50,
          top: 1470,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...mono,
          color: NA.red,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={NA.red} stroke={2.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GincoStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: NA.navy }}>
    <Glazed at={0} until={S2}>
      <Scene1 />
    </Glazed>
    <Glazed at={S2} until={S3}>
      <Scene2 />
    </Glazed>
    <Glazed at={S3} until={S4}>
      <Scene3 />
    </Glazed>
    <Glazed at={S4} until={END}>
      <Scene4 />
    </Glazed>
    <Glazed at={END}>
      <EndCard />
    </Glazed>
    <Mullions />
    <Caption from={S2 + 8} to={S3 - 4} a="Engineered" b="like a façade." />
    <Caption from={S3 + 8} to={S4 - 4} a="Hold to build" b="a unit." />
    <Caption from={S4 + 8} to={END - 4} a="15 systems." b="One standard." />
    <Audio src={staticFile("audio/story-skyline.wav")} volume={0.82} />
    {[S2, S3, S4].map((c) => (
      <Sfx key={c} name="whoosh-soft" at={c - 6} volume={0.28} />
    ))}
    <Sfx name="tick" at={Math.round(pressAt) - 1} volume={0.25} />
    {systems.taps.map((t) => (
      <Sfx key={t.frame} name="tick" at={TAB_FROM + t.frame - 1} volume={0.2} />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

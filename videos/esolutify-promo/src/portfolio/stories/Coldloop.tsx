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
import layers from "../../../public/stories/newpc/mobile-layers.json";

// Story: Coldloop (esolutify.com/demo/pc), 20 s, 9:16. A hardware HUD in
// the site's black and coolant cyan: it boots like a machine, and scenes
// change on a rising wave of coolant.
//   0–48     boot lines type themselves out
//   40–167   laptop: the 14,400 px desktop scroll film, studio to exploded
//            chip, under HUD brackets
//   167–350  phone: "touch and hold to pull the stack apart", with the
//            layers listed beside it
//   350–517  the site's own numbers, big-box prebuilt vs a Coldloop build,
//            as a HUD read-out; the pricing tiers on a tablet
//   517–600  end card: "Your website, built one at a time."
// Music: story-coolant.wav (scripts/gen_story_music.py coolant): drop 167,
// lift 350, end card 517.

export const COLDLOOP_DURATION = 600;
const FILM = 40;
const A2 = 167;
const A3 = 350;
const END = 517;
const SRC = "stories/newpc";

const CL = {
  bg: "#061015",
  panel: "#0B1B22",
  cyan: "#5CE1E6",
  cyanDeep: "#1FB6C1",
  text: "#E6F4F6",
  muted: "#7C949B",
  violet: "#A08BFF",
};
const heavy: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 22,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: CL.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, rgba(31,182,193,0.18), transparent 60%)`,
        }}
      />
      {/* scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
          backgroundPosition: `0px ${frame * 0.5}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// HUD corner brackets around a box
const Brackets: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
}> = ({ x, y, w, h, at }) => {
  const frame = useCurrentFrame();
  const p = ease(frame, at, at + 14);
  const L = 46 * p;
  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <path d={`M ${cx} ${cy + sy * L} L ${cx} ${cy} L ${cx + sx * L} ${cy}`} />
  );
  const pad = 18 + (1 - p) * 30;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, opacity: p, zIndex: 4 }}
    >
      <g
        stroke={CL.cyan}
        strokeWidth={3}
        fill="none"
        style={{ filter: "drop-shadow(0 0 8px rgba(92,225,230,0.8))" }}
      >
        {corner(x - pad, y - pad, 1, 1)}
        {corner(x + w + pad, y - pad, -1, 1)}
        {corner(x - pad, y + h + pad, 1, -1)}
        {corner(x + w + pad, y + h + pad, -1, -1)}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- coolant wave
const level = (frame: number, at: number) => {
  const p = ease(frame, at - 12, at + 12, theme.ease.inOut);
  return 1920 + 80 - p * (1920 + 160);
};
const wavePoints = (frame: number, at: number) => {
  const lv = level(frame, at);
  const pts: string[] = [];
  for (let x = 0; x <= 1080; x += 30) {
    const y =
      lv +
      26 * Math.sin(x / 110 + frame / 3.5) +
      12 * Math.sin(x / 47 - frame / 2.2);
    pts.push(`${x}px ${y.toFixed(1)}px`);
  }
  return pts;
};
const WaveScene: React.FC<{
  at: number;
  until?: number;
  children: React.ReactNode;
}> = ({ at, until, children }) => {
  const frame = useCurrentFrame();
  if (at > 0 && frame < at - 12) return null;
  if (until !== undefined && frame > until + 12) return null;
  const rising = at > 0 && frame < at + 12;
  const clip = rising
    ? `polygon(${[...wavePoints(frame, at), "1080px 1920px", "0px 1920px"].join(",")})`
    : undefined;
  return (
    <AbsoluteFill style={{ clipPath: clip, isolation: "isolate" }}>
      {children}
    </AbsoluteFill>
  );
};
const WaveLine: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at - 12 || frame > at + 12) return null;
  const pts = wavePoints(frame, at).map((p) => p.replace(/px/g, ""));
  const d = `M ${pts.join(" L ")}`;
  const lv = level(frame, at);
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, zIndex: 9 }}
    >
      <defs>
        <linearGradient id="coolant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5CE1E6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#5CE1E6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L 1080 ${lv + 160} L 0 ${lv + 160} Z`}
        fill="url(#coolant)"
      />
      <path
        d={d}
        fill="none"
        stroke="#BFF7F9"
        strokeWidth={5}
        style={{ filter: "drop-shadow(0 0 12px #5CE1E6)" }}
      />
      {[120, 330, 520, 760, 940].map((bx, i) => (
        <circle
          key={bx}
          cx={bx}
          cy={lv + 60 + ((frame * 9 + i * 37) % 120)}
          r={5 + (i % 3) * 3}
          fill="none"
          stroke="#BFF7F9"
          strokeWidth={2}
          opacity={0.7}
        />
      ))}
    </svg>
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
  const inA = ease(frame, from, from + 14);
  const inB = ease(frame, from + 6, from + 20);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 288,
        opacity: 1 - out,
        zIndex: 7,
      }}
    >
      {eyebrow ? (
        <div
          style={{ ...mono, color: CL.cyan, marginBottom: 16, opacity: inA }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...heavy,
          fontSize: 92,
          lineHeight: 1,
          color: CL.text,
          opacity: inA,
          translate: `0px ${(1 - inA) * 24}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...heavy,
          fontSize: 92,
          lineHeight: 1.06,
          color: CL.cyan,
          textShadow: "0 0 30px rgba(92,225,230,0.55)",
          opacity: inB,
          translate: `0px ${(1 - inB) * 24}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- act 1
const BOOT = [
  "> coldloop build studio",
  "> loop fill .............. ok",
  "> leak test 24h .......... pass",
  "> one builder ............ assigned",
  "> loading the film_",
];
const Boot: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 56) return null;
  const out = ease(frame, 44, 54, theme.ease.in);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 330,
        opacity: 1 - out,
        zIndex: 6,
      }}
    >
      {BOOT.map((line, i) => {
        const start = i * 7;
        const n = Math.floor(
          interpolate(frame, [start, start + 9], [0, line.length], clamp),
        );
        if (frame < start) return null;
        return (
          <div
            key={line}
            style={{
              ...mono,
              fontSize: 30,
              lineHeight: 1.8,
              color: i === BOOT.length - 1 ? CL.cyan : CL.text,
            }}
          >
            {line.slice(0, n)}
            {line.endsWith("pass") && n === line.length ? (
              <span style={{ color: CL.cyan }}> ✓</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
const LAP_W = 1000;
const LAP = { x: 540 - (LAP_W * 1.16) / 2, y: 700 };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  w: LAP_W,
  h: LAP_W * 0.625,
};
const FACTS = ["Leak tested 24 h", "One builder", "Shipped across N. America"];
const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({
    frame: frame - FILM,
    fps,
    config: theme.spring.smooth,
  });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Boot />
      {frame >= FILM - 2 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: LAP.x,
              top: LAP.y + (1 - rise) * 200,
              opacity: interpolate(rise, [0, 0.4], [0, 1], clamp),
            }}
          >
            <LaptopRec
              src={`${SRC}/desktop-film.mp4`}
              width={LAP_W}
              from={FILM}
              rate={1.6}
            />
          </div>
          <Brackets
            x={LSCREEN.x}
            y={LSCREEN.y}
            w={LSCREEN.w}
            h={LSCREEN.h}
            at={FILM + 12}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1420,
              display: "flex",
              justifyContent: "center",
              gap: 18,
            }}
          >
            {FACTS.map((f, i) => (
              <div
                key={f}
                style={{
                  ...mono,
                  fontSize: 19,
                  padding: "10px 16px",
                  border: `1px solid rgba(92,225,230,0.45)`,
                  color: CL.text,
                  background: "rgba(6,16,21,0.7)",
                  opacity: ease(frame, FILM + 24 + i * 6, FILM + 34 + i * 6),
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2
const PH_W = 500;
const PH = { x: 50, y: 560 };
const LAYERS_FROM = A2 - 4;
const press = layers.taps[0];
const PRESS_AT = LAYERS_FROM + press.frame;
const LAYER_NAMES = [
  "Tuning",
  "Silicon",
  "Memory",
  "GPU block",
  "CPU block & tubing",
  "Pump & reservoir",
  "Power & case",
];
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = PH_W / 390;
  const bezel = Math.round(PH_W * 0.035);
  const fx = PH.x + bezel + press.x * s;
  const fy = PH.y + bezel + press.y * s;
  const holding = frame >= PRESS_AT && frame < PRESS_AT + (press.hold ?? 100);
  const held = interpolate(frame, [PRESS_AT, PRESS_AT + 30], [0, 1], clamp);
  const phH = (PH_W * 844) / 390 + PH_W * 0.07;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: PH.x, top: PH.y }}>
        <PhoneRec
          src={`${SRC}/mobile-layers.mp4`}
          width={PH_W}
          from={LAYERS_FROM}
          hold
        />
      </div>
      <Brackets x={PH.x} y={PH.y} w={PH_W * 1.07} h={phH} at={A2 + 6} />
      {frame >= PRESS_AT - 12 && frame < PRESS_AT + (press.hold ?? 100) + 14 ? (
        <div
          style={{
            position: "absolute",
            left: fx,
            top: fy,
            zIndex: 5,
            opacity:
              ease(frame, PRESS_AT - 12, PRESS_AT - 4) *
              (1 -
                ease(
                  frame,
                  PRESS_AT + (press.hold ?? 100),
                  PRESS_AT + (press.hold ?? 100) + 12,
                )),
          }}
        >
          {holding ? (
            <svg
              width={120}
              height={120}
              style={{
                position: "absolute",
                left: -60,
                top: -60,
                rotate: "-90deg",
              }}
            >
              <circle
                cx={60}
                cy={60}
                r={52}
                fill="none"
                stroke="rgba(92,225,230,0.25)"
                strokeWidth={5}
              />
              <circle
                cx={60}
                cy={60}
                r={52}
                fill="none"
                stroke={CL.cyan}
                strokeWidth={5}
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - held)}
                style={{ filter: "drop-shadow(0 0 8px #5CE1E6)" }}
              />
            </svg>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: -32,
              top: -32,
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.5)",
              border: "3px solid #fff",
              scale: holding ? 0.85 : 1,
            }}
          />
        </div>
      ) : null}
      {/* the layers, read out one by one as the stack comes apart */}
      <div style={{ position: "absolute", left: 640, right: 40, top: 640 }}>
        <div
          style={{
            ...mono,
            fontSize: 20,
            color: CL.muted,
            opacity: ease(frame, PRESS_AT + 6, PRESS_AT + 16),
          }}
        >
          Layer by layer
        </div>
        {LAYER_NAMES.map((n, i) => {
          const at = PRESS_AT + 12 + i * 7;
          const p = spring({
            frame: frame - at,
            fps,
            config: theme.spring.snappy,
          });
          if (frame < at) return null;
          return (
            <div
              key={n}
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                border: "1px solid rgba(92,225,230,0.35)",
                background: "rgba(11,27,34,0.85)",
                opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
                translate: `${(1 - p) * 60}px 0px`,
              }}
            >
              <span style={{ ...mono, fontSize: 18, color: CL.cyan }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: 28,
                  color: CL.text,
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3
// The site's own comparison (typical figures, one metre, stock cooler).
const METRICS = [
  { k: "Fans", from: 2100, to: 800, unit: "rpm", max: 2400 },
  { k: "Noise", from: 41, to: 31, unit: "dBA", max: 45 },
  { k: "CPU", from: 84, to: 61, unit: "°C", max: 95 },
];
const TAB_W = 470;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 1010 };
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = ease(frame, A3 + 30, A3 + 70, theme.ease.inOut);
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: "absolute", left: 70, right: 70, top: 540 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            ...mono,
            fontSize: 19,
          }}
        >
          <span style={{ color: CL.muted, opacity: 1 - drop * 0.6 }}>
            Big-box prebuilt
          </span>
          <span
            style={{ color: CL.cyan, opacity: ease(frame, A3 + 26, A3 + 40) }}
          >
            → Coldloop build
          </span>
        </div>
        {METRICS.map((m, i) => {
          const v =
            m.from +
            (m.to - m.from) *
              ease(frame, A3 + 30 + i * 6, A3 + 70 + i * 6, theme.ease.inOut);
          const w = (v / m.max) * 100;
          const appear = ease(frame, A3 + 6 + i * 5, A3 + 18 + i * 5);
          return (
            <div key={m.k} style={{ marginTop: 26, opacity: appear }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ ...mono, fontSize: 20, color: CL.muted }}>
                  {m.k}
                </span>
                <span style={{ ...heavy, fontSize: 52, color: CL.text }}>
                  {Math.round(v).toLocaleString("en-US")}
                  <span
                    style={{
                      ...mono,
                      fontSize: 20,
                      color: CL.cyan,
                      marginLeft: 8,
                    }}
                  >
                    {m.unit}
                  </span>
                </span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 10,
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: `${w * appear}%`,
                    height: 10,
                    background: `linear-gradient(90deg, ${CL.cyanDeep}, ${CL.cyan})`,
                    boxShadow: "0 0 18px rgba(92,225,230,0.6)",
                  }}
                />
              </div>
            </div>
          );
        })}
        <div
          style={{
            ...mono,
            fontSize: 15,
            marginTop: 18,
            color: CL.muted,
            letterSpacing: "0.06em",
            textTransform: "none",
          }}
        >
          Typical figures at load, measured at one metre (Coldloop's own
          comparison).
        </div>
      </div>
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-build.mp4`}
          width={TAB_W}
          from={A3}
          trim={70}
          hold
        />
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
      frame: frame - END - 6 - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 36}px`,
    };
  };
  const line = "> build your website_";
  const typed = Math.floor(
    interpolate(frame, [END + 4, END + 22], [0, line.length], clamp),
  );
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          position: "absolute",
          left: 80,
          top: 300,
          width: 220,
          ...up(0),
        }}
      />
      <div style={{ position: "absolute", left: 80, right: 60, top: 470 }}>
        <div style={{ ...mono, color: CL.cyan, fontSize: 26 }}>
          {line.slice(0, typed)}
        </div>
        <div
          style={{
            ...heavy,
            marginTop: 26,
            fontSize: 116,
            lineHeight: 0.98,
            color: CL.text,
            ...up(6),
          }}
        >
          Your website,
          <br />
          <span
            style={{
              color: CL.cyan,
              textShadow: "0 0 40px rgba(92,225,230,0.6)",
            }}
          >
            built one
            <br />
            at a time.
          </span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: CL.muted,
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
          top: 1260,
          height: 108,
          padding: "0 44px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: CL.cyan,
          boxShadow: "0 0 50px rgba(92,225,230,0.55)",
          ...heavy,
          letterSpacing: "-0.01em",
          fontSize: 46,
          color: CL.bg,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={42} color={CL.bg} stroke={2.8} />
        <LightSweep start={END + 46} duration={24} width={140} opacity={0.6} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 86,
          top: 1398,
          ...mono,
          fontSize: 26,
          letterSpacing: "0.04em",
          textTransform: "none",
          color: CL.text,
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
          top: 1460,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...mono,
          color: CL.cyan,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={CL.cyan} stroke={2.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ColdloopStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: CL.bg }}>
    <WaveScene at={0} until={A2}>
      <Act1 />
    </WaveScene>
    <WaveScene at={A2} until={A3}>
      <Act2 />
    </WaveScene>
    <WaveScene at={A3} until={END}>
      <Act3 />
    </WaveScene>
    <WaveScene at={END}>
      <EndCard />
    </WaveScene>
    <WaveLine at={A2} />
    <WaveLine at={A3} />
    <WaveLine at={END} />
    <Caption
      from={FILM + 8}
      to={A2 - 10}
      eyebrow="Coldloop · custom water-cooled PCs"
      a="Built one"
      b="at a time."
    />
    <Caption
      from={A2 + 10}
      to={A3 - 8}
      a="Touch and hold."
      b="Pull the build apart."
    />
    <Caption from={A3 + 6} to={END - 8} a="Quieter." b="Cooler." />
    <Audio src={staticFile("audio/story-coolant.wav")} volume={0.82} />
    {[A2, A3, END].map((c) => (
      <Sfx key={c} name="whoosh-soft" at={c - 12} volume={0.3} />
    ))}
    <Sfx name="tick" at={PRESS_AT - 1} volume={0.25} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

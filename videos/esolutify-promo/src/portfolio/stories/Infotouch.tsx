import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Freeze,
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
import { PhoneRec, TabletRec } from "../kit";

// Story: Infotouch (esolutify.com/demo/infotouch), 22 s, 9:16. The site opens
// on a drone film over Dubai that plays as you scroll, from dusk to a green
// dawn, in four chapters. That scroll is the heart of the demo, so it gets
// half the Story, big, in a browser window with a scrubber under it that
// names each chapter as the page reaches it. Scenes change on a scanline
// sweep, like a signal coming in.
//   0–330    desktop: the scroll film (0 → 5,760 px), then the company numbers
//   330–450  phone: the company and the five verticals
//   450–555  tablet: ESG NetZero, then the client list
//   555–660  end card: "Make your website impossible to scroll past."
// Music: story-signal.wav (scripts/gen_story_music.py signal): the pulse at
// 30, lifts at 330 and 450, the end card at 555.

export const INFOTOUCH_DURATION = 660;
const A2 = 330;
const A3 = 450;
const END = 555;
const SRC = "stories/infotouch";

const IT = {
  bg: "#070C1F",
  panel: "#0E1634",
  copper: "#D9773F",
  dawn: "#7CE3B0",
  text: "#EEF1F8",
  muted: "#8892B0",
};
const heavy: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 20,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

// ---------------------------------------------------------------- backdrop
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: IT.bg }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(46,64,140,0.45), transparent 65%)",
        }}
      />
      {/* faint grid, drifting up like a feed */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `0px ${-frame * 0.6}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scenes
// Each scene arrives behind a bright scanline sweeping down the screen.
const Scene: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame >= to + 14) return null;
  const p = from === 0 ? 1 : ease(frame, from, from + 14, theme.ease.inOut);
  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(0px 0px ${(1 - p) * 100}% 0px)`,
        isolation: "isolate",
      }}
    >
      <Backdrop />
      {children}
    </AbsoluteFill>
  );
};
const Scan: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 16) return null;
  const p = ease(frame, at, at + 14, theme.ease.inOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: p * 1920 - 3,
        height: 6,
        background: IT.dawn,
        boxShadow: `0 0 40px 12px rgba(124,227,176,0.55)`,
        opacity: 1 - ease(frame, at + 12, at + 16),
        zIndex: 30,
      }}
    />
  );
};

const Caption: React.FC<{
  from: number;
  to: number;
  eyebrow?: string;
  a: string;
  b: string;
  top?: number;
}> = ({ from, to, eyebrow, a, b, top = 200 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from, from + 14);
  const inB = ease(frame, from + 6, from + 20);
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top,
        opacity: 1 - out,
      }}
    >
      {eyebrow ? (
        <div
          style={{ ...mono, color: IT.copper, marginBottom: 18, opacity: inA }}
        >
          ● {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...heavy,
          fontSize: 92,
          lineHeight: 1.0,
          color: IT.text,
          opacity: inA,
          translate: `0px ${(1 - inA) * 22}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...heavy,
          fontSize: 92,
          lineHeight: 1.04,
          color: IT.dawn,
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
// The recording scrolled 0 → 5,760 px over its frames 12–312 with an
// ease-in-out; here the scroll is re-timed to move steadily from the start.
const PAGE = 5760;
const SCROLL_FROM = 26;
const SCROLL_TO = 296;
const recFrame = (y: number) => {
  const p = y / PAGE;
  const t = p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2;
  return Math.min(321, Math.round(12 + 300 * t));
};
const scrollAt = (frame: number) => {
  const t = Math.min(
    1,
    Math.max(0, (frame - SCROLL_FROM) / (SCROLL_TO - SCROLL_FROM)),
  );
  const sine = (1 - Math.cos(Math.PI * t)) / 2;
  return PAGE * (0.55 * t + 0.45 * sine);
};
const CHAPTERS = [
  { k: "Signal", y: 0, tags: "Digital transformation · IT R&D" },
  { k: "Build", y: 1100, tags: "Blockchain · Web3 · Metaverse" },
  { k: "Intelligence", y: 2400, tags: "AI · IoT · Smart cities" },
  { k: "Horizon", y: 3650, tags: "ESG · NetZero" },
  { k: "Company", y: 4860, tags: "Founded in the UAE, 2007" },
];
const WIN = { x: 30, y: 560, w: 1020, bar: 54 };
const WIN_H = (WIN.w * 900) / 1440;
const BAR = { x: 50, y: WIN.y + WIN.bar + WIN_H + 60, w: 980 };

const Wheel: React.FC<{ on: boolean }> = ({ on }) => {
  const frame = useCurrentFrame();
  const t = (frame % 16) / 16;
  return (
    <svg width={44} height={64} viewBox="0 0 44 64">
      <rect
        x={3}
        y={3}
        width={38}
        height={58}
        rx={19}
        fill="rgba(7,12,31,0.75)"
        stroke={IT.dawn}
        strokeWidth={3}
      />
      {on ? (
        <circle
          cx={22}
          cy={15 + t * 14}
          r={4}
          fill={IT.dawn}
          opacity={1 - t * 0.6}
        />
      ) : (
        <circle cx={22} cy={18} r={4} fill={IT.dawn} />
      )}
    </svg>
  );
};

const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 2, fps, config: theme.spring.smooth });
  const hud = ease(frame, 14, 26);
  const y = scrollAt(frame);
  const ci = CHAPTERS.filter((c) => y >= c.y).length - 1;
  const ch = CHAPTERS[ci];
  const chAt = (() => {
    // the frame this chapter was reached, for its entrance
    let f = SCROLL_FROM;
    while (f < SCROLL_TO && scrollAt(f) < ch.y) f++;
    return f;
  })();
  const chIn = ci === 0 ? hud : ease(frame, chAt, chAt + 10);
  const moving = frame >= SCROLL_FROM && frame < SCROLL_TO;
  return (
    <>
      <Caption
        from={2}
        to={A2 - 6}
        eyebrow="Infotouch · Dubai"
        a="Scroll the page."
        b="Fly over Dubai."
      />
      {/* the browser window */}
      <div
        style={{
          position: "absolute",
          left: WIN.x,
          top: WIN.y + (1 - rise) * 240,
          width: WIN.w,
          opacity: interpolate(rise, [0, 0.35], [0, 1], clamp),
          borderRadius: 16,
          overflow: "hidden",
          background: "#0B1129",
          boxShadow:
            "0 60px 120px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(124,227,176,0.22), 0 0 90px rgba(60,90,200,0.3)",
        }}
      >
        <div
          style={{
            height: WIN.bar,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
            background: "#10183A",
          }}
        >
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div
              key={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
          <div
            style={{
              marginLeft: 22,
              flex: 1,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontFamily: theme.fonts.mono,
              fontSize: 18,
              color: IT.muted,
            }}
          >
            esolutify.com/demo/infotouch
          </div>
          <div style={{ ...mono, fontSize: 16, color: IT.dawn }}>Desktop</div>
        </div>
        <div
          style={{
            position: "relative",
            width: WIN.w,
            height: WIN_H,
            overflow: "hidden",
          }}
        >
          <Freeze frame={recFrame(y)}>
            <OffthreadVideo
              src={staticFile(`${SRC}/desktop-film.mp4`)}
              muted
              style={{ width: WIN.w, height: WIN_H, display: "block" }}
            />
          </Freeze>
          {/* scrollbar */}
          <div
            style={{
              position: "absolute",
              right: 4,
              top: 4,
              bottom: 4,
              width: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${(y / 12016) * 100}%`,
                height: WIN_H * (900 / 12016),
                borderRadius: 4,
                background: IT.dawn,
                boxShadow: "0 0 12px rgba(124,227,176,0.9)",
              }}
            />
          </div>
          {/* the hand on the mouse */}
          <div
            style={{
              position: "absolute",
              left: WIN.w * 0.62,
              top: WIN_H * 0.62,
              opacity: hud,
            }}
          >
            <svg
              width={38}
              height={46}
              viewBox="0 0 22 26"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
            >
              <path
                d="M2 2 L2 20 L7 15.5 L10.5 23.5 L13.5 22.2 L10 14.5 L17 14.5 Z"
                fill="#fff"
                stroke="#111"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ position: "absolute", left: 40, top: 6 }}>
              <Wheel on={moving} />
            </div>
          </div>
        </div>
      </div>
      {/* the scrubber: where the scroll is in the film */}
      <div
        style={{
          position: "absolute",
          left: BAR.x,
          top: BAR.y,
          width: BAR.w,
          opacity: hud,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ ...mono, fontSize: 26, color: IT.copper }}>
              {String(ci + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                ...heavy,
                fontSize: 64,
                color: ci === 3 ? IT.dawn : IT.text,
                opacity: chIn,
                translate: `0px ${(1 - chIn) * 14}px`,
                display: "inline-block",
              }}
            >
              {ch.k}
            </span>
          </div>
          <span style={{ ...mono, fontSize: 22, color: IT.muted }}>
            {Math.round(y).toLocaleString("en-US")} px
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: theme.fonts.body,
            fontSize: 32,
            color: IT.muted,
            opacity: chIn,
          }}
        >
          {ch.tags}
        </div>
        <div style={{ position: "relative", marginTop: 34, height: 64 }}>
          {CHAPTERS.map((c, i) => {
            const y1 = CHAPTERS[i + 1]?.y ?? PAGE;
            const left = (c.y / PAGE) * BAR.w;
            const w = ((y1 - c.y) / PAGE) * BAR.w;
            const fill = Math.min(1, Math.max(0, (y - c.y) / (y1 - c.y)));
            return (
              <div
                key={c.k}
                style={{ position: "absolute", left, width: w - 6, top: 0 }}
              >
                <div
                  style={{
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${fill * 100}%`,
                      height: "100%",
                      background: i === 4 ? IT.copper : IT.dawn,
                    }}
                  />
                </div>
                <div
                  style={{
                    ...mono,
                    fontSize: 15,
                    letterSpacing: "0.12em",
                    marginTop: 14,
                    color: i === ci ? IT.text : "rgba(136,146,176,0.7)",
                  }}
                >
                  {c.k}
                </div>
              </div>
            );
          })}
          {/* playhead */}
          <div
            style={{
              position: "absolute",
              left: (y / PAGE) * BAR.w - 11,
              top: -6,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: `0 0 0 5px rgba(124,227,176,0.35), 0 0 18px ${IT.dawn}`,
            }}
          />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- act 2
const PH_W = 470;
const PH = { x: 50, y: 520 };
const STATS = [
  { n: "2007", l: "Founded in UAE" },
  { n: "06", l: "Global locations" },
  { n: "2014", l: "SME100 rated since" },
  { n: "ISO", l: "Multi certified" },
];
const VERTICALS = [
  "Blockchain",
  "Metaverse & Web3",
  "Digital Security",
  "Digital Innovation",
  "ESG NetZero",
];
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Caption
        from={A2 + 8}
        to={A3 - 6}
        a="Five verticals."
        b="One clean scroll."
      />
      <div style={{ position: "absolute", left: PH.x, top: PH.y }}>
        <PhoneRec
          src={`${SRC}/mobile-verticals.mp4`}
          width={PH_W}
          from={A2 - 6}
          hold
        />
      </div>
      <div style={{ position: "absolute", left: 590, top: 560, width: 450 }}>
        {VERTICALS.map((v, i) => {
          const at = A2 + 40 + i * 9;
          return (
            <div
              key={v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                opacity: ease(frame, at, at + 10),
                translate: `${(1 - ease(frame, at, at + 12)) * 40}px 0px`,
              }}
            >
              <span style={{ ...mono, fontSize: 18, color: IT.copper }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  ...heavy,
                  fontWeight: 700,
                  fontSize: 36,
                  color: IT.text,
                }}
              >
                {v}
              </span>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 26,
          }}
        >
          {STATS.map((s, i) => {
            const at = A2 + 6 + i * 6;
            return (
              <div key={s.l} style={{ opacity: ease(frame, at, at + 10) }}>
                <div
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: 58,
                    color: i === 2 ? IT.copper : IT.text,
                  }}
                >
                  {s.n}
                </div>
                <div
                  style={{
                    ...mono,
                    fontSize: 14,
                    color: IT.muted,
                    marginTop: 4,
                  }}
                >
                  {s.l}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 600;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 520 };
const CLIENTS = [
  "ADNOC",
  "TAQA",
  "ENOC",
  "EMAAR",
  "NAKHEEL",
  "JUMEIRAH",
  "DUBAI AIRPORTS",
  "MUBADALA",
  "SEHA",
  "DUBAI CULTURE",
];
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const x = -(frame - A3) * 5;
  const row = CLIENTS.join("   ·   ");
  return (
    <>
      <Caption
        from={A3 + 8}
        to={END - 6}
        a="Net zero, governments,"
        b="enterprise."
      />
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-esg.mp4`}
          width={TAB_W}
          from={A3 - 4}
          trim={2}
          hold
        />
      </div>
      {/* the client list, as a ticker */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1500,
          height: 90,
          overflow: "hidden",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(14,22,52,0.85)",
          opacity: ease(frame, A3 + 16, A3 + 28),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            left: x + 60,
            whiteSpace: "nowrap",
            ...mono,
            fontSize: 34,
            letterSpacing: "0.12em",
            color: IT.text,
          }}
        >
          {row} · {row}
        </div>
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
      {/* a signal line, like the site's scroll indicator */}
      <svg
        width={1080}
        height={200}
        style={{ position: "absolute", left: 0, top: 1000 }}
      >
        <path
          d={`M 0 100 ${Array.from({ length: 55 }, (_, i) => {
            const x = i * 20;
            const a =
              Math.sin(i * 0.9 + frame / 4) *
              34 *
              Math.exp(-(((i - 27) / 12) ** 2));
            return `L ${x} ${100 + a}`;
          }).join(" ")}`}
          fill="none"
          stroke={IT.dawn}
          strokeWidth={3}
          opacity={0.35 * ease(frame, END + 10, END + 30)}
        />
      </svg>
      <div style={{ position: "absolute", left: 50, top: 230, ...up(0) }}>
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 230, display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 400 }}>
        <div style={{ ...mono, color: IT.copper, ...up(3) }}>
          ● Infotouch · built by eSolutify
        </div>
        <div
          style={{
            ...heavy,
            marginTop: 24,
            fontSize: 108,
            lineHeight: 0.98,
            color: IT.text,
            ...up(6),
          }}
        >
          Make your website
        </div>
        <div
          style={{
            ...heavy,
            fontSize: 108,
            lineHeight: 1.0,
            color: IT.dawn,
            ...up(9),
          }}
        >
          impossible to scroll past.
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.32,
            color: IT.muted,
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
          left: 50,
          top: 1230,
          height: 104,
          padding: "0 42px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: IT.dawn,
          boxShadow: "0 18px 40px -14px rgba(124,227,176,0.6)",
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 44,
          color: IT.bg,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={40} color={IT.bg} stroke={2.6} />
        <LightSweep start={END + 50} duration={24} width={140} opacity={0.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 1362,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: IT.text,
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
          top: 1430,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...mono,
          fontSize: 24,
          color: IT.dawn,
          ...up(24),
        }}
      >
        tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={IT.dawn} stroke={2.6} />
        </div>
      </div>
    </>
  );
};

export const InfotouchStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: IT.bg }}>
      <Scene from={0} to={A2}>
        <Act1 />
      </Scene>
      <Scene from={A2} to={A3}>
        <Act2 />
      </Scene>
      <Scene from={A3} to={END}>
        <Act3 />
      </Scene>
      <Scene from={END} to={10_000}>
        <EndCard />
      </Scene>
      {[A2, A3, END].map((c) => (
        <Scan key={c} at={c} />
      ))}
      <Audio src={staticFile("audio/story-signal.wav")} volume={0.85} />
      {[A2, A3, END].map((c) => (
        <Sfx key={c} name="whoosh-soft" at={c - 4} volume={0.28} />
      ))}
      {safeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

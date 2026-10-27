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
import globe from "../../../public/stories/baron/desktop-globe.json";
import journeys from "../../../public/stories/baron/mobile-journeys.json";

// Story: Baron Luxury Holidays (esolutify.com/demo/baron), 20 s, 9:16. A
// journey in four legs, in the site's navy and gold: an airport departure
// board flips to whatever the site is showing, and the site's gold plane
// flies each cut, then a boarding pass for the end card.
//   0–160    laptop: the route globe, four region taps, the board flips
//   160–340  phone: the journey filters, two taps, the cards scroll
//   340–480  tablet: tour of the month, then the Baron difference
//   480–600  end card: a boarding pass, "Give your business a first-class
//            website."
// Music: story-voyage.wav (scripts/gen_story_music.py voyage): the groove at
// 160, a lift at 340, the end card at 480.

export const BARON_DURATION = 600;
const A2 = 160;
const A3 = 340;
const END = 480;
const SRC = "stories/baron";

const BA = {
  navy: "#0A1326",
  navy2: "#111D38",
  tile: "#0E1830",
  gold: "#C9A24A",
  goldLight: "#E3C77E",
  cream: "#F3EBDD",
  muted: "#8C97AE",
};
const serif: React.CSSProperties = {
  fontFamily: theme.fonts.garamond,
  fontWeight: 500,
  letterSpacing: "-0.01em",
};
const label: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 20,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

// ---------------------------------------------------------------- the night
const Night: React.FC = () => {
  const frame = useCurrentFrame();
  const stars = Array.from({ length: 70 }, (_, i) => ({
    x: (i * 337) % 1080,
    y: (i * 911) % 1920,
    r: 1 + ((i * 7) % 3) * 0.6,
    tw: 0.35 + 0.35 * Math.sin(frame / 14 + i),
  }));
  return (
    <AbsoluteFill style={{ backgroundColor: BA.navy }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(60,88,150,0.35), transparent 62%)",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#DCE4F5"
            opacity={s.tw}
          />
        ))}
        {/* a faint globe grid turning behind everything */}
        <g
          opacity={0.1}
          stroke={BA.gold}
          fill="none"
          strokeWidth={1.4}
          transform="translate(540 1000)"
        >
          <circle r={760} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const ph = ((frame / 240 + k / 6) % 1) * Math.PI;
            return (
              <ellipse key={k} rx={Math.abs(Math.cos(ph)) * 760} ry={760} />
            );
          })}
          {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
            <ellipse
              key={k}
              cy={k * 760}
              rx={Math.sqrt(1 - k * k) * 760}
              ry={22}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the board
const CHARS = "ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
const Flap: React.FC<{
  text: string;
  at: number;
  len: number;
  size?: number;
  color?: string;
}> = ({ text, at, len, size = 46, color = BA.cream }) => {
  const frame = useCurrentFrame();
  const t = text.toUpperCase().padEnd(len, " ").slice(0, len);
  const w = Math.round(size * 0.82);
  return (
    <div style={{ display: "flex", gap: Math.round(size * 0.08) }}>
      {t.split("").map((ch, i) => {
        const settle = at + 4 + i * 1.3;
        const flipping = frame >= at && frame < settle;
        const shown = flipping
          ? CHARS[(i * 7919 + Math.floor(frame) * 31) % CHARS.length]
          : ch;
        return (
          <div
            key={i}
            style={{
              position: "relative",
              width: w,
              height: Math.round(size * 1.3),
              borderRadius: 5,
              background: BA.tile,
              boxShadow: "inset 0 0 0 1px rgba(201,162,74,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fonts.mono,
              fontWeight: 500,
              fontSize: size,
              color: flipping ? BA.goldLight : color,
              overflow: "hidden",
            }}
          >
            {shown === " " ? "" : shown}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 2,
                background: "rgba(0,0,0,0.55)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// the latest entry whose time has come
const latest = <T extends { at: number }>(list: T[], frame: number) =>
  [...list].reverse().find((e) => frame >= e.at) ?? list[0];

// ---------------------------------------------------------------- caption
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
        left: 50,
        right: 50,
        top: 230,
        opacity: 1 - out,
      }}
    >
      {eyebrow ? (
        <div
          style={{ ...label, color: BA.gold, marginBottom: 18, opacity: inA }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          ...serif,
          fontSize: 92,
          lineHeight: 1.0,
          color: BA.cream,
          opacity: inA,
          translate: `0px ${(1 - inA) * 22}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...serif,
          fontStyle: "italic",
          fontSize: 92,
          lineHeight: 1.06,
          color: BA.gold,
          opacity: inB,
          translate: `0px ${(1 - inB) * 22}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// a gold pointer gliding between taps (css px of the recording)
const Pointer: React.FC<{
  taps: { frame: number; x: number; y: number }[];
  from: number;
  screen: { x: number; y: number; s: number };
  show: number;
  finger?: boolean;
}> = ({ taps, from, screen, show, finger }) => {
  const frame = useCurrentFrame();
  const tap = [...taps].reverse().find((t) => frame >= from + t.frame);
  const since = tap ? frame - from - tap.frame : 99;
  let cx = taps[0].x + 160;
  let cy = taps[0].y + 120;
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
            border: `3px solid ${BA.goldLight}`,
            opacity: 1 - since / 14,
          }}
        />
      ) : null}
      {finger ? (
        <div
          style={{
            position: "absolute",
            left: -22,
            top: -22,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(243,235,221,0.55)",
            border: "2px solid rgba(255,255,255,0.9)",
            scale: since < 5 ? 0.82 : 1,
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        />
      ) : (
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
      )}
    </div>
  );
};

const BoardHead: React.FC<{ text: string; right: string }> = ({
  text,
  right,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      ...label,
      fontSize: 19,
      color: BA.gold,
      marginBottom: 14,
    }}
  >
    <span>✈ {text}</span>
    <span style={{ color: BA.muted }}>{right}</span>
  </div>
);

// ---------------------------------------------------------------- act 1
const LAP_W = 900;
const LAP = { x: 540 - (LAP_W * 1.16) / 2, y: 640 };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const GLOBE_FROM = 2;
const ROUTES = [
  { label: "All routes", cities: "33 years of routes" },
  { label: "Scandinavia", cities: "Copenhagen · Oslo · Stockholm" },
  { label: "Far East", cities: "Bangkok · Tokyo" },
  { label: "The Americas", cities: "Los Angeles · Hawaii · Iguazú" },
  { label: "All routes", cities: "25+ countries covered" },
];
const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const board = ROUTES.map((r, i) => ({
    ...r,
    at: i === 0 ? 10 : GLOBE_FROM + globe.taps[i - 1].frame,
  }));
  const cur = latest(board, frame);
  return (
    <>
      <Caption
        from={4}
        to={A2 - 6}
        eyebrow="Baron Luxury Holidays · Dubai"
        a="Tap a region."
        b="The globe flies there."
      />
      <div style={{ position: "absolute", left: LAP.x, top: LAP.y }}>
        <LaptopRec
          src={`${SRC}/desktop-globe.mp4`}
          width={LAP_W}
          from={GLOBE_FROM}
          hold
        />
      </div>
      <Pointer taps={globe.taps} from={GLOBE_FROM} screen={LSCREEN} show={12} />
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 1330,
          opacity: ease(frame, 8, 20),
        }}
      >
        <BoardHead text="Departures · DXB" right="Gate B" />
        <Flap text={cur.label} at={cur.at} len={12} size={58} />
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.fonts.body,
            fontSize: 34,
            color: BA.muted,
            opacity: ease(frame, cur.at + 10, cur.at + 20),
          }}
        >
          {cur.cities}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- act 2
const PH_W = 500;
const PH = { x: 40, y: 520 };
const PSCREEN = {
  x: PH.x + PH_W * 0.035,
  y: PH.y + PH_W * 0.035,
  s: PH_W / 390,
};
const JOUR_FROM = A2 - 4;
const FILTERS = ["Weekly Escapes", "Grand Journeys"];
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = FILTERS.map((f, i) => ({
    f,
    at: JOUR_FROM + journeys.taps[i].frame,
  }));
  return (
    <>
      <Caption
        from={A2 + 8}
        to={A3 - 6}
        a="Filter the trips."
        b="Find yours fast."
      />
      <div style={{ position: "absolute", left: PH.x, top: PH.y }}>
        <PhoneRec
          src={`${SRC}/mobile-journeys.mp4`}
          width={PH_W}
          from={JOUR_FROM}
          hold
        />
      </div>
      <Pointer
        taps={journeys.taps}
        from={JOUR_FROM}
        screen={PSCREEN}
        show={A2 + 30}
        finger
      />
      <div style={{ position: "absolute", left: 620, top: 700, width: 420 }}>
        <BoardHead text="Journeys" right="Filter" />
        {rows.map((r, i) =>
          frame >= r.at - 2 ? (
            <div key={r.f} style={{ marginBottom: 18 }}>
              <Flap
                text={r.f.split(" ")[0]}
                at={r.at}
                len={7}
                size={44}
                color={
                  i === rows.length - 1 || frame < rows[i + 1].at
                    ? BA.cream
                    : BA.muted
                }
              />
            </div>
          ) : null,
        )}
        <div
          style={{
            marginTop: 30,
            ...serif,
            fontSize: 44,
            lineHeight: 1.18,
            color: BA.cream,
            opacity: ease(frame, A2 + 120, A2 + 136),
          }}
        >
          Fixed dates,
          <br />
          weekly escapes,
          <br />
          <span style={{ color: BA.gold, fontStyle: "italic" }}>
            or your own dates.
          </span>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 660;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 540 };
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stub = spring({
    frame: frame - A3 - 40,
    fps,
    config: theme.spring.smooth,
  });
  return (
    <>
      <Caption
        from={A3 + 8}
        to={END - 6}
        a="Tour of the month,"
        b="told beautifully."
      />
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-spotlight.mp4`}
          width={TAB_W}
          from={A3 - 4}
          trim={2}
          hold
        />
      </div>
      {/* the price, as a ticket stub */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 1420,
          width: 440,
          padding: "22px 28px",
          borderRadius: 16,
          background: BA.cream,
          boxShadow: "0 24px 50px -18px rgba(0,0,0,0.7)",
          rotate: `${-4 + (1 - stub) * 8}deg`,
          translate: `${(1 - stub) * 500}px 0px`,
        }}
      >
        <div style={{ ...label, fontSize: 16, color: "#8A6A22" }}>
          Heart of Scandinavia
        </div>
        <div
          style={{
            display: "flex",
            gap: 26,
            marginTop: 10,
            alignItems: "baseline",
            color: BA.navy,
          }}
        >
          <span style={{ ...serif, fontSize: 64, fontWeight: 600 }}>
            €2,970
          </span>
          <span style={{ fontFamily: theme.fonts.body, fontSize: 26 }}>
            14 days · 3 countries
          </span>
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
  const pass = spring({ frame: frame - END, fps, config: theme.spring.smooth });
  return (
    <>
      {/* the boarding pass */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 250,
          height: 900,
          borderRadius: 30,
          background: BA.cream,
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.8)",
          translate: `0px ${(1 - pass) * 900}px`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 150,
            background: BA.navy2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 44px",
          }}
        >
          <Img
            src={staticFile("brand/logo.png")}
            style={{ width: 210, display: "block" }}
          />
          <div style={{ ...label, color: BA.gold, fontSize: 22 }}>
            Boarding pass
          </div>
        </div>
        <div style={{ padding: "40px 44px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              color: BA.navy,
              ...up(2),
            }}
          >
            <div>
              <div style={{ ...label, fontSize: 17, color: "#8A6A22" }}>
                From
              </div>
              <div style={{ ...serif, fontSize: 64, fontWeight: 600 }}>
                Your idea
              </div>
            </div>
            <div style={{ fontSize: 44, color: BA.gold, paddingBottom: 12 }}>
              ✈
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...label, fontSize: 17, color: "#8A6A22" }}>To</div>
              <div style={{ ...serif, fontSize: 64, fontWeight: 600 }}>
                Live site
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 36,
              borderTop: `3px dashed rgba(10,19,38,0.2)`,
            }}
          />
          <div
            style={{
              ...serif,
              marginTop: 40,
              fontSize: 104,
              lineHeight: 0.98,
              color: BA.navy,
              ...up(6),
            }}
          >
            Give your business
          </div>
          <div
            style={{
              ...serif,
              fontStyle: "italic",
              fontSize: 104,
              lineHeight: 1.04,
              color: "#A7832F",
              ...up(9),
            }}
          >
            a first-class website.
          </div>
          <div
            style={{
              marginTop: 30,
              fontFamily: theme.fonts.body,
              fontWeight: 500,
              fontSize: 38,
              lineHeight: 1.32,
              color: "#4E5870",
              ...up(12),
            }}
          >
            See your new site free,
            <br />
            before you pay a dollar.
          </div>
          <div
            style={{
              marginTop: 42,
              display: "flex",
              gap: 40,
              ...label,
              fontSize: 18,
              color: "#8A6A22",
              ...up(14),
            }}
          >
            <span>Seat 1A</span>
            <span>Class: First</span>
            <span>Built by eSolutify</span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 1230,
          height: 104,
          padding: "0 42px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: BA.gold,
          boxShadow: "0 18px 40px -14px rgba(201,162,74,0.6)",
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 44,
          color: BA.navy,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={40} color={BA.navy} stroke={2.6} />
        <LightSweep start={END + 50} duration={24} width={140} opacity={0.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 1362,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: BA.cream,
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
          ...label,
          fontSize: 24,
          color: BA.gold,
          ...up(24),
        }}
      >
        tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={BA.gold} stroke={2.6} />
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- the plane
// The site's gold plane flies a curved route across each cut.
const Flight: React.FC<{ at: number; flip?: boolean }> = ({ at, flip }) => {
  const frame = useCurrentFrame();
  const t = ease(frame, at - 16, at + 12, theme.ease.inOut);
  if (frame < at - 16 || frame > at + 26) return null;
  const P0 = { x: flip ? 1200 : -120, y: 1560 };
  const P1 = { x: 540, y: 160 };
  const P2 = { x: flip ? -120 : 1200, y: 760 };
  const pt = (u: number) => ({
    x: (1 - u) ** 2 * P0.x + 2 * (1 - u) * u * P1.x + u ** 2 * P2.x,
    y: (1 - u) ** 2 * P0.y + 2 * (1 - u) * u * P1.y + u ** 2 * P2.y,
  });
  const p = pt(t);
  const q = pt(Math.min(1, t + 0.01));
  const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
  const d = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  const fade = 1 - ease(frame, at + 12, at + 26);
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", zIndex: 20, pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={BA.gold}
        strokeWidth={4}
        pathLength={1}
        strokeDasharray={`${t} 1`}
        opacity={0.85 * fade}
        filter="drop-shadow(0 0 8px rgba(227,199,126,0.8))"
      />
      <g
        transform={`translate(${p.x} ${p.y}) rotate(${ang}) scale(2.2)`}
        opacity={fade}
      >
        <path
          d="M14 0 L4 -2 L-4 -12 L-7 -12 L-2 -2 L-10 -2 L-13 -6 L-15 -6 L-13 0 L-15 6 L-13 6 L-10 2 L-2 2 L-7 12 L-4 12 L4 2 Z"
          fill={BA.goldLight}
        />
      </g>
    </svg>
  );
};

// each leg slides in from the right as the last one leaves to the left
const Leg: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from - 12 || frame > to + 12) return null;
  const inn =
    from === 0 ? 1 : ease(frame, from - 12, from + 10, theme.ease.inOut);
  const out = ease(frame, to - 12, to + 10, theme.ease.inOut);
  return (
    <AbsoluteFill
      style={{
        translate: `${(1 - inn) * 1080 - out * 1080}px 0px`,
        isolation: "isolate",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const BaronStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BA.navy }}>
      <Night />
      <Leg from={0} to={A2}>
        <Act1 />
      </Leg>
      <Leg from={A2} to={A3}>
        <Act2 />
      </Leg>
      <Leg from={A3} to={END}>
        <Act3 />
      </Leg>
      <Leg from={END} to={10_000}>
        <EndCard />
      </Leg>
      <Flight at={A2} />
      <Flight at={A3} flip />
      <Flight at={END} />
      <Audio src={staticFile("audio/story-voyage.wav")} volume={0.85} />
      {[A2, A3, END].map((c) => (
        <Sfx key={c} name="whoosh-soft" at={c - 10} volume={0.3} />
      ))}
      {globe.taps.map((t) => (
        <Sfx
          key={t.frame}
          name="tick"
          at={GLOBE_FROM + t.frame - 1}
          volume={0.2}
        />
      ))}
      {journeys.taps.map((t) => (
        <Sfx
          key={t.frame}
          name="tick"
          at={JOUR_FROM + t.frame - 1}
          volume={0.2}
        />
      ))}
      {safeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

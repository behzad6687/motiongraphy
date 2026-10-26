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
import { LaptopRec, PhoneRec, TabletRec } from "../kit";
import compare from "../../../public/stories/hb/desktop-compare.json";
import finish from "../../../public/stories/hb/tablet-finish.json";
import projects from "../../../public/stories/hb/mobile-projects.json";

// Story: HB Developments (esolutify.com/demo/hb), 20 s, 9:16. Quiet,
// architectural: forest green and stone, thin type. The site's idea is the
// before and after (a real construction site that scrolls into the
// architect's render), so every scene change is a before/after divider
// sweeping across the frame.
//   0–150    the desktop "scroll to build" film, full-bleed: framing on a
//            muddy lot becomes the finished house; chapter counter 00–02
//   150–300  laptop: the before/after slider dragged
//   300–420  tablet: Mid-Range or Luxury finishes
//   420–510  phone: four projects, one tap each
//   510–600  end card: "See what your website could become."
// Music: story-verdant.wav (scripts/gen_story_music.py verdant): drop 5 s
// (150), lift 10 s (300), end card 17 s (510).

export const HB_DURATION = 600;
const A2 = 150;
const A3 = 300;
const A4 = 420;
const END = 510;
const SRC = "stories/hb";

const HB = {
  forest: "#1E2B22",
  forest2: "#2A3A2F",
  stone: "#ECEAE4",
  stone2: "#E1DED6",
  ink: "#1B1F1C",
  muted: "#7D877F",
  pale: "#C9CFC4",
};
const thin: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontWeight: 300,
  letterSpacing: "-0.045em",
};
const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontWeight: 600,
  fontSize: 22,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

// ---------------------------------------------------------------- divider
// Scene changes: a before/after divider with its round handle sweeps across;
// the new scene is on the side it has passed.
const wipe = (frame: number, at: number) =>
  ease(frame, at - 10, at + 12, theme.ease.inOut);
const Scene: React.FC<{
  from: number;
  to?: number;
  fromLeft?: boolean;
  children: React.ReactNode;
}> = ({ from, to, fromLeft = false, children }) => {
  const frame = useCurrentFrame();
  const pin = from === 0 ? 1 : wipe(frame, from);
  if (pin <= 0) return null;
  if (to !== undefined && wipe(frame, to) >= 1) return null;
  const clip = fromLeft
    ? `inset(0 ${(1 - pin) * 100}% 0 0)`
    : `inset(0 0 0 ${(1 - pin) * 100}%)`;
  return (
    <AbsoluteFill
      style={{ clipPath: pin < 1 ? clip : undefined, isolation: "isolate" }}
    >
      {children}
    </AbsoluteFill>
  );
};
const Divider: React.FC<{ at: number; fromLeft?: boolean }> = ({
  at,
  fromLeft = false,
}) => {
  const frame = useCurrentFrame();
  const p = wipe(frame, at);
  if (p <= 0 || p >= 1) return null;
  const x = fromLeft ? p * 1080 : (1 - p) * 1080;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: 0,
        bottom: 0,
        width: 4,
        background: "#fff",
        zIndex: 9,
        boxShadow: "0 0 30px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -40,
          top: 920,
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: HB.ink,
          fontFamily: theme.fonts.body,
          fontSize: 38,
          fontWeight: 500,
        }}
      >
        ⟷
      </div>
    </div>
  );
};

const Caption: React.FC<{
  from: number;
  to: number;
  a: string;
  b: string;
  color?: string;
  dim?: string;
}> = ({ from, to, a, b, color = HB.ink, dim = HB.muted }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 4) return null;
  const out = ease(frame, to - 8, to + 2, theme.ease.in);
  const inA = ease(frame, from, from + 16);
  const inB = ease(frame, from + 6, from + 22);
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
          ...thin,
          fontSize: 96,
          lineHeight: 1,
          color,
          opacity: inA,
          translate: `0px ${(1 - inA) * 24}px`,
        }}
      >
        {a}
      </div>
      <div
        style={{
          ...thin,
          fontSize: 96,
          lineHeight: 1.04,
          color: dim,
          opacity: inB,
          translate: `0px ${(1 - inB) * 24}px`,
        }}
      >
        {b}
      </div>
    </div>
  );
};

// a finger at a recorded tap (css px of the recording) on a device screen
const Finger: React.FC<{
  x: number;
  y: number;
  since: number;
  dark?: boolean;
}> = ({ x, y, since, dark }) => {
  const ring = interpolate(since, [0, 16], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 5 }}>
      <div
        style={{
          position: "absolute",
          left: -56 * ring - 12,
          top: -56 * ring - 12,
          width: 112 * ring + 24,
          height: 112 * ring + 24,
          borderRadius: "50%",
          border: `3px solid ${dark ? HB.forest : "#fff"}`,
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
          background: "rgba(255,255,255,0.6)",
          border: "3px solid #fff",
          boxShadow: "0 10px 28px rgba(0,0,0,0.3)",
          opacity: 1 - ease(since, 12, 24),
          scale: since < 6 ? 1 - Math.sin((since / 6) * Math.PI) * 0.2 : 1,
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------- act 1
// The film at full height; the crop is centred on the house.
const FILM_SCALE = 1920 / 900; // story px per css px
const FILM_W = 1440 * FILM_SCALE;
const FOCUS_X = 1060; // css x of the house's middle
const CHAPTERS = [
  { at: 0, n: "00", t: "The site" },
  { at: 62, n: "01", t: "Vision" },
  { at: 118, n: "02", t: "Craft" },
];
const Act1: React.FC = () => {
  const frame = useCurrentFrame();
  const cur = [...CHAPTERS].reverse().find((c) => frame >= c.at) ?? CHAPTERS[0];
  const since = frame - cur.at;
  const drift = interpolate(frame, [0, A2], [0, -60], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: HB.forest }}>
      <OffthreadVideo
        src={staticFile(`${SRC}/desktop-film.mp4`)}
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 540 - FOCUS_X * FILM_SCALE + drift,
          width: FILM_W,
          height: 1920,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(20,30,24,0.82) 0%, rgba(20,30,24,0.35) 32%, transparent 48%, transparent 70%, rgba(20,30,24,0.7) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 70, top: 290 }}>
        <div style={{ ...label, color: HB.pale, opacity: ease(frame, 2, 14) }}>
          HB Developments · Toronto
        </div>
        <div
          style={{
            ...thin,
            marginTop: 22,
            fontSize: 104,
            lineHeight: 1,
            color: "#fff",
            opacity: ease(frame, 6, 22),
          }}
        >
          Scroll,
        </div>
        <div
          style={{
            ...thin,
            fontSize: 104,
            lineHeight: 1.04,
            color: "transparent",
            WebkitTextStroke: "2px #fff",
            opacity: ease(frame, 14, 30),
          }}
        >
          and it&apos;s built.
        </div>
      </div>
      {/* chapter counter, like the site's own */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 1440,
          display: "flex",
          alignItems: "baseline",
          gap: 22,
        }}
      >
        <div
          style={{
            ...thin,
            fontSize: 150,
            lineHeight: 1,
            color: "#fff",
            opacity: ease(since, 0, 8),
            translate: `0px ${(1 - ease(since, 0, 10)) * 30}px`,
          }}
        >
          {cur.n}
        </div>
        <div style={{ ...label, fontSize: 26, color: HB.pale }}>{cur.t}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1610,
          height: 2,
          background: "rgba(255,255,255,0.25)",
        }}
      >
        <div
          style={{
            width: `${interpolate(frame, [0, A2], [0, 100], clamp)}%`,
            height: 2,
            background: "#fff",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2
const LAP_W = 1000;
const LAP = { x: 540 - (LAP_W * 1.16) / 2, y: 720 };
const LSCREEN = {
  x: LAP.x + (LAP_W * 1.16 - LAP_W * 1.044) / 2 + LAP_W * 0.022,
  y: LAP.y + LAP_W * 0.03,
  s: LAP_W / 1440,
};
const CMP_FROM = A2 - 6;
const Act2: React.FC = () => {
  const frame = useCurrentFrame();
  const r = frame - CMP_FROM;
  const drags = compare.drags;
  const cur = [...drags].reverse().find((d) => d.frame <= r) ?? drags[0];
  const dragging = drags.some((d) => d.frame === r);
  const show =
    ease(r, drags[0].frame - 10, drags[0].frame - 2) *
    (1 -
      ease(
        r,
        drags[drags.length - 1].frame + 6,
        drags[drags.length - 1].frame + 16,
      ));
  return (
    <AbsoluteFill style={{ backgroundColor: HB.stone }}>
      <div style={{ position: "absolute", left: LAP.x, top: LAP.y }}>
        <LaptopRec
          src={`${SRC}/desktop-compare.mp4`}
          width={LAP_W}
          from={CMP_FROM}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: LSCREEN.x + cur.x * LSCREEN.s,
          top: LSCREEN.y + cur.y * LSCREEN.s,
          opacity: show,
          zIndex: 5,
        }}
      >
        <svg
          width={44}
          height={52}
          viewBox="0 0 22 26"
          style={{
            position: "absolute",
            left: -4,
            top: 6,
            scale: dragging ? 0.9 : 1,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
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
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1440,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ ...label, color: HB.muted }}>The actual site</div>
        <div style={{ ...label, color: HB.ink }}>
          The architect&apos;s render
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3
const TAB_W = 620;
const TAB = { x: 540 - (TAB_W * 1.09) / 2, y: 560 };
const FIN_FROM = A3 - 8;
const Act3: React.FC = () => {
  const frame = useCurrentFrame();
  const s = TAB_W / 820;
  const bezel = Math.round(TAB_W * 0.045);
  const last = [...finish.taps]
    .reverse()
    .find((t) => frame >= FIN_FROM + t.frame);
  const since = last ? frame - FIN_FROM - last.frame : 99;
  return (
    <AbsoluteFill style={{ backgroundColor: HB.stone2 }}>
      <div style={{ position: "absolute", left: TAB.x, top: TAB.y }}>
        <TabletRec
          src={`${SRC}/tablet-finish.mp4`}
          width={TAB_W}
          from={FIN_FROM}
          hold
        />
      </div>
      {last && since < 24 ? (
        <Finger
          x={TAB.x + bezel + last.x * s}
          y={TAB.y + bezel + last.y * s}
          since={since}
          dark
        />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 4
const PH_W = 440;
const PH = { x: 540 - (PH_W * 1.07) / 2, y: 560 };
const PRJ_FROM = A4 - 8;
const Act4: React.FC = () => {
  const frame = useCurrentFrame();
  const s = PH_W / 390;
  const bezel = Math.round(PH_W * 0.035);
  const last = [...projects.taps]
    .reverse()
    .find((t) => frame >= PRJ_FROM + t.frame);
  const since = last ? frame - PRJ_FROM - last.frame : 99;
  return (
    <AbsoluteFill style={{ backgroundColor: HB.stone }}>
      <div style={{ position: "absolute", left: PH.x, top: PH.y }}>
        <PhoneRec
          src={`${SRC}/mobile-projects.mp4`}
          width={PH_W}
          from={PRJ_FROM}
          hold
        />
      </div>
      {last && since < 24 ? (
        <Finger
          x={PH.x + bezel + last.x * s}
          y={PH.y + bezel + last.y * s}
          since={since}
          dark
        />
      ) : null}
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
  const fill = ease(frame, END + 30, END + 60);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: HB.forest }}>
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
        <div style={{ ...label, color: HB.pale, ...up(3) }}>
          HB Developments · built by eSolutify
        </div>
        <div
          style={{
            ...thin,
            marginTop: 30,
            fontSize: 112,
            lineHeight: 1,
            color: "#fff",
            ...up(6),
          }}
        >
          See what
          <br />
          your website
          <br />
          could
        </div>
        <div
          style={{
            position: "relative",
            ...thin,
            fontSize: 112,
            lineHeight: 1.04,
            ...up(9),
          }}
        >
          <span style={{ color: "transparent", WebkitTextStroke: "2px #fff" }}>
            become.
          </span>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: "#fff",
              clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`,
            }}
          >
            become.
          </span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.32,
            color: HB.pale,
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
          top: 1270,
          height: 104,
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          gap: 22,
          overflow: "hidden",
          background: HB.stone,
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 42,
          letterSpacing: "-0.02em",
          color: HB.ink,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={40} color={HB.ink} stroke={2.4} />
        <LightSweep start={END + 46} duration={24} width={140} opacity={0.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          top: 1404,
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 34,
          color: "#fff",
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
          top: 1466,
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...label,
          color: HB.pale,
          ...up(24),
        }}
      >
        Tap the link
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={34} color={HB.pale} stroke={2.4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HBStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: HB.forest }}>
    <Scene from={0} to={A2}>
      <Act1 />
    </Scene>
    <Scene from={A2} to={A3}>
      <Act2 />
    </Scene>
    <Scene from={A3} to={A4} fromLeft>
      <Act3 />
    </Scene>
    <Scene from={A4} to={END}>
      <Act4 />
    </Scene>
    <Scene from={END} fromLeft>
      <EndCard />
    </Scene>
    <Divider at={A2} />
    <Divider at={A3} fromLeft />
    <Divider at={A4} />
    <Divider at={END} fromLeft />
    <Caption
      from={A2 + 6}
      to={A3 - 6}
      a="The site today."
      b="The home tomorrow."
    />
    <Caption from={A3 + 6} to={A4 - 6} a="Mid-range" b="or luxury?" />
    <Caption from={A4 + 6} to={END - 6} a="Every project," b="one tap away." />
    <Audio src={staticFile("audio/story-verdant.wav")} volume={0.85} />
    {[A2, A3, A4, END].map((c) => (
      <Sfx key={c} name="whoosh-soft" at={c - 12} volume={0.28} />
    ))}
    {finish.taps.map((t) => (
      <Sfx
        key={`f${t.frame}`}
        name="tick"
        at={FIN_FROM + t.frame - 1}
        volume={0.2}
      />
    ))}
    {projects.taps.map((t) => (
      <Sfx
        key={`p${t.frame}`}
        name="tick"
        at={PRJ_FROM + t.frame - 1}
        volume={0.2}
      />
    ))}
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

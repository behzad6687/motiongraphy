import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
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
import rescue from "../../../public/stories/samantha/mobile-rescue.json";

// Story: Samantha Beauty Salon (esolutify.com/demo/samantha), 20 s, 9:16.
// One continuous camera move across a "desk" of three devices, in the
// salon's chocolate and gold:
//   0–152    tight on the laptop's gilded mirror: the desktop scroll film
//            wipes from one client's hair to the next
//   152–188  the camera pulls back to the whole laptop (music drop at 171)
//   228–338  it flies to the phone: the before/after slider is dragged
//   338–490  then to the tablet: 221 five-star reviews
//   490–516  a wide of all three, then the end card inside a gold arch
// Music: story-silk.wav (scripts/gen_story_music.py silk): drop 5.71 s,
// lift 11.4 s, end card 17.1 s.

export const SAM_DURATION = 600;
const DROP = 171;
const END = 514;
const SRC = "stories/samantha";

const SAM = {
  choc: "#1A110B",
  choc2: "#2A1B11",
  gold: "#C9A25A",
  goldLight: "#E9D29A",
  cream: "#F3EBDD",
  muted: "#B9A88F",
};
const GOLD = "linear-gradient(135deg, #B8893F 0%, #E9D29A 50%, #C9A25A 100%)";
const goldText: React.CSSProperties = {
  backgroundImage: GOLD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---------------------------------------------------------------- the world
// Device positions in world px (camera zoom 1 = Story px).
const LAPTOP = { x: 18, y: 600, w: 900 }; // screen starts at (90, 627)
const LAPTOP_SCREEN = { x: 90, y: 627, s: 900 / 1440 };
const PHONE = { x: 1260, y: 1150, w: 430 };
const PHONE_SCREEN = { x: 1275, y: 1165, s: 430 / 390 };
const TABLET = { x: 150, y: 1750, w: 560 };
const PHONE_FROM = 232; // phone recording starts here (trimmed by 8)
const PHONE_TRIM = 8;
const TABLET_FROM = 352;
// the gilded mirror inside the desktop film, in css px of the recording
const MIRROR = { x: 976, y: 480 };
const mirror = {
  x: LAPTOP_SCREEN.x + MIRROR.x * LAPTOP_SCREEN.s,
  y: LAPTOP_SCREEN.y + MIRROR.y * LAPTOP_SCREEN.s,
};

type Key = { f: number; x: number; y: number; z: number; fly?: boolean };
const KEYS: Key[] = [
  { f: 0, x: mirror.x, y: mirror.y - 110, z: 2.3 },
  { f: 152, x: mirror.x, y: mirror.y - 110, z: 2.5 },
  { f: 188, x: 540, y: 870, z: 1 },
  { f: 228, x: 540, y: 880, z: 1.02 },
  { f: 254, x: 1490, y: 1560, z: 1.1, fly: true },
  { f: 338, x: 1490, y: 1560, z: 1.13 },
  { f: 362, x: 455, y: 2130, z: 1.12, fly: true },
  { f: 490, x: 455, y: 2130, z: 1.17 },
  { f: 516, x: 869, y: 1640, z: 0.56 },
];
const camera = (frame: number) => {
  const i = Math.max(
    0,
    KEYS.findIndex((k, j) => frame < (KEYS[j + 1]?.f ?? Infinity)),
  );
  const a = KEYS[i];
  const b = KEYS[i + 1] ?? a;
  const moving = Math.hypot(b.x - a.x, b.y - a.y) > 50 || b.z / a.z > 1.3;
  const p =
    b === a
      ? 0
      : ease(frame, a.f, b.f, moving ? theme.ease.inOut : theme.ease.soft);
  const dip = b.fly ? 1 - 0.22 * Math.sin(Math.PI * p) : 1;
  return {
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p,
    z: a.z * Math.pow(b.z / a.z, p) * dip,
  };
};

// faint gold arches and dust, in world space, so the fly-throughs read
const ARCHES = [
  { x: -200, y: 300, w: 700, h: 1100 },
  { x: 1050, y: 700, w: 900, h: 1500 },
  { x: -100, y: 1500, w: 1000, h: 1400 },
];
const DUST = new Array(70).fill(0).map((_, i) => ({
  x: -300 + random(`dx${i}`) * 2400,
  y: 200 + random(`dy${i}`) * 2700,
  r: 2 + random(`dr${i}`) * 5,
  tw: random(`dt${i}`) * 6,
}));
const World: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {ARCHES.map((a, i) => (
        <svg
          key={i}
          width={a.w}
          height={a.h}
          style={{ position: "absolute", left: a.x, top: a.y, opacity: 0.16 }}
        >
          <path
            d={`M 6 ${a.h} L 6 ${a.w / 2} A ${a.w / 2 - 6} ${a.w / 2 - 6} 0 0 1 ${a.w - 6} ${a.w / 2} L ${a.w - 6} ${a.h}`}
            fill="none"
            stroke={SAM.gold}
            strokeWidth={4}
          />
        </svg>
      ))}
      {DUST.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y + Math.sin(frame / 40 + d.tw) * 12,
            width: d.r * 2,
            height: d.r * 2,
            borderRadius: "50%",
            background: SAM.goldLight,
            opacity: 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(frame / 18 + d.tw)),
            boxShadow: `0 0 ${d.r * 4}px ${SAM.gold}`,
          }}
        />
      ))}
    </>
  );
};

const Finger: React.FC = () => {
  const frame = useCurrentFrame();
  const r = frame - PHONE_FROM + PHONE_TRIM; // recording frame
  const drags = rescue.drags;
  const first = drags[0].frame;
  const last = drags[drags.length - 1].frame;
  if (r < first - 10 || r > last + 14) return null;
  const cur = [...drags].reverse().find((d) => d.frame <= r) ?? drags[0];
  const dragging = drags.some((d) => d.frame === r);
  const show =
    ease(r, first - 10, first - 2) * (1 - ease(r, last + 4, last + 14));
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_SCREEN.x + cur.x * PHONE_SCREEN.s,
        top: PHONE_SCREEN.y + cur.y * PHONE_SCREEN.s,
        opacity: show,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -36,
          top: -36,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          border: "3px solid rgba(255,255,255,0.95)",
          boxShadow: `0 0 0 ${dragging ? 10 : 0}px rgba(233,210,154,0.35), 0 10px 30px rgba(0,0,0,0.45)`,
          scale: dragging ? 0.86 : 1,
        }}
      />
    </div>
  );
};

const Desk: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camera(frame);
  const gone = ease(frame, END - 4, END + 20, theme.ease.in);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - gone * 0.85,
        filter: gone > 0 ? `blur(${gone * 14}px)` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <World />
        <div style={{ position: "absolute", left: LAPTOP.x, top: LAPTOP.y }}>
          <LaptopRec
            src={`${SRC}/desktop-film.mp4`}
            width={LAPTOP.w}
            from={0}
          />
        </div>
        <div style={{ position: "absolute", left: PHONE.x, top: PHONE.y }}>
          <PhoneRec
            src={`${SRC}/mobile-rescue.mp4`}
            width={PHONE.w}
            from={PHONE_FROM}
            trim={PHONE_TRIM}
            hold
          />
        </div>
        <div style={{ position: "absolute", left: TABLET.x, top: TABLET.y }}>
          <TabletRec
            src={`${SRC}/tablet-reviews.mp4`}
            width={TABLET.w}
            from={TABLET_FROM}
            hold
          />
        </div>
        <Finger />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- captions
const CAPTIONS = [
  { from: 8, to: 146, a: "Scroll, and", b: "the look changes." },
  { from: 188, to: 230, a: "A scroll film,", b: "framed in gold." },
  { from: 256, to: 338, a: "Drag the line.", b: "See the rescue." },
  { from: 364, to: 490, a: "Her clients", b: "say it best." },
];
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ zIndex: 3 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: 640 + 140 * (1 - ease(frame, 148, 176)),
          background: `linear-gradient(180deg, ${SAM.choc} 0%, ${SAM.choc} ${30 + 35 * (1 - ease(frame, 148, 176))}%, rgba(26,17,11,0.8) ${70 + 15 * (1 - ease(frame, 148, 176))}%, transparent)`,
          opacity: 1 - ease(frame, END - 6, END + 6),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 280,
          textAlign: "center",
          fontFamily: theme.fonts.garamond,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.32em",
          color: SAM.gold,
          opacity: ease(frame, 4, 18) * (1 - ease(frame, 140, 152)),
        }}
      >
        SAMANTHA BEAUTY SALON · RICHMOND HILL
      </div>
      {CAPTIONS.map((c) => {
        if (frame < c.from || frame > c.to + 4) return null;
        const inA = ease(frame, c.from, c.from + 16);
        const inB = ease(frame, c.from + 8, c.from + 26);
        const out = ease(frame, c.to - 8, c.to + 2, theme.ease.in);
        const first = c.from === 8;
        return (
          <div
            key={c.a}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: first ? 330 : 300,
              textAlign: "center",
              opacity: 1 - out,
              translate: `0px ${-out * 20}px`,
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.garamond,
                fontWeight: 500,
                fontSize: 92,
                lineHeight: 1,
                color: SAM.cream,
                opacity: inA,
                translate: `0px ${(1 - inA) * 26}px`,
                filter: `blur(${(1 - inA) * 8}px)`,
              }}
            >
              {c.a}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.script,
                fontSize: 108,
                lineHeight: 1.15,
                marginTop: -6,
                paddingBottom: 10,
                ...goldText,
                opacity: inB,
                clipPath: `inset(0 ${(1 - inB) * 100}% 0 0)`,
              }}
            >
              {c.b}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
const ARCH = { x: 110, y: 250, w: 860, h: 1420 };
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < END - 6) return null;
  const veil = ease(frame, END - 6, END + 14);
  const draw = ease(frame, END, END + 36, theme.ease.inOut);
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 40}px`,
    };
  };
  const r = ARCH.w / 2;
  const path = `M 4 ${ARCH.h} L 4 ${r} A ${r - 4} ${r - 4} 0 0 1 ${ARCH.w - 4} ${r} L ${ARCH.w - 4} ${ARCH.h}`;
  const len = 2 * (ARCH.h - r) + Math.PI * (r - 4);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill style={{ zIndex: 6 }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${SAM.choc2}, ${SAM.choc} 70%)`,
          opacity: veil * 0.92,
        }}
      />
      <svg
        width={ARCH.w}
        height={ARCH.h}
        style={{ position: "absolute", left: ARCH.x, top: ARCH.y }}
      >
        <defs>
          <linearGradient id="samArch" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B8893F" />
            <stop offset="0.5" stopColor="#E9D29A" />
            <stop offset="1" stopColor="#C9A25A" />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="url(#samArch)"
          strokeWidth={5}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: ARCH.x,
          width: ARCH.w,
          top: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 230, ...up(0) }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: theme.fonts.garamond,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.2em",
            whiteSpace: "nowrap",
            color: SAM.gold,
            ...up(3),
          }}
        >
          SAMANTHA BEAUTY SALON · BUILT BY ESOLUTIFY
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.garamond,
            fontWeight: 500,
            fontSize: 104,
            lineHeight: 1,
            color: SAM.cream,
            ...up(6),
          }}
        >
          Your website
        </div>
        <div
          style={{
            fontFamily: theme.fonts.script,
            fontSize: 112,
            lineHeight: 1.2,
            paddingBottom: 8,
            ...goldText,
            ...up(9),
          }}
        >
          could look like this.
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 36,
            lineHeight: 1.35,
            color: SAM.muted,
            ...up(12),
          }}
        >
          See your new site free,
          <br />
          before you pay a dollar.
        </div>
        <div
          style={{
            marginTop: 44,
            height: 108,
            padding: "0 44px",
            borderRadius: 99,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: GOLD,
            boxShadow: "0 0 60px rgba(233,210,154,0.35)",
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 46,
            color: SAM.choc,
            ...up(16),
          }}
        >
          Get your free demo
          <Icon name="arrow" size={42} color={SAM.choc} stroke={2.8} />
          <LightSweep
            start={END + 40}
            duration={24}
            width={140}
            opacity={0.6}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 34,
            color: SAM.cream,
            ...up(20),
          }}
        >
          esolutify.com/free-demo
        </div>
        {/* the link sticker goes below this */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "0.12em",
            color: SAM.gold,
            ...up(24),
          }}
        >
          TAP THE LINK
          <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
            <Icon name="arrow" size={36} color={SAM.gold} stroke={2.8} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SamanthaStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, ${SAM.choc2}, ${SAM.choc} 75%)`,
    }}
  >
    <Desk />
    <Captions />
    <EndCard />
    <Audio src={staticFile("audio/story-silk.wav")} volume={0.85} />
    <Sfx name="whoosh-soft" at={DROP - 14} volume={0.3} />
    <Sfx name="whoosh-soft" at={232} volume={0.3} />
    <Sfx name="whoosh-soft" at={342} volume={0.3} />
    <Sfx name="shimmer" at={END - 2} volume={0.25} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

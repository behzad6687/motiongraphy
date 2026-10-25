import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
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
import { LaptopRec, TabletRec } from "../kit";
import tryon from "../../../public/stories/pedinnails/mobile-tryon.json";

// Story: Pedi n Nails (esolutify.com/demo/pedinnails), 20 s, 9:16.
// A light, editorial Story in the salon's own colours (cream, blush, royal
// blue, Bodoni serif), unlike the dark Downtown Dentists one.
//   0–129    the phone's scroll film plays full-bleed, like a salon video
//   129      on the music drop it pulls back into a phone: "This isn't a
//            video. It's a website."
//   176–392  the virtual nail try-on, tapped live: a finger on the phone, the
//            choices it makes listed beside it
//   392–514  laptop (services & prices) + tablet (client gallery), price chips
//   514–600  light end card
// Music: story-polish.wav (scripts/gen_story_music.py polish), drop at
// 4.29 s, lift at 12.9 s, end card at 17.1 s.

export const PN_DURATION = 600;
const REVEAL = 114; // pull-back runs 114–144, its middle on the drop (129)
const TRYON = 176;
const DEVICES = 392;
const END = 514;
const SRC = "stories/pedinnails";

// the salon's palette, sampled from the site
const PN = {
  cream: "#F6F3EE",
  blush: "#F0E3DF",
  blue: "#2844C2",
  navy: "#151A3D",
  ink: "#4A4E68",
  white: "#FFFFFF",
};
const serif: React.CSSProperties = {
  fontFamily: theme.fonts.serif,
  fontWeight: 500,
  letterSpacing: "-0.01em",
};
const italic: React.CSSProperties = {
  fontStyle: "italic",
  color: PN.blue,
};

// ---------------------------------------------------------------- background
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: PN.cream, overflow: "hidden" }}>
      {[
        { x: 140, y: 380, r: 520, c: PN.blush, s: 0 },
        { x: 960, y: 1180, r: 620, c: "#E6E9F8", s: 2 },
        { x: 300, y: 1700, r: 460, c: PN.blush, s: 4 },
      ].map((b) => (
        <div
          key={b.s}
          style={{
            position: "absolute",
            left: b.x - b.r + Math.sin(frame / 70 + b.s) * 40,
            top: b.y - b.r + Math.cos(frame / 80 + b.s) * 40,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the phone
// One phone for acts 1–2. Full-bleed at first (the screen fills the Story),
// it shrinks into a phone on the drop, then slides left for the try-on.
const SCREEN_A = { w: 520, x: 540 - 260, y: 540 }; // act 1, centred
const SCREEN_B = { w: 480, x: 100, y: 560 }; // act 2, left
const FILM_OFFSET = -350; // full-bleed: hide the site header, keep its copy

const screenRect = (frame: number) => {
  const k = ease(frame, REVEAL, REVEAL + 30, theme.ease.inOut);
  const m = ease(frame, TRYON - 6, TRYON + 16, theme.ease.inOut);
  const w = SCREEN_A.w + (SCREEN_B.w - SCREEN_A.w) * m;
  const x = SCREEN_A.x + (SCREEN_B.x - SCREEN_A.x) * m;
  const y = SCREEN_A.y + (SCREEN_B.y - SCREEN_A.y) * m;
  const h = (w * 844) / 390;
  return {
    k,
    x: x * k,
    y: y * k,
    w: 1080 + (w - 1080) * k,
    h: 1920 + (h - 1920) * k,
    vw: 1080 + (w - 1080) * k, // video width
    vy: FILM_OFFSET * (1 - k),
  };
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const r = screenRect(frame);
  const exit = ease(frame, DEVICES - 4, DEVICES + 12, theme.ease.in);
  if (exit >= 1) return null;
  const bezel = 18 * r.k;
  const radius = 70 * r.k;
  const swap = ease(frame, TRYON - 2, TRYON + 8);
  const vh = (r.vw * 844) / 390;
  const video: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: r.vy,
    width: r.vw,
    height: vh,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - bezel,
        top: r.y - bezel,
        width: r.w + bezel * 2,
        height: r.h + bezel * 2,
        padding: bezel,
        borderRadius: radius + bezel,
        background: "linear-gradient(150deg, #3A3A44, #101018 45%, #2A2A33)",
        boxShadow:
          r.k > 0
            ? `0 ${80 * r.k}px ${140 * r.k}px -40px rgba(21,26,61,${0.55 * r.k})`
            : undefined,
        translate: `${exit * -900}px ${exit * 120}px`,
        rotate: `${exit * -12}deg`,
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: "relative",
          width: r.w,
          height: r.h,
          borderRadius: radius,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {swap < 1 ? (
          <OffthreadVideo
            src={staticFile(`${SRC}/mobile-film.mp4`)}
            muted
            style={video}
          />
        ) : null}
        <Sequence from={TRYON - 2} layout="none">
          <OffthreadVideo
            src={staticFile(`${SRC}/mobile-tryon.mp4`)}
            muted
            style={{ ...video, opacity: swap }}
          />
        </Sequence>
        {/* dynamic island */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: r.w * 0.025,
            width: r.w * 0.3,
            height: r.w * 0.085,
            translate: "-50% 0px",
            borderRadius: 99,
            background: "#050505",
            opacity: r.k,
          }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- act 1 copy
const FILM_WORDS = [
  { from: 0, to: 60, a: "Marble floors.", it: false },
  { from: 60, to: REVEAL + 4, a: "Blue thrones.", it: true },
];
const FilmWords: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > REVEAL + 12) return null;
  const scrim = 1 - ease(frame, REVEAL - 6, REVEAL + 10);
  return (
    <AbsoluteFill style={{ zIndex: 4 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: 820,
          background:
            "linear-gradient(180deg, rgba(21,26,61,0.62), rgba(21,26,61,0.25) 60%, transparent)",
          opacity: scrim,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 300,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.24em",
          color: PN.white,
          opacity: ease(frame, 4, 16) * scrim,
        }}
      >
        PEDI N NAILS · SCARBOROUGH
      </div>
      {FILM_WORDS.map((w) => {
        if (frame < w.from || frame > w.to + 4) return null;
        const inP = ease(frame, w.from + 2, w.from + 16);
        const outP = ease(frame, w.to - 8, w.to + 2, theme.ease.in);
        return (
          <div
            key={w.a}
            style={{
              ...serif,
              position: "absolute",
              left: 40,
              right: 40,
              top: 362,
              textAlign: "center",
              fontSize: 118,
              lineHeight: 1,
              fontStyle: w.it ? "italic" : "normal",
              color: PN.white,
              textShadow: "0 6px 40px rgba(21,26,61,0.45)",
              opacity: inP * (1 - outP),
              translate: `0px ${(1 - inP) * 34 - outP * 20}px`,
              filter: `blur(${(1 - inP) * 10 + outP * 6}px)`,
            }}
          >
            {w.a}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const RevealWords: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < REVEAL + 8 || frame > TRYON + 2) return null;
  const out = ease(frame, TRYON - 10, TRYON - 2, theme.ease.in);
  const line = (d: number): React.CSSProperties => {
    const p = ease(frame, REVEAL + 12 + d, REVEAL + 28 + d);
    return {
      opacity: p * (1 - out),
      translate: `0px ${(1 - p) * 30 - out * 16}px`,
      filter: `blur(${(1 - p) * 8}px)`,
    };
  };
  return (
    <div
      style={{
        ...serif,
        position: "absolute",
        left: 40,
        right: 40,
        top: 290,
        textAlign: "center",
        fontSize: 88,
        lineHeight: 1.08,
        color: PN.navy,
        zIndex: 4,
      }}
    >
      <div style={line(0)}>This isn&apos;t a video.</div>
      <div style={{ ...line(14), ...italic }}>It&apos;s a website.</div>
    </div>
  );
};

// ---------------------------------------------------------------- act 2 try-on
const CHOICES = [
  { key: "Shape", first: "Almond" },
  { key: "Finish", first: "Gloss" },
  { key: "Colour", first: "Cobalt Crush" },
  { key: "Skin tone", first: "Medium" },
] as const;
// what each recorded tap picked (scripts/record_scroll.mjs logged where)
const TAP_PICKS: { key: (typeof CHOICES)[number]["key"]; v: string }[] = [
  { key: "Shape", v: "Coffin" },
  { key: "Shape", v: "Stiletto" },
  { key: "Finish", v: "Chrome" },
  { key: "Colour", v: "Lilac Haze" },
  { key: "Finish", v: "Glitter" },
  { key: "Colour", v: "Ballet Slipper" },
  { key: "Skin tone", v: "Deep" },
  { key: "Finish", v: "French" },
  { key: "Skin tone", v: "Light" },
];
const TAPS = tryon.taps.map((t, i) => ({
  ...t,
  at: TRYON - 2 + t.frame,
  ...TAP_PICKS[i],
}));

const Finger: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < TRYON || frame > DEVICES) return null;
  const r = screenRect(frame);
  const s = r.w / 390;
  const exit = ease(frame, DEVICES - 4, DEVICES + 12, theme.ease.in);
  // glide from tap to tap, arriving 2 frames before each one lands
  let x = TAPS[0].x;
  let y = TAPS[0].y + 120;
  for (let i = 0; i < TAPS.length; i++) {
    const t = TAPS[i];
    const p = ease(frame, t.at - 12, t.at - 2, theme.ease.inOut);
    x += (t.x - x) * p;
    y += (t.y - y) * p;
  }
  const show = ease(frame, TRYON + 2, TRYON + 10) * (1 - exit);
  const last = [...TAPS].reverse().find((t) => frame >= t.at);
  const since = last ? frame - last.at : 99;
  const press = since < 6 ? Math.sin((since / 6) * Math.PI) : 0;
  const ring = interpolate(since, [0, 16], [0, 1], clamp);
  const px = r.x + x * s;
  const py = r.y + y * s;
  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        zIndex: 5,
        opacity: show,
        translate: `${exit * -900}px ${exit * 120}px`,
      }}
    >
      {since < 16 ? (
        <div
          style={{
            position: "absolute",
            left: -60 * ring - 20,
            top: -60 * ring - 20,
            width: 120 * ring + 40,
            height: 120 * ring + 40,
            borderRadius: "50%",
            border: `4px solid ${PN.blue}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: -34,
          top: -34,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "3px solid rgba(255,255,255,0.95)",
          boxShadow: "0 10px 30px rgba(21,26,61,0.35)",
          scale: 1 - press * 0.22,
        }}
      />
    </div>
  );
};

const TryOnPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < TRYON || frame > DEVICES + 10) return null;
  const out = ease(frame, DEVICES - 6, DEVICES + 6, theme.ease.in);
  const head = ease(frame, TRYON + 4, TRYON + 20);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, zIndex: 4 }}>
      <div
        style={{
          ...serif,
          position: "absolute",
          left: 40,
          right: 40,
          top: 290,
          textAlign: "center",
          fontSize: 92,
          lineHeight: 1.04,
          color: PN.navy,
          opacity: head,
          translate: `0px ${(1 - head) * 30}px`,
        }}
      >
        Try a look
        <br />
        <span style={italic}>before you book.</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 624,
          right: 40,
          top: 640,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.2em",
          color: PN.ink,
          opacity: ease(frame, TRYON + 12, TRYON + 24),
        }}
      >
        LIVE NAIL TRY-ON
      </div>
      {CHOICES.map((c, i) => {
        const inP = spring({
          frame: frame - TRYON - 14 - i * 5,
          fps,
          config: theme.spring.smooth,
        });
        const picks = TAPS.filter((t) => t.key === c.key && frame >= t.at);
        const cur = picks[picks.length - 1];
        const since = cur ? frame - cur.at : 99;
        const flip = ease(since, 0, 10);
        const hot = cur ? 1 - ease(since, 16, 30, theme.ease.soft) : 0;
        const prev = picks.length > 1 ? picks[picks.length - 2].v : c.first;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left: 624,
              right: 30,
              top: 700 + i * 150,
              height: 128,
              padding: "16px 0 0 28px",
              borderLeft: `5px solid ${hot > 0.01 ? PN.blue : "rgba(21,26,61,0.15)"}`,
              background: `linear-gradient(90deg, rgba(40,68,194,${0.1 * hot}), transparent)`,
              opacity: interpolate(inP, [0, 0.4], [0, 1], clamp),
              translate: `${(1 - inP) * 60}px 0px`,
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "0.16em",
                color: hot > 0.5 ? PN.blue : PN.ink,
              }}
            >
              {c.key.toUpperCase()}
            </div>
            <div
              style={{ position: "relative", height: 70, overflow: "hidden" }}
            >
              {[
                { v: cur ? prev : c.first, y: -flip, o: cur ? 1 - flip : 1 },
                ...(cur ? [{ v: cur.v, y: 1 - flip, o: flip }] : []),
              ].map((row, j) => (
                <div
                  key={j}
                  style={{
                    ...serif,
                    position: "absolute",
                    top: 4 + row.y * 60,
                    fontSize: 46,
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                    color: PN.navy,
                    opacity: row.o,
                  }}
                >
                  {row.v}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 3 devices
const CHIPS = [
  { t: "Mani & Pedi", p: "from $25" },
  { t: "Acrylic, Gel & Dip", p: "from $30" },
  { t: "Lash extensions", p: "from $25" },
  { t: "Waxing", p: "from $6" },
];
const Screens: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < DEVICES - 8) return null;
  const laptop = spring({
    frame: frame - DEVICES + 6,
    fps,
    config: theme.spring.smooth,
  });
  const tablet = spring({
    frame: frame - DEVICES - 4,
    fps,
    config: theme.spring.smooth,
  });
  const head = ease(frame, DEVICES + 4, DEVICES + 20);
  const gone = ease(frame, END - 6, END + 12, theme.ease.in);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - gone,
        filter: gone > 0 ? `blur(${gone * 12}px)` : undefined,
        scale: 1 + gone * 0.05,
        zIndex: 2,
      }}
    >
      <div
        style={{
          ...serif,
          position: "absolute",
          left: 40,
          right: 40,
          top: 290,
          textAlign: "center",
          fontSize: 92,
          lineHeight: 1.04,
          color: PN.navy,
          opacity: head,
          translate: `0px ${(1 - head) * 30}px`,
        }}
      >
        Every price,
        <br />
        <span style={italic}>right on the page.</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 - (820 * 1.16) / 2,
          top: 560,
          translate: `${(1 - laptop) * 1000}px 0px`,
          rotate: `${(1 - laptop) * 8}deg`,
        }}
      >
        <LaptopRec
          src={`${SRC}/desktop-prices.mp4`}
          width={820}
          from={DEVICES - 8}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1020,
          rotate: `${-5 + (1 - tablet) * -10}deg`,
          translate: `0px ${(1 - tablet) * 900}px`,
        }}
      >
        <TabletRec
          src={`${SRC}/tablet-work.mp4`}
          width={340}
          from={DEVICES - 8}
        />
      </div>
      {CHIPS.map((c, i) => {
        const at = DEVICES + 26 + i * 8;
        const p = spring({
          frame: frame - at,
          fps,
          config: theme.spring.snappy,
        });
        if (frame < at) return null;
        return (
          <div
            key={c.t}
            style={{
              position: "absolute",
              left: 470,
              top: 1150 + i * 112,
              height: 92,
              padding: "0 30px",
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              gap: 18,
              whiteSpace: "nowrap",
              background: PN.white,
              boxShadow: "0 18px 40px -12px rgba(21,26,61,0.28)",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              scale: interpolate(p, [0, 1], [0.6, 1]),
              translate: `${(1 - p) * 60}px 0px`,
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: 34,
                color: PN.navy,
              }}
            >
              {c.t}
            </span>
            <span style={{ ...serif, ...italic, fontSize: 40 }}>{c.p}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < END) return null;
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 50}px`,
    };
  };
  const line = ease(frame, END + 14, END + 34);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill style={{ zIndex: 6 }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          padding: "22px 30px",
          borderRadius: 26,
          background: PN.navy,
          ...up(0),
        }}
      >
        <Img
          src={staticFile("brand/logo.png")}
          style={{ width: 210, display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", left: 90, right: 70, top: 480 }}>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.18em",
            color: PN.blue,
            ...up(3),
          }}
        >
          PEDI N NAILS · BUILT BY ESOLUTIFY
        </div>
        <div
          style={{
            ...serif,
            marginTop: 24,
            fontSize: 112,
            lineHeight: 1.02,
            color: PN.navy,
            ...up(6),
          }}
        >
          Let your clients
          <br />
          <span style={italic}>try before</span>
          <br />
          <span style={italic}>they book.</span>
        </div>
        <div
          style={{
            marginTop: 30,
            width: 420 * line,
            height: 5,
            borderRadius: 3,
            background: PN.blue,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.3,
            color: PN.ink,
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
          left: 90,
          top: 1230,
          height: 112,
          padding: "0 44px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: PN.blue,
          boxShadow: "0 24px 60px -16px rgba(40,68,194,0.6)",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 48,
          color: PN.white,
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={44} color={PN.white} stroke={2.8} />
        <LightSweep start={END + 40} duration={24} width={140} opacity={0.5} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 1376,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 36,
          color: PN.ink,
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
          top: 1440,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "0.1em",
          color: PN.blue,
          ...up(24),
        }}
      >
        TAP THE LINK
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon name="arrow" size={40} color={PN.blue} stroke={2.8} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PediNNailsStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: PN.cream }}>
    <Backdrop />
    <Screens />
    <Phone />
    <FilmWords />
    <RevealWords />
    <TryOnPanel />
    <Finger />
    <EndCard />
    <Audio src={staticFile("audio/story-polish.wav")} volume={0.8} />
    <Sfx name="whoosh-soft" at={REVEAL - 2} volume={0.35} />
    {TAPS.map((t) => (
      <Sfx key={t.at} name="tick" at={t.at - 1} volume={0.22} />
    ))}
    <Sfx name="whoosh-soft" at={DEVICES - 8} volume={0.3} />
    <Sfx name="whoosh" at={END - 6} volume={0.3} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

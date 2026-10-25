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
import { Stage } from "../../components/Stage";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import { LaptopRec, PhoneRec, TabletRec } from "../kit";

// Story: Downtown Dentists (esolutify.com/demo/downtowndentists), 18 s, 9:16.
// The site's signature is its phone intro: a scroll-driven film that flies
// from the downtown skyline, through the doors, to the dental chair. So:
//   0–212    the film, big, in a phone; three words keep pace with it
//   212–380  laptop + tablet + phone, all playing real scroll recordings
//            (scripts/record_scroll.mjs); the beat drops on 212
//   380–440  three feature lines, one per music stab
//   440–540  end card: "Your website could move like this."
// Music: story-dawn.wav (scripts/gen_story_music.py dawn), drop at 7.06 s.

export const DD_DURATION = 540;
const TRIO = 212;
const LINES = 380;
const END = 440;
const SRC = "stories/downtowndentists";

const gold: React.CSSProperties = {
  backgroundImage: theme.gradients.gold,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---------------------------------------------------------------- act 1 words
const FILM_WORDS = [
  { from: 0, to: 76, a: "Downtown.", b: "" },
  { from: 76, to: 128, a: "Through", b: "the doors." },
  { from: 128, to: TRIO, a: "To your", b: "chair." },
];
const FilmWords: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > TRIO + 10) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 286,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.2em",
          color: theme.colors.gold2,
          opacity: ease(frame, 4, 16) * (1 - ease(frame, TRIO - 6, TRIO + 6)),
        }}
      >
        DOWNTOWN DENTISTS · THE SCROLL FILM
      </div>
      {FILM_WORDS.map((w) => {
        const inP = ease(frame, w.from + 2, w.from + 14, theme.ease.out);
        const outP = ease(frame, w.to - 8, w.to + 2, theme.ease.in);
        if (frame < w.from || frame > w.to + 2) return null;
        return (
          <div
            key={w.a}
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 330,
              textAlign: "center",
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: theme.colors.text,
              opacity: inP * (1 - outP),
              translate: `0px ${(1 - inP) * 30 - outP * 20}px`,
              filter: `blur(${(1 - inP) * 8 + outP * 6}px)`,
            }}
          >
            {w.a} {w.b ? <span style={gold}>{w.b}</span> : null}
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the devices
// The phone is one element through acts 1–2: big and centred, then it slides
// to the bottom-right as the laptop and tablet arrive.
const Devices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({
    frame: frame - TRIO + 6,
    fps,
    config: theme.spring.smooth,
  });
  const rise = spring({ frame: frame - 2, fps, config: theme.spring.smooth });
  const dim = ease(frame, LINES - 4, LINES + 10);
  const gone = ease(frame, END - 6, END + 14, theme.ease.in);
  // phone: big (620 screen, centred) → small (270, bottom right)
  const pw = 620 + (270 - 620) * k;
  const pOuter = pw * 1.07;
  const px = (540 - pOuter / 2) * (1 - k) + (1080 - 60 - pOuter) * k;
  const py = 470 * (1 - k) + 1150 * k + (1 - rise) * 1200;
  const drift = (1 - k) * Math.sin(frame / 40) * 2;
  const laptop = spring({
    frame: frame - TRIO - 2,
    fps,
    config: theme.spring.smooth,
  });
  const tablet = spring({
    frame: frame - TRIO - 8,
    fps,
    config: theme.spring.smooth,
  });
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - gone,
        filter:
          dim > 0
            ? `blur(${dim * 10}px) brightness(${1 - dim * 0.55})`
            : undefined,
        scale: 1 + gone * 0.06,
      }}
    >
      {frame >= TRIO - 6 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 540 - (860 * 1.16) / 2,
              top: 560,
              translate: `0px ${(1 - laptop) * -700}px`,
              opacity: interpolate(laptop, [0, 0.3], [0, 1], clamp),
            }}
          >
            <LaptopRec
              src={`${SRC}/desktop-tour.mp4`}
              width={860}
              from={TRIO - 6}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 50,
              top: 1110,
              rotate: "-4deg",
              translate: `${(1 - tablet) * -700}px 0px`,
              opacity: interpolate(tablet, [0, 0.3], [0, 1], clamp),
            }}
          >
            <TabletRec
              src={`${SRC}/tablet-tour.mp4`}
              width={400}
              from={TRIO - 6}
            />
          </div>
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: px,
          top: py,
          rotate: `${drift + k * 4}deg`,
          zIndex: 2,
        }}
      >
        <PhoneRec
          src={`${SRC}/mobile-film.mp4`}
          width={pw}
          from={0}
          glow={0.5 * (1 - k)}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 2 title
const TrioTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = ease(frame, TRIO + 6, TRIO + 20, theme.ease.out);
  const out = ease(frame, LINES - 8, LINES + 2, theme.ease.in);
  if (frame < TRIO || frame > LINES + 2) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 300,
        textAlign: "center",
        opacity: inP * (1 - out),
        translate: `0px ${(1 - inP) * 30}px`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: theme.colors.text,
        }}
      >
        One site. <span style={gold}>Every screen.</span>
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 32,
          color: theme.colors.muted,
        }}
      >
        Laptop, tablet and phone, each with its own layout.
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- act 3 lines
const FEATURES = [
  { t: "Book in one tap.", s: "8 visit types, one button each" },
  { t: "Symptom checker.", s: "points patients to the right visit" },
  { t: "Same-day crowns.", s: "one visit, no temporary" },
];
const Lines: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < LINES - 2 || frame > END + 8) return null;
  const out = ease(frame, END - 6, END + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, zIndex: 5 }}>
      {FEATURES.map((f, i) => {
        const at = LINES + i * 18;
        const p = spring({
          frame: frame - at,
          fps,
          config: theme.spring.snappy,
        });
        if (frame < at) return null;
        return (
          <div
            key={f.t}
            style={{
              position: "absolute",
              left: 90,
              right: 60,
              top: 640 + i * 220,
              display: "flex",
              alignItems: "center",
              gap: 30,
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `${(1 - p) * -80}px 0px`,
            }}
          >
            <div
              style={{
                flex: "none",
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: theme.gradients.gold,
                boxShadow: theme.shadow.goldGlow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: interpolate(p, [0, 1], [0.4, 1]),
              }}
            >
              <Icon name="check" size={54} color="#0A0A0A" stroke={3} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 76,
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: theme.colors.text,
                }}
              >
                {f.t}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: theme.fonts.body,
                  fontWeight: 500,
                  fontSize: 34,
                  color: theme.colors.muted,
                }}
              >
                {f.s}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- act 4 end card
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
  const line = ease(frame, END + 14, END + 34, theme.ease.out);
  const bob = Math.sin((frame - END) / 6) * 8;
  return (
    <AbsoluteFill style={{ zIndex: 6 }}>
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          width: 240,
          ...up(0),
        }}
      />
      <div style={{ position: "absolute", left: 90, right: 70, top: 470 }}>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.18em",
            color: theme.colors.gold2,
            ...up(3),
          }}
        >
          DOWNTOWN DENTISTS · BUILT BY ESOLUTIFY
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: theme.colors.text,
            ...up(6),
          }}
        >
          Your website
          <br />
          could move
          <br />
          <span style={gold}>like this.</span>
        </div>
        <div
          style={{
            marginTop: 26,
            width: 420 * line,
            height: 6,
            borderRadius: 3,
            background: theme.gradients.gold,
          }}
        />
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.3,
            color: theme.colors.text,
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
          top: 1220,
          height: 112,
          padding: "0 44px",
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: theme.gradients.gold,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 48,
          color: "#0A0A0A",
          ...up(16),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={44} color="#0A0A0A" stroke={2.8} />
        <LightSweep start={END + 40} duration={24} width={140} opacity={0.7} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 1366,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 36,
          color: theme.colors.muted,
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
          top: 1430,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "0.1em",
          color: theme.colors.gold2,
          ...up(24),
        }}
      >
        TAP THE LINK
        <div style={{ rotate: "90deg", translate: `${bob}px 0px` }}>
          <Icon
            name="arrow"
            size={40}
            color={theme.colors.gold2}
            stroke={2.8}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DowntownDentistsStory: React.FC<{
  readonly safeZones?: boolean;
}> = ({ safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Devices />
      <FilmWords />
      <TrioTitle />
      <Lines />
      <EndCard />
    </Stage>
    <Audio src={staticFile("audio/story-dawn.wav")} volume={0.8} />
    <Sfx name="whoosh-soft" at={TRIO - 8} volume={0.35} />
    <Sfx name="whoosh" at={END - 6} volume={0.3} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

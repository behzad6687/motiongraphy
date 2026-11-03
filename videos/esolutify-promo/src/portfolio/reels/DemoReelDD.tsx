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
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";

// Website demo reel, hand-scroll: Downtown Dentists
// (esolutify.com/demo/downtowndentists), 29 s, 9:16, cut to the client's
// track "Make Your First Impression" (public/audio/make-your-first-impression
// .wav: drop at 15.05 s, break at 23.1 s, last hit at 27.6 s). Looks like a
// phone filming someone using the site, and the site's scroll film is the
// star, so it plays at reading pace, never skipped:
//   0–451    a hand slowly two-finger scrolls a laptop's trackpad through the
//            first chapters of the sunrise film
//   451–693  on the drop: a thumb scrolls the phone in front of the monitor
//            and both carry the film on from there, on the same frame
//   693–875  the break: "Want a website like this? Comment the word below"
// The hand clips are generated (public/stories/reel-dd/gen-a3.mp4 and gen-b2.mp4, green
// screens); scripts/pin_screens.py fits each screen's edges, pins the real
// recordings in at the screen's own proportions, and lets the hand's motion
// nudge the steady scroll (*-comp.mp4).

export const DEMO_REEL_DD_DURATION = 875;
const B = 451;
const END = 693;
const SRC = "stories/reel-dd";

const Credit: React.FC<{ from: number; to: number; dark?: boolean }> = ({
  from,
  to,
  dark,
}) => {
  const frame = useCurrentFrame();
  const o = ease(frame, from, from + 14) * (1 - ease(frame, to - 12, to));
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 1560,
        fontFamily: theme.fonts.mono,
        fontSize: 22,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: dark ? "rgba(20,24,28,0.7)" : "rgba(255,244,236,0.8)",
        opacity: o,
      }}
    >
      Downtown Dentists · website by eSolutify
    </div>
  );
};

const Shot: React.FC<{
  src: string;
  from: number;
  to: number;
  push?: number;
}> = ({ src, from, to, push = 0 }) => {
  const frame = useCurrentFrame();
  // a hard cut on the beat, with a small punch-in that settles
  const inn = from === 0 || frame >= from ? 1 : 0;
  const blur = 0;
  const punch = from === 0 ? 0 : 0.06 * (1 - ease(frame, from, from + 10, theme.ease.out));
  const z = 1 + punch + push * ease(frame, from, to, theme.ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: inn, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: z,
          filter: blur > 0 ? `blur(${blur * 12}px)` : undefined,
        }}
      >
        <Sequence from={from} layout="none">
          <OffthreadVideo
            src={staticFile(src)}
            muted
            style={{ width: 1080, height: 1920, objectFit: "cover" }}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 30}px`,
    };
  };
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F3EEE6",
        opacity: ease(frame, END - 4, END + 6),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 330,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.news,
            fontWeight: 500,
            fontSize: 104,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            color: "#14211E",
            ...up(0),
          }}
        >
          Want a website
          <br />
          <span style={{ fontStyle: "italic", color: "#1E5B52" }}>
            like this?
          </span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 40,
            color: "#5C6B67",
            ...up(6),
          }}
        >
          Comment the word below 👇
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1460,
          display: "flex",
          justifyContent: "center",
          ...up(14),
        }}
      >
        <div
          style={{
            padding: "14px 22px",
            borderRadius: 14,
            background: "#14211E",
          }}
        >
          <Img
            src={staticFile("brand/logo.png")}
            style={{ width: 200, display: "block" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DemoReelDD: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {frame < B ? (
        <Shot src={`${SRC}/gen-a3-comp.mp4`} from={0} to={B} />
      ) : null}
      {frame >= B && frame < END + 8 ? (
        <Shot src={`${SRC}/gen-b2-comp.mp4`} from={B} to={END} push={0.03} />
      ) : null}
      <Credit from={30} to={B - 10} dark />
      <Credit from={B + 30} to={END - 8} />
      {frame >= END - 4 ? <EndCard /> : null}
      <Audio src={staticFile("audio/make-your-first-impression.wav")} volume={1} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnail
// The Reel cover: a frame of the phone shot (desktop and phone on the same
// section), with the offer on top. Key content inside the 4:5 grid crop.
export const DemoReelDDThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={-(B + 160)} layout="none">
      <Shot src={`${SRC}/gen-b2-comp.mp4`} from={B} to={END} />
    </Sequence>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(20,16,14,0.92) 0%, rgba(20,16,14,0.8) 26%, rgba(20,16,14,0.35) 40%, transparent 50%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: 26,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#F2C7A5",
        }}
      >
        Free website demo
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: theme.fonts.news,
          fontWeight: 500,
          fontSize: 104,
          lineHeight: 0.98,
          letterSpacing: "-0.02em",
          color: "#fff",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        Want a website
        <br />
        <span style={{ fontStyle: "italic" }}>like this?</span>
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1450,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "22px 40px",
          borderRadius: 99,
          background: "#F3EEE6",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 52,
          color: "#14211E",
          boxShadow: "0 18px 40px -12px rgba(0,0,0,0.6)",
        }}
      >
        Comment <span style={{ color: "#1E5B52" }}>DEMO</span>
      </div>
    </div>
  </AbsoluteFill>
);

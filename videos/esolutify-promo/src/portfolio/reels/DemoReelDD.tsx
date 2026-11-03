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
// (esolutify.com/demo/downtowndentists), 18 s, 9:16. Looks like a phone
// filming someone using the site:
//   0–210    a hand two-finger scrolls a laptop's trackpad and the site's
//            sunrise film plays down the page
//   210–450  a thumb scrolls the phone in front of the monitor; the desktop
//            and mobile sites move through the same sections together
//   450–540  end card: "Want a website like this? Comment the word below"
// The hand clips are generated (public/stories/reel-dd/gen-*.mp4, green
// screens); scripts/pin_screens.py keys them, tracks the screens and pins the
// real recordings in, with the scroll driven by the hand's own motion
// (*-comp.mp4). Music: story-showcase-dd.wav.

export const DEMO_REEL_DD_DURATION = 540;
const B = 210;
const END = 450;
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
  const inn = from === 0 ? 1 : ease(frame, from - 8, from + 4);
  const blur = from === 0 ? 0 : 1 - ease(frame, from - 8, from + 6);
  const z = 1 + push * ease(frame, from, to, theme.ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: inn, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: z,
          filter: blur > 0 ? `blur(${blur * 12}px)` : undefined,
        }}
      >
        <Sequence from={from - (from === 0 ? 0 : 8)} layout="none">
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
      {frame < B + 8 ? (
        <Shot src={`${SRC}/gen-a-comp.mp4`} from={0} to={B} />
      ) : null}
      {frame >= B - 8 && frame < END + 8 ? (
        <Shot src={`${SRC}/gen-b-comp.mp4`} from={B} to={END} push={0.03} />
      ) : null}
      <Credit from={30} to={B - 10} dark />
      <Credit from={B + 30} to={END - 8} />
      {frame >= END - 4 ? <EndCard /> : null}
      <Audio src={staticFile("audio/story-showcase-dd.wav")} volume={0.9} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnail
// The Reel cover: a frame of the phone shot (desktop and phone on the same
// section), with the offer on top. Key content inside the 4:5 grid crop.
export const DemoReelDDThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={-(B + 120)} layout="none">
      <Shot src={`${SRC}/gen-b-comp.mp4`} from={B} to={END} />
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

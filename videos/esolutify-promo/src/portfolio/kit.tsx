import React from "react";
import { Freeze, OffthreadVideo, Sequence, staticFile } from "remotion";

// Device mock-ups that play real scroll recordings
// (scripts/record_scroll.mjs → public/stories/<slug>/<device>-<name>.mp4).
// Each screen has exactly its recording's aspect, so nothing is cropped:
// desktop 1440×900, tablet 820×1180, mobile 390×844.

const Rec: React.FC<{
  src: string;
  width: number;
  height: number;
  from: number; // composition frame the recording starts on
  trim?: number; // recording frames to skip
  hold?: boolean; // show the first frame before `from` instead of black
  rate?: number; // playback rate
}> = ({ src, width, height, from, trim = 0, hold = false, rate = 1 }) => {
  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      trimBefore={trim}
      playbackRate={rate}
      muted
      style={{ width, height, display: "block", objectFit: "cover" }}
    />
  );
  return (
    <>
      {hold && from > 0 ? (
        <Sequence durationInFrames={from} layout="none">
          <Freeze frame={0}>{video}</Freeze>
        </Sequence>
      ) : null}
      <Sequence from={from} layout="none">
        {video}
      </Sequence>
    </>
  );
};

export const PhoneRec: React.FC<{
  src: string;
  width: number; // screen width
  from: number;
  trim?: number;
  glow?: number;
  hold?: boolean;
}> = ({ src, width, from, trim, glow = 0, hold }) => {
  const h = Math.round((width * 844) / 390);
  const bezel = Math.round(width * 0.035);
  const r = Math.round(width * 0.14);
  return (
    <div
      style={{
        position: "relative",
        width: width + bezel * 2,
        height: h + bezel * 2,
        padding: bezel,
        borderRadius: r + bezel,
        background: "linear-gradient(150deg, #3A3A3A, #0E0E0E 45%, #262626)",
        boxShadow: `0 80px 140px -40px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.08)${
          glow ? `, 0 0 ${130 * glow}px rgba(220,174,85,${0.45 * glow})` : ""
        }`,
      }}
    >
      <div
        style={{
          position: "relative",
          width,
          height: h,
          borderRadius: r,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Rec
          src={src}
          width={width}
          height={h}
          from={from}
          trim={trim}
          hold={hold}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: width * 0.025,
            width: width * 0.3,
            height: width * 0.085,
            translate: "-50% 0px",
            borderRadius: 99,
            background: "#050505",
          }}
        />
      </div>
    </div>
  );
};

export const TabletRec: React.FC<{
  src: string;
  width: number; // screen width
  from: number;
  trim?: number;
  hold?: boolean;
}> = ({ src, width, from, trim, hold }) => {
  const h = Math.round((width * 1180) / 820);
  const bezel = Math.round(width * 0.045);
  const r = Math.round(width * 0.05);
  return (
    <div
      style={{
        width: width + bezel * 2,
        height: h + bezel * 2,
        padding: bezel,
        borderRadius: r + bezel,
        background: "linear-gradient(150deg, #34343A, #0D0D0F 50%, #23232A)",
        boxShadow:
          "0 70px 120px -30px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width,
          height: h,
          borderRadius: r,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Rec
          src={src}
          width={width}
          height={h}
          from={from}
          trim={trim}
          hold={hold}
        />
      </div>
    </div>
  );
};

export const LaptopRec: React.FC<{
  src: string;
  width: number; // screen width
  from: number;
  trim?: number;
  hold?: boolean;
  rate?: number;
}> = ({ src, width, from, trim, hold, rate }) => {
  const h = Math.round((width * 900) / 1440);
  const bezel = Math.round(width * 0.022);
  const top = Math.round(width * 0.03);
  const baseW = width * 1.16;
  return (
    <div style={{ position: "relative", width: baseW }}>
      <div
        style={{
          margin: "0 auto",
          width: width + bezel * 2,
          padding: `${top}px ${bezel}px ${bezel}px`,
          borderRadius: `${width * 0.03}px ${width * 0.03}px 6px 6px`,
          background: "linear-gradient(160deg, #2E2E32, #0C0C0E 60%)",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.09)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: top * 0.35,
            width: top * 0.28,
            height: top * 0.28,
            translate: "-50% 0px",
            borderRadius: "50%",
            background: "#1F2630",
          }}
        />
        <div
          style={{
            width,
            height: h,
            overflow: "hidden",
            borderRadius: 4,
            background: "#000",
          }}
        >
          <Rec
            src={src}
            width={width}
            height={h}
            from={from}
            trim={trim}
            hold={hold}
            rate={rate}
          />
        </div>
      </div>
      {/* the base */}
      <div
        style={{
          width: baseW,
          height: width * 0.035,
          borderRadius: `0 0 ${width * 0.04}px ${width * 0.04}px`,
          background: "linear-gradient(180deg, #C9CACE, #8C8D92 55%, #5A5B60)",
          boxShadow: "0 50px 90px -20px rgba(0,0,0,0.9)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: width * 0.16,
            height: width * 0.012,
            translate: "-50% 0px",
            borderRadius: `0 0 ${width * 0.012}px ${width * 0.012}px`,
            background: "#6E6F74",
          }}
        />
      </div>
    </div>
  );
};

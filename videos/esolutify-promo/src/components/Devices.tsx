import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, theme } from "../theme";

// Device frames that scroll real full-page captures (public/sites/<slug>/).
// Captures are clipped to the top `clipCss` css px of each page; `scroll` is
// the css-px offset of the viewport's top edge.

export type Capture = {
  slug: string;
  device: "mobile" | "desktop";
  cssWidth: number; // 390 (mobile) or 1440 (desktop)
  clipCss: number; // captured page height in css px
  sticky: number; // sticky header height in css px (0 = none)
};

const PageScroll: React.FC<{
  cap: Capture;
  width: number; // rendered viewport width in px
  height: number; // rendered viewport height in px
  scroll: number; // css px
}> = ({ cap, width, height, scroll }) => {
  const k = width / cap.cssWidth;
  const maxScroll = cap.clipCss - height / k;
  const y = Math.max(0, Math.min(scroll, maxScroll));
  const src = staticFile(`sites/${cap.slug}/${cap.device}.jpg`);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <Img
        src={src}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: cap.clipCss * k,
          translate: `0px ${-y * k}px`,
        }}
      />
      {/* sticky header stays pinned while the page moves under it */}
      {cap.sticky > 0 && y > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height: cap.sticky * k,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          }}
        >
          <Img src={src} style={{ width, height: cap.clipCss * k }} />
        </div>
      ) : null}
      {/* scroll indicator */}
      <div
        style={{
          position: "absolute",
          right: 4,
          top: 6 + (height - 12) * (y / cap.clipCss),
          width: 5,
          height: Math.max(40, (height - 12) * (height / k / cap.clipCss)),
          borderRadius: 4,
          background: "rgba(20,20,20,0.35)",
        }}
      />
    </div>
  );
};

// Modern phone: rounded body, thin bezel, dynamic island, side buttons.
export const Phone: React.FC<{
  cap: Capture;
  width: number; // screen width in px
  scroll: number;
  glow?: number;
  children?: React.ReactNode; // overlays drawn on the screen (taps, callouts)
}> = ({ cap, width, scroll, glow = 0, children }) => {
  const screenH = Math.round((width * 844) / 390);
  const bezel = Math.round(width * 0.035);
  const r = Math.round(width * 0.14);
  return (
    <div
      style={{
        position: "relative",
        width: width + bezel * 2,
        height: screenH + bezel * 2,
        borderRadius: r + bezel,
        padding: bezel,
        background: "linear-gradient(150deg, #3A3A3A, #0E0E0E 45%, #262626)",
        boxShadow: `0 80px 140px -40px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.06), 0 0 ${120 * glow}px rgba(220,174,85,${0.35 * glow})`,
      }}
    >
      {/* side buttons */}
      <div
        style={{
          position: "absolute",
          left: -4,
          top: screenH * 0.22,
          width: 4,
          height: screenH * 0.07,
          borderRadius: 3,
          background: "#2C2C2C",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: screenH * 0.31,
          width: 4,
          height: screenH * 0.07,
          borderRadius: 3,
          background: "#2C2C2C",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -4,
          top: screenH * 0.26,
          width: 4,
          height: screenH * 0.11,
          borderRadius: 3,
          background: "#2C2C2C",
        }}
      />
      <div
        style={{
          position: "relative",
          width,
          height: screenH,
          borderRadius: r,
          overflow: "hidden",
        }}
      >
        <PageScroll cap={cap} width={width} height={screenH} scroll={scroll} />
        {/* dynamic island */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: width * 0.03,
            width: width * 0.3,
            height: width * 0.085,
            translate: "-50% 0px",
            borderRadius: 99,
            background: "#050505",
          }}
        />
        {children}
      </div>
    </div>
  );
};

// Desktop browser window with traffic lights and a URL bar.
export const Browser: React.FC<{
  cap: Capture;
  width: number; // viewport width in px
  height: number; // viewport height in px
  scroll: number;
  url: string;
  children?: React.ReactNode;
}> = ({ cap, width, height, scroll, url, children }) => {
  const bar = Math.round(width * 0.045);
  return (
    <div
      style={{
        width,
        borderRadius: Math.round(width * 0.018),
        overflow: "hidden",
        background: "#1B1B1B",
        boxShadow:
          "0 60px 120px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          height: bar,
          display: "flex",
          alignItems: "center",
          gap: bar * 0.22,
          padding: `0 ${bar * 0.45}px`,
          borderBottom: `1px solid ${theme.colors.line}`,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span
            key={c}
            style={{
              width: bar * 0.26,
              height: bar * 0.26,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <div
          style={{
            marginLeft: bar * 0.3,
            flex: 1,
            height: bar * 0.6,
            borderRadius: bar * 0.2,
            background: "#2A2A2A",
            display: "flex",
            alignItems: "center",
            gap: bar * 0.18,
            padding: `0 ${bar * 0.3}px`,
            fontFamily: theme.fonts.body,
            fontSize: bar * 0.34,
            color: theme.colors.muted,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={bar * 0.3}
            height={bar * 0.3}
            fill="none"
            stroke={theme.colors.muted}
            strokeWidth={2.4}
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          {url}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <PageScroll cap={cap} width={width} height={height} scroll={scroll} />
        {children}
      </div>
    </div>
  );
};

// A finger tap: soft dot + expanding ring, anchored in screen px.
export const Tap: React.FC<{
  x: number;
  y: number;
  at: number;
  size?: number;
}> = ({ x, y, at, size = 70 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -6 || t > 24) return null;
  const press = interpolate(t, [-6, 0, 8], [0, 1, 0], {
    ...clamp,
    easing: theme.ease.out,
  });
  const ring = interpolate(t, [0, 22], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  return (
    <div
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          width: size * 0.55,
          height: size * 0.55,
          translate: "-50% -50%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          opacity: press * 0.9,
          scale: 0.8 + press * 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          translate: "-50% -50%",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.9)",
          opacity: 1 - ring,
          scale: 0.4 + ring * 1.2,
        }}
      />
    </div>
  );
};

// Scroll curve helper: css-px scroll position with eased holds between stops.
// stops: [[frame, cssY], ...] — eases between consecutive stops, holds outside.
export const useScroll = (stops: [number, number][]) => {
  const frame = useCurrentFrame();
  if (frame <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [f0, y0] = stops[i - 1];
    const [f1, y1] = stops[i];
    if (frame <= f1) {
      return interpolate(frame, [f0, f1], [y0, y1], {
        ...clamp,
        easing: theme.ease.inOut,
      });
    }
  }
  return stops[stops.length - 1][1];
};

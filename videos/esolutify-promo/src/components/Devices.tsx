import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, theme } from "../theme";

// Device frames that scroll real full-page captures (public/sites/<slug>/).
// A capture is clipped to its top `clipCss` css px; `scroll` is the css-px
// offset of the viewport's top edge.

export type Capture = {
  slug: string;
  device: "mobile" | "desktop";
  cssWidth: number; // 390 (mobile) or 1440 (desktop)
  clipCss: number; // captured page height in css px
  sticky: number; // sticky header height in css px (0 = none)
  file?: string; // defaults to `${device}.jpg`
  statusBg?: string; // phone status-bar colour (matches the site's header)
};

// Viewport height in css px for a device of a given rendered size.
// iOS-style status bar: the page starts below it, so the island never clips
// a client's header or logo.
export const phoneStatusInset = (width: number) => Math.round(width * 0.12);

export const phoneScreenHeight = (width: number) =>
  Math.round((width * 844) / 390);

// Height of the page viewport under the status bar.
export const phoneViewportHeight = (width: number) =>
  phoneScreenHeight(width) - phoneStatusInset(width);

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
};

const StatusBar: React.FC<{ width: number; bg: string }> = ({ width, bg }) => {
  const h = phoneStatusInset(width);
  const fg = isLight(bg) ? "#111" : "#F5F5F5";
  const fs = Math.round(width * 0.04);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: h,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${Math.round(h * 0.12)}px ${Math.round(width * 0.085)}px 0`,
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: fs,
        color: fg,
      }}
    >
      <span>9:41</span>
      <span style={{ display: "flex", alignItems: "center", gap: fs * 0.35 }}>
        <svg viewBox="0 0 18 12" width={fs * 1.1} height={fs * 0.75} fill={fg}>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg
          viewBox="0 0 26 12"
          width={fs * 1.55}
          height={fs * 0.75}
          fill="none"
        >
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="3"
            stroke={fg}
            opacity={0.5}
          />
          <rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill={fg} />
          <rect
            x="24"
            y="4"
            width="1.5"
            height="4"
            rx="0.7"
            fill={fg}
            opacity={0.5}
          />
        </svg>
      </span>
    </div>
  );
};

// One page inside a screen. `offsetY` slides the whole page (page-swap
// hand-offs); `blur` is a vertical motion blur in px (velocity blur).
export const PageLayer: React.FC<{
  cap: Capture;
  width: number;
  height: number;
  scroll: number;
  offsetY?: number;
  blur?: number;
  id: string;
}> = ({ cap, width, height, scroll, offsetY = 0, blur = 0, id }) => {
  const k = width / cap.cssWidth;
  const maxScroll = Math.max(0, cap.clipCss - height / k);
  const y = Math.max(0, Math.min(scroll, maxScroll));
  const src = staticFile(
    `sites/${cap.slug}/${cap.file ?? `${cap.device}.jpg`}`,
  );
  const filterId = `vblur-${id}`;
  const sigma = Math.min(10, blur);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: offsetY,
        width,
        height,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {sigma > 0.4 ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="0" y="-5%" width="100%" height="110%">
              <feGaussianBlur stdDeviation={`0 ${sigma}`} />
            </filter>
          </defs>
        </svg>
      ) : null}
      <Img
        src={src}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: cap.clipCss * k,
          translate: `0px ${-y * k}px`,
          filter: sigma > 0.4 ? `url(#${filterId})` : undefined,
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
            boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
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
          width: Math.max(4, width * 0.009),
          height: Math.max(30, (height - 12) * (height / k / cap.clipCss)),
          borderRadius: 4,
          background: "rgba(40,40,40,0.4)",
          opacity: y > 0 ? 1 : 0,
        }}
      />
    </div>
  );
};

// Modern phone body: rounded, thin bezel, dynamic island, side buttons.
// Children render inside the screen (pages, touch dots, overlays).
export const PhoneShell: React.FC<{
  width: number; // screen width in px
  glow?: number;
  statusBg?: string;
  children: React.ReactNode;
}> = ({ width, glow = 0, statusBg = "#0A0A0A", children }) => {
  const screenH = phoneScreenHeight(width);
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
        boxShadow: `0 80px 140px -40px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.06)${
          glow > 0.01
            ? `, 0 0 ${120 * glow}px rgba(220,174,85,${0.4 * glow})`
            : ""
        }`,
      }}
    >
      {[
        { left: -4, top: 0.22, h: 0.07 },
        { left: -4, top: 0.31, h: 0.07 },
        { right: -4, top: 0.26, h: 0.11 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.left,
            right: b.right,
            top: screenH * b.top,
            width: 4,
            height: screenH * b.h,
            borderRadius: 3,
            background: "#2C2C2C",
          }}
        />
      ))}
      <div
        style={{
          position: "relative",
          width,
          height: screenH,
          borderRadius: r,
          overflow: "hidden",
          background: "#0A0A0A",
        }}
      >
        <StatusBar width={width} bg={statusBg} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: phoneStatusInset(width),
            width,
            height: phoneViewportHeight(width),
            overflow: "hidden",
          }}
        >
          {children}
        </div>
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
      </div>
    </div>
  );
};

// Convenience: a phone showing one page.
export const Phone: React.FC<{
  cap: Capture;
  width: number;
  scroll: number;
  glow?: number;
  blur?: number;
  id: string;
  children?: React.ReactNode;
}> = ({ cap, width, scroll, glow, blur, id, children }) => (
  <PhoneShell width={width} glow={glow} statusBg={cap.statusBg}>
    <PageLayer
      cap={cap}
      width={width}
      height={phoneViewportHeight(width)}
      scroll={scroll}
      blur={blur}
      id={id}
    />
    {children}
  </PhoneShell>
);

// Desktop browser window with traffic lights and a URL bar.
export const Browser: React.FC<{
  cap: Capture;
  width: number; // viewport width in px
  height: number; // viewport height in px
  scroll: number;
  url: string;
  blur?: number;
  id: string;
  barPx?: number; // URL-bar height (default 4.5% of width)
  children?: React.ReactNode;
}> = ({ cap, width, height, scroll, url, blur, id, barPx, children }) => {
  const bar = barPx ?? Math.round(width * 0.045);
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
            fontSize: bar * 0.36,
            color: theme.colors.muted,
            whiteSpace: "nowrap",
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
      <div style={{ position: "relative", width, height }}>
        <PageLayer
          cap={cap}
          width={width}
          height={height}
          scroll={scroll}
          blur={blur}
          id={id}
        />
        {children}
      </div>
    </div>
  );
};

// A finger tap: soft dot + expanding ring, anchored in local px.
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

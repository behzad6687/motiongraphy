import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  Eyebrow,
  SceneExit,
  WordReveal,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 8 — Websites we've built (165f). Real captured client sites.
const SITES = [
  { src: "portfolio/nhfclinics.jpg", url: "nhfclinics.com" },
  { src: "portfolio/khelectric.jpg", url: "khelectric.ca" },
  { src: "portfolio/greersmiles.jpg", url: "Greer Smiles" },
  { src: "portfolio/rielbuild.jpg", url: "Riel Build" },
  { src: "portfolio/gincoaluminium.jpg", url: "Ginco Aluminium" },
  { src: "portfolio/handsofcare.jpg", url: "holistichandsofcare.ca" },
];

const FRAME_W = 400;
const VIEW_H = 560;
const IMG_H = (FRAME_W * 2600) / 800; // screenshots are cropped to 800 × 2600

const Browser: React.FC<{ site: (typeof SITES)[number]; i: number }> = ({
  site,
  i,
}) => {
  const frame = useCurrentFrame();
  const inP = useEntrance(8 + i * 5, "smooth");
  // each page scrolls on its own offset — Ken Burns for screenshots
  const scroll = interpolate(
    frame,
    [20 + i * 4, 150],
    [0, -(IMG_H - VIEW_H) * 0.55],
    {
      ...clamp,
      easing: theme.ease.inOut,
    },
  );
  const float = Math.sin(frame / 26 + i) * 6;
  return (
    <div
      style={{
        width: FRAME_W,
        flexShrink: 0,
        borderRadius: 18,
        overflow: "hidden",
        background: "#111",
        boxShadow:
          "0 50px 100px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.10)",
        opacity: interpolate(inP, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(inP, [0, 1], [180, 0]) + float + (i % 2 ? 40 : 0)}px`,
      }}
    >
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          background: "#1B1B1B",
          borderBottom: `1px solid ${theme.colors.line}`,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span
            key={c}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: c,
              opacity: 0.8,
            }}
          />
        ))}
        <div
          style={{
            marginLeft: 12,
            flex: 1,
            height: 26,
            borderRadius: 8,
            background: "#262626",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            fontFamily: theme.fonts.body,
            fontSize: 15,
            color: theme.colors.muted,
          }}
        >
          {site.url}
        </div>
      </div>
      <div style={{ height: VIEW_H, overflow: "hidden" }}>
        <Img
          src={staticFile(site.src)}
          style={{
            width: FRAME_W,
            height: IMG_H,
            display: "block",
            translate: `0px ${scroll}px`,
          }}
        />
      </div>
    </div>
  );
};

export const S08Portfolio: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 165], [160, -260], {
    ...clamp,
    easing: theme.ease.soft,
  });

  return (
    <SceneExit frames={12}>
      {/* 3D row of browser frames */}
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 120,
            display: "flex",
            gap: 40,
            rotate: "y -14deg",
            transformOrigin: "30% 50%",
            translate: `${drift}px 0px`,
          }}
        >
          {SITES.map((s, i) => (
            <Browser key={s.src} site={s} i={i} />
          ))}
        </div>
      </AbsoluteFill>
      {/* legibility scrim behind the title */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 26%, transparent 42%)",
        }}
      />
      <AbsoluteFill style={{ left: 150, top: 96 }}>
        <Eyebrow text="Our work" delay={0} align="left" />
        <div style={{ height: 18 }} />
        <WordReveal
          words={["Websites", "that", { text: "convert.", tone: "gold" }]}
          delay={4}
          per={4}
          size={84}
          align="flex-start"
        />
      </AbsoluteFill>

      <Sfx name="whoosh" at={6} volume={0.45} />
      <Sfx name="whoosh-soft" at={20} volume={0.3} />
    </SceneExit>
  );
};

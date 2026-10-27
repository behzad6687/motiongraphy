import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../theme";
import { LaptopRec, PhoneRec } from "./kit";

// Thumbnails / Reel covers for the portfolio Stories, 1080×1920, one per site
// in that Story's own look. Everything that matters sits inside the 4:5 crop
// the profile grid shows (y 285–1635). The device screens are real frames
// from the Story recordings (public/stories/<slug>/), picked with `trim`.

type Look = {
  bg: string;
  glow: string;
  ink: string;
  accent: string;
  muted: string;
  titleFont: React.CSSProperties;
  hookFont: React.CSSProperties;
  labelFont: React.CSSProperties;
  pattern?: string;
};

type Thumb = {
  name: string;
  label?: string; // defaults to "Website preview"
  hook: string;
  look: Look;
  laptop: { src: string; frame: number };
  phone: { src: string; frame: number };
};

const display: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};
const body: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};
const mono: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

export const THUMBS = {
  downtowndentists: {
    name: "Downtown Dentists",
    hook: "A website that moves like a film.",
    look: {
      bg: "#0A0A0A",
      glow: "rgba(220,174,85,0.20)",
      ink: theme.colors.text,
      accent: theme.colors.gold2,
      muted: theme.colors.muted,
      titleFont: display,
      hookFont: { ...display, fontWeight: 700 },
      labelFont: body,
    },
    laptop: { src: "stories/downtowndentists/desktop-tour.mp4", frame: 0 },
    phone: { src: "stories/downtowndentists/mobile-film.mp4", frame: 100 },
  },
  pedinnails: {
    name: "Pedi n Nails",
    hook: "Try a look before you book.",
    look: {
      bg: "#F6F3EE",
      glow: "rgba(240,227,223,0.95)",
      ink: "#151A3D",
      accent: "#2844C2",
      muted: "#4A4E68",
      titleFont: {
        fontFamily: theme.fonts.serif,
        fontWeight: 500,
        letterSpacing: "-0.01em",
      },
      hookFont: {
        fontFamily: theme.fonts.serif,
        fontWeight: 500,
        fontStyle: "italic",
      },
      labelFont: body,
    },
    laptop: { src: "stories/pedinnails/desktop-prices.mp4", frame: 40 },
    phone: { src: "stories/pedinnails/mobile-tryon.mp4", frame: 64 },
  },
  samantha: {
    name: "Samantha Beauty Salon",
    hook: "Scroll, and the look changes.",
    look: {
      bg: "#1A110B",
      glow: "rgba(201,162,90,0.22)",
      ink: "#F3EBDD",
      accent: "#E0C485",
      muted: "#B9A88F",
      titleFont: {
        fontFamily: theme.fonts.garamond,
        fontWeight: 500,
      },
      hookFont: { fontFamily: theme.fonts.script, fontWeight: 400 },
      labelFont: {
        fontFamily: theme.fonts.garamond,
        fontWeight: 600,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
      },
    },
    laptop: { src: "stories/samantha/desktop-film.mp4", frame: 90 },
    phone: { src: "stories/samantha/mobile-rescue.mp4", frame: 60 },
  },
  crown: {
    name: "Crown",
    hook: "Luggage you design in live 3D.",
    look: {
      bg: "#0D0C0B",
      glow: "rgba(205,184,146,0.16)",
      ink: "#F3EEE6",
      accent: "#D9C59E",
      muted: "#8F877C",
      titleFont: {
        fontFamily: theme.fonts.serif,
        fontWeight: 400,
        letterSpacing: "0.04em",
      },
      hookFont: {
        fontFamily: theme.fonts.serif,
        fontWeight: 400,
        fontStyle: "italic",
      },
      labelFont: mono,
      pattern:
        "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 3px, transparent 3px 46px)",
    },
    laptop: { src: "stories/crown/desktop-studio.mp4", frame: 240 },
    phone: { src: "stories/crown/mobile-film.mp4", frame: 150 },
  },
  rielbuild: {
    name: "Riel Build",
    hook: "A website built plumb.",
    look: {
      bg: "#131A17",
      glow: "rgba(201,150,60,0.14)",
      ink: "#F1ECE3",
      accent: "#C9963C",
      muted: "#97A39C",
      titleFont: display,
      hookFont: display,
      labelFont: mono,
      pattern: [
        "linear-gradient(rgba(241,236,227,0.07) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(241,236,227,0.07) 1px, transparent 1px)",
        "linear-gradient(rgba(241,236,227,0.03) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(241,236,227,0.03) 1px, transparent 1px)",
      ].join(","),
    },
    laptop: { src: "stories/rielbuild/desktop-plumb.mp4", frame: 120 },
    phone: { src: "stories/rielbuild/mobile-film.mp4", frame: 60 },
  },
  gincoaluminium: {
    name: "National Aluminium",
    hook: "We build the skin of the skyline.",
    look: {
      bg: "#121A23",
      glow: "rgba(199,122,82,0.20)",
      ink: "#EEF0F1",
      accent: "#D8443F",
      muted: "#8D99A6",
      titleFont: display,
      hookFont: display,
      labelFont: mono,
      pattern: [
        "linear-gradient(90deg, transparent 356px, rgba(207,209,210,0.10) 356px 364px, transparent 364px)",
        "linear-gradient(transparent 380px, rgba(207,209,210,0.10) 380px 388px, transparent 388px)",
      ].join(","),
    },
    laptop: { src: "stories/gincoaluminium/desktop-film.mp4", frame: 40 },
    phone: { src: "stories/gincoaluminium/mobile-film.mp4", frame: 200 },
  },
  hb: {
    name: "HB Developments",
    hook: "Scroll, and it's built.",
    look: {
      bg: "#1E2B22",
      glow: "rgba(201,207,196,0.16)",
      ink: "#FFFFFF",
      accent: "#C9CFC4",
      muted: "#C9CFC4",
      titleFont: {
        fontFamily: theme.fonts.body,
        fontWeight: 300,
        letterSpacing: "-0.045em",
      },
      hookFont: {
        fontFamily: theme.fonts.body,
        fontWeight: 300,
        letterSpacing: "-0.04em",
      },
      labelFont: body,
    },
    laptop: { src: "stories/hb/desktop-compare.mp4", frame: 130 },
    phone: { src: "stories/hb/mobile-projects.mp4", frame: 100 },
  },
  newpc: {
    name: "Coldloop",
    hook: "Water-cooled PCs, built one at a time.",
    look: {
      bg: "#061015",
      glow: "rgba(31,182,193,0.26)",
      ink: "#E6F4F6",
      accent: "#5CE1E6",
      muted: "#7C949B",
      titleFont: display,
      hookFont: display,
      labelFont: mono,
      pattern:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)",
    },
    laptop: { src: "stories/newpc/desktop-film.mp4", frame: 100 },
    phone: { src: "stories/newpc/mobile-layers.mp4", frame: 60 },
  },
  nhfclinics: {
    name: "N.H.F Clinics",
    label: "Client website",
    hook: "A clinic website with a bedside manner.",
    look: {
      bg: "#F3F6F2",
      glow: "rgba(94,156,103,0.22)",
      ink: "#16211C",
      accent: "#2F6B3A",
      muted: "#6B7A72",
      titleFont: {
        fontFamily: theme.fonts.news,
        fontWeight: 400,
        letterSpacing: "-0.015em",
      },
      hookFont: {
        fontFamily: theme.fonts.news,
        fontWeight: 400,
        fontStyle: "italic",
      },
      labelFont: mono,
    },
    laptop: { src: "stories/nhfclinics/desktop-promos.mp4", frame: 36 },
    phone: { src: "stories/nhfclinics/mobile-tour.mp4", frame: 0 },
  },
  masera: {
    name: "Masera Dentistry",
    hook: "Gentle dentistry, gentle website.",
    look: {
      bg: "#FBF7F0",
      glow: "rgba(62,140,134,0.18)",
      ink: "#1F2A2A",
      accent: "#1F5E5B",
      muted: "#6F7B78",
      titleFont: {
        fontFamily: theme.fonts.news,
        fontWeight: 500,
        letterSpacing: "-0.015em",
      },
      hookFont: {
        fontFamily: theme.fonts.hand,
        fontWeight: 600,
      },
      labelFont: mono,
    },
    laptop: { src: "stories/masera/desktop-picker.mp4", frame: 66 },
    phone: { src: "stories/masera/mobile-film.mp4", frame: 70 },
  },
  baron: {
    name: "Baron Luxury Holidays",
    hook: "Tap a region. The globe flies there.",
    look: {
      bg: "#0A1326",
      glow: "rgba(201,162,74,0.22)",
      ink: "#F3EBDD",
      accent: "#C9A24A",
      muted: "#8C97AE",
      titleFont: {
        fontFamily: theme.fonts.garamond,
        fontWeight: 500,
        letterSpacing: "-0.01em",
      },
      hookFont: {
        fontFamily: theme.fonts.garamond,
        fontWeight: 500,
        fontStyle: "italic",
      },
      labelFont: mono,
    },
    laptop: { src: "stories/baron/desktop-globe.mp4", frame: 84 },
    phone: { src: "stories/baron/mobile-journeys.mp4", frame: 76 },
  },
  infotouch: {
    name: "Infotouch",
    hook: "Scroll the page. Fly over Dubai.",
    look: {
      bg: "#070C1F",
      glow: "rgba(124,227,176,0.2)",
      ink: "#EEF1F8",
      accent: "#7CE3B0",
      muted: "#8892B0",
      titleFont: {
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        letterSpacing: "-0.03em",
      },
      hookFont: {
        fontFamily: theme.fonts.display,
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      labelFont: mono,
    },
    laptop: { src: "stories/infotouch/desktop-film.mp4", frame: 162 },
    phone: { src: "stories/infotouch/mobile-verticals.mp4", frame: 66 },
  },
} satisfies Record<string, Thumb>;

export type ThumbSite = keyof typeof THUMBS;
export const THUMB_ORDER: ThumbSite[] = [
  "downtowndentists",
  "pedinnails",
  "samantha",
  "crown",
  "rielbuild",
  "gincoaluminium",
  "hb",
  "newpc",
  "nhfclinics",
  "masera",
  "baron",
  "infotouch",
];

export const StoryThumb: React.FC<{ readonly site: ThumbSite }> = ({
  site,
}) => {
  const t: Thumb = THUMBS[site];
  const L = t.look;
  const long = t.name.length > 14;
  return (
    <AbsoluteFill style={{ backgroundColor: L.bg, overflow: "hidden" }}>
      {L.pattern ? (
        <AbsoluteFill
          style={{
            backgroundImage: L.pattern,
            backgroundSize:
              site === "rielbuild"
                ? "200px 200px, 200px 200px, 40px 40px, 40px 40px"
                : site === "gincoaluminium"
                  ? "360px 384px, 360px 384px"
                  : undefined,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 64%, ${L.glow}, transparent 62%)`,
        }}
      />
      {/* label */}
      <div
        style={{
          ...L.labelFont,
          position: "absolute",
          left: 0,
          right: 0,
          top: 330,
          textAlign: "center",
          fontSize: 24,
          color: L.accent,
        }}
      >
        {t.label ?? "Website preview"}
      </div>
      {/* name + hook */}
      <div
        style={{
          ...L.titleFont,
          position: "absolute",
          left: 50,
          right: 50,
          top: 380,
          textAlign: "center",
          fontSize: long ? 104 : 132,
          lineHeight: 1,
          color: L.ink,
        }}
      >
        {t.name}
      </div>
      <div
        style={{
          ...L.hookFont,
          position: "absolute",
          left: 50,
          right: 50,
          top: long ? 500 : 530,
          textAlign: "center",
          fontSize: site === "samantha" ? 84 : site === "masera" ? 74 : 58,
          lineHeight: 1.15,
          color: L.accent,
        }}
      >
        {t.hook}
      </div>
      {/* devices */}
      <div style={{ position: "absolute", left: 30, top: 760 }}>
        <LaptopRec
          src={t.laptop.src}
          width={820}
          from={0}
          trim={t.laptop.frame}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 720,
          top: 960,
          rotate: "4deg",
        }}
      >
        <PhoneRec src={t.phone.src} width={290} from={0} trim={t.phone.frame} />
      </div>
      {/* sign-off */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1560,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background:
              L.bg === "#F6F3EE"
                ? "#151A3D"
                : L.bg === "#F3F6F2"
                  ? "#132530"
                  : L.bg === "#FBF7F0"
                    ? "#1F5E5B"
                    : "transparent",
          }}
        >
          <Img
            src={staticFile("brand/logo.png")}
            style={{ width: 150, display: "block" }}
          />
        </div>
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 26,
            color: L.muted,
          }}
        >
          Built by eSolutify
        </div>
      </div>
    </AbsoluteFill>
  );
};

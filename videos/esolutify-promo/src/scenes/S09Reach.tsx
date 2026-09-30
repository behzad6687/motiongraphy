import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Icon } from "../components/Icons";
import { SceneExit, WordReveal, useEntrance } from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 9 — Every sector. Four offices. (225f)
const SECTORS = [
  [
    "Healthcare & Dental",
    "Real Estate",
    "E-Commerce & Retail",
    "Food & Hospitality",
  ],
  ["Automotive", "Legal & Finance", "Home Services", "Education & Coaching"],
  ["Luxury & Beauty", "Immigration & Visa", "Construction", "Logistics & B2B"],
  [
    "Fitness & Wellness",
    "Professional Services",
    "Manufacturing",
    "Non-profits",
  ],
];

const OFFICES = [
  {
    city: "Toronto",
    role: "Canadian HQ",
    code: "CA",
    img: "offices/toronto.jpg",
  },
  {
    city: "Montréal",
    role: "Quebec Office",
    code: "CA",
    img: "offices/montreal.jpg",
  },
  {
    city: "Los Angeles",
    role: "US Office",
    code: "US",
    img: "offices/los-angeles.jpg",
  },
  { city: "Dubai", role: "MENA HQ", code: "AE", img: "offices/dubai.jpg" },
];

const PART_B = 104;
const CARD_W = 370;
const CARD_GAP = 40;
const CARDS_LEFT = (1920 - (CARD_W * 4 + CARD_GAP * 3)) / 2;
const OFFICE_AT = [PART_B + 30, PART_B + 42, PART_B + 54, PART_B + 66];

const SectorRows: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [PART_B - 14, PART_B], [0, 1], {
    ...clamp,
    easing: theme.ease.in,
  });
  if (frame > PART_B + 2) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - out,
        filter: `blur(${out * 14}px)`,
        scale: 1 - out * 0.04,
      }}
    >
      <AbsoluteFill style={{ top: 150, alignItems: "center" }}>
        <WordReveal
          words={[
            "Deep",
            "expertise",
            "across",
            { text: "every", tone: "gold" },
            { text: "sector.", tone: "gold" },
          ]}
          delay={0}
          per={3}
          size={80}
        />
      </AbsoluteFill>
      {SECTORS.map((row, r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            top: 360 + r * 118,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            translate: `${(r % 2 ? -1 : 1) * (frame * 0.9 - 40)}px 0px`,
          }}
        >
          {row.map((s, i) => (
            <SectorPill key={s} text={s} at={10 + r * 6 + i * 3} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const SectorPill: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const p = useEntrance(at, "snappy");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "20px 30px",
        borderRadius: 99,
        background: theme.gradients.card,
        border: `1px solid ${theme.colors.line2}`,
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: 30,
        color: theme.colors.text,
        whiteSpace: "nowrap",
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [30, 0])}px`,
        scale: interpolate(p, [0, 1], [0.85, 1]),
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: theme.colors.dim,
        }}
      />
      {text}
    </div>
  );
};

const OfficeCard: React.FC<{ office: (typeof OFFICES)[number]; i: number }> = ({
  office,
  i,
}) => {
  const frame = useCurrentFrame();
  const p = useEntrance(OFFICE_AT[i], "smooth");
  const pin = useEntrance(OFFICE_AT[i] - 4, "bouncy");
  const kb = interpolate(frame, [OFFICE_AT[i], 225], [1, 1.12], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const x = CARDS_LEFT + i * (CARD_W + CARD_GAP);
  return (
    <>
      {/* route pin */}
      <div
        style={{
          position: "absolute",
          left: x + CARD_W / 2 - 22,
          top: 438 - 22,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.gold2}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: pin,
          boxShadow: `0 0 ${20 + 14 * Math.sin(frame / 8 + i)}px ${theme.colors.glow}`,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: theme.colors.gold2,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: x,
          top: 500,
          width: CARD_W,
          borderRadius: 26,
          overflow: "hidden",
          background: theme.gradients.card,
          border: `1px solid ${theme.colors.line}`,
          boxShadow: theme.shadow.card,
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          translate: `0px ${interpolate(p, [0, 1], [60, 0])}px`,
          scale: interpolate(p, [0, 1], [0.93, 1]),
        }}
      >
        <div style={{ height: 210, overflow: "hidden", position: "relative" }}>
          <Img
            src={staticFile(office.img)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              scale: kb,
              translate: `${(i % 2 ? -1 : 1) * (kb - 1) * 60}px 0px`,
              filter: "saturate(0.85) contrast(1.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 40%, rgba(15,15,15,0.95))",
            }}
          />
        </div>
        <div style={{ padding: "8px 28px 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 44,
                letterSpacing: "-0.03em",
                color: theme.colors.text,
              }}
            >
              {office.city}
            </div>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.colors.line2}`,
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "0.1em",
                color: theme.colors.muted,
              }}
            >
              {office.code}
            </div>
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: theme.colors.dim,
              textTransform: "uppercase",
            }}
          >
            <Icon name="pin" size={20} color={theme.colors.dim} />
            {office.role}
          </div>
        </div>
      </div>
    </>
  );
};

export const S09Reach: React.FC = () => {
  const frame = useCurrentFrame();
  const route = interpolate(frame, [PART_B + 24, PART_B + 80], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const x0 = CARDS_LEFT + CARD_W / 2;
  const x1 = CARDS_LEFT + CARD_W * 3.5 + CARD_GAP * 3;

  return (
    <SceneExit frames={12}>
      <SectorRows />

      {frame >= PART_B ? (
        <>
          <AbsoluteFill style={{ top: 150, alignItems: "center" }}>
            <WordReveal
              words={[
                "One",
                "agency.",
                { text: "Four", tone: "gold" },
                { text: "offices.", tone: "gold" },
              ]}
              delay={PART_B}
              per={4}
              size={84}
            />
            <div
              style={{
                marginTop: 20,
                fontFamily: theme.fonts.body,
                fontSize: 28,
                color: theme.colors.muted,
                opacity: interpolate(
                  frame,
                  [PART_B + 16, PART_B + 30],
                  [0, 1],
                  { ...clamp, easing: theme.ease.out },
                ),
              }}
            >
              Local expertise in Canada, the USA and the UAE, working as one
              team.
            </div>
          </AbsoluteFill>
          {/* dashed route line connecting the offices */}
          <div
            style={{
              position: "absolute",
              left: x0,
              top: 437,
              width: (x1 - x0) * route,
              height: 2,
              backgroundImage: `linear-gradient(90deg, ${theme.colors.gold2} 60%, transparent 60%)`,
              backgroundSize: "18px 2px",
              opacity: 0.8,
            }}
          />
          {OFFICES.map((o, i) => (
            <OfficeCard key={o.city} office={o} i={i} />
          ))}
        </>
      ) : null}

      {SECTORS.flat().map((s, i) =>
        i % 2 ? null : (
          <Sfx
            key={s}
            name="tick"
            at={10 + i * 3}
            volume={0.22}
            rate={1 + (i % 5) * 0.05}
          />
        ),
      )}
      <Sfx name="whoosh-soft" at={PART_B - 6} volume={0.4} />
      {OFFICE_AT.map((f, i) => (
        <Sfx
          key={f}
          name="pop"
          at={f - 6}
          volume={0.45}
          rate={0.9 + i * 0.08}
        />
      ))}
    </SceneExit>
  );
};

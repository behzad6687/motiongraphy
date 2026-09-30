import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Phone } from "../components/Devices";
import { Icon } from "../components/Icons";
import { SafeZones } from "../components/SafeZones";
import { Stage } from "../components/Stage";
import { theme } from "../theme";
import { SITES, type SiteKey } from "./timeline";

// Static 1080×1920 Story ads. Stories keep the top and bottom 250px clear
// (profile bar / reply bar), so all copy sits in y 270–1650.

type Props = {
  readonly variant: "offer" | "wall";
  readonly safeZones?: boolean;
};

const HERO_SCROLL: Record<SiteKey, number> = {
  greersmiles: 0,
  sutebel: 180,
  newpc: 210,
  rielbuild: 260,
  gincoaluminium: 0,
};

const gold: React.CSSProperties = {
  backgroundImage: theme.gradients.gold,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 0 28px ${theme.colors.glow})`,
};

const headline = (size: number): React.CSSProperties => ({
  fontFamily: theme.fonts.display,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 1.04,
  letterSpacing: "-0.03em",
  color: theme.colors.text,
  textAlign: "center",
});

const PhoneAt: React.FC<{
  site: SiteKey;
  width: number;
  cx: number;
  top: number;
  rotate?: number;
  dim?: number;
  glow?: number;
}> = ({ site, width, cx, top, rotate = 0, dim = 1, glow = 0 }) => {
  const outerW = width + Math.round(width * 0.035) * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - outerW / 2,
        top,
        rotate: `${rotate}deg`,
        filter: dim < 1 ? `brightness(${dim})` : undefined,
      }}
    >
      <Phone
        id={`story-${site}-${width}`}
        cap={SITES[site].mobile}
        width={width}
        scroll={HERO_SCROLL[site]}
        glow={glow}
      />
    </div>
  );
};

const Sticker: React.FC<{ left: number; top: number }> = ({ left, top }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      padding: "18px 34px",
      borderRadius: 99,
      background: theme.gradients.gold,
      boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
      fontFamily: theme.fonts.body,
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: "0.06em",
      color: "#0A0A0A",
      rotate: "-4deg",
      whiteSpace: "nowrap",
    }}
  >
    FREE · NO OBLIGATION
  </div>
);

// Bottom block: dark fade, the one button, URL and proof.
const CtaBlock: React.FC<{ top: number; proof: string }> = ({ top, proof }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top - 320,
        bottom: 0,
        background:
          "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.88) 38%, #0A0A0A 70%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 190,
        top,
        width: 700,
        height: 118,
        borderRadius: 99,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        background: theme.gradients.gold,
        boxShadow: theme.shadow.goldGlow,
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 52,
        color: "#0A0A0A",
      }}
    >
      Apply for a free demo
      <Icon name="arrow" size={46} color="#0A0A0A" stroke={2.8} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top + 148,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: 42,
        color: theme.colors.text,
      }}
    >
      esolutify.com/free-demo
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: top + 212,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: 34,
        color: theme.colors.muted,
      }}
    >
      {proof.includes("Google") ? (
        <Icon name="star" size={30} color={theme.colors.gold2} stroke={2.2} />
      ) : null}
      {proof}
    </div>
  </>
);

const Logo: React.FC<{ top: number; width: number }> = ({ top, width }) => (
  <Img
    src={staticFile("brand/logo.png")}
    style={{
      position: "absolute",
      left: 540 - width / 2,
      top,
      width,
      filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
    }}
  />
);

// A — the offer, proven by three real sites.
const Offer: React.FC = () => {
  const w = 400;
  return (
    <>
      <Logo top={280} width={280} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 400 }}>
        <div
          style={{
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 50,
            color: theme.colors.muted,
          }}
        >
          See your new website
        </div>
        <div style={{ ...headline(112), marginTop: 12 }}>before you pay</div>
        <div style={headline(112)}>
          <span style={gold}>a dollar.</span>
        </div>
      </div>
      <PhoneAt
        site="sutebel"
        width={330}
        cx={232}
        top={840}
        rotate={-9}
        dim={0.7}
      />
      <PhoneAt
        site="newpc"
        width={330}
        cx={848}
        top={840}
        rotate={9}
        dim={0.7}
      />
      <PhoneAt site="greersmiles" width={w} cx={540} top={760} glow={0.45} />
      <Sticker left={560} top={735} />
      <CtaBlock top={1400} proof="5.0 on Google · 500+ projects" />
    </>
  );
};

// B — the showcase: a wall of real demo sites, then the offer.
const Wall: React.FC = () => {
  const w = 300;
  const top = 700;
  return (
    <>
      <Logo top={280} width={240} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 380 }}>
        <div style={headline(100)}>We build websites</div>
        <div style={headline(100)}>
          <span style={gold}>like this.</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 612,
          display: "flex",
          justifyContent: "center",
          gap: 14,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 30,
          color: theme.colors.text,
        }}
      >
        {["Dental", "Fashion", "PC studio", "Renovation", "Façades"].map(
          (t) => (
            <span
              key={t}
              style={{
                padding: "8px 18px",
                borderRadius: 99,
                background: theme.colors.surface2,
                border: `1px solid ${theme.colors.goldLine}`,
              }}
            >
              {t}
            </span>
          ),
        )}
      </div>
      <PhoneAt
        site="greersmiles"
        width={w * 0.82}
        cx={-10}
        top={top + 90}
        rotate={-8}
        dim={0.6}
      />
      <PhoneAt
        site="rielbuild"
        width={w * 0.82}
        cx={1090}
        top={top + 90}
        rotate={8}
        dim={0.6}
      />
      <PhoneAt
        site="sutebel"
        width={w * 0.9}
        cx={262}
        top={top + 40}
        rotate={-4}
        dim={0.85}
      />
      <PhoneAt
        site="newpc"
        width={w * 0.9}
        cx={818}
        top={top + 40}
        rotate={4}
        dim={0.85}
      />
      <PhoneAt site="gincoaluminium" width={w} cx={540} top={top} glow={0.4} />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1250,
          zIndex: 2,
          ...headline(64),
        }}
      >
        See yours <span style={gold}>before you pay.</span>
      </div>
      <CtaBlock top={1400} proof="Free · no obligation · about a week" />
    </>
  );
};

export const StoryImage: React.FC<Props> = ({ variant, safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>{variant === "offer" ? <Offer /> : <Wall />}</Stage>
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

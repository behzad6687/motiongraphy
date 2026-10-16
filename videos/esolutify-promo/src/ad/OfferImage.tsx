import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Icon } from "../components/Icons";
import { Stage } from "../components/Stage";
import { theme } from "../theme";
import { PhoneAt, gold, headline } from "./StoryImage";

// The "free demo" offer (StoryImageOffer) re-laid out for feed placements,
// so nothing is cropped: wide 1.91:1 (1200×628), square 1:1 (1080×1080) and
// tall 4:5 (1080×1350). Same copy, phones and button as the Story.

export type OfferFormat = "wide" | "square" | "tall";

const Sticker: React.FC<{ left: number; top: number; size: number }> = ({
  left,
  top,
  size,
}) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      padding: `${size * 0.5}px ${size}px`,
      borderRadius: 99,
      background: theme.gradients.gold,
      boxShadow: "0 14px 34px rgba(0,0,0,0.5)",
      fontFamily: theme.fonts.body,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "0.06em",
      color: "#0A0A0A",
      rotate: "-4deg",
      whiteSpace: "nowrap",
      zIndex: 3,
    }}
  >
    FREE · NO OBLIGATION
  </div>
);

const Button: React.FC<{
  left: number;
  top: number;
  width: number;
  height: number;
  size: number;
}> = ({ left, top, width, height, size }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      width,
      height,
      borderRadius: 99,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: size * 0.35,
      background: theme.gradients.gold,
      boxShadow: theme.shadow.goldGlow,
      fontFamily: theme.fonts.display,
      fontWeight: 800,
      fontSize: size,
      color: "#0A0A0A",
      zIndex: 3,
    }}
  >
    Apply for a free demo
    <Icon name="arrow" size={size * 0.9} color="#0A0A0A" stroke={2.8} />
  </div>
);

const Url: React.FC<{
  left: number;
  width: number;
  top: number;
  size: number;
  align?: "center" | "left";
}> = ({ left, width, top, size, align = "center" }) => (
  <>
    <div
      style={{
        position: "absolute",
        left,
        width,
        top,
        textAlign: align,
        fontFamily: theme.fonts.body,
        fontWeight: 600,
        fontSize: size,
        color: theme.colors.text,
        zIndex: 3,
      }}
    >
      esolutify.com/free-demo
    </div>
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: top + size * 1.5,
        display: "flex",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "center",
        gap: size * 0.3,
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: size * 0.8,
        color: theme.colors.muted,
        zIndex: 3,
      }}
    >
      <Icon
        name="star"
        size={size * 0.72}
        color={theme.colors.gold2}
        stroke={2.2}
      />
      5.0 on Google · 500+ projects
    </div>
  </>
);

const Fade: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      bottom: 0,
      background:
        "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.88) 38%, #0A0A0A 70%)",
      zIndex: 2,
    }}
  />
);

const Logo: React.FC<{ left: number; top: number; width: number }> = ({
  left,
  top,
  width,
}) => (
  <Img
    src={staticFile("brand/logo.png")}
    style={{
      position: "absolute",
      left,
      top,
      width,
      filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
    }}
  />
);

const Lead: React.FC<{ size: number; align?: "center" | "left" }> = ({
  size,
  align = "center",
}) => (
  <div
    style={{
      textAlign: align,
      fontFamily: theme.fonts.body,
      fontWeight: 600,
      fontSize: size,
      color: theme.colors.muted,
    }}
  >
    See your new website
  </div>
);

// three phones, centred on cx; the middle one on top
const Phones: React.FC<{
  cx: number;
  top: number;
  w: number;
  spread: number;
}> = ({ cx, top, w, spread }) => (
  <>
    <PhoneAt
      site="sutebel"
      width={w * 0.82}
      cx={cx - spread}
      top={top + w * 0.2}
      rotate={-9}
      dim={0.7}
    />
    <PhoneAt
      site="newpc"
      width={w * 0.82}
      cx={cx + spread}
      top={top + w * 0.2}
      rotate={9}
      dim={0.7}
    />
    <PhoneAt site="greersmiles" width={w} cx={cx} top={top} glow={0.45} />
  </>
);

// 1.91:1 — copy on the left, phones on the right
const Wide: React.FC = () => (
  <>
    <Phones cx={905} top={70} w={230} spread={190} />
    <Sticker left={760} top={52} size={20} />
    <Fade top={420} />
    <Logo left={64} top={44} width={190} />
    <div style={{ position: "absolute", left: 64, width: 600, top: 140 }}>
      <Lead size={30} align="left" />
      <div style={{ ...headline(76), textAlign: "left", marginTop: 6 }}>
        before you pay
      </div>
      <div style={{ ...headline(76), textAlign: "left" }}>
        <span style={gold}>a dollar.</span>
      </div>
    </div>
    <Button left={64} top={392} width={470} height={84} size={34} />
    <Url left={64} width={600} top={500} size={28} align="left" />
  </>
);

// 1:1
const Square: React.FC = () => (
  <>
    <Logo left={540 - 110} top={48} width={220} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 146 }}>
      <Lead size={40} />
      <div style={{ ...headline(92), marginTop: 6 }}>
        before you pay <span style={gold}>a dollar.</span>
      </div>
    </div>
    <Phones cx={540} top={390} w={300} spread={300} />
    <Sticker left={560} top={372} size={26} />
    <Fade top={600} />
    <Button left={210} top={830} width={660} height={104} size={46} />
    <Url left={0} width={1080} top={958} size={34} />
  </>
);

// 4:5
const Tall: React.FC = () => (
  <>
    <Logo left={540 - 130} top={56} width={260} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 172 }}>
      <Lead size={46} />
      <div style={{ ...headline(104), marginTop: 8 }}>before you pay</div>
      <div style={headline(104)}>
        <span style={gold}>a dollar.</span>
      </div>
    </div>
    <Phones cx={540} top={520} w={360} spread={330} />
    <Sticker left={560} top={500} size={30} />
    <Fade top={760} />
    <Button left={190} top={1040} width={700} height={114} size={50} />
    <Url left={0} width={1080} top={1186} size={38} />
  </>
);

export const OfferImage: React.FC<{ readonly format: OfferFormat }> = ({
  format,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      {format === "wide" ? (
        <Wide />
      ) : format === "square" ? (
        <Square />
      ) : (
        <Tall />
      )}
    </Stage>
  </AbsoluteFill>
);

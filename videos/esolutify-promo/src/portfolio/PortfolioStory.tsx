import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { scrollV, scrollY, type Seg } from "../ad/timeline";
import { Phone, Tap, phoneScreenHeight } from "../components/Devices";
import { Icon } from "../components/Icons";
import { LightSweep } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { ease } from "../reel/kit";
import { clamp, theme } from "../theme";
import { STORY_SITES, type StoryKey } from "./sites";

// A 15 s Instagram Story for one portfolio site, 1080×1920 @ 30 fps.
// Stories keep the top and bottom ~250 px clear (profile bar, reply bar), so
// copy sits in y 270–1650 and the end card leaves room for a link sticker.
//
//   0–20     title + phone rise in
//   20–330   the real site scrolls in the phone: three flicks, and a callout
//            (a fact from the page) lands at each stop
//   330–450  end card: "Want a site like this?" → free demo

export const STORY_DURATION = 450;
const END = 330;
const PHONE_W = 500;
const PHONE_TOP = 590;
const FLICKS = [
  [52, 82],
  [134, 164],
  [216, 246],
] as const;
const CALLOUT_AT = FLICKS.map(([, f1]) => f1 + 2);

const gold: React.CSSProperties = {
  backgroundImage: theme.gradients.gold,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// ---------------------------------------------------------------- title
const Title: React.FC<{ k: StoryKey }> = ({ k }) => {
  const frame = useCurrentFrame();
  const s = STORY_SITES[k];
  const out = ease(frame, END - 8, END + 6, theme.ease.in);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 282,
        textAlign: "center",
        opacity: ease(frame, 2, 14) * (1 - out),
        translate: `0px ${(1 - ease(frame, 2, 18, theme.ease.out)) * 24}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "0.18em",
          color: theme.colors.gold2,
        }}
      >
        <span>BUILT BY ESOLUTIFY</span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: s.name.length > 16 ? 76 : 92,
          lineHeight: 1.04,
          letterSpacing: "-0.03em",
          color: theme.colors.text,
        }}
      >
        {s.name}
      </div>
      <div
        style={{
          marginTop: 14,
          display: "inline-block",
          padding: "8px 22px",
          borderRadius: 99,
          background: theme.colors.surface2,
          border: `1px solid ${theme.colors.goldLine}`,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 30,
          color: theme.colors.text,
        }}
      >
        {s.kind}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- phone
const segsFor = (k: StoryKey): Seg[] => {
  const st = STORY_SITES[k].stops;
  return FLICKS.map(([f0, f1], i) => ({
    type: "flick" as const,
    f0,
    f1,
    y0: st[i],
    y1: st[i + 1],
    release: 0.35,
  }));
};

const StoryPhone: React.FC<{ k: StoryKey }> = ({ k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = STORY_SITES[k];
  const segs = segsFor(k);
  const rise = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  const out = ease(frame, END - 10, END + 12, theme.ease.in);
  const outerW = PHONE_W + Math.round(PHONE_W * 0.035) * 2;
  const screenH = phoneScreenHeight(PHONE_W);
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - outerW / 2,
        top: PHONE_TOP,
        translate: `0px ${(1 - rise) * 900 + out * 700}px`,
        scale: 1 - out * 0.15,
        opacity: 1 - out,
        zIndex: 2,
      }}
    >
      <Phone
        id={`story-${k}`}
        cap={s.phone}
        width={PHONE_W}
        scroll={scrollY(frame, segs)}
        blur={Math.abs(scrollV(frame, segs)) * 0.35}
        glow={0.35}
      >
        {FLICKS.map(([f0]) => (
          <Tap
            key={f0}
            x={PHONE_W * 0.62}
            y={screenH * 0.66}
            at={f0}
            size={110}
          />
        ))}
      </Phone>
    </div>
  );
};

// ---------------------------------------------------------------- callouts
const CALLOUT_POS: {
  left?: number;
  right?: number;
  top: number;
  rot: number;
}[] = [
  { left: 36, top: 900, rot: -3 },
  { right: 36, top: 1130, rot: 3 },
  { left: 36, top: 1430, rot: -2 },
];

const Callouts: React.FC<{ k: StoryKey }> = ({ k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = ease(frame, END - 10, END + 4, theme.ease.in);
  return (
    <>
      {STORY_SITES[k].callouts.map((c, i) => {
        const at = CALLOUT_AT[i];
        if (frame < at) return null;
        const p = spring({
          frame: frame - at,
          fps,
          config: theme.spring.bouncy,
        });
        const pos = CALLOUT_POS[i];
        // one callout at a time: the previous one fades as the next lands
        const next = CALLOUT_AT[i + 1];
        const gone = next === undefined ? 0 : ease(frame, next - 2, next + 8);
        if (gone >= 1) return null;
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: pos.left,
              right: pos.right,
              top: pos.top,
              maxWidth: 640,
              padding: "22px 26px",
              borderRadius: 26,
              display: "flex",
              gap: 18,
              alignItems: "center",
              background: "rgba(18,16,12,0.92)",
              border: `2px solid ${theme.colors.gold2}`,
              boxShadow: `0 24px 50px rgba(0,0,0,0.55), ${theme.shadow.goldGlow}`,
              rotate: `${pos.rot}deg`,
              scale: interpolate(p, [0, 1], [0.6, 1]) * (1 - 0.1 * gone),
              opacity:
                interpolate(p, [0, 0.3], [0, 1], clamp) *
                (1 - gone) *
                (1 - out),
              zIndex: 3 + i,
            }}
          >
            <div
              style={{
                flex: "none",
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: theme.gradients.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="check" size={34} color="#0A0A0A" stroke={3} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 38,
                  lineHeight: 1.1,
                  color: theme.colors.text,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: theme.fonts.body,
                  fontWeight: 500,
                  fontSize: 26,
                  lineHeight: 1.25,
                  color: theme.colors.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC<{ k: StoryKey }> = ({ k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < END) return null;
  const t = (d: number) =>
    spring({ frame: frame - END - d, fps, config: theme.spring.smooth });
  const up = (d: number): React.CSSProperties => ({
    opacity: interpolate(t(d), [0, 0.4], [0, 1], clamp),
    translate: `0px ${(1 - t(d)) * 40}px`,
  });
  const ring = ((((frame - END - 40) % 36) + 36) % 36) / 36;
  return (
    <AbsoluteFill style={{ zIndex: 5 }}>
      <Img
        src={staticFile("brand/logo.png")}
        style={{
          position: "absolute",
          left: 540 - 150,
          top: 380,
          width: 300,
          filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
          ...up(0),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 560,
          textAlign: "center",
          ...up(4),
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 40,
            color: theme.colors.muted,
          }}
        >
          {STORY_SITES[k].name} was built by eSolutify.
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: theme.colors.text,
          }}
        >
          Want a site
          <br />
          <span style={gold}>like this?</span>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.3,
            color: theme.colors.text,
          }}
        >
          See your new website free,
          <br />
          before you pay a dollar.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 1110,
          width: 740,
          height: 116,
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: theme.gradients.gold,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 50,
          color: "#0A0A0A",
          ...up(10),
        }}
      >
        Get your free demo
        <Icon name="arrow" size={46} color="#0A0A0A" stroke={2.8} />
        <LightSweep start={END + 34} duration={24} width={140} opacity={0.7} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1262,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 40,
          color: theme.colors.text,
          ...up(14),
        }}
      >
        esolutify.com/free-demo
      </div>
      {/* room for the Story link sticker */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.08em",
          color: theme.colors.gold2,
          ...up(20),
        }}
      >
        TAP THE LINK
        <div
          style={{
            position: "relative",
            width: 54,
            height: 54,
            translate: `0px ${Math.sin((frame - END) / 5) * 6}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${theme.colors.gold2}`,
              scale: 1 + ring * 0.7,
              opacity: 1 - ring,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              rotate: "90deg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="arrow"
              size={40}
              color={theme.colors.gold2}
              stroke={2.8}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PortfolioStory: React.FC<{
  readonly site: StoryKey;
  readonly safeZones?: boolean;
}> = ({ site, safeZones = false }) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <Title k={site} />
      <StoryPhone k={site} />
      <Callouts k={site} />
      <EndCard k={site} />
    </Stage>
    <Audio
      src={staticFile("audio/ad-music-15.wav")}
      volume={(f) =>
        0.55 *
        interpolate(f, [STORY_DURATION - 24, STORY_DURATION], [1, 0], clamp)
      }
    />
    <Sfx name="whoosh-soft" at={2} volume={0.35} />
    {FLICKS.map(([f0]) => (
      <Sfx key={f0} name="whoosh" at={f0 + 2} volume={0.25} />
    ))}
    {CALLOUT_AT.map((at, i) => (
      <Sfx key={at} name="pop" at={at - 1} volume={0.4} rate={1 + i * 0.08} />
    ))}
    <Sfx name="whoosh" at={END - 6} volume={0.35} />
    <Sfx name="chime" at={END + 10} volume={0.4} />
    {safeZones ? <SafeZones /> : null}
  </AbsoluteFill>
);

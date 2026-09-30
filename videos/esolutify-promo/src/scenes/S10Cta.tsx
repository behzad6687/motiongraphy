import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Icon } from "../components/Icons";
import {
  LightSweep,
  WordReveal,
  useBreathe,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 10 — Book the call (240f). One action, calm, glow on the CTA.
const BUTTON_AT = 62;

export const S10Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useEntrance(0, "smooth");
  const button = useEntrance(BUTTON_AT, "bouncy");
  const info = useEntrance(84, "smooth");
  const demo = useEntrance(96, "smooth");
  const offices = useEntrance(108, "smooth");
  const breathe = useBreathe(20, 0.012);
  const glow = 0.6 + 0.4 * Math.sin(frame / 12);
  const halo = interpolate(frame, [0, 60], [0.4, 1], {
    ...clamp,
    easing: theme.ease.out,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1500,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(200,151,58,0.16), transparent 75%)",
            opacity: halo,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", top: 168 }}>
        <Img
          src={staticFile("brand/logo.png")}
          style={{
            width: 540,
            opacity: interpolate(logo, [0, 0.4], [0, 1], clamp),
            translate: `0px ${interpolate(logo, [0, 1], [40, 0])}px`,
            scale: interpolate(logo, [0, 1], [0.9, 1]),
            filter: `blur(${interpolate(logo, [0, 1], [10, 0], clamp)}px) drop-shadow(0 16px 40px rgba(0,0,0,0.6))`,
          }}
        />
        <div style={{ height: 50 }} />
        <WordReveal
          words={[
            "One",
            "system.",
            "Every",
            "lead",
            { text: "answered.", tone: "gold" },
          ]}
          delay={24}
          per={4}
          size={96}
        />

        {/* the one action */}
        <div
          style={{
            marginTop: 56,
            position: "relative",
            opacity: interpolate(button, [0, 0.4], [0, 1], clamp),
            scale: interpolate(button, [0, 1], [0.7, 1]) * breathe,
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "32px 60px",
              borderRadius: 99,
              background: theme.gradients.gold,
              boxShadow: `0 0 ${50 + glow * 40}px rgba(220,174,85,${0.35 + glow * 0.2}), 0 20px 50px rgba(0,0,0,0.5)`,
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 46,
              letterSpacing: "-0.01em",
              color: "#0A0A0A",
            }}
          >
            Book a free strategy call
            <Icon name="arrow" size={44} color="#0A0A0A" stroke={2.6} />
            <LightSweep
              start={BUTTON_AT + 18}
              duration={28}
              width={140}
              opacity={0.7}
            />
            <LightSweep
              start={BUTTON_AT + 78}
              duration={28}
              width={140}
              opacity={0.7}
            />
            <LightSweep
              start={BUTTON_AT + 138}
              duration={28}
              width={140}
              opacity={0.7}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 36,
            color: theme.colors.text,
            opacity: info,
            translate: `0px ${interpolate(info, [0, 1], [20, 0])}px`,
          }}
        >
          esolutify.com
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: theme.colors.dim,
            }}
          />
          (647) 450-2250
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.fonts.body,
            fontSize: 26,
            color: theme.colors.muted,
            opacity: demo,
            translate: `0px ${interpolate(demo, [0, 1], [16, 0])}px`,
          }}
        >
          Free website demo: see your new site before you pay a dollar.
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 70,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "0.3em",
            color: theme.colors.dim,
            opacity: offices,
          }}
        >
          TORONTO · MONTRÉAL · LOS ANGELES · DUBAI
        </div>
      </AbsoluteFill>

      <Sfx name="shimmer" at={6} volume={0.45} />
      <Sfx name="whoosh-soft" at={22} volume={0.35} />
      <Sfx name="riser" at={BUTTON_AT - 30} volume={0.3} />
      <Sfx name="impact" at={BUTTON_AT - 2} volume={0.4} />
      <Sfx name="chime" at={BUTTON_AT + 2} volume={0.35} />
    </AbsoluteFill>
  );
};

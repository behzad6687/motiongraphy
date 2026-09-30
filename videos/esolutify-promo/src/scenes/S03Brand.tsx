import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  SceneExit,
  WordReveal,
  useBreathe,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

const LOGO = staticFile("brand/logo.png"); // 570 × 181

// Frame 3 — The promise (165f). Lands on the music drop.
export const S03Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: theme.spring.bouncy });
  const settle = spring({
    frame: frame - 34,
    fps,
    config: theme.spring.smooth,
  });
  const flare = interpolate(frame, [0, 6, 40], [0, 1, 0], {
    ...clamp,
    easing: theme.ease.out,
  });
  const sweep = interpolate(frame, [10, 38], [-40, 140], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const breathe = useBreathe(26, 0.01);
  const tag = useEntrance(96, "smooth");

  const logoW = 1000;
  const logoScale =
    interpolate(pop, [0, 1], [0.82, 1]) *
    interpolate(settle, [0, 1], [1, 0.56]) *
    breathe;
  const logoY = interpolate(settle, [0, 1], [0, -250]);

  return (
    <SceneExit frames={14} lift={0}>
      {/* flare behind the mark */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1400,
            height: 1400,
            borderRadius: "50%",
            translate: `0px ${logoY}px`,
            background: `radial-gradient(circle, rgba(232,184,75,${0.28 * flare + 0.06}), transparent 55%)`,
            scale: interpolate(flare, [0, 1], [0.6, 1.1]),
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: logoW,
            height: (logoW * 181) / 570,
            translate: `0px ${logoY}px`,
            scale: logoScale,
            opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
            filter: `blur(${interpolate(pop, [0, 1], [18, 0], clamp)}px) drop-shadow(0 20px 50px rgba(0,0,0,0.6))`,
          }}
        >
          <Img src={LOGO} style={{ width: "100%", height: "100%" }} />
          {/* light sweep clipped to the logo's own alpha */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              maskImage: `url(${LOGO})`,
              WebkitMaskImage: `url(${LOGO})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              background: `linear-gradient(105deg, transparent ${sweep - 14}%, rgba(255,240,200,0.95) ${sweep}%, transparent ${sweep + 14}%)`,
              mixBlendMode: "screen",
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 520, alignItems: "center" }}>
        <WordReveal
          words={["We", "don’t", "just", "get", "you", "leads."]}
          delay={46}
          per={3}
          size={92}
        />
        <div style={{ height: 6 }} />
        <WordReveal
          words={[
            "We",
            { text: "convert", tone: "gold", underline: true },
            "them.",
          ]}
          delay={70}
          per={4}
          size={118}
        />
        <div
          style={{
            marginTop: 42,
            opacity: tag,
            translate: `0px ${interpolate(tag, [0, 1], [14, 0])}px`,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 30,
            color: theme.colors.muted,
          }}
        >
          AI chat agents, follow-up and automation — fed by ads, SEO and
          websites that convert.
        </div>
      </AbsoluteFill>

      <Sfx name="impact" at={0} volume={0.55} />
      <Sfx name="shimmer" at={8} volume={0.6} />
      <Sfx name="whoosh-soft" at={43} volume={0.4} />
      <Sfx name="whoosh" at={67} volume={0.45} />
    </SceneExit>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Icon } from "../components/Icons";
import { SceneExit, WordReveal, useEntrance } from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 1 — The enquiry (165f). A 9:42 PM enquiry arrives. Nobody answers.
export const S01Hook: React.FC = () => {
  const frame = useCurrentFrame();

  const hair = interpolate(frame, [0, 22], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  const hairFade = interpolate(frame, [18, 34], [1, 0], {
    ...clamp,
    easing: theme.ease.in,
  });
  const clockIn = useEntrance(6, "smooth");
  const bubble = useEntrance(18, "bouncy");
  // bubble steps back when the headline takes over
  const back = interpolate(frame, [58, 78], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  // "lose" shake after it lands
  const shake =
    interpolate(frame, [118, 136], [1, 0], {
      ...clamp,
      easing: theme.ease.out,
    }) *
    Math.sin(frame * 1.9) *
    7;

  return (
    <SceneExit frames={12}>
      {/* gold hairline that opens the film */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1100 * hair,
            height: 2,
            background: theme.gradients.hair,
            opacity: hairFade,
          }}
        />
      </AbsoluteFill>

      {/* enquiry bubble */}
      <AbsoluteFill style={{ alignItems: "center", top: 250 }}>
        <div
          style={{
            opacity:
              interpolate(clockIn, [0, 1], [0, 1]) *
              interpolate(back, [0, 1], [1, 0.5]),
            translate: `0px ${interpolate(back, [0, 1], [0, -80])}px`,
            fontFamily: theme.fonts.body,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "0.3em",
            color: theme.colors.muted,
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="clock" size={26} color={theme.colors.muted} />
          9:42 PM
        </div>
        <div
          style={{
            opacity:
              interpolate(bubble, [0, 0.5], [0, 1], clamp) *
              interpolate(back, [0, 1], [1, 0.42]),
            translate: `0px ${interpolate(bubble, [0, 1], [70, 0]) + interpolate(back, [0, 1], [0, -80])}px`,
            scale:
              interpolate(bubble, [0, 1], [0.85, 1]) *
              interpolate(back, [0, 1], [1, 0.84]),
            width: 860,
            padding: "34px 42px",
            borderRadius: 28,
            background: theme.gradients.card,
            border: `1px solid ${theme.colors.line2}`,
            boxShadow: theme.shadow.card,
            display: "flex",
            gap: 28,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              flexShrink: 0,
              borderRadius: "50%",
              background: theme.colors.surface3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="user" size={38} color={theme.colors.muted} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: theme.fonts.body,
                fontWeight: 600,
                fontSize: 21,
                letterSpacing: "0.18em",
                color: theme.colors.gold2,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: theme.colors.gold2,
                  boxShadow: `0 0 ${10 + pulse * 16}px ${theme.colors.glow}`,
                }}
              />
              NEW ENQUIRY · 9:42 PM
            </div>
            <div
              style={{
                fontFamily: theme.fonts.body,
                fontSize: 44,
                fontWeight: 500,
                lineHeight: 1.25,
                color: theme.colors.text,
              }}
            >
              “Hi, do you have anything this week?”
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* the line */}
      <AbsoluteFill style={{ top: 560, alignItems: "center" }}>
        <WordReveal
          words={["Every", "lead", "that", "waits…"]}
          delay={64}
          per={4}
          size={104}
        />
        <div style={{ height: 8 }} />
        <div style={{ translate: `${shake}px 0px` }}>
          <WordReveal
            words={[
              { text: "…is", tone: "muted" },
              { text: "a", tone: "muted" },
              { text: "lead", tone: "muted" },
              { text: "you", tone: "muted" },
              { text: "lose.", tone: "red" },
            ]}
            delay={98}
            per={4}
            size={104}
          />
        </div>
      </AbsoluteFill>

      <Sfx name="ping" at={16} volume={0.7} />
      <Sfx name="whoosh-soft" at={60} volume={0.45} />
      <Sfx name="whoosh-soft" at={95} volume={0.4} />
      <Sfx name="thud" at={113} volume={0.75} />
    </SceneExit>
  );
};

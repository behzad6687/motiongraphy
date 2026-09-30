import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Icon } from "../components/Icons";
import { Rise, SceneExit, WordReveal, useEntrance } from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 2 — Same lead. Two outcomes. (270f) Copy verbatim from esolutify.com.
type Step = { time: string; text: string; tone?: "bad" | "ok" };

const WITHOUT: Step[] = [
  { time: "9:42 PM", text: "Enquiry arrives" },
  { time: "EVENING", text: "Nobody sees it" },
  { time: "OVERNIGHT", text: "Still waiting" },
  { time: "12:15 PM", text: "Someone calls back" },
  { time: "TOO LATE", text: "“We went with someone else”", tone: "bad" },
];
const WITH: Step[] = [
  { time: "9:42:00", text: "Enquiry arrives" },
  { time: "9:42:05", text: "Answered on the same channel" },
  { time: "9:44", text: "Right questions asked" },
  { time: "9:46", text: "Booked: Tue 10:30 am", tone: "ok" },
  { time: "TUESDAY", text: "Reminded · shows up" },
];

const LEFT_STEPS = [36, 54, 72, 90, 108];
const RIGHT_STEPS = [124, 132, 140, 148, 156];

const StepRow: React.FC<{
  step: Step;
  at: number;
  dot: string;
  last: boolean;
}> = ({ step, at, dot, last }) => {
  const p = useEntrance(at, "snappy");
  const color =
    step.tone === "bad"
      ? theme.colors.red
      : step.tone === "ok"
        ? theme.colors.ok
        : theme.colors.text;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        height: 76,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `${interpolate(p, [0, 1], [-24, 0])}px 0px`,
      }}
    >
      <div
        style={{
          width: 30,
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: step.tone ? 26 : 16,
            height: step.tone ? 26 : 16,
            borderRadius: "50%",
            background:
              step.tone === "ok"
                ? theme.colors.ok
                : step.tone === "bad"
                  ? theme.colors.red
                  : dot,
            scale: interpolate(p, [0, 1], [0.2, 1]),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              step.tone === "ok" ? `0 0 24px ${theme.colors.ok}` : "none",
          }}
        >
          {step.tone === "ok" ? (
            <Icon name="check" size={18} color="#0A0A0A" stroke={3} />
          ) : null}
        </div>
      </div>
      <div
        style={{
          width: 170,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: "0.14em",
          color: theme.colors.dim,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {step.time}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: step.tone ? 700 : 500,
          fontSize: 31,
          color,
          opacity: last && !step.tone ? 0.9 : 1,
        }}
      >
        {step.text}
      </div>
    </div>
  );
};

const Column: React.FC<{
  side: "without" | "with";
  x: number;
  dimmed: number;
  lit: number;
}> = ({ side, x, dimmed, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isWith = side === "with";
  const steps = isWith ? WITH : WITHOUT;
  const at = isWith ? RIGHT_STEPS : LEFT_STEPS;
  const labelAt = isWith ? 112 : 24;

  // counters: slow grind on the left, a snap on the right
  const slow = interpolate(frame, [30, 112], [0, 1], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const minutes = Math.round(873 * slow);
  const fast = spring({ frame: frame - 118, fps, config: theme.spring.snappy });
  const seconds = Math.round(interpolate(fast, [0, 1], [0, 5], clamp));
  const counterIn = useEntrance(
    isWith ? 116 : 28,
    isWith ? "bouncy" : "smooth",
  );
  const lineGrow = interpolate(frame, [at[0], at[4] + 8], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 292,
        width: 720,
        opacity: 1 - dimmed * 0.55,
        scale: 1 - dimmed * 0.03 + lit * 0.015,
        filter: `grayscale(${dimmed})`,
      }}
    >
      <Rise delay={labelAt} y={20}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 99,
            border: `1px solid ${isWith ? theme.colors.goldLine : theme.colors.line2}`,
            background: isWith
              ? theme.colors.goldSoft
              : "rgba(255,255,255,0.03)",
            fontFamily: theme.fonts.body,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "0.2em",
            color: isWith ? theme.colors.gold2 : theme.colors.muted,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isWith ? theme.colors.gold2 : theme.colors.red,
            }}
          />
          {isWith ? "WITH YOUR SYSTEM" : "WITHOUT A SYSTEM"}
        </div>
      </Rise>
      <div
        style={{
          marginTop: 22,
          height: 118,
          opacity: counterIn,
          translate: `0px ${interpolate(counterIn, [0, 1], [30, 0])}px`,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 104,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          ...(isWith
            ? {
                backgroundImage: theme.gradients.gold,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: `drop-shadow(0 0 ${24 + lit * 30}px ${theme.colors.glow})`,
              }
            : {
                color: minutes >= 873 ? theme.colors.text : theme.colors.muted,
              }),
        }}
      >
        {isWith
          ? `${seconds} seconds`
          : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`}
      </div>
      <div
        style={{
          opacity: counterIn,
          fontFamily: theme.fonts.body,
          fontSize: 26,
          color: theme.colors.muted,
          marginTop: 4,
          marginBottom: 26,
        }}
      >
        to the first reply
      </div>
      <div style={{ position: "relative" }}>
        {/* timeline spine */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 38,
            width: 2,
            height: 4 * 76 * lineGrow,
            background: isWith ? theme.colors.gold : theme.colors.line2,
            boxShadow: isWith ? `0 0 12px ${theme.colors.glow}` : "none",
          }}
        />
        {steps.map((s, i) => (
          <StepRow
            key={s.time}
            step={s}
            at={at[i]}
            dot={isWith ? theme.colors.gold2 : theme.colors.dim}
            last={i === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export const S02Outcomes: React.FC = () => {
  const frame = useCurrentFrame();
  const divider = interpolate(frame, [10, 40], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  const hold = interpolate(frame, [172, 200], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });

  return (
    <SceneExit frames={8} lift={0} tail={0}>
      <AbsoluteFill style={{ top: 84, alignItems: "center" }}>
        <WordReveal
          words={["Same", "lead.", "Two", "outcomes."]}
          delay={2}
          per={4}
          size={76}
        />
        <Rise delay={12} y={16} style={{ marginTop: 18 }}>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 26,
              color: theme.colors.muted,
            }}
          >
            The enquiry is the same. What happens in the next five minutes
            decides who gets the customer.
          </div>
        </Rise>
      </AbsoluteFill>

      {/* centre divider */}
      <div
        style={{
          position: "absolute",
          left: 959,
          top: 300,
          width: 1,
          height: 680 * divider,
          background: `linear-gradient(180deg, ${theme.colors.line2}, transparent)`,
        }}
      />

      <Column side="without" x={170} dimmed={hold} lit={0} />
      <Column side="with" x={1040} dimmed={0} lit={hold} />

      {/* SFX — the clock grinds on the left, blips race up the right */}
      {new Array(12).fill(true).map((_, i) => (
        <Sfx key={`t${i}`} name="tick" at={30 + i * 7} volume={0.35} />
      ))}
      <Sfx name="thud" at={106} volume={0.7} />
      <Sfx name="whoosh" at={112} volume={0.4} />
      {RIGHT_STEPS.map((f, i) =>
        i === 3 ? null : (
          <Sfx
            key={`b${i}`}
            name="blip"
            at={f - 2}
            volume={0.45}
            rate={1 + i * 0.12}
          />
        ),
      )}
      <Sfx name="chime" at={146} volume={0.6} />
    </SceneExit>
  );
};

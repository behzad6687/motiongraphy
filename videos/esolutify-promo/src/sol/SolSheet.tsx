import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";
import { Sol, type Mood, type SolProps } from "./Sol";

// Model sheet: Sol's expressions and props at a glance (reference still).
const POSES: { label: string; p: Partial<SolProps> & { mood: Mood } }[] = [
  { label: "happy", p: { mood: "happy" } },
  { label: "talk", p: { mood: "talk", talking: true } },
  { label: "laugh", p: { mood: "laugh", arms: [150, 150] } },
  { label: "shock", p: { mood: "shock", spike: 1, arms: [160, 160] } },
  { label: "smug", p: { mood: "smug", arms: [40, 40] } },
  { label: "wink", p: { mood: "wink", arms: [55, 150] } },
  {
    label: "worried + sweat",
    p: { mood: "worried", sweat: true, look: [0.6, -0.5] },
  },
  { label: "pout", p: { mood: "pout", look: [-0.5, 0.4] } },
  {
    label: "1960s specs",
    p: { mood: "happy", glasses: true, arms: [55, 130] },
  },
];

export const SolSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg, padding: 40 }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
      }}
    >
      {POSES.map(({ label, p }) => (
        <div
          key={label}
          style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Sol size={280} {...p} />
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 26,
              color: theme.colors.muted,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

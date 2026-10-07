import React from "react";
import { useCurrentFrame } from "remotion";

// Sol — eSolutify's AI agent as a character: a bouncy little sun wearing a
// receptionist headset. Pure SVG, deterministic (everything is a function of
// the frame and the props), so it renders identically every time.

export type Mood =
  | "happy" // smiling, eyes open
  | "laugh" // ^ ^ eyes, big open grin
  | "talk" // neutral, mouth flaps
  | "shock" // huge eyes, O mouth, rays spike
  | "smug" // half-lidded, crooked grin
  | "wink"
  | "worried" // brows up, wobbly mouth
  | "pout"; // brows down, small frown

export type SolProps = {
  size: number; // rendered width in px
  mood?: Mood;
  talking?: boolean; // flap the mouth
  mouthOpen?: number; // 0..1 from the voice's loudness (lip-sync); overrides the flap
  look?: [number, number]; // pupils, -1..1
  arms?: [number, number]; // degrees from straight down; + raises outward
  spike?: number; // 0..1 rays shoot out (shock)
  squash?: number; // -1 (squashed) .. 1 (stretched)
  glasses?: boolean; // retro specs (the 1960s gag)
  sweat?: boolean;
  blinkSeed?: number;
};

const GOLD = "#F2C14E";
const GOLD_DARK = "#B07A1E";
const INK = "#1E1408";

const Arm: React.FC<{ side: -1 | 1; angle: number }> = ({ side, angle }) => {
  const sx = side * 84;
  const sy = 34;
  const a = ((angle - 0) * Math.PI) / 180;
  // 0 deg hangs down and slightly out; positive swings outward and up
  const len = 64;
  const hx = sx + side * Math.sin(a) * len;
  const hy = sy + Math.cos(a) * len;
  const cx = sx + side * Math.sin(a) * len * 0.5 + side * 10;
  const cy = sy + Math.cos(a) * len * 0.5 + 6;
  return (
    <g>
      <path
        d={`M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`}
        stroke={GOLD_DARK}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`}
        stroke={GOLD}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={hx}
        cy={hy}
        r={14}
        fill={GOLD}
        stroke={GOLD_DARK}
        strokeWidth={3.5}
      />
    </g>
  );
};

export const Sol: React.FC<SolProps> = ({
  size,
  mood = "happy",
  talking = false,
  mouthOpen,
  look = [0, 0],
  arms = [55, 55],
  spike = 0,
  squash = 0,
  glasses = false,
  sweat = false,
  blinkSeed = 0,
}) => {
  const frame = useCurrentFrame();
  // blink every ~3 s (not while laughing / winking)
  const bt = (frame + blinkSeed * 37) % 96;
  const blink =
    mood === "laugh" ? 1 : bt >= 90 && bt < 93 ? 0.12 : bt >= 93 ? 0.5 : 1;
  // mouth: syllable-like flaps while talking
  const flap =
    mouthOpen !== undefined
      ? mouthOpen
      : talking
        ? 0.25 +
          0.75 * Math.abs(Math.sin(frame * 0.85) * Math.cos(frame * 0.31))
        : 0;
  const spin = frame * 0.6;
  const shock = mood === "shock" ? 1 : 0;
  const rayLen = 30 + 24 * spike + (mood === "pout" ? -8 : 0);
  const px = look[0] * 8;
  const py = look[1] * 8;

  const eye = (cx: number, closedArc: boolean) => {
    if (closedArc) {
      return (
        <path
          d={`M${cx - 18} ${-6} Q${cx} ${-30} ${cx + 18} ${-6}`}
          stroke={INK}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    const rx = shock ? 26 : 21;
    const ry = (shock ? 31 : 25) * blink;
    return (
      <g>
        <ellipse
          cx={cx}
          cy={-12}
          rx={rx}
          ry={Math.max(2, ry)}
          fill="#FFFDF6"
          stroke={INK}
          strokeWidth={3.5}
        />
        {blink > 0.4 ? (
          <>
            <circle cx={cx + px} cy={-10 + py} r={shock ? 7 : 11} fill={INK} />
            <circle cx={cx + px + 4} cy={-15 + py} r={3.6} fill="#fff" />
          </>
        ) : null}
        {mood === "smug" ? (
          // heavy lid
          <>
            <path
              d={`M${cx - rx - 3} ${-12} Q${cx} ${-18} ${cx + rx + 3} ${-12} L${cx + rx + 3} ${-42} L${cx - rx - 3} ${-42} Z`}
              fill="#F3CB66"
            />
            <path
              d={`M${cx - rx} ${-12} Q${cx} ${-18} ${cx + rx} ${-12}`}
              stroke={INK}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : null}
      </g>
    );
  };

  const brow = (cx: number, side: -1 | 1) => {
    const tilt =
      mood === "worried"
        ? -12 * side
        : mood === "pout"
          ? 14 * side
          : mood === "shock"
            ? -4 * side
            : mood === "smug"
              ? side < 0
                ? 6
                : -10
              : 0;
    const y = shock ? -56 : -46;
    return (
      <line
        x1={cx - 14}
        y1={y - (tilt * side) / 2}
        x2={cx + 14}
        y2={y + (tilt * side) / 2}
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  };

  let mouth: React.ReactNode;
  if (mood === "shock") {
    mouth = (
      <ellipse
        cx={0}
        cy={42}
        rx={13 + 3 * flap}
        ry={17 + 4 * flap}
        fill="#5A1E12"
        stroke={INK}
        strokeWidth={3.5}
      />
    );
  } else if (mood === "pout") {
    mouth = (
      <path
        d="M-16 46 Q0 36 16 46"
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    );
  } else if (mood === "worried") {
    mouth = (
      <path
        d={`M-22 44 Q-11 ${38 - 6 * flap} 0 44 Q11 ${50 + 6 * flap} 22 44`}
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    );
  } else if (mood === "smug") {
    mouth = (
      <path
        d="M-20 40 Q6 54 26 32"
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    );
  } else {
    const open =
      mood === "laugh" ? 1 : talking || mouthOpen !== undefined ? flap : 0;
    if (open < 0.08) {
      mouth = (
        <path
          d="M-28 32 Q0 60 28 32"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
      );
    } else {
      const depth = 40 + 26 * open;
      mouth = (
        <g>
          <path
            d={`M-28 32 Q0 ${depth + 14} 28 32 Z`}
            fill="#5A1E12"
            stroke={INK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <ellipse
            cx={0}
            cy={32 + (depth - 32) * 0.55}
            rx={11}
            ry={6 * open + 1}
            fill="#FF7A7A"
          />
        </g>
      );
    }
  }

  const sx = 1 - 0.12 * squash;
  const sy = 1 + 0.12 * squash;
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="-160 -180 320 400"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="solBody" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="35%" stopColor="#F7D474" />
          <stop offset="75%" stopColor="#E8B84B" />
          <stop offset="100%" stopColor="#C8973A" />
        </radialGradient>
        <radialGradient id="solGlow" r="50%">
          <stop offset="0%" stopColor="rgba(243,207,122,0.55)" />
          <stop offset="100%" stopColor="rgba(243,207,122,0)" />
        </radialGradient>
      </defs>
      {/* shadow */}
      <ellipse
        cx={0}
        cy={186}
        rx={88 * (1 + 0.15 * squash)}
        ry={14}
        fill="rgba(0,0,0,0.45)"
      />
      <g transform={`translate(0 160) scale(${sx} ${sy}) translate(0 -160)`}>
        <circle cx={0} cy={0} r={175} fill="url(#solGlow)" />
        {/* rays */}
        <g transform={`rotate(${spin})`}>
          {new Array(12).fill(0).map((_, i) => {
            const jitter =
              spike > 0 ? 6 * spike * Math.sin(frame * 1.7 + i * 2.1) : 0;
            const len = rayLen + jitter + (i % 2 ? -4 : 0);
            return (
              <rect
                key={i}
                x={-12}
                y={-(96 + len)}
                width={24}
                height={len + 14}
                rx={12}
                fill={GOLD}
                stroke={GOLD_DARK}
                strokeWidth={3.5}
                transform={`rotate(${i * 30})`}
              />
            );
          })}
        </g>
        <Arm side={-1} angle={arms[0]} />
        <Arm side={1} angle={arms[1]} />
        {/* body */}
        <circle
          cx={0}
          cy={0}
          r={100}
          fill="url(#solBody)"
          stroke={GOLD_DARK}
          strokeWidth={5}
        />
        {/* headset band */}
        <path
          d="M-94 -26 A98 98 0 0 1 94 -26"
          stroke="#2A2622"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x={-112}
          y={-30}
          width={26}
          height={48}
          rx={11}
          fill="#2A2622"
          stroke={INK}
          strokeWidth={3}
        />
        <rect
          x={86}
          y={-30}
          width={26}
          height={48}
          rx={11}
          fill="#2A2622"
          stroke={INK}
          strokeWidth={3}
        />
        <path
          d="M-100 16 Q-92 66 -46 62"
          stroke="#2A2622"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={-42} cy={62} r={8} fill="#2A2622" />
        {/* cheeks */}
        <ellipse
          cx={-62}
          cy={22}
          rx={15}
          ry={9}
          fill="rgba(255,110,110,0.45)"
        />
        <ellipse cx={62} cy={22} rx={15} ry={9} fill="rgba(255,110,110,0.45)" />
        {brow(-36, -1)}
        {brow(36, 1)}
        {eye(-36, mood === "laugh")}
        {eye(36, mood === "laugh" || mood === "wink")}
        {mouth}
        {glasses ? (
          <g stroke={INK} strokeWidth={5} fill="rgba(255,255,255,0.18)">
            <circle cx={-36} cy={-12} r={30} />
            <circle cx={36} cy={-12} r={30} />
            <path d="M-6 -14 Q0 -20 6 -14" fill="none" />
          </g>
        ) : null}
        {sweat ? (
          <path
            d={`M86 ${-60 + ((frame * 2) % 40)} q-12 22 0 28 q12 -6 0 -28 Z`}
            fill="#7EC8FF"
            stroke="#2F6FA8"
            strokeWidth={3}
          />
        ) : null}
      </g>
    </svg>
  );
};

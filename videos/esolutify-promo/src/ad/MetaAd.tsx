import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { AdText, TopLogo } from "./AdText";
import { Cta } from "./Cta";
import { HeroDevices } from "./HeroDevices";
import { TIMINGS, type Variant } from "./timeline";

type Props = { readonly variant: Variant; readonly safeZones?: boolean };

// SFX land 2–3 frames before their visual; nothing is stacked on the f180 drop.
type Cue = [SfxName, number, number, number?]; // name, frame, volume, rate
const OPENING: Cue[] = [
  ["impact", 0, 0.5],
  ["tick", 0, 0.35],
  ["tick", 3, 0.35],
  ["whoosh-soft", 10, 0.3],
  ["shimmer", 4, 0.3],
  ["whoosh-soft", 90, 0.35],
  ["tick", 95, 0.35],
  ["tick", 98, 0.35],
  ["whoosh", 114, 0.45],
  ["blip", 118, 0.35],
  ["whoosh-soft", 142, 0.3],
  ["whoosh", 172, 0.5],
  ["whoosh", 202, 0.5, 1.05],
  ["blip", 210, 0.35],
  ["whoosh", 232, 0.5],
  ["blip", 240, 0.35, 1.08],
  ["whoosh", 262, 0.5, 1.1],
  ["blip", 270, 0.35, 1.16],
];
const WALL_AND_PROCESS: Cue[] = [
  ["whoosh-soft", 298, 0.45],
  ["whoosh-soft", 303, 0.35],
  ["shimmer", 326, 0.3],
  ["whoosh-soft", 354, 0.4],
  ["tick", 373, 0.5],
  ["blip", 373, 0.3],
  ["tick", 388, 0.5],
  ["blip", 388, 0.3, 1.1],
  ["tick", 403, 0.5],
  ["blip", 403, 0.3, 1.2],
  ["chime", 417, 0.5],
  ["whoosh", 466, 0.45],
];
// relative to the CTA start
const CTA: Cue[] = [
  ["shimmer", 0, 0.35],
  ["pop", 18, 0.55],
  ["pop", 73, 0.55],
  ["ping", 75, 0.45],
  ["shimmer", 90, 0.25],
];

export const MetaAd: React.FC<Props> = ({ variant, safeZones = false }) => {
  const t = TIMINGS[variant];
  const cues: Cue[] = [
    ...OPENING,
    ...(t.wall ? WALL_AND_PROCESS : []),
    ...CTA.map(([n, f, v, r]): Cue => [n, f + t.cta, v, r]),
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      <Stage>
        <HeroDevices t={t} />
        <TopLogo t={t} />
        <AdText t={t} />
        <Cta t={t} />
      </Stage>
      <Audio src={staticFile(`audio/ad-music-${variant}.wav`)} volume={0.8} />
      {cues.map(([name, at, volume, rate], i) => (
        <Sfx
          key={`${name}-${at}-${i}`}
          name={name}
          at={at}
          volume={volume}
          rate={rate}
        />
      ))}
      {safeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

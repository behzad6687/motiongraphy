import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

export type SfxName =
  | "blip"
  | "cash"
  | "chime"
  | "impact"
  | "pencil"
  | "ping"
  | "pop"
  | "rewind"
  | "riser"
  | "ring"
  | "shimmer"
  | "thud"
  | "tick"
  | "typing"
  | "whoosh"
  | "whoosh-soft";

// One sound effect at a frame. Place it 2–3 frames BEFORE the visual lands.
export const Sfx: React.FC<{
  name: SfxName;
  at: number;
  volume?: number;
  rate?: number;
}> = ({ name, at, volume = 0.6, rate = 1 }) => (
  <Sequence
    from={Math.max(0, at)}
    durationInFrames={90}
    layout="none"
    name={`sfx:${name}`}
  >
    <Audio
      src={staticFile(`audio/sfx/${name}.wav`)}
      volume={volume}
      playbackRate={rate}
    />
  </Sequence>
);

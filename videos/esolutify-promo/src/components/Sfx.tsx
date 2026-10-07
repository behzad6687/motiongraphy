import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

export type SfxName =
  | "boing"
  | "drumroll"
  | "inflate"
  | "stamp"
  | "tada"
  | "wahwah"
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
  | "shutter"
  | "thud"
  | "tick"
  | "typing"
  | "whoosh"
  | "whoosh-soft";

// One sound effect at a frame. Place it 2–3 frames BEFORE the visual lands.
// duck(frame) scales it per frame of the composition, e.g. to sit under a
// voice-over (see speechDuck in sol/episodes/kit.tsx).
export const Sfx: React.FC<{
  name: SfxName;
  at: number;
  volume?: number;
  rate?: number;
  duck?: (frame: number) => number;
}> = ({ name, at, volume = 0.6, rate = 1, duck }) => (
  <Sequence
    from={Math.max(0, at)}
    durationInFrames={90}
    layout="none"
    name={`sfx:${name}`}
  >
    <Audio
      src={staticFile(`audio/sfx/${name}.wav`)}
      volume={
        duck ? (f: number) => volume * duck(Math.max(0, at) + f) : volume
      }
      playbackRate={rate}
    />
  </Sequence>
);

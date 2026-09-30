import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Sfx } from "./components/Sfx";
import { Stage } from "./components/Stage";
import { S01Hook } from "./scenes/S01Hook";
import { S02Outcomes } from "./scenes/S02Outcomes";
import { S03Brand } from "./scenes/S03Brand";
import { S04System } from "./scenes/S04System";
import { S05InAction } from "./scenes/S05InAction";
import { S06Services } from "./scenes/S06Services";
import { S07Proof } from "./scenes/S07Proof";
import { S08Portfolio } from "./scenes/S08Portfolio";
import { S09Reach } from "./scenes/S09Reach";
import { S10Cta } from "./scenes/S10Cta";
import { clamp, theme } from "./theme";

// 70 s at 30 fps = 2100 frames. Cuts land on the 120 BPM grid (15 f per beat):
// S2 @150 · S3 @420 (music drop) · S4 @570 · S5 @780 · S6 @1020 · S7 @1290
// S8 @1500 · S9 @1650 · S10 @1860 (music outro). See STORYBOARD.md.
export const MAIN_DURATION = 2100;

const T = 15; // one beat
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

// Gold flash that hides the hard cut onto the music drop.
const DropFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const mid = durationInFrames / 2;
  const o = interpolate(frame, [0, mid, durationInFrames], [0, 1, 0], {
    ...clamp,
    easing: theme.ease.soft,
  });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,240,205,0.95), rgba(232,184,75,0.55) 40%, rgba(10,10,10,0) 80%)",
        opacity: o,
      }}
    />
  );
};

const FadeOut: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity: interpolate(
          frame,
          [MAIN_DURATION - 22, MAIN_DURATION - 1],
          [0, 1],
          { ...clamp, easing: theme.ease.inOut },
        ),
      }}
    />
  );
};

export const Main: React.FC = () => {
  return (
    <AbsoluteFill>
      <Stage>
        <TransitionSeries>
          <TransitionSeries.Sequence name="01 Hook" durationInFrames={165}>
            <S01Hook />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
          <TransitionSeries.Sequence
            name="02 Two outcomes"
            durationInFrames={270}
          >
            <S02Outcomes />
          </TransitionSeries.Sequence>
          <TransitionSeries.Overlay durationInFrames={12}>
            <DropFlash />
          </TransitionSeries.Overlay>
          <TransitionSeries.Sequence
            name="03 Brand promise"
            durationInFrames={165}
          >
            <S03Brand />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
          <TransitionSeries.Sequence
            name="04 How it works"
            durationInFrames={225}
          >
            <S04System />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={timing}
          />
          <TransitionSeries.Sequence name="05 In action" durationInFrames={255}>
            <S05InAction />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
          <TransitionSeries.Sequence name="06 Services" durationInFrames={285}>
            <S06Services />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-bottom" })}
            timing={timing}
          />
          <TransitionSeries.Sequence name="07 Proof" durationInFrames={225}>
            <S07Proof />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={timing}
          />
          <TransitionSeries.Sequence name="08 Portfolio" durationInFrames={165}>
            <S08Portfolio />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
          <TransitionSeries.Sequence
            name="09 Sectors & offices"
            durationInFrames={225}
          >
            <S09Reach />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={timing} />
          <TransitionSeries.Sequence
            name="10 Call to action"
            durationInFrames={240}
          >
            <S10Cta />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </Stage>

      {/* original 120 BPM score (scripts/gen_audio.py) */}
      <Audio src={staticFile("audio/music.wav")} volume={0.6} />
      {/* transition whooshes, 3 frames ahead of each cut */}
      <Sfx name="whoosh-soft" at={147} volume={0.35} />
      <Sfx name="whoosh" at={567} volume={0.35} />
      <Sfx name="whoosh" at={777} volume={0.4} />
      <Sfx name="whoosh-soft" at={1017} volume={0.35} />
      <Sfx name="whoosh" at={1287} volume={0.4} />
      <Sfx name="whoosh" at={1497} volume={0.4} />
      <Sfx name="whoosh-soft" at={1647} volume={0.35} />
      <Sfx name="whoosh-soft" at={1857} volume={0.35} />

      <FadeOut />
    </AbsoluteFill>
  );
};

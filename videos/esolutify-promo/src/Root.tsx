import "./fonts";
import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Stage } from "./components/Stage";
import { MetaAd } from "./ad/MetaAd";
import { StoryImage } from "./ad/StoryImage";
import { VoiceReel } from "./voice/VoiceReel";
import { Main } from "./Main";
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

// Standalone scene previews get the same five-layer stage as the main film.
const staged = (Scene: React.FC): React.FC => {
  const Staged: React.FC = () => (
    <Stage>
      <Scene />
    </Stage>
  );
  return Staged;
};

const Hook = staged(S01Hook);
const Outcomes = staged(S02Outcomes);
const Brand = staged(S03Brand);
const System = staged(S04System);
const InAction = staged(S05InAction);
const Services = staged(S06Services);
const Proof = staged(S07Proof);
const Portfolio = staged(S08Portfolio);
const Reach = staged(S09Reach);
const Cta = staged(S10Cta);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EsolutifyPromo"
        component={Main}
        durationInFrames={2100}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="MetaAd">
        <Composition
          id="MetaAdFreeDemo"
          component={MetaAd}
          durationInFrames={630}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: "21" as const }}
        />
        <Composition
          id="MetaAdFreeDemo15"
          component={MetaAd}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: "15" as const }}
        />
        <Composition
          id="MetaAdFreeDemo-SZ"
          component={MetaAd}
          durationInFrames={630}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: "21" as const, safeZones: true }}
        />
        <Still
          id="StoryImageOffer"
          component={StoryImage}
          width={1080}
          height={1920}
          defaultProps={{ variant: "offer" as const }}
        />
        <Still
          id="StoryImageWall"
          component={StoryImage}
          width={1080}
          height={1920}
          defaultProps={{ variant: "wall" as const }}
        />
      </Folder>
      <Folder name="VoiceReceptionist">
        <Composition
          id="VoiceReceptionistReel"
          component={VoiceReel}
          durationInFrames={720}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="VoiceReceptionistReel-SZ"
          component={VoiceReel}
          durationInFrames={720}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ safeZones: true }}
        />
      </Folder>
      <Folder name="Scenes">
        <Composition
          id="S01-Hook"
          component={Hook}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S02-Outcomes"
          component={Outcomes}
          durationInFrames={270}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S03-Brand"
          component={Brand}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S04-System"
          component={System}
          durationInFrames={225}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S05-InAction"
          component={InAction}
          durationInFrames={255}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S06-Services"
          component={Services}
          durationInFrames={285}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S07-Proof"
          component={Proof}
          durationInFrames={225}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S08-Portfolio"
          component={Portfolio}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S09-Reach"
          component={Reach}
          durationInFrames={225}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="S10-Cta"
          component={Cta}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

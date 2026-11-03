import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ease } from "../../reel/kit";
import { clamp, theme } from "../../theme";
import screens from "../../../public/stories/reel-pc/screens.json";

// Website demo reel, photoreal: Coldloop (esolutify.com/demo/pc), 16 s, 9:16.
// Made to look like a phone filming a real screen, after the "laptop on a
// desk" and "neon desk + phone in hand" reels people share: no UI chrome, no
// captions, just the site's scroll film playing on real-looking hardware.
//   0–210    a laptop on a bright desk, the camera slowly pushing into the
//            screen while the scroll builds the PC
//   210–390  a dark room in Coldloop's cyan: the ultrawide shows the desktop
//            site, a hand holds the phone with the mobile site in front
//   390–480  end card: "Want a website like this? Comment DEMO"
// The rooms are generated photos (public/stories/reel-pc/*-2k.png) with flat
// green screens, keyed out (*-keyed.png); the real recordings sit behind the
// cut-outs, pinned to the screen corners found in screens.json.
// Music: story-showcase.wav (scripts/gen_story_music.py showcase).

export const DEMO_REEL_PC_DURATION = 480;
const B = 210;
const END = 390;
const SRC = "stories/reel-pc";

type Pt = [number, number];
type Quad = { tl: number[]; tr: number[]; br: number[]; bl: number[] };

// CSS matrix3d that maps a w×h box onto a quad (a projective warp).
const quadMatrix = (w: number, h: number, q: Pt[]) => {
  const src: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const bv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    bv.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    bv.push(v);
  }
  // Gaussian elimination
  const n = 8;
  const M = A.map((r, i) => [...r, bv[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const sol = M.map((r, i) => r[n] / r[i]);
  const H = [...sol, 1];
  return `matrix3d(${H[0]},${H[3]},0,${H[6]},${H[1]},${H[4]},0,${H[7]},0,0,1,0,${H[2]},${H[5]},0,${H[8]})`;
};

// the room photos are 2160 px wide; shown 1080 wide
const K = 0.5;
const toPts = (q: Quad, grow: number): Pt[] => {
  const pts = [q.tl, q.tr, q.br, q.bl].map((p) => [p[0] * K, p[1] * K] as Pt);
  const cx = pts.reduce((s, p) => s + p[0], 0) / 4;
  const cy = pts.reduce((s, p) => s + p[1], 0) / 4;
  return pts.map(
    ([x, y]) => [cx + (x - cx) * grow, cy + (y - cy) * grow] as Pt,
  );
};

// a recording pinned onto a screen, behind the room's cut-out
const Pinned: React.FC<{
  quad: Pt[];
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ quad, w, h, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: w,
      height: h,
      overflow: "hidden",
      transformOrigin: "0 0",
      transform: quadMatrix(w, h, quad),
      background: "#000",
    }}
  >
    {children}
  </div>
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.07,
        mixBlendMode: "overlay",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.8px), radial-gradient(rgba(0,0,0,0.9) 0.6px, transparent 0.8px)",
        backgroundSize: "3px 3px, 4px 4px",
        backgroundPosition: `${(frame * 7) % 3}px ${(frame * 5) % 3}px, ${(frame * 3) % 4}px ${(frame * 11) % 4}px`,
        pointerEvents: "none",
      }}
    />
  );
};

const Credit: React.FC<{ from: number; to: number; dark?: boolean }> = ({
  from,
  to,
  dark,
}) => {
  const frame = useCurrentFrame();
  const o = ease(frame, from, from + 14) * (1 - ease(frame, to - 12, to));
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 1560,
        fontFamily: theme.fonts.mono,
        fontSize: 22,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: dark ? "rgba(20,24,28,0.75)" : "rgba(230,244,246,0.8)",
        opacity: o,
      }}
    >
      Coldloop · website by eSolutify
    </div>
  );
};

// ---------------------------------------------------------------- shot A
const DESK = toPts(screens.desk.screen, 1.03);
const ShotA: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, B + 10, theme.ease.inOut);
  const out = ease(frame, B - 8, B + 6, theme.ease.in);
  const z = 1 + 0.6 * p + 0.25 * out;
  const sc = { x: 647, y: 798 }; // the screen's centre on the photo
  return (
    <AbsoluteFill style={{ backgroundColor: "#d9d9d6", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${sc.x}px ${sc.y}px`,
          transform: `translate(${(540 - sc.x) * p}px, ${(900 - sc.y) * p}px) scale(${z}) rotate(${-1.4 * p}deg)`,
          filter: out > 0 ? `blur(${out * 10}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: 0,
            width: 1080,
            height: 1928,
          }}
        >
          <Pinned quad={DESK} w={1440} h={900}>
            <OffthreadVideo
              src={staticFile("stories/newpc/desktop-film-hd.mp4")}
              playbackRate={2}
              muted
              style={{
                width: 1440,
                height: 900,
                objectFit: "cover",
                display: "block",
              }}
            />
            <Img
              src={staticFile("stories/newpc/desktop-nav.png")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 1440,
                height: 52,
              }}
            />
            {/* soft daylight reflection from the window */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 35%, transparent 55%)",
              }}
            />
          </Pinned>
          <Img
            src={staticFile(`${SRC}/desk-keyed.png`)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: 1928,
            }}
          />
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.22))",
        }}
      />
      <Credit from={30} to={B - 10} dark />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- shot B
const MON = toPts(screens.neon.monitor, 1.025);
const PHONE = toPts(screens.neon.phone, 1.07);
const ShotB: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - B;
  const inn = ease(frame, B - 6, B + 10, theme.ease.out);
  // a hand-held camera: a slow push and a little drift
  const z = 1.12 - 0.08 * inn + 0.05 * ease(frame, B, END, theme.ease.inOut);
  const dx = 7 * Math.sin(f / 37) + 4 * Math.sin(f / 19);
  const dy = 6 * Math.sin(f / 29 + 1) + 3 * Math.sin(f / 13);
  const rot = 0.45 * Math.sin(f / 41);
  const blurIn = 1 - ease(frame, B - 6, B + 8);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#03080a",
        overflow: "hidden",
        opacity: ease(frame, B - 8, B + 2),
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate(${dx}px, ${dy}px) scale(${z}) rotate(${rot}deg)`,
          filter: blurIn > 0 ? `blur(${blurIn * 12}px)` : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: 0,
            width: 1080,
            height: 1928,
          }}
        >
          <Pinned quad={MON} w={1440 * 1.6} h={900}>
            <Sequence from={B - 10} layout="none">
              <OffthreadVideo
                src={staticFile("stories/newpc/desktop-film-hd.mp4")}
                trimBefore={Math.round(12.8 * 30)}
                playbackRate={1.7}
                muted
                style={{
                  width: 1440 * 1.6,
                  height: 900,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Sequence>
            <Img
              src={staticFile("stories/newpc/desktop-nav.png")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 1440 * 1.6,
                height: 52 * 1.2,
              }}
            />
          </Pinned>
          <Pinned quad={PHONE} w={390} h={844}>
            <Sequence from={B - 10} layout="none">
              <OffthreadVideo
                src={staticFile("stories/newpc/mobile-hero.mp4")}
                trimBefore={8}
                muted
                style={{
                  width: 390,
                  height: 844,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Sequence>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.12), transparent 40%)",
              }}
            />
          </Pinned>
          {/* the room, with both screens cut out */}
          <Img
            src={staticFile(`${SRC}/neon-keyed.png`)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: 1928,
            }}
          />
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.45))",
        }}
      />
      <Credit from={B + 30} to={END - 8} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- end card
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = (d: number): React.CSSProperties => {
    const t = spring({
      frame: frame - END - d,
      fps,
      config: theme.spring.smooth,
    });
    return {
      opacity: interpolate(t, [0, 0.4], [0, 1], clamp),
      translate: `0px ${(1 - t) * 30}px`,
    };
  };
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#061015",
        opacity: ease(frame, END - 4, END + 6),
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(31,182,193,0.28), transparent 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 330,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "#E6F4F6",
            ...up(0),
          }}
        >
          Want a website
          <br />
          like this?
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: 40,
            color: "#7C949B",
            ...up(6),
          }}
        >
          Comment the word below 👇
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1460,
          display: "flex",
          justifyContent: "center",
          ...up(14),
        }}
      >
        <Img src={staticFile("brand/logo.png")} style={{ width: 210 }} />
      </div>
    </AbsoluteFill>
  );
};

export const DemoReelPC: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {frame < B + 8 ? <ShotA /> : null}
      {frame >= B - 8 && frame < END + 8 ? <ShotB /> : null}
      {frame >= END - 4 ? <EndCard /> : null}
      <Grain />
      <Audio src={staticFile("audio/story-showcase.wav")} volume={0.9} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- thumbnail
// The Reel cover: the laptop shot mid push-in, with the offer on top. Key
// content inside the 4:5 grid crop (y 285–1635).
export const DemoReelPCThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={-105} layout="none">
      <ShotA />
    </Sequence>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(6,16,21,0.88) 0%, rgba(6,16,21,0.55) 24%, transparent 40%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 310,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: 26,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#5CE1E6",
        }}
      >
        Free website demo
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 0.98,
          letterSpacing: "-0.035em",
          color: "#fff",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        Want a website
        <br />
        like this?
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1370,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "22px 40px",
          borderRadius: 99,
          background: "#061015",
          border: "3px solid #5CE1E6",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 52,
          color: "#E6F4F6",
          boxShadow: "0 18px 40px -12px rgba(0,0,0,0.6)",
        }}
      >
        Comment <span style={{ color: "#5CE1E6" }}>DEMO</span>
      </div>
    </div>
  </AbsoluteFill>
);

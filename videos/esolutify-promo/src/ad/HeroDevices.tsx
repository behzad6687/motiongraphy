import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Browser,
  PageLayer,
  PhoneShell,
  phoneViewportHeight,
  type Capture,
} from "../components/Devices";
import { LightSweep } from "../components/Motion";
import { clamp, theme } from "../theme";
import {
  CUTS,
  GREER_DESKTOP,
  GREER_PHONE,
  MONTAGE,
  MONTAGE_DESKTOP,
  MONTAGE_PHONE,
  MONTAGE_START,
  PROCESS,
  SITES,
  WALL,
  WALL_PHONES,
  activeFlick,
  scrollV,
  scrollY,
  type Seg,
  type SiteKey,
  type Timing,
} from "./timeline";

// Hero phone is always rendered at a 470px screen and scaled, so the page
// texture stays identical through dock/undock/wall moves.
const BASE_W = 470;
const BASE_H = phoneViewportHeight(BASE_W); // page viewport under the status bar
const K = BASE_W / 390; // px per css px on the hero phone
const HANDOFF = 4; // half-width of the page-swap window (8 frames total)

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// ------------------------------------------------------------ hero phone pose
const useHeroPose = (t: Timing) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number) =>
    spring({ frame: frame - at, fps, config: theme.spring.smooth });
  const enter = sp(-8);
  const dock = sp(118);
  const undock = sp(180);
  const wall = t.wall ? sp(WALL) : 0;
  const sink = t.wall
    ? interpolate(frame, [PROCESS, PROCESS + 16], [0, 1], {
        ...clamp,
        easing: theme.ease.inOut,
      })
    : interpolate(frame, [t.cta, t.cta + 16], [0, 1], {
        ...clamp,
        easing: theme.ease.inOut,
      });

  // scale = screen width / 470; left/top of the phone's outer box
  let s = 1;
  let left = 289;
  let top = 700;
  s = mix(s, 260 / BASE_W, dock);
  left = mix(left, 700, dock);
  top = mix(top, 960, dock);
  s = mix(s, 440 / BASE_W, undock);
  left = mix(left, 305, undock);
  top = mix(top, 700, undock);
  s = mix(s, 300 / BASE_W, wall);
  left = mix(left, 379, wall);
  top = mix(top, 712, wall);
  top = mix(top, t.wall ? 1330 : 1180, sink);

  return {
    s,
    left,
    top: top + interpolate(enter, [0, 1], [240, 0]),
    rotX:
      interpolate(enter, [0, 1], [10, 0]) +
      Math.sin(frame / 24) * 1.2 * (1 - sink),
    opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
    // 15s: the sunk phone is texture under the CTA, not a second message
    dim: mix(1, t.wall ? 0.45 : 0.28, sink),
    blur: mix(0, t.wall ? 2 : 6, sink),
    glow:
      frame < 60
        ? 0.35
        : frame >= t.cta
          ? interpolate(frame, [t.cta, t.cta + 30], [0.25, 0.6], clamp)
          : 0.25,
  };
};

// ------------------------------------------------------------ hero phone pages
type Page = { cap: Capture; segs: Seg[]; start: number };

const heroPages = (): { key: SiteKey; page: Page; from: number }[] => [
  {
    key: "greersmiles",
    page: { cap: SITES.greersmiles.mobile, segs: GREER_PHONE, start: 0 },
    from: -Infinity,
  },
  ...MONTAGE.map((key, i) => ({
    key,
    page: {
      cap: SITES[key].mobile,
      segs: MONTAGE_PHONE[key],
      start: MONTAGE_START[key],
    },
    from: CUTS[i],
  })),
];

// index of the page on screen (the incoming one once its cut has started)
const heroIndex = (frame: number) => {
  const pages = heroPages();
  let idx = 0;
  for (let i = 1; i < pages.length; i++)
    if (frame >= pages[i].from - HANDOFF) idx = i;
  return idx;
};

const HeroScreen: React.FC<{ glowBlur: number }> = ({ glowBlur }) => {
  const frame = useCurrentFrame();
  const pages = heroPages();
  const idx = heroIndex(frame);
  const cur = pages[idx];
  const layers: React.ReactNode[] = [];

  const vblur = (p: Page) =>
    Math.abs(scrollV(frame, p.segs, p.start)) * K * 0.08;

  const inHandoff = idx > 0 && frame < cur.from + HANDOFF;
  if (inHandoff) {
    const prev = pages[idx - 1];
    const p = interpolate(
      frame,
      [cur.from - HANDOFF, cur.from + HANDOFF],
      [0, 1],
      clamp,
    );
    const outY = -BASE_H * theme.ease.in(p);
    const inY = BASE_H * (1 - theme.ease.out(p));
    const swapBlur = Math.sin(Math.PI * p) * 7;
    layers.push(
      <PageLayer
        key={`o-${prev.key}`}
        id={`hero-o-${prev.key}`}
        cap={prev.page.cap}
        width={BASE_W}
        height={BASE_H}
        scroll={scrollY(frame, prev.page.segs, prev.page.start)}
        offsetY={outY}
        blur={Math.max(vblur(prev.page), swapBlur)}
      />,
      // seam between the two pages
      <div
        key="seam"
        style={{
          position: "absolute",
          left: 0,
          width: BASE_W,
          top: inY - 6,
          height: 6,
          background: "#0A0A0A",
          borderBottom: `1px solid ${theme.colors.goldLine}`,
        }}
      />,
      <PageLayer
        key={`i-${cur.key}`}
        id={`hero-i-${cur.key}`}
        cap={cur.page.cap}
        width={BASE_W}
        height={BASE_H}
        scroll={scrollY(frame, cur.page.segs, cur.page.start)}
        offsetY={inY}
        blur={swapBlur}
      />,
    );
  } else {
    layers.push(
      <PageLayer
        key={`c-${cur.key}`}
        id={`hero-c-${cur.key}`}
        cap={cur.page.cap}
        width={BASE_W}
        height={BASE_H}
        scroll={scrollY(frame, cur.page.segs, cur.page.start)}
        blur={Math.max(vblur(cur.page), glowBlur)}
      />,
    );
  }

  return (
    <>
      {layers}
      <TouchDot segs={cur.page.segs} />
    </>
  );
};

// Touch dot rides the page while the finger is down, then lifts off.
const TouchDot: React.FC<{ segs: Seg[] }> = ({ segs }) => {
  const frame = useCurrentFrame();
  const f = activeFlick(frame, segs);
  if (!f) return null;
  const releaseAt = f.f0 + (f.f1 - f.f0) * (f.release ?? 0.3);
  const yAt = (fr: number) => {
    const p = interpolate(fr, [f.f0, f.f1], [0, 1], clamp);
    const eased = scrollY(fr, [f]) - f.y0;
    return p <= 0 ? 0 : eased;
  };
  const startY = BASE_H * 0.62;
  const travelled = yAt(Math.min(frame, releaseAt)) * K;
  const appear = interpolate(frame, [f.f0 - 3, f.f0], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  const lift = interpolate(frame, [releaseAt, releaseAt + 6], [1, 0], {
    ...clamp,
    easing: theme.ease.in,
  });
  const o = Math.min(appear, lift);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: BASE_W * 0.58,
        top: startY - travelled,
        width: 64,
        height: 64,
        translate: "-50% -50%",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.35)",
        border: `2px solid ${theme.colors.gold2}`,
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        opacity: o,
        scale: 0.7 + 0.3 * appear,
      }}
    />
  );
};

const HeroPhone: React.FC<{ t: Timing }> = ({ t }) => {
  const frame = useCurrentFrame();
  const pose = useHeroPose(t);
  return (
    <div
      style={{
        position: "absolute",
        left: pose.left,
        top: pose.top,
        transformOrigin: "0 0",
        scale: pose.s,
        rotate: `x ${pose.rotX}deg`,
        opacity: pose.opacity,
        filter:
          pose.dim < 0.999
            ? `brightness(${pose.dim}) blur(${pose.blur}px)`
            : undefined,
      }}
    >
      <PhoneShell
        width={BASE_W}
        glow={pose.glow}
        statusBg={heroPages()[heroIndex(frame)].page.cap.statusBg}
      >
        <HeroScreen glowBlur={0} />
      </PhoneShell>
    </div>
  );
};

// ------------------------------------------------------------ browser (S3/S4)
const BROWSER_W = 900;
const BROWSER_H = 540;

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 120 || frame > 182) return null;
  const x = interpolate(frame, [120, 128, 156], [640, 610, 300], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const y = interpolate(frame, [120, 128, 156], [24, 30, 330], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const o = interpolate(frame, [120, 126, 176, 182], [0, 1, 1, 0], clamp);
  return (
    <svg
      viewBox="0 0 24 24"
      width={28}
      height={28}
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: o,
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
      }}
    >
      <path
        d="M4 2l15 11-6.5 1.2L16 21l-3 1.4-3.4-6.9L4 20z"
        fill="#111"
        stroke="#fff"
        strokeWidth={1.4}
      />
    </svg>
  );
};

const HeroBrowser: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < 112 || frame > WALL + 2) return null;
  const enter = spring({
    frame: frame - 116,
    fps,
    config: theme.spring.smooth,
  });
  const ghost = spring({
    frame: frame - 180,
    fps,
    config: theme.spring.smooth,
  });
  const out = interpolate(frame, [WALL - 8, WALL + 2], [1, 0], {
    ...clamp,
    easing: theme.ease.in,
  });

  // which desktop page is on screen (crossfade 6 frames around each cut)
  const layers: { key: SiteKey; o: number; segs: Seg[] }[] = [];
  const order: { key: SiteKey; from: number; segs: Seg[] }[] = [
    { key: "greersmiles", from: -Infinity, segs: GREER_DESKTOP },
    ...MONTAGE.map((key, i) => ({
      key,
      from: CUTS[i] as number,
      segs: MONTAGE_DESKTOP[key],
    })),
  ];
  order.forEach((o, i) => {
    const next = order[i + 1];
    const inO =
      i === 0 ? 1 : interpolate(frame, [o.from - 3, o.from + 3], [0, 1], clamp);
    const outO = next
      ? interpolate(frame, [next.from - 3, next.from + 3], [1, 0], clamp)
      : 1;
    const op = i === 0 ? outO : Math.min(inO, outO);
    if (op > 0.001) layers.push({ key: o.key, o: op, segs: o.segs });
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 700,
        perspective: 1400,
        opacity:
          interpolate(enter, [0, 0.4], [0, 1], clamp) *
          mix(1, 0.18, ghost) *
          out,
        translate: `0px ${interpolate(enter, [0, 1], [260, 0])}px`,
        scale: mix(1, 1.08, ghost),
        filter:
          ghost > 0.01
            ? `blur(${8 * ghost}px) brightness(${mix(1, 0.8, ghost)})`
            : undefined,
      }}
    >
      <div
        style={{
          rotate: `x ${interpolate(enter, [0, 1], [12, 0])}deg`,
          position: "relative",
        }}
      >
        {layers.map((l, i) => {
          const scroll = scrollY(frame, l.segs, 0);
          const v =
            Math.abs(scrollV(frame, l.segs, 0)) * (BROWSER_W / 1440) * 0.08;
          return (
            <div
              key={l.key}
              style={{
                position: i === 0 ? "relative" : "absolute",
                left: 0,
                top: 0,
                opacity: l.o,
              }}
            >
              <Browser
                id={`br-${l.key}`}
                cap={SITES[l.key].desktop}
                width={BROWSER_W}
                height={BROWSER_H}
                scroll={scroll}
                url={SITES[l.key].url}
                blur={v}
                barPx={64}
              >
                {l.key === "greersmiles" ? <Cursor /> : null}
              </Browser>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------ phone wall (S5+)
const WallPhones: React.FC<{ t: Timing }> = ({ t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!t.wall || frame < WALL) return null;
  const sink = interpolate(frame, [PROCESS, PROCESS + 16], [0, 1], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const w = 300;
  const outerW = w + Math.round(w * 0.035) * 2;
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      {WALL_PHONES.map((p, i) => {
        const inP = spring({
          frame: frame - p.at,
          fps,
          config: theme.spring.smooth,
        });
        const scroll = scrollY(frame, p.segs, p.segs[0].y0);
        const v =
          Math.abs(scrollV(frame, p.segs, p.segs[0].y0)) * (w / 390) * 0.08;
        return (
          <div
            key={p.key}
            style={{
              position: "absolute",
              left: p.cx - outerW / 2,
              top: p.top + sink * 618,
              translate: `${interpolate(inP, [0, 1], [p.from, 0])}px 0px`,
              scale: p.scale,
              rotate: `y ${p.rotY}deg`,
              opacity: interpolate(inP, [0, 0.3], [0, 1], clamp),
              filter:
                sink > 0.001
                  ? `brightness(${mix(1, 0.45, sink)}) blur(${2 * sink}px)`
                  : undefined,
            }}
          >
            <PhoneShell width={w} statusBg={SITES[p.key].mobile.statusBg}>
              <PageLayer
                id={`wall-${p.key}`}
                cap={SITES[p.key].mobile}
                width={w}
                height={phoneViewportHeight(w)}
                scroll={scroll}
                blur={v}
              />
              {/* glint clipped to each phone's glass */}
              <LightSweep
                start={326 + i * 4}
                duration={22}
                width={120}
                opacity={0.18}
              />
            </PhoneShell>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ layer
export const HeroDevices: React.FC<{ t: Timing }> = ({ t }) => (
  <AbsoluteFill>
    <HeroBrowser />
    <WallPhones t={t} />
    <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
      <HeroPhone t={t} />
    </div>
    {/* Meta's caption + CTA land on dark: gradient above devices, below text */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1480,
        bottom: 0,
        background:
          "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.7) 55%, rgba(10,10,10,0.9) 100%)",
      }}
    />
  </AbsoluteFill>
);

import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PhoneShell, Tap, phoneViewportHeight } from "../components/Devices";
import { Icon, type IconName } from "../components/Icons";
import { WordReveal, useEntrance } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import {
  BottomFade,
  CtaButton,
  Flash,
  Head,
  Logo,
  StatCards,
  Sub,
  UrlLine,
  Window,
  ease,
} from "../reel/kit";
import { clamp, theme } from "../theme";

// Social Media Management — 9:16 Reel / Short, 24 s @ 30 fps.
// Story (esolutify.com/social-media-management, "A Month of Posts — Done for
// You"): when did you last post? the page has gone quiet → on the drop a
// whole month is planned in the calendar and approved in ten minutes →
// posts go live every week, followers climb, "2 new messages" → 280%
// follower growth → strategy call, from $599 CAD a month.
// 128.57 BPM UK garage (14 frames a beat, 56 a bar): the calendar lands on
// the drop (f168); new posts land one a beat. Copy stays in y 290–1160.

export const SOCIAL_DURATION = 720;
const BEAT = 14;
const DROP = 168;
const LIVE = 280;
const PROOF = 392;
const CTA = 504;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;
const VH = phoneViewportHeight(PHONE_W);
const SCREEN_BG = "#0F0F10";
const APPROVE_AT = DROP + 80;

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

// ---------------------------------------------------------------- text layer
const Copy: React.FC = () => (
  <AbsoluteFill>
    <Window from={-10} until={80}>
      <Head>
        <WordReveal
          words={["When", "did", "you"]}
          delay={-12}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            { text: "last", tone: "gold" },
            { text: "post?", tone: "gold" },
          ]}
          delay={-4}
          per={3}
          size={116}
        />
      </Head>
    </Window>
    <Window from={84} until={DROP - 6}>
      <Head>
        <WordReveal
          words={["You’re", "busy", "running"]}
          delay={86}
          per={3}
          size={84}
        />
        <WordReveal words={["the", "business."]} delay={94} per={3} size={96} />
      </Head>
      <Sub text="The page goes quiet. Customers move on." at={108} />
    </Window>
    <Window from={DROP} until={LIVE - 6}>
      <Head>
        <WordReveal
          words={["A", "month", "of", "posts."]}
          delay={DROP}
          per={3}
          size={84}
        />
        <WordReveal
          words={[
            { text: "Done", tone: "gold" },
            { text: "for", tone: "gold" },
            { text: "you.", tone: "gold", underline: true },
          ]}
          delay={DROP + 8}
          per={3}
          size={112}
        />
      </Head>
      <Sub text="You approve once a month. Ten minutes." at={APPROVE_AT} />
    </Window>
    <Window from={LIVE} until={PROOF - 6}>
      <Head>
        <WordReveal
          words={["Posted", "every", "week."]}
          delay={LIVE}
          per={3}
          size={84}
        />
        <WordReveal
          words={[
            { text: "In", tone: "gold" },
            { text: "your", tone: "gold" },
            { text: "voice.", tone: "gold" },
          ]}
          delay={LIVE + 8}
          per={3}
          size={104}
        />
      </Head>
      <Sub text="Instagram · Facebook · TikTok · LinkedIn" at={LIVE + 20} />
    </Window>
    <Window from={PROOF} until={CTA - 6}>
      <Growth />
      <Head top={556}>
        <WordReveal
          words={["follower", "growth."]}
          delay={PROOF + 6}
          per={3}
          size={76}
        />
      </Head>
      <Sub
        text="Average, first 6 months, across managed accounts."
        at={PROOF + 16}
        top={652}
        size={30}
      />
    </Window>
  </AbsoluteFill>
);

const Growth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - PROOF, fps, config: theme.spring.counter });
  const pop = spring({
    frame: frame - PROOF,
    fps,
    config: theme.spring.snappy,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 376,
        textAlign: "center",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 160,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
        backgroundImage: theme.gradients.gold,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 28px ${theme.colors.glow})`,
        opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        scale: interpolate(pop, [0, 1], [0.8, 1]),
      }}
    >
      {Math.round(280 * p)}%
    </div>
  );
};

// ---------------------------------------------------------------- the profile
type Tile = {
  label: string;
  kind: "photo" | "reel" | "offer" | "tip";
  bg: string;
  dark?: boolean;
};
const OLD: Tile[] = [
  { label: "Open late", kind: "photo", bg: "#3A3A3A" },
  { label: "", kind: "photo", bg: "#2E2E2E" },
  { label: "Holiday hours", kind: "tip", bg: "#343434" },
  { label: "", kind: "photo", bg: "#2A2A2A" },
  { label: "Sale", kind: "offer", bg: "#383838" },
  { label: "", kind: "photo", bg: "#303030" },
  { label: "", kind: "photo", bg: "#2C2C2C" },
  { label: "We're hiring", kind: "tip", bg: "#363636" },
  { label: "", kind: "photo", bg: "#2F2F2F" },
];
const NEW: Tile[] = [
  {
    label: "Fresh this week",
    kind: "photo",
    bg: "radial-gradient(circle at 30% 30%, #F3CF7A, #C8973A 50%, #5A3A12)",
    dark: true,
  },
  {
    label: "Behind the scenes",
    kind: "reel",
    bg: "linear-gradient(160deg, #2B3A55, #121A2A)",
  },
  { label: "20% off", kind: "offer", bg: theme.gradients.gold, dark: true },
  {
    label: "Tip #3",
    kind: "tip",
    bg: "linear-gradient(160deg, #1F3B2E, #0F1E17)",
  },
  {
    label: "Meet the team",
    kind: "photo",
    bg: "radial-gradient(circle at 60% 40%, #E8A87C, #8A4B2A 60%, #3A1E10)",
    dark: true,
  },
  {
    label: "New this month",
    kind: "reel",
    bg: "linear-gradient(160deg, #4A2B55, #1E1024)",
  },
  {
    label: "Free consult",
    kind: "offer",
    bg: "linear-gradient(135deg, #F3CF7A, #E8B84B)",
    dark: true,
  },
  {
    label: "Your question, answered",
    kind: "tip",
    bg: "linear-gradient(160deg, #2A3E44, #10191C)",
  },
];
const NEW_AT = NEW.map((_, k) => LIVE + 4 + k * BEAT);
const COLS = 3;
const TILE = 152;
const GAP = 2;
const GRID_TOP = 286;

const KIND_ICON: Record<Tile["kind"], IconName> = {
  photo: "camera",
  reel: "video",
  offer: "star",
  tip: "chat",
};

const TileView: React.FC<{ t: Tile; grey: number }> = ({ t, grey }) => (
  <div
    style={{
      width: TILE,
      height: TILE,
      background: t.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 10,
      textAlign: "center",
      filter:
        grey > 0
          ? `grayscale(${grey}) brightness(${1 - 0.35 * grey})`
          : undefined,
    }}
  >
    <Icon
      name={KIND_ICON[t.kind]}
      size={t.label ? 26 : 34}
      color={t.dark ? "#1A1208" : "rgba(255,255,255,0.75)"}
      stroke={2}
    />
    {t.label ? (
      <div
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: t.kind === "offer" ? 26 : 18,
          lineHeight: 1.1,
          color: t.dark ? "#1A1208" : "#F0EDE8",
        }}
      >
        {t.label}
      </div>
    ) : null}
  </div>
);

const posOf = (idx: number) => ({
  x: (idx % COLS) * (TILE + GAP),
  y: GRID_TOP + Math.floor(idx / COLS) * (TILE + GAP),
});

const ProfileScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const live = frame >= LIVE - 4;
  const inserted = NEW_AT.filter((t) => frame >= t).length;
  const lastAt = inserted > 0 ? NEW_AT[inserted - 1] : 0;
  const settle =
    inserted > 0
      ? spring({ frame: frame - lastAt, fps, config: theme.spring.snappy })
      : 1;
  // how quiet the page has gone
  const quiet = live ? 0 : ease(frame, 20, 150, theme.ease.inOut);
  const days = Math.round(12 + 82 * quiet);
  const followers = live
    ? Math.round(212 + 594 * ease(frame, LIVE, LIVE + 110, theme.ease.inOut))
    : 212;
  const msgs = spring({
    frame: frame - (LIVE + 62),
    fps,
    config: theme.spring.bouncy,
  });
  // like the real grid: older posts shift a slot, the newest pops in
  const place = (i: number, isNewest: boolean) => ({
    ...posOf(i),
    s: isNewest ? interpolate(settle, [0, 1], [0.6, 1]) : 1,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        background: SCREEN_BG,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 14,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 26,
        }}
      >
        yourbusiness
      </div>
      {live ? (
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px",
            borderRadius: 99,
            background: theme.colors.ok,
            color: "#0A0A0A",
            fontSize: 16,
            fontWeight: 800,
            scale: msgs,
            zIndex: 4,
          }}
        >
          <Icon name="chat" size={16} color="#0A0A0A" stroke={2.6} />2 new
          messages
        </div>
      ) : null}
      {/* avatar */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 62,
          width: 100,
          height: 100,
          borderRadius: "50%",
          padding: 4,
          background: live ? theme.gradients.gold : "#3A3A3A",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `4px solid ${SCREEN_BG}`,
            background: theme.colors.surface3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 30,
            color: live ? theme.colors.gold2 : theme.colors.dim,
          }}
        >
          YB
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 16,
          top: 82,
          display: "flex",
          justifyContent: "space-around",
          textAlign: "center",
        }}
      >
        {[
          [String(OLD.length + inserted), "posts"],
          [followers.toLocaleString("en-US"), "followers"],
          ["180", "following"],
        ].map(([v, k]) => (
          <div key={k}>
            <div
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 800,
                fontSize: 26,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {v}
            </div>
            <div style={{ fontSize: 15, color: theme.colors.muted }}>{k}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 174,
          fontSize: 19,
          fontWeight: 700,
        }}
      >
        Your Business
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 198,
          fontSize: 17,
          color: theme.colors.muted,
        }}
      >
        Your city · Open today
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 234,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 99,
          fontSize: 16,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          background: live ? theme.colors.okSoft : "rgba(237,28,36,0.12)",
          border: `1px solid ${live ? "rgba(60,207,142,0.5)" : "rgba(237,28,36,0.45)"}`,
          color: live ? theme.colors.ok : "#FF6B6B",
          opacity: live ? 1 : ease(frame, 14, 22),
        }}
      >
        <Icon
          name="clock"
          size={16}
          color={live ? theme.colors.ok : "#FF6B6B"}
          stroke={2.2}
        />
        {live ? "New post · every week" : `Last post · ${days} days ago`}
      </div>
      {/* the grid: old posts, then the new ones pushing in at the top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
        {OLD.map((t, j) => {
          const p = place(j + inserted, false);
          return (
            <div
              key={`o${j}`}
              style={{ position: "absolute", left: p.x, top: p.y }}
            >
              <TileView t={t} grey={live ? 0.6 : 0.3 + 0.7 * quiet} />
            </div>
          );
        })}
        {NEW.slice(0, inserted).map((t, k) => {
          const idx = inserted - 1 - k;
          const p = place(idx, idx === 0);
          return (
            <div
              key={`n${k}`}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                scale: p.s,
                zIndex: 2,
                boxShadow: idx === 0 ? `0 0 30px ${theme.colors.glow}` : "none",
              }}
            >
              <TileView t={t} grey={0} />
            </div>
          );
        })}
      </div>
      {/* likes floating up */}
      {live
        ? NEW_AT.flatMap((at, k) =>
            [0, 1, 2].map((h) => {
              const t0 = at + 4 + h * 5;
              const age = frame - t0;
              if (age < 0 || age > 30) return null;
              const x = 60 + (((k * 3 + h) * 53) % 340) + rnd(k * 7 + h) * 20;
              return (
                <div
                  key={`h${k}-${h}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 560 - age * 6,
                    opacity: interpolate(age, [0, 4, 20, 30], [0, 1, 1, 0]),
                    scale: interpolate(age, [0, 6], [0.5, 1], clamp),
                    zIndex: 5,
                  }}
                >
                  <svg width={34} height={30} viewBox="0 0 24 21">
                    <path
                      d="M20.8 2.6a5.5 5.5 0 0 0-7.8 0L12 3.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 19l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"
                      fill="#FF4D6D"
                    />
                  </svg>
                </div>
              );
            }),
          )
        : null}
    </div>
  );
};

// ---------------------------------------------------------------- the month
type Kind = "photo" | "video" | "story" | "offer" | "tip";
const PLAN: Record<number, Kind> = {
  1: "photo",
  3: "video",
  5: "story",
  7: "offer",
  9: "photo",
  11: "tip",
  13: "video",
  15: "photo",
  17: "story",
  19: "video",
  21: "offer",
  23: "photo",
  25: "tip",
  27: "story",
};
const Glyph: React.FC<{ k: Kind; size?: number; color?: string }> = ({
  k,
  size = 24,
  color = theme.colors.gold2,
}) => {
  if (k === "story")
    return (
      <span
        style={{
          width: size * 0.85,
          height: size * 0.85,
          borderRadius: "50%",
          border: `3px solid ${color}`,
        }}
      />
    );
  if (k === "offer")
    return (
      <span
        style={{
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: size,
          color,
          lineHeight: 1,
        }}
      >
        %
      </span>
    );
  const name: IconName =
    k === "photo" ? "camera" : k === "video" ? "video" : "chat";
  return <Icon name={name} size={size} color={color} stroke={2.2} />;
};
const CELL = 58;
const CELL_GAP = 4;
const CAL_LEFT = (PHONE_W - (7 * CELL + 6 * CELL_GAP)) / 2;
const CAL_TOP = 142;

const CalendarScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const approved = frame >= APPROVE_AT;
  const ok = spring({
    frame: frame - APPROVE_AT,
    fps,
    config: theme.spring.bouncy,
  });
  const press =
    1 - 0.05 * interpolate(frame - APPROVE_AT, [-3, 0, 5], [0, 1, 0], clamp);
  const preview = spring({
    frame: frame - (DROP + 60),
    fps,
    config: theme.spring.smooth,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        background: `radial-gradient(380px 300px at 50% 0%, rgba(200,151,58,0.12), transparent 70%), ${SCREEN_BG}`,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 18,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 30,
        }}
      >
        Your month
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 58,
          fontSize: 16,
          color: theme.colors.gold2,
          fontWeight: 700,
        }}
      >
        planned · designed · written · posted
      </div>
      <div
        style={{
          position: "absolute",
          left: CAL_LEFT,
          top: 106,
          display: "flex",
          gap: CELL_GAP,
        }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: theme.colors.dim,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      {new Array(28).fill(0).map((_, i) => {
        const day = i + 1;
        const at = DROP + 2 + i * 2;
        const p = spring({
          frame: frame - at,
          fps,
          config: theme.spring.snappy,
        });
        const kind = PLAN[day];
        return (
          <div
            key={day}
            style={{
              position: "absolute",
              left: CAL_LEFT + (i % 7) * (CELL + CELL_GAP),
              top: CAL_TOP + Math.floor(i / 7) * (CELL + 8),
              width: CELL,
              height: CELL,
              borderRadius: 12,
              background: kind ? theme.colors.goldSoft : theme.colors.surface2,
              border: `1px solid ${kind ? theme.colors.goldLine : theme.colors.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: interpolate(p, [0, 0.4], [0.25, 1], clamp),
              scale: kind ? interpolate(p, [0, 1], [0.6, 1]) : 1,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 6,
                top: 3,
                fontSize: 12,
                color: theme.colors.dim,
              }}
            >
              {day}
            </span>
            {kind && frame >= at ? <Glyph k={kind} /> : null}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: CAL_LEFT,
          right: CAL_LEFT,
          top: 410,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          color: theme.colors.muted,
        }}
      >
        {(["photo", "video", "story", "offer", "tip"] as Kind[]).map((k) => (
          <span
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Glyph k={k} size={16} color={theme.colors.muted} />
            {k[0].toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
      {/* a post from the plan */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 450,
          height: 150,
          borderRadius: 18,
          background: theme.colors.surface2,
          border: `1px solid ${theme.colors.line2}`,
          display: "flex",
          gap: 14,
          padding: 14,
          opacity: interpolate(preview, [0, 0.4], [0, 1], clamp),
          translate: `0px ${interpolate(preview, [0, 1], [30, 0])}px`,
        }}
      >
        <div
          style={{
            width: 122,
            height: 122,
            flexShrink: 0,
            borderRadius: 12,
            background: NEW[0].bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="camera" size={34} color="#1A1208" stroke={2} />
        </div>
        <div>
          <div style={{ fontSize: 15, color: theme.colors.muted }}>
            Mon 1 · Photo
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>
            yourbusiness
          </div>
          <div style={{ fontSize: 15, color: theme.colors.muted }}>
            Your city · 2 h
          </div>
          <div style={{ fontSize: 18, marginTop: 8 }}>Fresh this week…</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 624,
          height: 70,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 24,
          background: approved ? theme.colors.ok : theme.gradients.gold,
          color: "#0A0A0A",
          scale: approved ? interpolate(ok, [0, 1], [0.9, 1]) : press,
          boxShadow: approved
            ? "0 0 40px rgba(60,207,142,0.45)"
            : `0 0 40px ${theme.colors.glow}`,
        }}
      >
        <Icon
          name={approved ? "check" : "calendarCheck"}
          size={26}
          color="#0A0A0A"
          stroke={2.6}
        />
        {approved ? "Approved · 10 minutes" : "Approve this month"}
      </div>
      <Tap x={230} y={659} at={APPROVE_AT} size={90} />
    </div>
  );
};

// ---------------------------------------------------------------- the phone
const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame + 8, fps, config: theme.spring.smooth });
  const sink = ease(frame, CTA, CTA + 18, theme.ease.inOut);
  const dim = 1 - 0.5 * ease(frame, PROOF, PROOF + 10) - 0.15 * sink;
  const toCal = ease(frame, DROP - 4, DROP + 8, theme.ease.inOut);
  const toFeed = ease(frame, LIVE - 4, LIVE + 8, theme.ease.inOut);
  const slide = (p: number, z: number): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    translate: `${(1 - p) * 100}% 0px`,
    boxShadow: "-20px 0 40px rgba(0,0,0,0.5)",
    zIndex: z,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_LEFT,
        top: PHONE_TOP + interpolate(enter, [0, 1], [220, 0]) + sink * 520,
        opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
        filter:
          dim < 0.99 ? `brightness(${dim}) blur(${4 * sink}px)` : undefined,
      }}
    >
      <PhoneShell
        width={PHONE_W}
        glow={frame >= DROP ? 0.5 : 0.12}
        statusBg={SCREEN_BG}
      >
        {/* the profile: quiet before the drop, alive after the calendar */}
        {toCal < 1 || toFeed > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate:
                toFeed > 0
                  ? `${(1 - toFeed) * 100}% 0px`
                  : `${-toCal * 35}% 0px`,
              opacity: toFeed > 0 ? 1 : 1 - toCal * 0.7,
              zIndex: toFeed > 0 ? 3 : 1,
            }}
          >
            <ProfileScreen />
          </div>
        ) : null}
        {toCal > 0 && toFeed < 1 ? (
          <div
            style={{
              ...slide(toCal, 2),
              translate:
                toFeed > 0
                  ? `${-toFeed * 35}% 0px`
                  : `${(1 - toCal) * 100}% 0px`,
              opacity: 1 - toFeed * 0.7,
            }}
          >
            <CalendarScreen />
          </div>
        ) : null}
      </PhoneShell>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "YouTube"];

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = spring({
    frame: frame - (CTA + 20),
    fps,
    config: theme.spring.bouncy,
  });
  const sub = useEntrance(CTA + 40, "smooth");
  if (frame < CTA) return null;
  return (
    <AbsoluteFill>
      <Head top={440}>
        <WordReveal
          words={["Run", "your", "business."]}
          delay={CTA + 4}
          per={3}
          size={88}
        />
        <WordReveal
          words={[
            { text: "We", tone: "gold" },
            { text: "keep", tone: "gold" },
            { text: "you", tone: "gold" },
            { text: "posted.", tone: "gold" },
          ]}
          delay={CTA + 12}
          per={3}
          size={84}
        />
      </Head>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 900,
          top: 716,
          height: 116,
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "0 24px",
          background: theme.colors.surface2,
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          opacity: interpolate(box, [0, 0.4], [0, 1], clamp),
          scale: interpolate(box, [0, 1], [0.8, 1]),
        }}
      >
        {PLATFORMS.map((p, i) => {
          const c = spring({
            frame: frame - (CTA + 24 + i * 3),
            fps,
            config: theme.spring.snappy,
          });
          return (
            <span
              key={p}
              style={{
                padding: "10px 18px",
                borderRadius: 99,
                background: theme.colors.goldSoft,
                border: `1px solid ${theme.colors.goldLine}`,
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 28,
                color: theme.colors.text,
                scale: c,
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 862,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 32,
          color: theme.colors.muted,
          opacity: sub,
        }}
      >
        From $599 CAD a month. No lock-in contracts.
      </div>
      <CtaButton label="Get a free strategy call" at={CTA + 44}>
        <Tap x={380} y={54} at={CTA + 86} size={100} />
      </CtaButton>
      <UrlLine url="esolutify.com/social-media-management" at={CTA + 54} />
    </AbsoluteFill>
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["tick", 30, 0.3],
  ["tick", 70, 0.3],
  ["tick", 110, 0.3],
  ["thud", 150, 0.4],
  ["whoosh", DROP - 8, 0.45],
  ...[0, 1, 2, 3, 4, 5, 6].map(
    (k): Cue => ["blip", DROP + 2 + k * 8, 0.2, 1 + k * 0.06],
  ),
  ["pop", APPROVE_AT - 2, 0.45, 1.2],
  ["chime", APPROVE_AT + 2, 0.45],
  ["whoosh-soft", LIVE - 6, 0.35],
  ...NEW_AT.map((t, k): Cue => ["shutter", t - 2, 0.4, 1 + (k % 3) * 0.05]),
  ["ping", LIVE + 60, 0.45],
  ["whoosh-soft", PROOF + 4, 0.3],
  ["pop", PROOF + 20, 0.4],
  ["pop", PROOF + 29, 0.4, 1.1],
  ["pop", PROOF + 38, 0.4, 1.2],
  ["shimmer", CTA, 0.35],
  ["pop", CTA + 24, 0.35, 1.2],
  ["pop", CTA + 84, 0.45, 1.3],
];

export const SocialReel: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <PhoneLayer />
      <StatCards
        at={PROOF + 20}
        until={CTA}
        cards={[
          {
            icon: "trending",
            title: "3.5x organic reach",
            sub: "Average, within 90 days",
          },
          {
            icon: "check",
            title: "Approved by you, always",
            sub: "Nothing goes live without your sign-off",
          },
          {
            icon: "globe",
            title: "EN · FR · AR · FA",
            sub: "Designed in-house, in your customers' language",
          },
        ]}
      />
      <BottomFade />
      <Logo cta={CTA} />
      <Copy />
      <Cta />
      <Flash at={DROP} />
    </Stage>
    <Audio src={staticFile("audio/social-music-24.wav")} volume={0.8} />
    {CUES.map(([name, at, volume, rate], i) => (
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

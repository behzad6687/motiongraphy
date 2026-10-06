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
import { Icon } from "../components/Icons";
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

// Paid Advertising Management — 9:16 Reel / Short, 24 s @ 30 fps.
// Story (esolutify.com/paid-advertising-management): you put $1 into ads →
// leads leak away (nobody answers / too late / no follow-up), $1.20 comes
// back → on the drop the leaks are sealed: $4.80 back → "One customer's
// day. Six chances to meet you." (Instagram → LinkedIn → Google → news →
// YouTube → TikTok, she messages at 9:31 pm) → 4.8x ROAS → free ads audit.
// 150 BPM trap, half-time (12 frames a beat, 48 a bar): the drop is f144,
// the montage cuts every two beats. Copy stays in y 290–1160.

export const ADS_DURATION = 720;
const BEAT = 12;
const DROP = 144;
const DAY = 240;
const PROOF = 384;
const CTA = 528;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;
const VH = phoneViewportHeight(PHONE_W);
const SCREEN_BG = "#0F0F10";

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

// ---------------------------------------------------------------- counters
const Money: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - DROP, fps, config: theme.spring.counter });
  return <>${(1.2 + 3.6 * p).toFixed(2)}</>;
};

const BigNumber: React.FC<{
  at: number;
  top: number;
  size: number;
  children: React.ReactNode;
}> = ({ at, top, size, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: theme.spring.snappy });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: size,
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
      {children}
    </div>
  );
};

const DropMoney: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <BigNumber at={DROP + 4} top={500} size={132}>
      <Money frame={frame} /> back.
    </BigNumber>
  );
};

const Roas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - PROOF, fps, config: theme.spring.counter });
  return (
    <BigNumber at={PROOF} top={376} size={160}>
      {(1.2 + 3.6 * p).toFixed(1)}x
    </BigNumber>
  );
};

// ---------------------------------------------------------------- text layer
const Copy: React.FC = () => (
  <AbsoluteFill>
    <Window from={-10} until={70}>
      <Head>
        <WordReveal words={["You", "put"]} delay={-12} per={3} size={100} />
        <WordReveal
          words={[
            { text: "$1", tone: "gold" },
            { text: "into", tone: "gold" },
            { text: "ads.", tone: "gold" },
          ]}
          delay={-6}
          per={3}
          size={110}
        />
      </Head>
    </Window>
    <Window from={72} until={DROP - 6}>
      <Head>
        <WordReveal words={["Only"]} delay={74} size={96} />
        <WordReveal
          words={[
            { text: "$1.20", tone: "red" },
            { text: "comes", tone: "red" },
            { text: "back.", tone: "red" },
          ]}
          delay={80}
          per={3}
          size={92}
        />
      </Head>
      <Sub text="Nobody answers. Too late. No follow-up." at={96} />
    </Window>
    <Window from={DROP} until={DAY - 6}>
      <Head>
        <WordReveal
          words={["After", "90", "days:"]}
          delay={DROP}
          per={3}
          size={88}
        />
      </Head>
      <DropMoney />
      <Sub text="Same budget. 4× more." at={DROP + 20} top={660} />
    </Window>
    <Window from={DAY} until={PROOF - 6}>
      <Head>
        <WordReveal
          words={["One", "customer’s", "day."]}
          delay={DAY}
          per={3}
          size={84}
        />
        <WordReveal
          words={[
            { text: "Six", tone: "gold" },
            { text: "chances.", tone: "gold" },
          ]}
          delay={DAY + 8}
          per={3}
          size={100}
        />
      </Head>
      <Sub text="We put you everywhere she spends her time." at={DAY + 20} />
    </Window>
    <Window from={PROOF} until={CTA - 6}>
      <Roas />
      <Head top={556}>
        <WordReveal
          words={["return", "on", "ad", "spend."]}
          delay={PROOF + 6}
          per={3}
          size={76}
        />
      </Head>
      <Sub
        text="Average across managed Meta & Google campaigns."
        at={PROOF + 16}
        top={652}
        size={30}
      />
    </Window>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- $1 in: the leaks
const PIPE_X = 185;
const PIPE_W = 90;
const PIPE_TOP = 130;
const PIPE_BOTTOM = 570;
const SPEED = 8; // px a frame
type Leak = { y: number; side: -1 | 1; before: string; after: string };
const LEAKS: Leak[] = [
  { y: 220, side: -1, before: "Nobody answers", after: "Reply in seconds" },
  { y: 330, side: 1, before: "Answered too late", after: "Never too late" },
  {
    y: 440,
    side: -1,
    before: "Nobody follows up",
    after: "Follow-up until booked",
  },
];
// before the seal: 8 in 10 people slip out of one of the three leaks
const FATE = [0, 1, 0, 2, 1, 3, 0, 2, 1, 3];

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const dots: React.ReactNode[] = [];
  for (
    let k = Math.max(0, Math.floor((frame - 80) / 3));
    k * 3 + 16 <= frame;
    k++
  ) {
    const t0 = k * 3 + 16;
    const age = frame - t0;
    const x0 = PIPE_X + PIPE_W / 2 + rnd(k) * 56;
    let x = x0;
    let y = PIPE_TOP + age * SPEED;
    let color: string = theme.colors.text;
    let opacity = interpolate(age, [0, 4], [0, 1], clamp);
    const fate = FATE[k % FATE.length];
    const leak = LEAKS[fate];
    const hitAt = leak ? t0 + (leak.y - PIPE_TOP) / SPEED : Infinity;
    if (leak && hitAt < DROP && y >= leak.y) {
      const out = (y - leak.y) / SPEED; // frames since it reached the leak
      y = leak.y + out * 1.5;
      x = x0 + leak.side * out * 9;
      color = "#FF6B6B";
      opacity *= interpolate(out, [6, 16], [1, 0], clamp);
    } else if (y >= PIPE_BOTTOM) {
      const sink = (y - PIPE_BOTTOM) / SPEED;
      y = PIPE_BOTTOM + sink * 3;
      x = x0 + (230 - x0) * Math.min(1, sink / 6);
      color = theme.colors.ok;
      opacity *= interpolate(sink, [3, 8], [1, 0], clamp);
    }
    if (opacity <= 0.01) continue;
    dots.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: x - 7,
          top: y - 7,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: color,
          opacity,
          boxShadow: `0 0 10px ${color}`,
        }}
      />,
    );
  }
  return <>{dots}</>;
};

const FunnelScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const coin = spring({ frame: frame - 4, fps, config: theme.spring.bouncy });
  const seal = spring({
    frame: frame - DROP,
    fps,
    config: theme.spring.bouncy,
  });
  const sealed = frame >= DROP;
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
          top: 22,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: theme.colors.muted,
        }}
      >
        YOUR AD BUDGET
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 44,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 28,
        }}
      >
        {sealed ? "Ads + someone who answers" : "Ads on their own"}
      </div>
      {/* the coin */}
      <div
        style={{
          position: "absolute",
          left: 230 - 36,
          top: interpolate(coin, [0, 1], [-90, 78]) - 6 * Math.sin(frame / 6),
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: theme.gradients.gold,
          boxShadow: `0 0 30px ${theme.colors.glow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 30,
          color: "#0A0A0A",
          zIndex: 3,
        }}
      >
        $1
      </div>
      {/* the pipe */}
      <div
        style={{
          position: "absolute",
          left: PIPE_X,
          top: PIPE_TOP,
          width: PIPE_W,
          height: PIPE_BOTTOM - PIPE_TOP,
          borderRadius: 20,
          background: "#151517",
          border: `2px solid ${sealed ? theme.colors.goldLine : theme.colors.line2}`,
        }}
      />
      {LEAKS.map((l, i) => {
        const outletLeft = l.side < 0 ? PIPE_X - 70 : PIPE_X + PIPE_W;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: outletLeft,
                top: l.y - 4,
                width: 70,
                height: 30,
                background: "#151517",
                borderTop: `2px solid ${theme.colors.line2}`,
                borderBottom: `2px solid ${theme.colors.line2}`,
              }}
            />
            {/* the seal */}
            <div
              style={{
                position: "absolute",
                left: l.side < 0 ? PIPE_X - 6 : PIPE_X + PIPE_W - 4,
                top: l.y - 10,
                width: 10,
                height: 42,
                borderRadius: 5,
                background: theme.gradients.gold,
                boxShadow: `0 0 16px ${theme.colors.glow}`,
                scale: `1 ${seal}`,
                opacity: sealed ? 1 : 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: l.side < 0 ? 14 : PIPE_X + PIPE_W + 8,
                width: 170,
                top: l.y - 50,
                textAlign: l.side < 0 ? "left" : "right",
                fontSize: 17,
                fontWeight: 700,
                lineHeight: 1.2,
                color: sealed ? theme.colors.ok : "#FF6B6B",
                opacity: ease(frame, 30 + i * 10, 40 + i * 10),
              }}
            >
              {sealed ? l.after : l.before}
            </div>
          </React.Fragment>
        );
      })}
      <Particles />
      {/* who is left */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: PIPE_BOTTOM + 24,
          height: 96,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          background: sealed
            ? "linear-gradient(180deg, #17221D, #111915)"
            : theme.colors.surface2,
          border: `2px solid ${sealed ? "rgba(60,207,142,0.6)" : theme.colors.line2}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
              color: theme.colors.muted,
            }}
          >
            {sealed ? "CUSTOMERS · SAME BUDGET" : "CUSTOMERS"}
          </div>
          <div
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            {sealed ? "Many more" : "A few"}
          </div>
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 34,
            fontVariantNumeric: "tabular-nums",
            color: sealed ? theme.colors.ok : theme.colors.muted,
          }}
        >
          <Money frame={frame} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- one customer's day
const Chip: React.FC<{ time: string; app: string; color: string }> = ({
  time,
  app,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: 16,
      translate: "-50% 0px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 18px",
      borderRadius: 99,
      background: "rgba(20,20,20,0.88)",
      border: `1px solid ${theme.colors.line2}`,
      fontSize: 19,
      fontWeight: 800,
      whiteSpace: "nowrap",
      zIndex: 5,
    }}
  >
    <span
      style={{ width: 12, height: 12, borderRadius: "50%", background: color }}
    />
    {time} · {app}
  </div>
);

const Sponsored: React.FC<{ name: string; sub?: string }> = ({
  name,
  sub = "Sponsored",
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        background: theme.gradients.gold,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 18,
        color: "#0A0A0A",
      }}
    >
      YB
    </div>
    <div>
      <div style={{ fontSize: 19, fontWeight: 800 }}>{name}</div>
      <div style={{ fontSize: 15, color: theme.colors.muted }}>{sub}</div>
    </div>
  </div>
);

const Lines: React.FC<{ n: number; top: number; w?: number[] }> = ({
  n,
  top,
  w = [400, 360, 380, 300],
}) => (
  <>
    {new Array(n).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 30,
          top: top + i * 26,
          width: w[i % w.length],
          height: 12,
          borderRadius: 6,
          background: theme.colors.surface3,
        }}
      />
    ))}
  </>
);

const CtaBar: React.FC<{ label: string; color?: string; top: number }> = ({
  label,
  color = "#0A84FF",
  top,
}) => (
  <div
    style={{
      position: "absolute",
      left: 20,
      right: 20,
      top,
      height: 54,
      borderRadius: 12,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 18px",
      fontSize: 20,
      fontWeight: 800,
      color: "#fff",
    }}
  >
    {label}
    <Icon name="arrow" size={22} color="#fff" stroke={2.6} />
  </div>
);

const InstagramScreen: React.FC = () => (
  <>
    <Chip time="7:30 am" app="Instagram" color="#E1306C" />
    <div style={{ position: "absolute", left: 20, top: 76 }}>
      <Sponsored name="yourbakery" />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 136,
        height: 400,
        background:
          "radial-gradient(circle at 30% 30%, #F3CF7A, #C8973A 45%, #5A3A12 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#1A1208",
        fontFamily: theme.fonts.display,
        fontWeight: 800,
      }}
    >
      <div style={{ fontSize: 26, letterSpacing: "0.2em" }}>THIS WEEK</div>
      <div style={{ fontSize: 62, lineHeight: 1, textAlign: "center" }}>
        Free coffee
      </div>
      <div style={{ fontSize: 30 }}>with every box</div>
    </div>
    <CtaBar label="Order now" top={536} />
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: 606,
        fontSize: 19,
        lineHeight: 1.35,
      }}
    >
      <b>yourbakery</b> Still warm at 7 am. This week: free coffee with every
      box.
    </div>
  </>
);

const LinkedInScreen: React.FC = () => (
  <>
    <Chip time="10:15 am" app="LinkedIn" color="#0A66C2" />
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: 76,
        height: 560,
        borderRadius: 18,
        background: theme.colors.surface2,
        border: `1px solid ${theme.colors.line}`,
      }}
    >
      <div style={{ position: "absolute", left: 18, top: 18 }}>
        <Sponsored name="Your Business" sub="Promoted" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 84,
          fontSize: 20,
          lineHeight: 1.35,
        }}
      >
        Your offer, in front of the person who signs the cheques.
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 160,
          height: 280,
          background: "linear-gradient(135deg, #1B2A3E, #0E1622)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 44,
          color: "#DCE8F7",
          textAlign: "center",
        }}
      >
        Book a demo
        <br />
        this week
      </div>
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 470,
          padding: "10px 22px",
          borderRadius: 99,
          border: "2px solid #0A84FF",
          color: "#4DA3FF",
          fontSize: 19,
          fontWeight: 800,
        }}
      >
        Learn more
      </div>
    </div>
  </>
);

const GoogleScreen: React.FC = () => (
  <>
    <Chip time="12:40 pm" app="Google" color="#34A853" />
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: 76,
        height: 60,
        borderRadius: 30,
        background: theme.colors.surface2,
        border: `1px solid ${theme.colors.line2}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        fontSize: 21,
      }}
    >
      <Icon name="search" size={24} color={theme.colors.muted} stroke={2.2} />
      emergency plumber near me
    </div>
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: 160,
        borderRadius: 18,
        padding: 18,
        background: "linear-gradient(180deg, #221C11, #17130C)",
        border: `2px solid ${theme.colors.gold2}`,
        boxShadow: `0 0 30px ${theme.colors.glow}`,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: theme.colors.text }}>
        Sponsored
      </div>
      <div style={{ fontSize: 15, color: theme.colors.muted, marginTop: 4 }}>
        yourbusiness.com
      </div>
      <div
        style={{
          fontSize: 23,
          fontWeight: 800,
          color: "#8AB4F8",
          marginTop: 6,
          lineHeight: 1.25,
        }}
      >
        Your Business — Emergency Plumber, 24/7
      </div>
      <div
        style={{
          fontSize: 18,
          color: theme.colors.muted,
          marginTop: 6,
          lineHeight: 1.35,
        }}
      >
        At your door within the hour. Upfront prices, no surprises.
      </div>
      <div
        style={{
          marginTop: 14,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 99,
          background: "#8AB4F8",
          color: "#0A0A0A",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        <Icon name="handset" size={18} color="#0A0A0A" stroke={2.4} />
        Call now
      </div>
    </div>
    <div style={{ opacity: 0.6 }}>
      <Lines n={3} top={470} />
      <Lines n={3} top={570} w={[340, 400, 260]} />
    </div>
  </>
);

const NewsScreen: React.FC = () => (
  <>
    <Chip time="5:50 pm" app="News & websites" color="#A39E96" />
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 80,
        width: 400,
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 30,
        lineHeight: 1.15,
        color: theme.colors.muted,
      }}
    >
      City council approves new transit line
    </div>
    <Lines n={4} top={170} />
    <div
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        top: 290,
        height: 200,
        borderRadius: 16,
        background: theme.gradients.gold,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        color: "#0A0A0A",
        boxShadow: `0 0 40px ${theme.colors.glow}`,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.16em" }}>
          AD · YOUR BUSINESS
        </div>
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 30,
            lineHeight: 1.1,
            marginTop: 8,
          }}
        >
          Still thinking
          <br />
          about it?
        </div>
      </div>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#0A0A0A",
          color: theme.colors.gold2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 34,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        20%
        <br />
        off
      </div>
    </div>
    <Lines n={5} top={520} w={[400, 380, 340, 400, 280]} />
  </>
);

const YouTubeScreen: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Chip time="8:15 pm" app="YouTube" color="#FF0033" />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 74,
        height: 259,
        background: "radial-gradient(circle at 60% 40%, #3A2A12, #0A0A0A 75%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 70,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1.05,
          ...{
            backgroundImage: theme.gradients.gold,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          },
        }}
      >
        Your Business.
        <br />
        Fifteen seconds of you.
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 14,
          padding: "4px 10px",
          borderRadius: 6,
          background: "#F2C14E",
          color: "#0A0A0A",
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        Ad · 0:{String(15 - Math.min(15, Math.floor(f / 2))).padStart(2, "0")}
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 14,
          padding: "10px 16px",
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(255,255,255,0.3)",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Skip in {Math.max(1, 5 - Math.floor(f / 5))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 4,
          width: `${Math.min(100, f * 4)}%`,
          background: "#F2C14E",
        }}
      />
    </div>
    <div style={{ position: "absolute", left: 20, top: 352 }}>
      <Sponsored name="Your Business" sub="Ad · yourbusiness.com" />
    </div>
    <div style={{ opacity: 0.6 }}>
      <Lines n={2} top={430} />
      <Lines n={3} top={520} w={[400, 330, 380]} />
    </div>
  </>
);

const TikTokScreen: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const dm = spring({ frame: f - 14, fps, config: theme.spring.smooth });
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: VH,
          background:
            "radial-gradient(circle at 50% 30%, #5A3A12, #1A1208 55%, #0A0A0A 100%)",
        }}
      />
      <Chip time="9:30 pm" app="TikTok · Facebook" color="#25F4EE" />
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 90,
          top: 180,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 48,
          lineHeight: 1.05,
          color: "#FFF3DC",
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        Fresh every morning.
        <br />
        Still warm at 7.
      </div>
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 300,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          alignItems: "center",
        }}
      >
        {(["star", "chat", "share"] as const).map((n) => (
          <Icon key={n} name={n} size={38} color="#fff" stroke={1.8} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 470,
          fontSize: 19,
          fontWeight: 700,
        }}
      >
        @yourbakery · Sponsored
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 510,
          height: 58,
          borderRadius: 12,
          background: theme.gradients.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontSize: 21,
          fontWeight: 800,
          color: "#0A0A0A",
          scale: 1 - 0.05 * interpolate(f - 8, [-3, 0, 5], [0, 1, 0], clamp),
        }}
      >
        <Icon name="chat" size={22} color="#0A0A0A" stroke={2.4} />
        Send message
      </div>
      <Tap x={230} y={539} at={DAY + 5 * 2 * BEAT + 8} size={80} />
      {/* 9:31 pm: she writes to you */}
      {f >= 14 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: interpolate(dm, [0, 1], [VH, 300]),
            height: VH - 300,
            borderRadius: "30px 30px 0 0",
            background: "#171614",
            borderTop: `1px solid ${theme.colors.line2}`,
            padding: "26px 22px",
          }}
        >
          <div
            style={{ fontSize: 15, fontWeight: 700, color: theme.colors.dim }}
          >
            9:31 PM · to Your Business
          </div>
          <div
            style={{
              marginTop: 12,
              display: "inline-block",
              padding: "14px 18px",
              borderRadius: 24,
              borderBottomLeftRadius: 8,
              background: theme.colors.surface3,
              fontSize: 22,
            }}
          >
            Hi! Do you have anything this week?
          </div>
        </div>
      ) : null}
    </>
  );
};

const SCENES = [
  InstagramScreen,
  LinkedInScreen,
  GoogleScreen,
  NewsScreen,
  YouTubeScreen,
  TikTokScreen,
] as const;
const SCENE_LEN = 2 * BEAT;

const DayScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - DAY;
  const idx = Math.max(
    0,
    Math.min(SCENES.length - 1, Math.floor(t / SCENE_LEN)),
  );
  const local = t - idx * SCENE_LEN;
  const p = ease(local, 0, 6, theme.ease.out);
  const render = (i: number, f: number) => {
    const S = SCENES[i] as React.FC<{ f: number }>;
    return <S f={f} />;
  };
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
      {idx > 0 && p < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            translate: `0px ${-p * 30}%`,
            opacity: 1 - p,
          }}
        >
          {render(idx - 1, SCENE_LEN + local)}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: SCREEN_BG,
          translate: idx > 0 ? `0px ${(1 - p) * 60}%` : undefined,
        }}
      >
        {render(idx, idx === SCENES.length - 1 ? t - idx * SCENE_LEN : local)}
      </div>
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
  const push = ease(frame, DAY - 4, DAY + 8, theme.ease.inOut);
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
        {push < 1 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `${-push * 35}% 0px`,
              opacity: 1 - push * 0.7,
            }}
          >
            <FunnelScreen />
          </div>
        ) : null}
        {push > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              translate: `${(1 - push) * 100}% 0px`,
              boxShadow: "-20px 0 40px rgba(0,0,0,0.5)",
            }}
          >
            <DayScreen />
          </div>
        ) : null}
      </PhoneShell>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const PLATFORMS = [
  "Meta",
  "Instagram",
  "Google",
  "TikTok",
  "LinkedIn",
  "YouTube",
];

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
          words={["Turn", "ad", "spend"]}
          delay={CTA + 4}
          per={3}
          size={92}
        />
        <WordReveal
          words={[
            { text: "into", tone: "gold" },
            { text: "real", tone: "gold" },
            { text: "revenue.", tone: "gold" },
          ]}
          delay={CTA + 12}
          per={3}
          size={88}
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
          flexWrap: "wrap",
          gap: 10,
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
                padding: "10px 16px",
                borderRadius: 99,
                background: theme.colors.goldSoft,
                border: `1px solid ${theme.colors.goldLine}`,
                fontFamily: theme.fonts.body,
                fontWeight: 700,
                fontSize: 26,
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
        We find where your ad money leaks, first.
      </div>
      <CtaButton label="Get a free ads audit" at={CTA + 44}>
        <Tap x={380} y={54} at={CTA + 86} size={100} />
      </CtaButton>
      <UrlLine url="esolutify.com/paid-advertising-management" at={CTA + 54} />
    </AbsoluteFill>
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["cash", 12, 0.5],
  ["thud", 80, 0.45],
  ["whoosh", DROP - 8, 0.45],
  ["cash", DROP + 2, 0.55],
  ["chime", DROP + 22, 0.35],
  ...[0, 1, 2, 3, 4, 5].map(
    (i): Cue => ["whoosh-soft", DAY + i * 2 * BEAT - 4, 0.22],
  ),
  ["pop", DAY + 5 * 2 * BEAT + 6, 0.45, 1.2],
  ["ping", DAY + 5 * 2 * BEAT + 12, 0.45],
  ["whoosh-soft", PROOF + 4, 0.3],
  ["pop", PROOF + 20, 0.4],
  ["pop", PROOF + 29, 0.4, 1.1],
  ["pop", PROOF + 38, 0.4, 1.2],
  ["shimmer", CTA, 0.35],
  ["pop", CTA + 24, 0.35, 1.2],
  ["pop", CTA + 84, 0.45, 1.3],
];

export const AdsReel: React.FC<{ readonly safeZones?: boolean }> = ({
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
            title: "62% lower cost per lead",
            sub: "After our first 90 days",
          },
          {
            icon: "target",
            title: "0.8% → 3.9% click-through",
            sub: "Almost 5× more people tap",
          },
          {
            icon: "globe",
            title: "500+ campaigns managed",
            sub: "Canada, USA & UAE · 98% retention",
          },
        ]}
      />
      <BottomFade />
      <Logo cta={CTA} />
      <Copy />
      <Cta />
      <Flash at={DROP} />
    </Stage>
    <Audio src={staticFile("audio/ads-music-24.wav")} volume={0.7} />
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

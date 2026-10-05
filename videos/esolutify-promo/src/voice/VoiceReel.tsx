import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PhoneShell, Tap, phoneViewportHeight } from "../components/Devices";
import { Icon, type IconName } from "../components/Icons";
import { LightSweep, WordReveal, useEntrance } from "../components/Motion";
import { SafeZones } from "../components/SafeZones";
import { Sfx, type SfxName } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { clamp, theme } from "../theme";

// AI Voice Receptionist — 9:16 Reel / Short, 24 s @ 30 fps (720 frames).
// Story: it's 9:42 pm, the phone rings → missed, no voicemail → rewind:
// answered on ring 1 → the live call (verbatim from esolutify.com/ai-voice-
// receptionist) → booked, texted, summary to you → "Don't believe it? Call it."
// 120 BPM: the answer lands on the drop (f180), the CTA on the outro (f540).
// All copy sits in the Meta/YouTube safe zone (y 290–1160); see SafeZones.

export const VOICE_DURATION = 720;
const ANSWER = 180;
const RESULTS = 444;
const CTA = 540;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;

type Line = {
  who: "RECEPTIONIST" | "CALLER";
  text: string;
  at: number;
  per: number;
};
// Verbatim from the page's live-call example.
const LINES: Line[] = [
  {
    who: "RECEPTIONIST",
    text: "Thank you for calling Bright Smile Dental. How can I help you tonight?",
    at: 226,
    per: 4,
  },
  {
    who: "CALLER",
    text: "I have a toothache. Do you have anything tomorrow morning?",
    at: 284,
    per: 4,
  },
  {
    who: "RECEPTIONIST",
    text: "I’m sorry to hear that. I have 9:30 or 11 o’clock tomorrow. Which one suits you?",
    at: 330,
    per: 3.5,
  },
  { who: "CALLER", text: "9:30, please.", at: 392, per: 4 },
  {
    who: "RECEPTIONIST",
    text: "Booked for 9:30. Your confirmation is on its way by text.",
    at: 406,
    per: 3,
  },
];
const lineEnd = (l: Line) => l.at + l.text.split(" ").length * l.per;

const speaking = (frame: number): Line["who"] | null => {
  const l = LINES.find((x) => frame >= x.at && frame < lineEnd(x));
  return l ? l.who : null;
};

const ease = (frame: number, a: number, b: number, e = theme.ease.out) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });

// ---------------------------------------------------------------- text layer
const Window: React.FC<{
  from: number;
  until: number;
  children: React.ReactNode;
}> = ({ from, until, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= until + 6) return null;
  const p = ease(frame, until, until + 6, theme.ease.in);
  return (
    <AbsoluteFill style={{ opacity: 1 - p, translate: `0px ${-24 * p}px` }}>
      {children}
    </AbsoluteFill>
  );
};

const Head: React.FC<{ top?: number; children: React.ReactNode }> = ({
  top = 392,
  children,
}) => (
  <div style={{ position: "absolute", left: 80, right: 80, top }}>
    {children}
  </div>
);

const Sub: React.FC<{ text: string; at: number; top: number }> = ({
  text,
  at,
  top,
}) => {
  const p = useEntrance(at, "smooth");
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top,
        textAlign: "center",
        fontFamily: theme.fonts.body,
        fontWeight: 500,
        fontSize: 40,
        color: theme.colors.muted,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [20, 0])}px`,
      }}
    >
      {text}
    </div>
  );
};

// Live captions of the call: the speaker label, then the line revealed word
// by word at speaking pace over a dim copy (reads with the sound off).
const Caption: React.FC<{ line: Line; until: number }> = ({ line, until }) => {
  const frame = useCurrentFrame();
  if (frame < line.at - 4 || frame >= until + 4) return null;
  const inP = ease(frame, line.at - 4, line.at + 4);
  const outP = ease(frame, until, until + 4, theme.ease.in);
  const words = line.text.split(" ");
  const ai = line.who === "RECEPTIONIST";
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 372,
        opacity: inP * (1 - outP),
        translate: `0px ${(1 - inP) * 20 - outP * 20}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: theme.fonts.body,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.22em",
          color: ai ? theme.colors.gold2 : theme.colors.muted,
          marginBottom: 14,
        }}
      >
        {ai ? (
          <Icon
            name="sparkle"
            size={24}
            color={theme.colors.gold2}
            stroke={2}
          />
        ) : (
          <Icon name="user" size={24} color={theme.colors.muted} stroke={2} />
        )}
        {ai ? "AI RECEPTIONIST" : "CALLER"}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 14,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: line.text.length > 70 ? 50 : 56,
          lineHeight: 1.16,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        {words.map((w, i) => {
          const on = ease(
            frame,
            line.at + i * line.per,
            line.at + i * line.per + 5,
          );
          return (
            <span
              key={i}
              style={{
                color: ai ? theme.colors.text : theme.colors.muted,
                opacity: 0.18 + 0.82 * on,
                ...(ai && on > 0.5 && /9:30|Booked|tonight\?/.test(w)
                  ? {
                      backgroundImage: theme.gradients.gold,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : {}),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Copy: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* S1 — the hook, readable on frame 0 */}
      <Window from={-10} until={92}>
        <Head>
          <WordReveal
            words={[
              "It’s",
              { text: "9:42", tone: "gold" },
              { text: "pm.", tone: "gold" },
            ]}
            delay={-12}
            per={3}
            size={100}
          />
          <WordReveal
            words={["Your", "phone", "is", "ringing."]}
            delay={-6}
            per={3}
            size={84}
          />
        </Head>
      </Window>
      {/* S2 — the problem (site copy) */}
      <Window from={96} until={174}>
        <Head>
          <WordReveal
            words={["Most", "callers", "won’t"]}
            delay={98}
            per={3}
            size={92}
          />
          <WordReveal
            words={["leave", "a", { text: "voicemail.", tone: "red" }]}
            delay={106}
            per={3}
            size={92}
          />
        </Head>
        <Sub text="They call the next name on the list." at={124} top={620} />
      </Window>
      {/* S3 — the answer, on the drop */}
      <Window from={ANSWER} until={218}>
        <Head>
          <WordReveal
            words={["Answered", "on"]}
            delay={ANSWER}
            per={3}
            size={104}
          />
          <WordReveal
            words={[
              { text: "ring", tone: "gold" },
              { text: "1.", tone: "gold" },
            ]}
            delay={ANSWER + 6}
            per={3}
            size={104}
          />
        </Head>
      </Window>
      {/* S4 — the live call */}
      {LINES.map((l, i) => (
        <Caption
          key={i}
          line={l}
          until={i < LINES.length - 1 ? LINES[i + 1].at - 4 : RESULTS - 4}
        />
      ))}
      {/* S5 — the outcome */}
      <Window from={RESULTS} until={CTA - 6}>
        <Head>
          <WordReveal
            words={["Booked.", "Texted."]}
            delay={RESULTS}
            per={4}
            size={96}
          />
          <WordReveal
            words={[
              { text: "Summary", tone: "gold" },
              { text: "to", tone: "gold" },
              { text: "you.", tone: "gold" },
            ]}
            delay={RESULTS + 8}
            per={3}
            size={96}
          />
        </Head>
        <Sub
          text="Any language · 24/7 · 0 voicemails to chase"
          at={RESULTS + 20}
          top={630}
        />
      </Window>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the phone
const Waveform: React.FC<{ who: Line["who"] | null; width: number }> = ({
  who,
  width,
}) => {
  const frame = useCurrentFrame();
  const bars = 30;
  const amp = who ? 1 : 0.12;
  const color = who === "CALLER" ? theme.colors.text : theme.colors.gold2;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        height: 90,
        width,
      }}
    >
      {new Array(bars).fill(0).map((_, i) => {
        const n =
          Math.abs(Math.sin(frame * 0.55 + i * 0.9)) * 0.6 +
          Math.abs(Math.sin(frame * 0.23 + i * 1.7)) * 0.4;
        const env = Math.sin((Math.PI * (i + 0.5)) / bars);
        const h = 8 + 74 * amp * n * env;
        return (
          <div
            key={i}
            style={{
              width: 7,
              height: h,
              borderRadius: 4,
              background: color,
              opacity: 0.35 + 0.65 * env,
            }}
          />
        );
      })}
    </div>
  );
};

const RoundBtn: React.FC<{
  color: string;
  icon: IconName;
  rotate?: number;
  label: string;
}> = ({ color, icon, rotate = 0, label }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 112,
        height: 112,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        rotate: `${rotate}deg`,
      }}
    >
      <Icon name={icon} size={50} color="#fff" stroke={2.2} />
    </div>
    <div style={{ fontFamily: theme.fonts.body, fontSize: 22, color: "#ddd" }}>
      {label}
    </div>
  </div>
);

const IncomingScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const missed = ease(frame, 100, 118, theme.ease.inOut);
  const pulse = (frame % 36) / 36;
  const h = phoneViewportHeight(PHONE_W);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: h,
        background: "linear-gradient(180deg, #1E2A38 0%, #0E1218 100%)",
        filter: `grayscale(${missed})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: theme.fonts.body,
        color: "#fff",
      }}
    >
      <div
        style={{
          marginTop: 36,
          fontSize: 22,
          letterSpacing: "0.18em",
          opacity: 0.75,
          textTransform: "uppercase",
        }}
      >
        {missed > 0.5 ? "Call ended" : "Incoming call — 9:42 pm"}
      </div>
      <div
        style={{ position: "relative", marginTop: 40, width: 170, height: 170 }}
      >
        {missed < 0.5
          ? [0, 0.5].map((o) => {
              const p = (pulse + o) % 1;
              return (
                <div
                  key={o}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.6)",
                    scale: 1 + p * 0.7,
                    opacity: 1 - p,
                  }}
                />
              );
            })
          : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="user" size={84} color="#fff" stroke={1.6} />
        </div>
      </div>
      <div style={{ marginTop: 34, fontSize: 44, fontWeight: 600 }}>
        Unknown number
      </div>
      <div style={{ marginTop: 6, fontSize: 26, opacity: 0.7 }}>
        your business line
      </div>
      {missed > 0.5 ? (
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: missed,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 34,
              fontWeight: 700,
              color: "#FF6B6B",
            }}
          >
            <Icon name="phoneMissed" size={36} color="#FF6B6B" stroke={2.2} />
            Missed call
          </div>
          <div style={{ fontSize: 26, opacity: 0.7 }}>No voicemail left</div>
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          opacity: 1 - missed,
        }}
      >
        <RoundBtn color="#E5484D" icon="handset" rotate={135} label="Decline" />
        <RoundBtn color="#30A46C" icon="handset" label="Accept" />
      </div>
    </div>
  );
};

const LiveScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const secs = Math.max(1, Math.floor((frame - ANSWER) / fps) + 1);
  const who = speaking(frame);
  const chip = spring({
    frame: frame - (ANSWER + 6),
    fps,
    config: theme.spring.bouncy,
  });
  const h = phoneViewportHeight(PHONE_W);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: h,
        background:
          "radial-gradient(420px 360px at 50% 18%, rgba(200,151,58,0.22), transparent 70%), linear-gradient(180deg, #141210 0%, #0A0A0A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      <div
        style={{
          marginTop: 30,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 24,
          color: theme.colors.muted,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#E5484D",
            opacity: 0.6 + 0.4 * Math.sin(frame / 5),
          }}
        />
        Live · 0:{String(secs).padStart(2, "0")}
      </div>
      <div
        style={{
          marginTop: 26,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: theme.gradients.gold,
          boxShadow: `0 0 ${50 + (who === "RECEPTIONIST" ? 40 : 0)}px ${theme.colors.glow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="bot" size={78} color="#0A0A0A" stroke={1.9} />
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 40,
        }}
      >
        AI Receptionist
      </div>
      <div style={{ marginTop: 4, fontSize: 24, color: theme.colors.muted }}>
        Bright Smile Dental
      </div>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: 99,
          background: theme.colors.okSoft,
          border: "1px solid rgba(60,207,142,0.5)",
          fontSize: 22,
          fontWeight: 600,
          color: theme.colors.ok,
          scale: chip,
        }}
      >
        <Icon name="check" size={22} color={theme.colors.ok} stroke={2.6} />
        Answered on ring 1
      </div>
      <div style={{ marginTop: 18 }}>
        <Waveform who={who} width={PHONE_W - 60} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          opacity: 0.85,
        }}
      >
        <RoundBtn color="#2A2A2A" icon="user" label="Transfer" />
        <RoundBtn color="#2A2A2A" icon="calendarCheck" label="Calendar" />
        <RoundBtn color="#E5484D" icon="handset" rotate={135} label="End" />
      </div>
    </div>
  );
};

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame + 8, fps, config: theme.spring.smooth });
  const sink = ease(frame, CTA, CTA + 18, theme.ease.inOut);
  // vibrate on each ring while incoming
  const ringing =
    frame < 100 && [0, 36, 72].some((r) => frame >= r && frame < r + 26);
  const shake = ringing ? Math.sin(frame * 2.6) * 5 : 0;
  // answer: the screen flips from the missed call to the live call on the drop
  const live = frame >= ANSWER - 2;
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_LEFT,
        top: PHONE_TOP + interpolate(enter, [0, 1], [220, 0]) + sink * 520,
        opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
        translate: `${shake}px 0px`,
        rotate: `${shake * 0.15}deg`,
        filter:
          sink > 0.01
            ? `brightness(${1 - 0.65 * sink}) blur(${4 * sink}px)`
            : undefined,
      }}
    >
      <PhoneShell
        width={PHONE_W}
        glow={live ? 0.5 : 0.15}
        statusBg={live ? "#141210" : "#1E2A38"}
      >
        {live ? <LiveScreen /> : <IncomingScreen />}
      </PhoneShell>
    </div>
  );
};

// Outcome cards slide over the phone (S5).
const CARDS: { icon: IconName; title: string; sub: string; ok?: boolean }[] = [
  {
    icon: "calendarCheck",
    title: "Booked · 9:30 am",
    sub: "Straight into your calendar",
    ok: true,
  },
  {
    icon: "sms",
    title: "Text sent",
    sub: "Confirmation + reminder to the caller",
  },
  {
    icon: "mail",
    title: "Summary to you",
    sub: "Transcript and lead on your board",
  },
];

const ResultCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < RESULTS || frame > CTA + 8) return null;
  const out = ease(frame, CTA - 6, CTA + 4, theme.ease.in);
  return (
    <>
      {CARDS.map((c, i) => {
        const p = spring({
          frame: frame - (RESULTS + i * 8),
          fps,
          config: theme.spring.bouncy,
        });
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 150,
              width: 780,
              top: 760 + i * 128,
              height: 108,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "0 30px",
              background: c.ok
                ? "linear-gradient(180deg, #17221D, #111915)"
                : theme.gradients.card,
              border: `1px solid ${c.ok ? "rgba(60,207,142,0.5)" : theme.colors.line2}`,
              boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp) * (1 - out),
              translate: `${interpolate(p, [0, 1], [i % 2 ? 120 : -120, 0])}px 0px`,
              scale: interpolate(p, [0, 1], [0.9, 1]),
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                flexShrink: 0,
                background: c.ok ? theme.colors.ok : theme.colors.goldSoft,
                border: c.ok ? "none" : `1.5px solid ${theme.colors.goldLine}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={c.ok ? "check" : c.icon}
                size={34}
                color={c.ok ? "#0A0A0A" : theme.colors.gold2}
                stroke={2.4}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 38,
                  color: theme.colors.text,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 26,
                  color: theme.colors.muted,
                }}
              >
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- CTA
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const num = spring({
    frame: frame - (CTA + 22),
    fps,
    config: theme.spring.bouncy,
  });
  const btn = spring({
    frame: frame - (CTA + 44),
    fps,
    config: theme.spring.snappy,
  });
  const sub = useEntrance(CTA + 32, "smooth");
  const url = useEntrance(CTA + 54, "smooth");
  const ring = ((frame - CTA) % 45) / 45;
  if (frame < CTA) return null;
  return (
    <AbsoluteFill>
      <Head top={440}>
        <WordReveal
          words={["Don’t", "believe", "it?"]}
          delay={CTA + 4}
          per={3}
          size={88}
        />
        <WordReveal
          words={[
            { text: "Call", tone: "gold" },
            { text: "it.", tone: "gold" },
          ]}
          delay={CTA + 12}
          per={3}
          size={112}
        />
      </Head>
      <div
        style={{
          position: "absolute",
          left: 120,
          width: 840,
          top: 716,
          height: 124,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          background: theme.colors.surface2,
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 66,
          letterSpacing: "-0.01em",
          color: theme.colors.text,
          opacity: interpolate(num, [0, 0.4], [0, 1], clamp),
          scale: interpolate(num, [0, 1], [0.8, 1]),
        }}
      >
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${theme.colors.gold2}`,
              scale: 1 + ring * 0.8,
              opacity: 1 - ring,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: theme.gradients.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="handset" size={34} color="#0A0A0A" stroke={2.4} />
          </div>
        </div>
        +1 365 360 3545
        <Tap x={420} y={62} at={CTA + 80} size={100} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 866,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: 32,
          color: theme.colors.muted,
          opacity: sub,
        }}
      >
        Sol, our AI receptionist, answers our own line. 24/7.
      </div>
      <div
        style={{
          position: "absolute",
          left: 170,
          width: 740,
          top: 948,
          height: 108,
          borderRadius: 99,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: theme.gradients.gold,
          fontFamily: theme.fonts.display,
          fontWeight: 800,
          fontSize: 44,
          color: "#0A0A0A",
          opacity: interpolate(btn, [0, 0.4], [0, 1], clamp),
          scale: interpolate(btn, [0, 1], [0.85, 1]),
        }}
      >
        Try it on your business
        <Icon name="arrow" size={42} color="#0A0A0A" stroke={2.8} />
        <LightSweep start={CTA + 70} duration={24} width={130} opacity={0.7} />
        <LightSweep start={CTA + 130} duration={24} width={130} opacity={0.7} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 1082,
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: theme.colors.text,
          opacity: url,
        }}
      >
        esolutify.com/ai-voice-receptionist
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame: frame - CTA, fps, config: theme.spring.bouncy });
  const w = interpolate(grow, [0, 1], [200, 330]);
  return (
    <Img
      src={staticFile("brand/logo.png")}
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: interpolate(grow, [0, 1], [290, 300]),
        width: w,
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.6))",
      }}
    />
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [ANSWER - 5, ANSWER, ANSWER + 7], [0, 1, 0], {
    ...clamp,
    easing: theme.ease.soft,
  });
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 55%, rgba(255,240,205,0.95), rgba(232,184,75,0.5) 40%, rgba(10,10,10,0) 80%)",
        opacity: o,
      }}
    />
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["ring", 0, 0.55],
  ["ring", 36, 0.5],
  ["ring", 72, 0.45],
  ["thud", 100, 0.5],
  ["whoosh-soft", 94, 0.3],
  ["whoosh", 172, 0.5],
  ["ping", 186, 0.45],
  ...LINES.map(
    (l): Cue => ["blip", l.at - 2, 0.22, l.who === "CALLER" ? 0.85 : 1.15],
  ),
  ["chime", RESULTS - 2, 0.55],
  ["pop", RESULTS + 6, 0.45],
  ["pop", RESULTS + 14, 0.45, 1.1],
  ["shimmer", CTA, 0.35],
  ["pop", CTA + 20, 0.5],
  ["ring", CTA + 76, 0.3],
];

export const VoiceReel: React.FC<{ readonly safeZones?: boolean }> = ({
  safeZones = false,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
    <Stage>
      <PhoneLayer />
      <ResultCards />
      {/* the platform caption/UI lands on dark */}
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
      <Logo />
      <Copy />
      <Cta />
      <Flash />
    </Stage>
    <Audio src={staticFile("audio/voice-music-24.wav")} volume={0.8} />
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

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

// AI Chatbots & Lead Automation — 9:16 Reel / Short, 24 s @ 30 fps.
// Story (esolutify.com/ai-chatbots-automation, its "without / with a
// system" example): someone DMs you at 9:42 pm → 14 h 33 min to the first
// reply, "we went with someone else" → rewind → the AI agent answers in
// 5 seconds and books Tue 10:30 am → 7 channels, one agent → 0 leads
// forgotten → "Hi, I'm Sol. I'm not a chatbot."
// 112.5 BPM (16 frames a beat, 64 a bar): the band drops out for the tape
// rewind and the answer lands on the drop (f192). Copy stays in y 290–1160.

export const BOT_DURATION = 720;
const REWIND = 168;
const DROP = 192;
const CHANNELS = 320;
const PROOF = 448;
const CTA = 576;
const PHONE_W = 460;
const PHONE_LEFT = 540 - (PHONE_W + Math.round(PHONE_W * 0.035) * 2) / 2;
const PHONE_TOP = 720;
const VH = phoneViewportHeight(PHONE_W);
const SCREEN_BG = "#0F0F10";

// without a system (the page's timeline)
const WAIT_FROM = 40;
const WAIT_TO = 128;
const WAIT_MIN = 14 * 60 + 33;
const LATE_AT = 134;
const LOST_AT = 148;
// with the agent
const AI_AT = DROP + 14;
const PICK_AT = DROP + 48;
const BOOK_AT = DROP + 66;

const clock = (minutes: number) => {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const START = 21 * 60 + 42; // 9:42 pm

// ---------------------------------------------------------------- text layer
const Copy: React.FC = () => (
  <AbsoluteFill>
    <Window from={-10} until={90}>
      <Head>
        <WordReveal
          words={["Someone", "DMs", "you"]}
          delay={-12}
          per={3}
          size={96}
        />
        <WordReveal
          words={[
            "at",
            { text: "9:42", tone: "gold" },
            { text: "pm.", tone: "gold" },
          ]}
          delay={-4}
          per={3}
          size={110}
        />
      </Head>
    </Window>
    <Window from={96} until={REWIND - 4}>
      <Head>
        <WordReveal
          words={[
            { text: "14", tone: "red" },
            { text: "h", tone: "red" },
            { text: "33", tone: "red" },
            { text: "min", tone: "red" },
          ]}
          delay={98}
          per={3}
          size={112}
        />
        <WordReveal
          words={["to", "your", "first", "reply."]}
          delay={106}
          per={3}
          size={80}
        />
      </Head>
      <Sub text="“We went with someone else.”" at={LOST_AT} />
    </Window>
    <Window from={REWIND} until={DROP - 6}>
      <Head top={430}>
        <WordReveal
          words={["Now,", { text: "rewind.", tone: "gold" }]}
          delay={REWIND}
          per={4}
          size={112}
        />
      </Head>
    </Window>
    <Window from={DROP} until={CHANNELS - 6}>
      <Head>
        <WordReveal words={["Answered", "in"]} delay={DROP} per={3} size={96} />
        <WordReveal
          words={[
            { text: "5", tone: "gold" },
            { text: "seconds.", tone: "gold", underline: true },
          ]}
          delay={DROP + 6}
          per={3}
          size={116}
        />
      </Head>
      <Sub text="Same lead. Same night. Booked." at={BOOK_AT} />
    </Window>
    <Window from={CHANNELS} until={PROOF - 6}>
      <Head>
        <WordReveal
          words={["7", "channels."]}
          delay={CHANNELS}
          per={4}
          size={100}
        />
        <WordReveal
          words={[
            { text: "One", tone: "gold" },
            { text: "AI", tone: "gold" },
            { text: "agent.", tone: "gold" },
          ]}
          delay={CHANNELS + 8}
          per={3}
          size={100}
        />
      </Head>
      <Sub text="Every lead answered in seconds." at={CHANNELS + 20} />
    </Window>
    <Window from={PROOF} until={CTA - 6}>
      <Head top={380}>
        <WordReveal
          words={[
            { text: "0", tone: "gold" },
            { text: "leads", tone: "gold" },
          ]}
          delay={PROOF}
          per={4}
          size={150}
        />
        <WordReveal words={["forgotten."]} delay={PROOF + 8} size={96} />
      </Head>
    </Window>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- the chat
type Tone = "lead" | "late" | "lost" | "ai";

const Bubble: React.FC<{
  f: number;
  at: number;
  tone: Tone;
  text: string;
  ts?: string;
  badge?: string;
}> = ({ f, at, tone, text, ts, badge }) => {
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const p = spring({ frame: f - at, fps, config: theme.spring.snappy });
  const right = tone === "late" || tone === "ai";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: right ? "flex-end" : "flex-start",
        gap: 6,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [0.85, 1]),
        transformOrigin: right ? "right bottom" : "left bottom",
      }}
    >
      {ts ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: tone === "ai" ? theme.colors.gold2 : theme.colors.dim,
          }}
        >
          {tone === "ai" ? (
            <Icon
              name="sparkle"
              size={15}
              color={theme.colors.gold2}
              stroke={2.2}
            />
          ) : null}
          {ts}
        </div>
      ) : null}
      <div
        style={{
          maxWidth: 340,
          padding: "14px 18px",
          borderRadius: 24,
          borderBottomLeftRadius: right ? 24 : 8,
          borderBottomRightRadius: right ? 8 : 24,
          fontSize: 22,
          lineHeight: 1.32,
          fontWeight: tone === "ai" ? 600 : 500,
          background:
            tone === "ai"
              ? theme.gradients.gold
              : tone === "late"
                ? "#2B2B2B"
                : theme.colors.surface3,
          color:
            tone === "ai"
              ? "#0A0A0A"
              : tone === "late"
                ? theme.colors.muted
                : theme.colors.text,
          border: tone === "lost" ? `2px solid ${theme.colors.red}` : "none",
          boxShadow: tone === "ai" ? `0 0 30px ${theme.colors.glow}` : "none",
        }}
      >
        {text}
      </div>
      {badge ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 99,
            background: theme.colors.okSoft,
            border: "1px solid rgba(60,207,142,0.5)",
            fontSize: 15,
            fontWeight: 700,
            color: theme.colors.ok,
          }}
        >
          <Icon name="zap" size={15} color={theme.colors.ok} stroke={2.4} />
          {badge}
        </div>
      ) : null}
    </div>
  );
};

const Typing: React.FC<{ f: number; from: number; to: number }> = ({
  f,
  from,
  to,
}) => {
  if (f < from || f >= to) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          display: "flex",
          gap: 7,
          padding: "16px 20px",
          borderRadius: 24,
          borderBottomRightRadius: 8,
          background: theme.colors.goldSoft,
          border: `1px solid ${theme.colors.goldLine}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: theme.colors.gold2,
              translate: `0px ${-5 * Math.max(0, Math.sin((f - from) * 0.5 - i))}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{ time: string; agent?: boolean }> = ({
  time,
  agent,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 92,
      borderBottom: `1px solid ${theme.colors.line}`,
      background: "#141415",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 16,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: theme.colors.surface3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="user" size={30} color={theme.colors.muted} stroke={1.8} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 14,
        fontFamily: theme.fonts.display,
        fontWeight: 800,
        fontSize: 24,
      }}
    >
      New enquiry
    </div>
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 50,
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 17,
        color: agent ? theme.colors.gold2 : theme.colors.muted,
      }}
    >
      <Icon
        name={agent ? "sparkle" : "instagram"}
        size={18}
        color={agent ? theme.colors.gold2 : theme.colors.muted}
        stroke={2}
      />
      {agent ? "AI agent replying" : "Instagram DM"}
    </div>
    <div
      style={{
        position: "absolute",
        right: 18,
        top: 26,
        padding: "6px 12px",
        borderRadius: 12,
        background: theme.colors.surface2,
        border: `1px solid ${theme.colors.line2}`,
        fontSize: 18,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {time}
    </div>
  </div>
);

// Without a system. `f` can run backwards (the rewind).
const ChatWithout: React.FC<{ f: number }> = ({ f }) => {
  const p = ease(f, WAIT_FROM, WAIT_TO, theme.ease.inOut);
  const waited = p * WAIT_MIN;
  const late = f >= LATE_AT;
  const grey = ease(f, LOST_AT + 2, LOST_AT + 14, theme.ease.inOut);
  const waitIn = ease(f, 30, 38);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        background: SCREEN_BG,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        filter: grey > 0 ? `grayscale(${grey * 0.85})` : undefined,
      }}
    >
      <ChatHeader time={clock(START + (late ? WAIT_MIN : waited))} />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 120,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Bubble
          f={f}
          at={6}
          tone="lead"
          text="Hi, do you have anything this week?"
          ts="9:42 PM"
        />
        {f >= 30 ? (
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 99,
              background: "rgba(237,28,36,0.12)",
              border: "1px solid rgba(237,28,36,0.45)",
              fontSize: 18,
              fontWeight: 700,
              color: "#FF6B6B",
              fontVariantNumeric: "tabular-nums",
              opacity: waitIn,
            }}
          >
            <Icon name="clock" size={18} color="#FF6B6B" stroke={2.2} />
            No reply · {Math.floor(waited / 60)} h{" "}
            {String(Math.floor(waited % 60)).padStart(2, "0")} min
          </div>
        ) : null}
        <Bubble
          f={f}
          at={LATE_AT}
          tone="late"
          text="Hi! Sorry for the slow reply. Still looking?"
          ts="12:15 PM · next day"
        />
        <Bubble
          f={f}
          at={LOST_AT}
          tone="lost"
          text="We went with someone else."
        />
      </div>
    </div>
  );
};

// With the agent: the same enquiry, answered in 5 seconds and booked.
const ChatWith: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const booked = spring({
    frame: f - (BOOK_AT + 14),
    fps,
    config: theme.spring.bouncy,
  });
  const time = f >= BOOK_AT ? "9:46 PM" : f >= PICK_AT ? "9:44 PM" : "9:42 PM";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        background: `radial-gradient(380px 300px at 50% 0%, rgba(200,151,58,0.12), transparent 70%), ${SCREEN_BG}`,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      <ChatHeader time={time} agent />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 120,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Bubble
          f={f}
          at={-100}
          tone="lead"
          text="Hi, do you have anything this week?"
          ts="9:42:00 PM"
        />
        <Typing f={f} from={DROP + 2} to={AI_AT} />
        <Bubble
          f={f}
          at={AI_AT}
          tone="ai"
          text="We do! Tuesday at 10:30 am or 2:15 pm. Would either work?"
          ts="9:42:05 PM · AI agent"
          badge="Replied in 5 seconds"
        />
        <Bubble
          f={f}
          at={PICK_AT}
          tone="lead"
          text="10:30 works"
          ts="9:44 PM"
        />
        <Bubble
          f={f}
          at={BOOK_AT}
          tone="ai"
          text="Booked: Tue 10:30 am. I’ll remind you the day before."
          ts="9:46 PM · AI agent"
        />
        {f >= BOOK_AT + 14 ? (
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              borderRadius: 99,
              background: theme.colors.ok,
              fontSize: 20,
              fontWeight: 800,
              color: "#0A0A0A",
              scale: booked,
              boxShadow: "0 0 40px rgba(60,207,142,0.45)",
            }}
          >
            <Icon name="calendarCheck" size={22} color="#0A0A0A" stroke={2.4} />
            Booked · Tue 10:30 am
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the inbox
type Row = {
  icon: IconName;
  color: string;
  channel: string;
  text: string;
  secs: number;
};
const ROWS: Row[] = [
  {
    icon: "whatsapp",
    color: "#25D366",
    channel: "WhatsApp",
    text: "Saw your reel — are you taking new clients?",
    secs: 3,
  },
  {
    icon: "instagram",
    color: "#E1306C",
    channel: "Instagram DM",
    text: "Is the 2-bed on King St still available?",
    secs: 4,
  },
  {
    icon: "messenger",
    color: "#0A84FF",
    channel: "Messenger",
    text: "Table for 8 on Friday, 7 pm?",
    secs: 2,
  },
  {
    icon: "sms",
    color: "#3CCF8E",
    channel: "SMS",
    text: "Do you take new patients?",
    secs: 5,
  },
  {
    icon: "globe",
    color: theme.colors.gold2,
    channel: "Website chat",
    text: "Am I eligible for Express Entry?",
    secs: 3,
  },
  {
    icon: "phoneMissed",
    color: "#FF6B6B",
    channel: "Missed call · texted back",
    text: "What’s the job and the address?",
    secs: 4,
  },
  {
    icon: "mail",
    color: "#A39E96",
    channel: "Email",
    text: "Do you still have the white RAV4?",
    secs: 6,
  },
];
const rowAt = (i: number) => CHANNELS + 6 + i * 16;

const Inbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        background: SCREEN_BG,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: 34,
          }}
        >
          Inbox
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 99,
            background: theme.colors.goldSoft,
            border: `1px solid ${theme.colors.goldLine}`,
            fontSize: 16,
            fontWeight: 700,
            color: theme.colors.gold2,
          }}
        >
          <Icon
            name="sparkle"
            size={16}
            color={theme.colors.gold2}
            stroke={2.2}
          />
          AI agent on · all channels
        </div>
      </div>
      {ROWS.map((r, i) => {
        const p = spring({
          frame: frame - rowAt(i),
          fps,
          config: theme.spring.snappy,
        });
        const replied = spring({
          frame: frame - (rowAt(i) + 8),
          fps,
          config: theme.spring.bouncy,
        });
        if (frame < rowAt(i)) return null;
        return (
          <div
            key={r.channel}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 86 + i * 94,
              height: 84,
              borderRadius: 18,
              background: theme.colors.surface2,
              border: `1px solid ${theme.colors.line}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "0 14px",
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `${interpolate(p, [0, 1], [60, 0])}px 0px`,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
                borderRadius: "50%",
                background: `${r.color}26`,
                border: `1.5px solid ${r.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={r.icon} size={26} color={r.color} stroke={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: theme.colors.muted,
                }}
              >
                {r.channel}
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.text}
              </div>
            </div>
            {frame >= rowAt(i) + 8 ? (
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 99,
                  background: theme.colors.ok,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0A0A0A",
                  scale: replied,
                }}
              >
                <Icon name="check" size={14} color="#0A0A0A" stroke={3} />
                {r.secs}s
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- the phone
const RewindFx: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < REWIND || frame >= DROP) return null;
  const t = frame - REWIND;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        height: VH,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)",
        }}
      />
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ((t * 47 + k * 310) % (VH + 60)) - 30,
            height: 22 + 10 * k,
            background: "rgba(220,174,85,0.16)",
            filter: "blur(2px)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 470,
          translate: "-50% -50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(10,10,10,0.75)",
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          opacity: t % 8 < 6 ? 1 : 0.6,
        }}
      >
        <svg width={86} height={56} viewBox="0 0 86 56">
          <path d="M42 0 L42 56 L0 28 Z" fill={theme.colors.gold2} />
          <path d="M86 0 L86 56 L44 28 Z" fill={theme.colors.gold2} />
        </svg>
      </div>
    </div>
  );
};

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame + 8, fps, config: theme.spring.smooth });
  const sink = ease(frame, CTA, CTA + 18, theme.ease.inOut);
  const dim = 1 - 0.5 * ease(frame, PROOF, PROOF + 10) - 0.15 * sink;
  const push = ease(frame, CHANNELS - 4, CHANNELS + 10, theme.ease.inOut);
  // the rewind plays "without" backwards, from the lost lead to 9:42 pm
  const rewinding = frame >= REWIND && frame < DROP;
  const back = interpolate(frame, [REWIND, DROP - 2], [LOST_AT + 14, 4], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const shake = rewinding ? Math.sin(frame * 3.1) * 3 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE_LEFT,
        top: PHONE_TOP + interpolate(enter, [0, 1], [220, 0]) + sink * 520,
        opacity: interpolate(enter, [0, 0.35], [0, 1], clamp),
        translate: `${shake}px 0px`,
        filter:
          dim < 0.99 ? `brightness(${dim}) blur(${4 * sink}px)` : undefined,
      }}
    >
      <PhoneShell
        width={PHONE_W}
        glow={frame >= DROP ? 0.5 : 0.12}
        statusBg="#141415"
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
            {frame < REWIND ? (
              <ChatWithout f={frame} />
            ) : rewinding ? (
              <ChatWithout f={back} />
            ) : (
              <ChatWith f={frame} />
            )}
            <RewindFx />
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
            <Inbox />
          </div>
        ) : null}
      </PhoneShell>
    </div>
  );
};

// ---------------------------------------------------------------- CTA
const QUESTION = "Can we talk Thursday?";

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const field = spring({
    frame: frame - (CTA + 20),
    fps,
    config: theme.spring.bouncy,
  });
  const sub = useEntrance(CTA + 34, "smooth");
  const typed = Math.max(
    0,
    Math.min(QUESTION.length, Math.floor((frame - (CTA + 26)) / 1.5)),
  );
  if (frame < CTA) return null;
  return (
    <AbsoluteFill>
      <Head top={440}>
        <WordReveal
          words={["Hi,", "I’m", "Sol."]}
          delay={CTA + 4}
          per={3}
          size={92}
        />
        <WordReveal
          words={[
            { text: "I’m", tone: "gold" },
            { text: "not", tone: "gold" },
            { text: "a", tone: "gold" },
            { text: "chatbot.", tone: "gold" },
          ]}
          delay={CTA + 12}
          per={3}
          size={88}
        />
      </Head>
      <div
        style={{
          position: "absolute",
          left: 120,
          width: 840,
          top: 716,
          height: 116,
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 30px",
          background: theme.colors.surface2,
          border: `2px solid ${theme.colors.gold2}`,
          boxShadow: theme.shadow.goldGlow,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 44,
          color: theme.colors.text,
          opacity: interpolate(field, [0, 0.4], [0, 1], clamp),
          scale: interpolate(field, [0, 1], [0.8, 1]),
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            flexShrink: 0,
            background: theme.gradients.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="sparkle" size={34} color="#0A0A0A" stroke={2.4} />
        </div>
        <span>{QUESTION.slice(0, typed)}</span>
        {typed < QUESTION.length || frame % 16 < 8 ? (
          <span
            style={{
              width: 3,
              height: 50,
              marginLeft: -18,
              background: theme.colors.gold2,
            }}
          />
        ) : null}
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
        Chat with it, talk to it, or call +1 365 360 3545.
      </div>
      <CtaButton label="Try it on your business" at={CTA + 44}>
        <Tap x={380} y={54} at={CTA + 86} size={100} />
      </CtaButton>
      <UrlLine url="esolutify.com/ai-chatbots-automation" at={CTA + 54} />
    </AbsoluteFill>
  );
};

type Cue = [SfxName, number, number, number?];
const CUES: Cue[] = [
  ["ping", 4, 0.45],
  ["blip", LATE_AT - 2, 0.3, 0.8],
  ["thud", LOST_AT - 2, 0.5],
  ["rewind", REWIND, 0.6],
  ["typing", DROP + 2, 0.3],
  ["ping", AI_AT - 2, 0.45, 1.1],
  ["blip", PICK_AT - 2, 0.3, 0.9],
  ["ping", BOOK_AT - 2, 0.4, 1.2],
  ["chime", BOOK_AT + 12, 0.45],
  ["whoosh-soft", CHANNELS - 6, 0.35],
  ...ROWS.map((_, i): Cue => ["pop", rowAt(i) - 2, 0.3, 1 + (i % 4) * 0.1]),
  ["whoosh-soft", PROOF + 4, 0.3],
  ["pop", PROOF + 20, 0.4],
  ["pop", PROOF + 29, 0.4, 1.1],
  ["pop", PROOF + 38, 0.4, 1.2],
  ["shimmer", CTA, 0.35],
  ["typing", CTA + 26, 0.45],
  ["pop", CTA + 84, 0.45, 1.3],
];

export const BotReel: React.FC<{ readonly safeZones?: boolean }> = ({
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
            icon: "zap",
            title: "Seconds to first reply",
            sub: "On the channel they used",
          },
          {
            icon: "calendarCheck",
            title: "Booked into your calendar",
            sub: "24/7, with confirmations & reminders",
          },
          {
            icon: "chat",
            title: "Followed up until they book",
            sub: "Day 1 · 3 · 7… until a yes or a no",
          },
        ]}
      />
      <BottomFade />
      <Logo cta={CTA} />
      <Copy />
      <Cta />
      <Flash at={DROP} />
    </Stage>
    <Audio src={staticFile("audio/bot-music-24.wav")} volume={0.8} />
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

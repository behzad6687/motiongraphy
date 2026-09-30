import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Icon, type IconName } from "../components/Icons";
import {
  Eyebrow,
  Rise,
  SceneExit,
  WordReveal,
  useEntrance,
} from "../components/Motion";
import { Sfx } from "../components/Sfx";
import { clamp, theme } from "../theme";

// Frame 5 — See it in action (255f). The site's own clinic example.
type Msg = { from: "ai" | "lead"; text: string; at: number; typing?: number };

const MSGS: Msg[] = [
  {
    from: "ai",
    text: "Hi! This is the assistant at Your Clinic — sorry we missed your call. How can we help?",
    at: 46,
    typing: 30,
  },
  {
    from: "lead",
    text: "Do you take new patients? I’ve got a toothache",
    at: 84,
  },
  {
    from: "ai",
    text: "We do. I can see you Tue 10:30 am or Wed 2:15 pm — which works?",
    at: 116,
    typing: 102,
  },
  { from: "lead", text: "Tuesday, please.", at: 146 },
];
const BOOKED_AT = 168;

const CHANNELS: { name: string; icon: IconName }[] = [
  { name: "WhatsApp", icon: "whatsapp" },
  { name: "Instagram DMs", icon: "instagram" },
  { name: "Messenger", icon: "messenger" },
  { name: "SMS", icon: "sms" },
  { name: "Website chat", icon: "globe" },
  { name: "Missed-call text-back", icon: "phoneMissed" },
  { name: "Email", icon: "mail" },
];
const CHANNEL_AT = 150;

const TypingDots: React.FC<{ at: number; until: number }> = ({ at, until }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= until) return null;
  const inP = interpolate(frame, [at, at + 6], [0, 1], {
    ...clamp,
    easing: theme.ease.out,
  });
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 8,
        padding: "18px 22px",
        borderRadius: "22px 22px 22px 6px",
        background: "rgba(200,151,58,0.12)",
        border: `1px solid ${theme.colors.goldLine}`,
        opacity: inP,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: theme.colors.gold2,
            opacity:
              0.35 + 0.65 * Math.max(0, Math.sin((frame - at) / 3 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};

const Bubble: React.FC<{ msg: Msg }> = ({ msg }) => {
  const p = useEntrance(msg.at, "snappy");
  const frame = useCurrentFrame();
  if (frame < msg.at) return null;
  const ai = msg.from === "ai";
  return (
    <div
      style={{
        alignSelf: ai ? "flex-start" : "flex-end",
        maxWidth: 360,
        padding: "16px 20px",
        borderRadius: ai ? "22px 22px 22px 6px" : "22px 22px 6px 22px",
        background: ai ? "rgba(200,151,58,0.12)" : theme.colors.surface3,
        border: `1px solid ${ai ? theme.colors.goldLine : theme.colors.line2}`,
        fontFamily: theme.fonts.body,
        fontSize: 22,
        lineHeight: 1.35,
        color: theme.colors.text,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [24, 0])}px`,
        scale: interpolate(p, [0, 1], [0.9, 1]),
        transformOrigin: ai ? "left bottom" : "right bottom",
      }}
    >
      {msg.text}
    </div>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = useEntrance(0, "smooth");
  const tilt = interpolate(frame, [0, 250], [16, 6], {
    ...clamp,
    easing: theme.ease.soft,
  });
  const chip = useEntrance(16, "snappy");
  const booked = useEntrance(BOOKED_AT, "bouncy");
  const scroll = interpolate(frame, [140, 170], [0, -70], {
    ...clamp,
    easing: theme.ease.inOut,
  });
  const replied = useEntrance(58, "snappy");

  return (
    <div
      style={{
        position: "absolute",
        left: 250,
        top: 90,
        perspective: 1800,
      }}
    >
      <div
        style={{
          width: 480,
          height: 900,
          borderRadius: 64,
          padding: 14,
          background: "linear-gradient(160deg, #2A2A2A, #121212)",
          boxShadow: `0 60px 120px -30px rgba(0,0,0,0.85), 0 0 0 1px ${theme.colors.line2}, 0 0 80px rgba(200,151,58,0.10)`,
          rotate: `y ${tilt}deg`,
          opacity: interpolate(inP, [0, 0.4], [0, 1], clamp),
          translate: `0px ${interpolate(inP, [0, 1], [140, 0])}px`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 52,
            overflow: "hidden",
            background: "#0D0D0D",
          }}
        >
          {/* header */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: 130,
              padding: "44px 26px 0",
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "#151515",
              borderBottom: `1px solid ${theme.colors.line}`,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: theme.gradients.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="bot" size={32} color="#0A0A0A" stroke={2} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 26,
                  color: theme.colors.text,
                }}
              >
                Your Clinic
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: theme.fonts.body,
                  fontSize: 18,
                  color: theme.colors.muted,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: theme.colors.ok,
                  }}
                />
                AI assistant · online 24/7
              </div>
            </div>
          </div>

          {/* conversation */}
          <div
            style={{
              position: "absolute",
              top: 131,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              maskImage: "linear-gradient(180deg, transparent 0px, black 26px)",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0px, black 26px)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 22,
                right: 22,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                translate: `0px ${scroll}px`,
              }}
            >
              <div
                style={{
                  alignSelf: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  borderRadius: 99,
                  background: theme.colors.redSoft,
                  border: `1px solid rgba(237,28,36,0.35)`,
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: "0.14em",
                  color: "#FF8A8F",
                  opacity: chip,
                  scale: interpolate(chip, [0, 1], [0.8, 1]),
                }}
              >
                <Icon name="phoneMissed" size={20} color="#FF8A8F" stroke={2} />
                MISSED CALL · 7:42 PM
              </div>
              <TypingDots at={MSGS[0].typing ?? 0} until={MSGS[0].at} />
              <Bubble msg={MSGS[0]} />
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: -6,
                  fontFamily: theme.fonts.body,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: theme.colors.gold2,
                  opacity: frame >= 58 ? replied : 0,
                }}
              >
                <Icon
                  name="zap"
                  size={16}
                  color={theme.colors.gold2}
                  stroke={2}
                />
                REPLIED IN 5 SEC
              </div>
              <Bubble msg={MSGS[1]} />
              <TypingDots at={MSGS[2].typing ?? 0} until={MSGS[2].at} />
              <Bubble msg={MSGS[2]} />
              <Bubble msg={MSGS[3]} />
            </div>
          </div>

          {/* booking confirmation */}
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: 34,
              padding: "22px 24px",
              borderRadius: 24,
              background: "linear-gradient(180deg, #17221D, #121A16)",
              border: `1px solid rgba(60,207,142,0.45)`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(60,207,142,0.18)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: interpolate(booked, [0, 0.4], [0, 1], clamp),
              translate: `0px ${interpolate(booked, [0, 1], [60, 0])}px`,
              scale: interpolate(booked, [0, 1], [0.9, 1]),
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.colors.ok,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={32} color="#0A0A0A" stroke={3} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 800,
                  fontSize: 25,
                  color: theme.colors.text,
                  whiteSpace: "nowrap",
                }}
              >
                Booked · Tue 10:30 am
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 17,
                  color: theme.colors.muted,
                  marginTop: 2,
                }}
              >
                In your calendar · reminder set
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const S05InAction: React.FC = () => {
  return (
    <SceneExit frames={12}>
      <Phone />

      <AbsoluteFill style={{ left: 860, top: 280, width: 980 }}>
        <Eyebrow text="See it in action" delay={6} align="left" />
        <div style={{ height: 26 }} />
        <WordReveal
          words={["Answered", "in", { text: "seconds.", tone: "gold" }]}
          delay={12}
          per={4}
          size={84}
          align="flex-start"
        />
        <WordReveal
          words={["Booked", "24/7."]}
          delay={26}
          per={4}
          size={84}
          align="flex-start"
        />
        <Rise delay={40} y={20} style={{ marginTop: 26 }}>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 30,
              lineHeight: 1.45,
              color: theme.colors.muted,
              maxWidth: 780,
            }}
          >
            Trained on your business, your AI agent replies on the same channel,
            asks the questions that matter and books into your real calendar.
          </div>
        </Rise>

        <Rise delay={CHANNEL_AT - 8} y={14} style={{ marginTop: 52 }}>
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: "0.2em",
              color: theme.colors.dim,
              marginBottom: 18,
            }}
          >
            ONE AI AGENT BEHIND EVERY CHANNEL
          </div>
        </Rise>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 860 }}
        >
          {CHANNELS.map((c, i) => (
            <Rise
              key={c.name}
              delay={CHANNEL_AT + i * 4}
              y={18}
              from={0.85}
              config="snappy"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 22px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${theme.colors.line2}`,
                  fontFamily: theme.fonts.body,
                  fontWeight: 500,
                  fontSize: 24,
                  color: theme.colors.text,
                }}
              >
                <Icon name={c.icon} size={26} color={theme.colors.gold2} />
                {c.name}
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>

      <Sfx name="whoosh-soft" at={0} volume={0.4} />
      <Sfx name="ping" at={14} volume={0.5} rate={0.8} />
      <Sfx name="typing" at={30} volume={0.5} />
      {MSGS.map((m) => (
        <Sfx
          key={m.at}
          name="pop"
          at={m.at - 2}
          volume={0.5}
          rate={m.from === "ai" ? 1.15 : 0.9}
        />
      ))}
      <Sfx name="typing" at={102} volume={0.45} />
      {CHANNELS.map((c, i) => (
        <Sfx
          key={c.name}
          name="tick"
          at={CHANNEL_AT + i * 4 - 2}
          volume={0.3}
        />
      ))}
      <Sfx name="chime" at={BOOKED_AT - 3} volume={0.65} />
    </SceneExit>
  );
};

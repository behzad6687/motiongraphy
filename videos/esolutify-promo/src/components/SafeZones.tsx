import React from "react";
import { AbsoluteFill } from "remotion";

// Review overlay for 1080×1920 Meta placements (never rendered in the ad itself).
// Red = covered by Reels UI (top 14%, bottom 35%, right-side action icons).
// Amber lines = Stories top/bottom 14%.
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 270,
        background: "rgba(255,0,0,0.22)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 670,
        background: "rgba(255,0,0,0.22)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 900,
        width: 120,
        bottom: 670,
        background: "rgba(255,0,0,0.18)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 250,
        height: 3,
        background: "rgba(255,190,0,0.9)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 250,
        height: 3,
        background: "rgba(255,190,0,0.9)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 65,
        top: 270,
        bottom: 670,
        width: 2,
        background: "rgba(0,255,160,0.8)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 120,
        top: 270,
        bottom: 670,
        width: 2,
        background: "rgba(0,255,160,0.8)",
      }}
    />
  </AbsoluteFill>
);

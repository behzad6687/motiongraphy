"""Music bed + tape-rewind SFX for the AI-chatbot reel: a fourth, different
track (brand/voice: A-minor four-on-the-floor; app: D-major future-pop;
SEO: swung boom-bap).

    python3 scripts/gen_bot_music.py

Writes public/audio/bot-music-24.wav and public/audio/sfx/rewind.wav.

112.5 BPM (16 frames per beat at 30 fps, one bar = 2.133 s = 64 frames),
E minor, i-VI-iv-V (Em C Am B), retro synthwave: 16th octave bass, gated
reverb snare on 2 and 4, arpeggiated pluck, warm saw pad. Locked to the reel:
  0-1  the enquiry    clock ticks, dark pad, quarter-note pulse
  2    the wait       ticks double, riser; the band drops out at beat 3
                      for the tape rewind (SFX in the reel)
  3    6.4 s          DROP: answered in 5 seconds
  3-8  groove         channels, proof (tom fill into bar 9)
  9-11 CTA            pad + arp, final Em(add9) rings out to 24 s
"""

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, saw, sweep_lp, t_axis, write_wav

BPM = 112.5
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
TOTAL = 24.0
DROP, OUTRO = 3, 9
BARS = int(np.ceil(TOTAL / BAR))
RNG = np.random.default_rng(53)
g.RNG = np.random.default_rng(59)

PROG = [
    ([52, 55, 59, 64], 40, [64, 67, 71, 76]),  # Em
    ([52, 55, 60, 64], 36, [64, 67, 72, 76]),  # C
    ([52, 57, 60, 64], 33, [64, 69, 72, 76]),  # Am
    ([51, 54, 59, 63], 35, [63, 66, 71, 75]),  # B
]


def square(f, t, width=0.5):
    return np.where((f * t) % 1.0 < width, 1.0, -1.0)


def pad(notes, dur, bright=2200):
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for n in notes:
        for k, d in enumerate((-0.007, 0, 0.007)):
            ph = RNG.random()
            l += saw(midi(n) * (1 + d), t, ph)
            r += saw(midi(n) * (1 - d), t, ph + 0.4)
    env = adsr(len(t), 0.25, 0.4, 0.8, 0.5)
    vib = 1 + 0.002 * np.sin(2 * np.pi * 0.3 * t)
    return np.stack([lp(l * vib, bright), lp(r, bright)]) * env / (len(notes) * 3)


def pluck(n, dur=0.22):
    t = t_axis(dur)
    f = midi(n)
    sig = square(f, t, 0.3) * 0.6 + saw(f * 1.005, t) * 0.4
    return lp(sig, 3800) * np.exp(-t / 0.07)


def obass(n, dur):
    """Octave-bass note: saw through a plucky low-pass."""
    t = t_axis(dur)
    f = midi(n)
    sig = saw(f, t) + 0.5 * square(f * 0.5, t)
    fenv = np.exp(-t / 0.04)  # filter "pluck": bright attack, dark tail
    out = lp(sig, 1900) * fenv + lp(sig, 320) * (1 - fenv)
    return out * adsr(len(t), 0.002, 0.05, 0.8, 0.02)


def gated_snare():
    t = t_axis(0.5)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.06)
    nse = bp(RNG.standard_normal(len(t)), 900, 9000) * np.exp(-t / 0.2)
    wet = reverb(body + nse, 0.65)
    gate = np.where(t < 0.24, 1.0, np.exp(-(t - 0.24) / 0.012))
    return wet * gate


def tom(f0, dur=0.35):
    t = t_axis(dur)
    f = f0 * (1 + 0.6 * np.exp(-t / 0.04))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def tick(accent=False):
    t = t_axis(0.05)
    return (np.sin(2 * np.pi * (2400 if accent else 1900) * t) * 0.6 + hp(RNG.standard_normal(len(t)), 5000) * 0.3) * np.exp(-t / 0.007)


def music():
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    pads = np.zeros((2, n))
    arps = np.zeros((2, n))
    fx = np.zeros((2, n))

    for b in range(BARS):
        t0 = b * BAR
        notes, root, tones = PROG[b % 4]
        groove = DROP <= b < OUTRO
        last = b == BARS - 1
        if b >= OUTRO and b == BARS - 2:
            notes, root, tones = PROG[0][0] + [66], 40, PROG[0][2]

        # pads
        if b < DROP:
            if b == 2:
                place(pads, pad(notes, BAR * 0.5, 900), t0, 0.7)
            else:
                place(pads, pad(notes, BAR + 0.3, 700 + 300 * b), t0, 0.8)
        elif groove:
            place(pads, pad(notes, BAR + 0.3, 2600), t0, 0.6)
        elif b == OUTRO:
            place(pads, pad(PROG[0][0] + [66, 71], TOTAL - t0, 1800), t0, 0.75)

        # the enquiry: a clock ticking, a heartbeat pulse
        if b < DROP:
            div = 2 if b < 2 else 4  # 8ths, then 16ths as the hours race by
            steps = range(0, 16, 4 // div) if b < 2 else range(0, 8)
            for s in steps:
                place(drums, tick(s % 4 == 0), t0 + s * S16, 0.5, pan=0.2 if s % 2 else -0.2)
            if b < 2:
                for q in range(4):
                    place(bass, obass(root, BEAT * 0.5), t0 + q * BEAT, 0.45)
            else:
                place(fx, g.riser(BEAT * 2), t0, 0.4)
                for s in range(8):
                    place(bass, obass(root + (12 if s % 2 else 0), S16 * 0.9), t0 + s * S16, 0.4)

        if groove:
            fill = b == OUTRO - 1
            for q in (0, 2):
                place(drums, g.kick(0.45, 140, 44, 0.9), t0 + q * BEAT, 0.85)
            place(drums, g.kick(0.45, 140, 44, 0.9), t0 + 2.5 * BEAT, 0.6)
            for q in (1, 3):
                if not (fill and q == 3):
                    place(drums, gated_snare(), t0 + q * BEAT, 0.65)
            for e in range(8):
                place(drums, g.hat(open_=e % 2 == 1), t0 + e * BEAT / 2, 0.22 if e % 2 else 0.3, pan=0.25)
            if fill:
                for k, s in enumerate((12, 13, 14, 15)):
                    place(drums, tom((150, 120, 95, 75)[k]), t0 + s * S16, 0.55)
            # 16th octave bass
            for s in range(16):
                place(bass, obass(root + (12 if s % 2 else 0), S16 * 0.85), t0 + s * S16, 0.55)
            # arpeggio, up two octaves, ping-ponged later
            up = 12 if b >= 5 else 0
            for s in range(16):
                note = tones[[0, 1, 2, 3, 2, 1, 2, 3][s % 8]] + (12 if s >= 8 else 0) + up - 12
                place(arps, pluck(note), t0 + s * S16, 0.35 if s % 4 else 0.45, pan=-0.3 if s % 2 else 0.3)
            if b == DROP:
                place(fx, g.crash(2.4), t0, 0.6)
                place(fx, g.kick(1.6, 120, 36, 0.6), t0, 0.85)
            if b == 6:
                place(fx, g.crash(1.6), t0, 0.35)

        if b >= OUTRO:
            if b == OUTRO:
                place(fx, g.crash(3.0), t0, 0.45)
                place(fx, g.kick(1.6, 120, 36, 0.5), t0, 0.7)
                place(bass, obass(28, BAR * 1.5), t0, 0.5)
            if not last:
                for s in range(0, 16, 2):
                    note = tones[[0, 1, 2, 3][(s // 2) % 4]]
                    place(arps, pluck(note, 0.3), t0 + s * S16, 0.3, pan=-0.3 if s % 4 else 0.3)
                place(drums, g.kick(0.45, 140, 44, 0.6), t0, 0.5)
                place(drums, gated_snare(), t0 + BEAT, 0.35)

    # sidechain-ish duck on pads/arps from the groove kicks
    t = t_axis(TOTAL)
    pump = np.ones(n)
    for b in range(DROP, OUTRO):
        for q in (0, 2, 2.5):
            at = b * BAR + q * BEAT
            i0 = int(at * SR)
            i1 = min(n, i0 + int(BEAT * 0.45 * SR))
            seg = (t[i0:i1] - at) / (BEAT * 0.45)
            pump[i0:i1] = np.minimum(pump[i0:i1], 0.4 + 0.6 * np.clip(seg, 0, 1) ** 0.6)

    d = int(BEAT * 0.75 * SR)
    arps_d = arps.copy()
    mono = arps.mean(axis=0)
    for k in range(1, 4):
        arps_d[k % 2, d * k :] += mono[: n - d * k] * 0.35**k

    mix = (
        drums * 0.95
        + reverb(bass, 0.05) * 0.8
        + reverb(pads * pump, 0.45) * 2.4
        + reverb(arps_d * pump, 0.3) * 1.6
        + reverb(fx, 0.4) * 0.6
    )
    # silence the band for the tape rewind (bar 2, beats 3-4)
    r0, r1 = int((2 * BAR + 2.5 * BEAT) * SR), int(DROP * BAR * SR)
    fade = int(0.03 * SR)
    gate = np.ones(n)
    gate[r0 : r0 + fade] = np.linspace(1, 0.08, fade)
    gate[r0 + fade : r1] = 0.08
    mix *= gate
    mix = hp(mix, 30)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(1.6 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / "bot-music-24.wav", mix, -1.0)


def rewind():
    """Tape shuttling backwards: warbling chirps whose pitch swoops up."""
    dur = 0.75
    t = t_axis(dur)
    f = 300 + 2400 * (t / dur) ** 1.6
    warble = 1 + 0.35 * np.sin(2 * np.pi * (18 + 30 * t / dur) * t)
    tone = saw(1, np.cumsum(f * warble) / SR) * 0.5
    chatter = sweep_lp(RNG.standard_normal(len(t)), 800, 7000, curve=1.4) * 0.5
    gatepat = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * (14 + 40 * t / dur) * t))
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.06)
    write_wav(OUT / "sfx" / "rewind.wav", reverb(lp(tone + chatter, 6000) * gatepat * env, 0.15), -5)


if __name__ == "__main__":
    music()
    rewind()
    print("wrote bot-music-24.wav, sfx/rewind.wav")

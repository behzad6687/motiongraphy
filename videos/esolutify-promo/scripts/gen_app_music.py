"""Music bed + pencil SFX for the mobile-app reel (a different track from the
brand film / voice reel, which share the A-minor four-on-the-floor bed).

    python3 scripts/gen_app_music.py

Writes public/audio/app-music-24.wav and public/audio/sfx/pencil.wav.

100 BPM (18 frames per beat at 30 fps, one bar = 2.4 s = 72 frames), D major,
I-V-vi-IV, bright future-pop: kalimba hook, finger snaps, swung shaker,
808 sub, side-chained supersaw stabs. Locked to the reel (bars):
  0-1  sketch     kalimba + soft pad, snaps from bar 1, build + gap
  2    4.8 s      DROP: the sketch becomes a real app
  2-7  groove     the app, the stores, the proof (fill into bar 8)
  8-9  CTA        half-time, kalimba, final D chord rings out to 24 s
"""

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, saw, t_axis, write_wav

BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
TOTAL = 24.0
DROP, OUTRO, BARS = 2, 8, 10
RNG = np.random.default_rng(29)
g.RNG = np.random.default_rng(31)  # kick/clap/hat/riser draw from gen_audio's RNG

# I - V - vi - IV in D major: pad voicing, bass root, kalimba tones
PROG = [
    ([62, 66, 69, 73, 76], 38, [74, 78, 81, 85]),  # Dmaj9
    ([61, 64, 69, 71, 76], 33, [73, 76, 81, 83]),  # A(add9)
    ([62, 66, 69, 71, 74], 35, [71, 74, 78, 81]),  # Bm7
    ([62, 66, 67, 71, 74], 31, [71, 74, 79, 83]),  # Gmaj7
]
# kalimba hook: (16th step, index into the chord's tones, octave shift)
HOOK = [(0, 2, 0), (3, 1, 0), (6, 0, 0), (8, 3, 0), (10, 2, 0), (12, 1, 0), (14, 3, -12)]


def kalimba(n, dur=0.6):
    t = t_axis(dur)
    f = midi(n)
    body = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.32)
    tine = np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.012) * 0.35
    oct_ = np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.08) * 0.25
    return (body + tine + oct_) * np.minimum(1, t / 0.002)


def stab(notes, dur, cutoff=5200):
    """Supersaw chord stab with a snappy filter envelope."""
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for n in notes:
        for k, d in enumerate((-0.006, 0, 0.006)):
            ph = RNG.random()
            l += saw(midi(n) * (1 + d), t, ph)
            r += saw(midi(n) * (1 - d * 1.2), t, ph + 0.3)
    env = adsr(len(t), 0.003, dur * 0.5, 0.35, dur * 0.3)
    fenv = np.exp(-t / 0.09)
    sig = np.stack([l, r]) / (len(notes) * 3)
    lo = np.stack([lp(sig[0], 900), lp(sig[1], 900)])
    hi = np.stack([lp(sig[0], cutoff), lp(sig[1], cutoff)])
    return (lo * (1 - fenv) + hi * fenv) * env


def soft_pad(notes, dur):
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        sig += np.sin(2 * np.pi * f * t + RNG.random() * 6) + 0.3 * saw(f * 1.003, t, RNG.random())
    return lp(sig, 1600) * adsr(len(t), 0.5, 0.3, 0.8, 0.8) / len(notes)


def snap(dur=0.18):
    t = t_axis(dur)
    nse = bp(RNG.standard_normal(len(t)), 1600, 7000) * np.exp(-t / 0.018)
    tone = np.sin(2 * np.pi * 2100 * t) * np.exp(-t / 0.008) * 0.4
    return nse + tone


def shaker(accent=False):
    t = t_axis(0.09)
    nse = hp(RNG.standard_normal(len(t)), 7000)
    env = np.minimum(1, t / (0.012 if accent else 0.006)) * np.exp(-t / 0.03)
    return nse * env * 0.22


def sub808(n, dur, glide_from=None):
    t = t_axis(dur)
    f = np.full(len(t), midi(n))
    if glide_from is not None:
        f = midi(n) + (midi(glide_from) - midi(n)) * np.exp(-t / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) + 0.15 * np.sin(2 * ph)
    return np.tanh(sig * 1.4) * adsr(len(t), 0.004, 0.1, 0.8, 0.12)


def music():
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    pads = np.zeros((2, n))
    keys = np.zeros((2, n))
    stabs = np.zeros((2, n))
    fx = np.zeros((2, n))

    for b in range(BARS):
        t0 = b * BAR
        chord, root, tones = PROG[b % 4]
        groove = DROP <= b < OUTRO
        last = b == BARS - 1

        # pad: the whole way, quieter under the groove
        if b < OUTRO:
            place(pads, soft_pad(chord, BAR + 0.5), t0, 0.5 if b < DROP else 0.3)
        elif b == OUTRO:
            place(pads, soft_pad(PROG[0][0] + [81], TOTAL - t0), t0, 0.6)

        # kalimba hook: sparse in the sketch, full in the groove, an octave
        # up for the stores/proof half, slow again in the outro
        for step, idx, octv in HOOK:
            if b < DROP and step % 4 not in (0, 3):
                continue
            if b >= OUTRO and step % 8 not in (0, 6):
                continue
            up = 12 if groove and b >= 4 and step in (8, 10) else 0
            note = tones[idx] + octv + up
            pan = -0.35 if step % 8 < 4 else 0.35
            place(keys, kalimba(note), t0 + step * S16, 0.5 if not last else 0.35, pan=pan)
        if last:
            place(keys, kalimba(PROG[0][2][0], 2.0), t0 + BEAT * 2, 0.45)

        # sketch intro: snaps from bar 1, shaker builds, kalimba run + gap
        if b < DROP:
            if b == 1:
                for q in (1, 3):
                    place(drums, snap(), t0 + q * BEAT, 0.5, pan=0.15)
                for s in range(8, 16):
                    place(drums, shaker(s % 2 == 0), t0 + s * S16, 0.25 + 0.05 * (s - 8), pan=0.3)
                for k, s in enumerate(range(8, 15)):  # rising run into the drop
                    note = PROG[0][2][k % 4] + 12 * (k // 4)
                    place(keys, kalimba(note, 0.3), t0 + s * S16, 0.32 + 0.03 * k, pan=0.4 if k % 2 else -0.4)
                place(fx, g.riser(BAR * 0.45), t0 + BAR * 0.5, 0.35)

        if groove:
            fill = b == OUTRO - 1
            # kick: 1, the "a" of 2, the "and" of 3  (16ths 0, 7, 10)
            for s in (0, 7, 10):
                place(drums, g.kick(0.4, 150, 46, 0.8), t0 + s * S16, 0.8)
            for s in (4, 12):  # backbeat: clap + snap layered
                place(drums, g.clap(), t0 + s * S16, 0.5)
                place(drums, snap(), t0 + s * S16, 0.35)
            for s in range(16):  # swung shaker
                swing = S16 * 0.18 if s % 2 else 0
                place(drums, shaker(s % 4 == 2), t0 + s * S16 + swing, 0.55 if s % 2 else 0.35, pan=0.3)
            for e in range(8):
                place(drums, g.hat(), t0 + e * BEAT / 2, 0.25 if e % 2 else 0.15, pan=-0.3)
            if fill:
                for s in range(12, 16):
                    place(drums, snap(0.12), t0 + s * S16, 0.25 + 0.08 * (s - 12))
                place(fx, g.riser(BEAT * 1.5), t0 + BAR - BEAT * 1.5, 0.25)
            # 808 on the kick pattern, with a glide up into the "and" of 3
            place(bass, sub808(root, S16 * 6.5), t0, 0.8)
            place(bass, sub808(root, S16 * 2.6), t0 + 7 * S16, 0.65)
            place(bass, sub808(root + 7, S16 * 5.5, glide_from=root), t0 + 10 * S16, 0.6)
            # supersaw stabs on the offbeats
            for s in (2, 6, 11, 14):
                place(stabs, stab(chord[1:], S16 * 1.8), t0 + s * S16, 0.55)
            if b == DROP:
                place(fx, g.crash(2.0), t0, 0.6)
                place(fx, g.kick(1.4, 130, 38, 0.6), t0, 0.8)
            if b == 4 or b == 6:
                place(fx, g.crash(1.6), t0, 0.35)

        if b >= OUTRO:
            if b == OUTRO:
                place(fx, g.crash(3.0), t0, 0.45)
                place(fx, g.kick(1.6, 120, 36, 0.5), t0, 0.7)
                place(bass, sub808(38, BAR * 1.6), t0, 0.55)
            if not last:
                for q in (0, 2):
                    place(drums, g.kick(0.4, 130, 46, 0.4), t0 + q * BEAT, 0.45)
                for q in (1, 3):
                    place(drums, snap(), t0 + q * BEAT, 0.3, pan=0.15)

    # sidechain pump from the groove kicks (pads, stabs, keys a little)
    t = t_axis(TOTAL)
    pump = np.ones(n)
    for b in range(DROP, OUTRO):
        for s in (0, 7, 10):
            at = b * BAR + s * S16
            i0 = int(at * SR)
            i1 = min(n, i0 + int(BEAT * 0.5 * SR))
            seg = (t[i0:i1] - at) / (BEAT * 0.5)
            pump[i0:i1] = np.minimum(pump[i0:i1], 0.3 + 0.7 * np.clip(seg, 0, 1) ** 0.5)

    # ping-pong eighth delay on the kalimba
    d = int(BEAT * 0.5 * SR)
    keys_d = keys.copy()
    mono = keys.mean(axis=0)
    for k in range(1, 4):
        keys_d[k % 2, d * k :] += mono[: n - d * k] * 0.3**k

    mix = (
        drums * 0.95
        + reverb(bass, 0.05) * 0.75
        + reverb(pads * pump, 0.4) * 1.6
        + reverb(stabs * pump, 0.25) * 1.5
        + reverb(keys_d * (0.6 + 0.4 * pump), 0.3) * 1.3
        + reverb(fx, 0.4) * 0.6
    )
    mix = hp(mix, 35)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(1.6 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / "app-music-24.wav", mix, -1.0)


def pencil():
    """Pencil scribble: three gritty strokes of band-passed noise."""
    p = np.zeros(int(0.7 * SR))
    for k, (at, dur) in enumerate(((0.0, 0.16), (0.2, 0.2), (0.44, 0.18))):
        t = t_axis(dur)
        grit = bp(RNG.standard_normal(len(t)), 2500 + 600 * k, 8000)
        grain = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * (55 + 10 * k) * t))
        env = np.sin(np.pi * t / dur) ** 0.7
        i = int(at * SR)
        p[i : i + len(t)] += grit * grain * env
    write_wav(OUT / "sfx" / "pencil.wav", reverb(p, 0.08), -9)


if __name__ == "__main__":
    music()
    pencil()
    print("wrote app-music-24.wav, sfx/pencil.wav")

"""Music bed + camera-shutter SFX for the social-media reel: a sixth,
different track (brand/voice: A-minor four-on-the-floor; app: D-major
future-pop; SEO: swung boom-bap; chatbots: synthwave; ads: trap).

    python3 scripts/gen_social_music.py

Writes public/audio/social-music-24.wav and public/audio/sfx/shutter.wav.

128.57 BPM (14 frames per beat at 30 fps, one bar = 1.867 s = 56 frames),
G minor, i-VI-iv-V (Gm9 Ebmaj7 Cm9 D7), UK garage 2-step: skippy shuffled
drums, organ stabs, formant "vocal" chops, bouncing sub. Locked to the reel:
  0-2   the quiet page    filtered organ, hats, a lonely kick; the band
                          drops out for the last half-beat before the drop
  3     5.6 s             DROP: a month of posts, done for you
  3-8   groove            calendar, posts going live, proof (fill into 9)
  9-12  CTA               lighter 2-step, chops, Gm9 rings out to 24 s
"""

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, saw, t_axis, write_wav

BPM = 30 * 60 / 14  # 128.571...: exactly 14 frames a beat
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
SWING = S16 * 0.32
TOTAL = 24.0
DROP, OUTRO = 3, 9
BARS = int(np.ceil(TOTAL / BAR))
RNG = np.random.default_rng(71)
g.RNG = np.random.default_rng(73)

PROG = [
    ([58, 62, 65, 69], 31, [74, 77, 79, 82]),  # Gm9
    ([58, 62, 63, 67], 27, [74, 75, 79, 82]),  # Ebmaj7
    ([58, 60, 63, 67], 24, [72, 75, 79, 82]),  # Cm9
    ([57, 60, 62, 66], 26, [74, 78, 81, 84]),  # D7
]
# vocal-chop hook per bar: (16th step, chord-tone index, vowel)
CHOPS = [(0, 2, "ah"), (3, 1, "oh"), (6, 3, "ah"), (10, 2, "ee"), (12, 1, "oh")]
FORMANTS = {"ah": (800, 1150), "oh": (450, 800), "ee": (300, 2300)}


def sw(step):
    return step * S16 + (SWING if step % 2 else 0)


def organ(notes, dur):
    """M1-style organ stab: drawbar sines, fast decay."""
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for h, a in ((1, 1.0), (2, 0.6), (3, 0.35), (4, 0.25), (6, 0.12)):
            sig += np.sin(2 * np.pi * f * h * t + RNG.random()) * a
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.16)
    return lp(sig, 5000) * env / (len(notes) * 2.3)


def chop(n, vowel, dur=0.2):
    t = t_axis(dur)
    src = saw(midi(n), t) + 0.4 * saw(midi(n) * 1.004, t)
    f1, f2 = FORMANTS[vowel]
    sig = bp(src, f1 * 0.8, f1 * 1.2) * 1.2 + bp(src, f2 * 0.85, f2 * 1.15) * 0.8
    env = np.minimum(1, t / 0.006) * np.minimum(1, (dur - t) / 0.03)
    return sig * env


def sub(n, dur):
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)
    return np.tanh(sig * 1.5) * adsr(len(t), 0.004, 0.08, 0.75, 0.04)


def garage_snare():
    t = t_axis(0.3)
    body = np.sin(2 * np.pi * 220 * t) * np.exp(-t / 0.03)
    nse = bp(RNG.standard_normal(len(t)), 1500, 9000) * np.exp(-t / 0.09)
    return (body * 0.6 + nse) * 0.9


def rim():
    t = t_axis(0.06)
    return (np.sin(2 * np.pi * 1800 * t) * 0.7 + bp(RNG.standard_normal(len(t)), 2500, 7000) * 0.4) * np.exp(-t / 0.01)


def shaker():
    t = t_axis(0.07)
    return hp(RNG.standard_normal(len(t)), 7500) * np.minimum(1, t / 0.008) * np.exp(-t / 0.022) * 0.2


def pad(notes, dur, bright=1300):
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for n in notes:
        l += saw(midi(n) * 1.004, t, RNG.random())
        r += saw(midi(n) * 0.996, t, RNG.random())
    return np.stack([lp(l, bright), lp(r, bright)]) * adsr(len(t), 0.3, 0.3, 0.8, 0.5) / len(notes)


def music():
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    keys = np.zeros((2, n))
    vox = np.zeros((2, n))
    fx = np.zeros((2, n))

    for b in range(BARS):
        t0 = b * BAR
        notes, root, tones = PROG[(b - DROP) % 4]
        groove = DROP <= b < OUTRO
        intro = b < DROP
        last = b == BARS - 1

        # organ stabs: muffled in the intro, choppy in the groove
        if intro:
            for s in (0, 6, 10):
                place(keys, organ(notes, 0.3), t0 + sw(s), 0.9)
            place(keys, pad(notes, BAR + 0.3, 900), t0, 0.55)
        elif groove or b < BARS - 1:
            for s in (2, 7, 10, 13) if groove else (2, 10):
                place(keys, organ(notes, 0.22), t0 + sw(s), 0.7 if groove else 0.5, pan=-0.2 if s % 2 else 0.2)
        if b >= OUTRO:
            place(keys, pad(notes if not last else PROG[0][0] + [74], BAR + (1.5 if last else 0.3)), t0, 0.45)

        # vocal chops: the hook
        for step, idx, vowel in CHOPS:
            if intro and step not in (0, 6):
                continue
            if b == DROP - 1 and step >= 8:
                continue
            if b >= OUTRO and step not in (0, 6, 10):
                continue
            place(vox, chop(tones[idx], vowel), t0 + sw(step), 0.42, pan=0.25 if step % 2 else -0.25)

        if intro:
            place(drums, g.kick(0.4, 140, 46, 0.6), t0, 0.85)
            place(drums, g.kick(0.4, 140, 46, 0.6), t0 + sw(10), 0.5)
            for s in range(0, 16, 2):
                place(drums, g.hat(), t0 + sw(s), 0.45, pan=0.2)
            if b == 2:
                for s in range(8):
                    place(drums, shaker(), t0 + sw(s), 0.6)
                place(fx, g.riser(BEAT * 3), t0 + BEAT * 0.5, 0.35)

        if groove:
            fill = b == OUTRO - 1
            for s in (0, 10):  # the 2-step kick
                place(drums, g.kick(0.4, 150, 46, 0.8), t0 + sw(s), 0.8)
            if b % 2:
                place(drums, g.kick(0.4, 150, 46, 0.8), t0 + sw(7), 0.5)
            for s in (4, 12):
                place(drums, garage_snare(), t0 + s * S16, 0.65)
            for s in range(16):
                place(drums, shaker(), t0 + sw(s), 0.55 if s % 2 else 0.35, pan=0.3)
                if s % 2:
                    place(drums, g.hat(), t0 + sw(s), 0.3, pan=-0.25)
            for s in (3, 11, 14):
                place(drums, rim(), t0 + sw(s), 0.35, pan=0.15)
            if fill:
                for k, s in enumerate((12, 13, 14, 15)):
                    place(drums, garage_snare(), t0 + sw(s), 0.3 + 0.1 * k)
            for s, iv, ln in ((0, 0, 3), (3, 0, 2), (6, 12, 2), (10, 0, 3), (14, 7, 2)):
                place(bass, sub(root + 12 + iv, S16 * ln), t0 + sw(s), 0.75)
            if b == DROP:
                place(fx, g.crash(2.2), t0, 0.5)
                place(fx, g.kick(1.4, 120, 38, 0.6), t0, 0.8)
            if b == 6:
                place(fx, g.crash(1.4), t0, 0.3)

        if b >= OUTRO and not last:
            if b == OUTRO:
                place(fx, g.crash(2.6), t0, 0.4)
            for s in (0, 10):
                place(drums, g.kick(0.4, 150, 46, 0.6), t0 + sw(s), 0.55)
            place(drums, garage_snare(), t0 + 4 * S16, 0.4)
            place(drums, garage_snare(), t0 + 12 * S16, 0.4)
            for s in range(1, 16, 2):
                place(drums, shaker(), t0 + sw(s), 0.4, pan=0.3)
            place(bass, sub(root + 12, BAR * 0.45), t0, 0.6)
        if last:
            place(bass, sub(31 + 12, BAR), t0, 0.5)

    mix = (
        drums * 0.95
        + reverb(bass, 0.04) * 0.85
        + reverb(keys, 0.3) * 1.5
        + reverb(vox, 0.35) * 1.2
        + reverb(fx, 0.4) * 0.6
    )
    # the half-beat before the drop: out
    r0, r1 = int((DROP * BAR - BEAT / 2) * SR), int(DROP * BAR * SR)
    fade = int(0.02 * SR)
    gate = np.ones(n)
    gate[r0 : r0 + fade] = np.linspace(1, 0.12, fade)
    gate[r0 + fade : r1] = 0.12
    mix *= gate
    mix = hp(mix, 32)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(1.6 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / "social-music-24.wav", mix, -1.0)


def shutter():
    """Camera shutter: two short mechanical clicks."""
    out = np.zeros(int(0.25 * SR))
    for at, f0 in ((0.0, 2600), (0.07, 1900)):
        t = t_axis(0.04)
        clk = bp(RNG.standard_normal(len(t)), f0 * 0.6, f0 * 1.8) * np.exp(-t / 0.006)
        clk += np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.004) * 0.5
        i = int(at * SR)
        out[i : i + len(t)] += clk
    write_wav(OUT / "sfx" / "shutter.wav", reverb(out, 0.1), -6)


if __name__ == "__main__":
    music()
    shutter()
    print("wrote social-music-24.wav, sfx/shutter.wav")

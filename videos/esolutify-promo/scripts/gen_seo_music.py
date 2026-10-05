"""Music bed for the local-SEO reel: a third, different track (the brand film
and voice reel share an A-minor four-on-the-floor bed; the app reel is D-major
future-pop).

    python3 scripts/gen_seo_music.py

Writes public/audio/seo-music-24.wav.

90 BPM (20 frames per beat at 30 fps, one bar = 2.667 s = 80 frames), C major,
ii-V-I-vi (Dm9 G13 Cmaj9 Am9), swung boom-bap: Rhodes, upright-style bass,
dusty drums, vinyl crackle, and a vibraphone line that climbs bar by bar
while the business climbs the results. Locked to the reel (bars):
  0-1  the search   filtered Rhodes + crackle + rim clicks, gap before the drop
  2    5.33 s       DROP: you jump to #1
  2-6  groove       calls, proof; the vibes climb from bar 3, fill into bar 7
  7-8  CTA          drums thin out, Cmaj9 rings out to 24 s
"""

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, saw, t_axis, write_wav

BPM = 90
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
SWING = S16 * 0.3  # late offbeat 16ths
TOTAL = 24.0
DROP, OUTRO, BARS = 2, 7, 9
RNG = np.random.default_rng(41)
g.RNG = np.random.default_rng(43)

# rootless Rhodes voicings + bass roots
PROG = [
    ([53, 57, 60, 64], 38),  # Dm9
    ([53, 59, 64, 69], 43),  # G13
    ([52, 55, 59, 62], 36),  # Cmaj9
    ([55, 59, 60, 64], 33),  # Am9
]
# the climbing vibraphone line: bar -> [(16th step, midi note)]
VIBES = {
    3: [(0, 76), (6, 79), (10, 81)],
    4: [(0, 79), (6, 81), (10, 84)],
    5: [(0, 81), (4, 84), (8, 86), (12, 88)],
    6: [(0, 88), (6, 86), (10, 88), (14, 91)],
    7: [(0, 88), (10, 84)],
    8: [(0, 84)],
}


def sw(step):
    """Time of a 16th step with swing."""
    return step * S16 + (SWING if step % 2 else 0)


def rhodes(n, dur, bright=1.0):
    t = t_axis(dur)
    f = midi(n)
    mod = np.sin(2 * np.pi * f * t) * (1.6 * bright * np.exp(-t / 0.3) + 0.25)
    car = np.sin(2 * np.pi * f * t + mod)
    tine = np.sin(2 * np.pi * f * 7.0 * t) * np.exp(-t / 0.015) * 0.12 * bright
    env = adsr(len(t), 0.004, 1.4, 0.35, 0.25)
    trem = 1 + 0.1 * np.sin(2 * np.pi * 4.2 * t)
    return (car + tine) * env * trem


def chord(notes, dur, bright=1.0):
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for k, n in enumerate(notes):
        v = rhodes(n, dur, bright)
        pan = (k / (len(notes) - 1) - 0.5) * 0.6
        l += v * (1 - pan)
        r += v * (1 + pan)
    return np.stack([l, r]) / len(notes)


def vibes(n, dur=1.2):
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.15)
    trem = 1 + 0.25 * np.sin(2 * np.pi * 5.5 * t)
    return sig * np.exp(-t / 0.55) * np.minimum(1, t / 0.003) * trem


def upright(n, dur):
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * lp(saw(f, t), 600) + 0.2 * np.sin(4 * np.pi * f * t)
    thump = lp(RNG.standard_normal(len(t)), 300) * np.exp(-t / 0.01) * 0.4
    return np.tanh((sig * np.exp(-t / 0.45) + thump) * 1.2) * adsr(len(t), 0.003, 0.05, 0.9, 0.06)


def boom(dur=0.5):
    t = t_axis(dur)
    f = 45 + 95 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    knock = lp(RNG.standard_normal(len(t)), 1800) * np.exp(-t / 0.006) * 0.5
    return np.tanh((body + knock) * 1.8)


def snare(dur=0.4):
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.7
    nse = bp(RNG.standard_normal(len(t)), 1200, 7500) * np.exp(-t / 0.11)
    return lp(tone + nse, 7000) * 0.9


def rim(dur=0.08):
    t = t_axis(dur)
    return (np.sin(2 * np.pi * 1700 * t) * 0.6 + bp(RNG.standard_normal(len(t)), 2000, 6000) * 0.5) * np.exp(-t / 0.012)


def dusty_hat(open_=False):
    t = t_axis(0.25 if open_ else 0.06)
    nse = bp(RNG.standard_normal(len(t)), 5500, 10000)
    return lp(nse, 9000) * np.exp(-t / (0.07 if open_ else 0.014)) * 0.2


def crackle(n):
    out = np.zeros(n)
    clicks = RNG.integers(0, n - 200, size=int(TOTAL * 22))
    for c in clicks:
        out[c : c + 40] += bp(RNG.standard_normal(40), 1500, 9000) * RNG.random() * 0.6
    hiss = lp(hp(RNG.standard_normal(n), 3000), 9000) * 0.012
    return out * 0.25 + hiss


def music():
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    keys = np.zeros((2, n))
    lead = np.zeros((2, n))
    fx = np.zeros((2, n))

    for b in range(BARS):
        t0 = b * BAR
        notes, root = PROG[b % 4]
        groove = DROP <= b < OUTRO
        last = b == BARS - 1
        if last:
            notes, root = PROG[2][0] + [67], 36  # Cmaj9 to ring out

        # Rhodes: soft whole notes in the intro, comping in the groove
        if b < DROP:
            place(keys, chord(notes, BAR * 0.55, 0.5), t0, 0.7)
            place(keys, chord(notes, BAR * 0.45, 0.4), t0 + sw(10), 0.5)
        elif groove:
            for step, length, gain in ((0, 5, 0.85), (6, 2, 0.55), (10, 5, 0.75)):
                place(keys, chord(notes, S16 * length + 0.15), t0 + sw(step), gain)
        else:
            place(keys, chord(notes, BAR * (1.6 if last else 1.0), 0.7), t0, 0.8)

        for step, note in VIBES.get(b, []):
            place(lead, vibes(note, 2.0 if last else 1.2), t0 + sw(step), 0.42, pan=0.2 if step % 8 else -0.2)

        if b < DROP:
            for q in (1, 3):
                place(drums, rim(), t0 + q * BEAT, 0.6 if b == 0 else 0.7)
            if b == 1:
                for s in (8, 10, 12, 13, 14):
                    place(drums, dusty_hat(), t0 + sw(s), 0.6)
                place(fx, g.riser(BEAT * 2.5), t0 + BEAT * 1.4, 0.3)

        if groove:
            fill = b == OUTRO - 1
            for s in (0, 7, 10) if not fill else (0, 7):
                place(drums, boom(), t0 + sw(s), 0.85)
            for s in (4, 12):
                place(drums, snare(), t0 + s * S16, 0.7)
            for s in range(16):
                if fill and s >= 12:
                    continue
                place(drums, dusty_hat(open_=s == 14), t0 + sw(s), 0.7 if s % 2 == 0 else 0.45, pan=0.25)
            if fill:
                for k, s in enumerate((12, 13, 14, 15)):
                    place(drums, snare(0.2), t0 + s * S16, 0.25 + 0.12 * k)
            # upright: root, root, fifth, octave
            for s, iv, ln in ((0, 0, 5), (6, 0, 3), (10, 7, 3), (14, 12, 2)):
                place(bass, upright(root + 12 + iv, S16 * ln), t0 + sw(s), 0.7)
            if b == DROP:
                place(fx, g.crash(2.2), t0, 0.5)
                place(fx, g.kick(1.4, 120, 36, 0.5), t0, 0.75)

        if b >= OUTRO:
            if b == OUTRO:
                place(fx, g.crash(3.0), t0, 0.4)
                place(bass, upright(root + 12, BAR * 0.9), t0, 0.6)
            if not last:
                place(drums, boom(), t0, 0.6)
                place(drums, boom(), t0 + sw(10), 0.45)
                place(drums, snare(), t0 + 4 * S16, 0.45)
                place(drums, snare(), t0 + 12 * S16, 0.45)
                for s in range(0, 16, 2):
                    place(drums, dusty_hat(), t0 + sw(s), 0.4, pan=0.25)
            else:
                place(bass, upright(36, BAR * 1.2), t0, 0.55)

    # intro keys sound "through a phone speaker", opening on the drop
    split = int(DROP * BAR * SR)
    for ch in range(2):
        keys[ch, :split] = bp(keys[ch, :split], 300, 2600) * 2.2

    mix = (
        drums * 0.95
        + reverb(bass, 0.05) * 0.9
        + reverb(keys, 0.25) * 1.25
        + reverb(lead, 0.4) * 1.0
        + reverb(fx, 0.4) * 0.6
    )
    mix += np.stack([crackle(n), crackle(n)])
    mix = hp(mix, 32)
    mix = np.tanh(mix * 1.35) / np.tanh(1.35)
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(1.6 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / "seo-music-24.wav", mix, -1.0)


if __name__ == "__main__":
    music()
    print("wrote seo-music-24.wav")

"""Music bed + cash-register SFX for the paid-ads reel: a fifth, different
track (brand/voice: A-minor four-on-the-floor; app: D-major future-pop;
SEO: swung boom-bap; chatbots: synthwave).

    python3 scripts/gen_ads_music.py

Writes public/audio/ads-music-24.wav and public/audio/sfx/cash.wav.

150 BPM trap, half-time feel (12 frames per beat at 30 fps, one bar =
1.6 s = 48 frames), F minor, i-VI-iv-V (Fm Dbmaj7 Bbm C): sliding 808s,
hi-hat rolls, clap on 3, FM bells, a synth-brass hit on the drop.
Locked to the reel (bars):
  0-2   $1 in, the leaks       bells + pad, sparse 808, hats from bar 1;
                               everything drops out for the last beat
  3     4.8 s                  DROP: $4.80 back (brass hit)
  3-10  groove                 the day montage (bars 5-7), proof (fill into 11)
  11-14 CTA                    808 + bells thin out, Fm rings to 24 s
"""

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, saw, t_axis, write_wav

BPM = 150
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
TOTAL = 24.0
DROP, OUTRO = 3, 11
BARS = int(np.ceil(TOTAL / BAR))
RNG = np.random.default_rng(61)
g.RNG = np.random.default_rng(67)

# pad voicing, 808 root, bell tones
PROG = [
    ([53, 56, 60, 65], 29, [77, 80, 84, 89]),  # Fm
    ([53, 56, 60, 61], 25, [73, 77, 80, 84]),  # Dbmaj7
    ([53, 58, 61, 65], 34, [77, 82, 85, 89]),  # Bbm
    ([52, 55, 60, 64], 24, [76, 79, 84, 88]),  # C
]
# 808 rhythm per bar: (16th step, length in 16ths, semitone offset, glide from)
BASS = [(0, 5, 0, None), (6, 3, 0, None), (10, 4, 12, 0), (14, 2, 7, None)]
# two-bar bell motif: (16th step, chord-tone index, octave)
BELLS = [(0, 3, 0), (3, 2, 0), (6, 1, 0), (8, 2, 0), (11, 0, 0), (14, 1, -12),
         (16, 3, 0), (19, 2, 0), (22, 3, 12), (26, 2, 0), (28, 1, 0)]


def sub808(n, dur, glide_from=None):
    t = t_axis(dur)
    f = np.full(len(t), midi(n))
    if glide_from is not None:
        f = midi(n) + (midi(glide_from) - midi(n)) * np.exp(-t / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph)
    env = np.exp(-t / 0.9) * np.minimum(1, t / 0.003) * np.minimum(1, (dur - t) / 0.02)
    click = np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.004) * 0.3
    return np.tanh((sig * env + click) * 2.2) * 0.8


def trap_kick():
    t = t_axis(0.25)
    f = 55 + 160 * np.exp(-t / 0.018)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08) * 2.5)


def clap():
    t = t_axis(0.4)
    nse = RNG.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, off in enumerate((0, 0.009, 0.019, 0.03)):
        env += np.exp(-np.clip(t - off, 0, None) / (0.005 if k < 3 else 0.12)) * (t >= off)
    return reverb(bp(nse, 1000, 6500) * env, 0.3)


def hat(dur=0.04):
    t = t_axis(dur)
    return bp(RNG.standard_normal(len(t)), 7000, 13000) * np.exp(-t / 0.009) * 0.25


def bell(n, dur=1.0):
    t = t_axis(dur)
    f = midi(n)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.0 * np.exp(-t / 0.18)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.45) * np.minimum(1, t / 0.002)


def pad(notes, dur, bright=1500):
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for n in notes:
        for d in (-0.006, 0.006):
            l += saw(midi(n) * (1 + d), t, RNG.random())
            r += saw(midi(n) * (1 - d), t, RNG.random())
    env = adsr(len(t), 0.4, 0.3, 0.85, 0.5)
    return np.stack([lp(l, bright), lp(r, bright)]) * env / (len(notes) * 2)


def brass(notes, dur=1.2):
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for n in notes:
        for d in (-0.004, 0, 0.004):
            sig += saw(midi(n) * (1 + d), t, RNG.random())
    fenv = np.minimum(1, t / 0.06) * np.exp(-t / 0.5)
    out = lp(sig, 700) * (1 - fenv) + lp(sig, 4200) * fenv
    return out * adsr(len(t), 0.02, 0.3, 0.5, 0.4) / (len(notes) * 3)


def music():
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    pads = np.zeros((2, n))
    keys = np.zeros((2, n))
    fx = np.zeros((2, n))

    for b in range(BARS):
        t0 = b * BAR
        # a chord every two bars, phrased from the drop (bars 1-2 sit on C, the V)
        notes, root, tones = PROG[((b - DROP) // 2) % 4]
        groove = DROP <= b < OUTRO
        last = b == BARS - 1
        intro = b < DROP

        if b < OUTRO and (b - DROP) % 2 == 0:
            place(pads, pad(notes, BAR * 2 + 0.4, 900 if intro else 1700), t0, 0.7)
        elif b == 0:
            place(pads, pad(notes, BAR + 0.4, 800), t0, 0.7)
        if b == OUTRO:
            place(pads, pad(PROG[0][0] + [72], TOTAL - t0, 1400), t0, 0.8)

        # bells: the motif, every bar (two-bar phrase)
        half = 16 if (b - DROP) % 2 else 0
        for step, idx, octv in BELLS:
            if not (half <= step < half + 16):
                continue
            if b >= OUTRO and step % 8 not in (0, 6):
                continue
            s = step - half
            if b == DROP - 1 and s >= 12:
                continue  # the gap before the drop
            place(keys, bell(tones[idx] + octv), t0 + s * S16, 0.32 if not intro else 0.4, pan=-0.3 if s % 2 else 0.3)
        if last:
            place(keys, bell(PROG[0][2][0], 2.0), t0, 0.35)

        if intro:
            place(bass, sub808(root, BEAT * 1.8), t0, 0.55)
            if b >= 1:
                for e in range(8 if b == 1 else 6):
                    place(drums, hat(), t0 + e * BEAT / 2, 0.5, pan=0.2)
            if b == DROP - 1:
                place(fx, g.riser(BEAT * 3), t0, 0.35)

        if groove:
            fill = b == OUTRO - 1
            montage = 5 <= b < 8
            # kick + 808 together
            for step, length, off, glide in BASS:
                place(drums, trap_kick(), t0 + step * S16, 0.7)
                place(bass, sub808(root + off, S16 * length, None if glide is None else root + glide), t0 + step * S16, 0.75)
            place(drums, clap(), t0 + 8 * S16, 0.75)
            # hats: 8ths with rolls; busier through the montage
            for e in range(8):
                place(drums, hat(), t0 + e * BEAT / 2, 0.55, pan=0.2)
            roll_at = 12 if montage else 14
            for k in range(6 if montage else 4):
                place(drums, hat(0.025), t0 + roll_at * S16 + k * S16 / 2, 0.35 + 0.04 * k, pan=-0.2)
            if b % 2:
                for k in range(3):  # triplet flick
                    place(drums, hat(0.03), t0 + 6 * S16 + k * S16 * 2 / 3, 0.4, pan=-0.25)
            if fill:
                for k in range(8):
                    place(drums, hat(0.025), t0 + 12 * S16 + k * S16 / 2, 0.3 + 0.05 * k)
                place(drums, clap(), t0 + 14 * S16, 0.5)
            if b == DROP:
                place(fx, brass([53, 56, 60, 65, 68]), t0, 0.9)
                place(fx, g.crash(2.0), t0, 0.5)
            if b in (5, 8):
                place(fx, g.crash(1.4), t0, 0.3)

        if b >= OUTRO and not last:
            place(drums, trap_kick(), t0, 0.55)
            place(bass, sub808(29, BEAT * 2.5), t0, 0.55)
            place(drums, clap(), t0 + 8 * S16, 0.4)
            for e in range(0, 8, 2):
                place(drums, hat(), t0 + e * BEAT / 2, 0.35, pan=0.2)
        if b == OUTRO:
            place(fx, g.crash(2.6), t0, 0.4)

    # duck pads/keys a little under the 808
    t = t_axis(TOTAL)
    pump = np.ones(n)
    for b in range(DROP, OUTRO):
        for step, _, _, _ in BASS:
            at = b * BAR + step * S16
            i0 = int(at * SR)
            i1 = min(n, i0 + int(BEAT * 0.5 * SR))
            seg = (t[i0:i1] - at) / (BEAT * 0.5)
            pump[i0:i1] = np.minimum(pump[i0:i1], 0.5 + 0.5 * np.clip(seg, 0, 1) ** 0.6)

    mix = (
        drums * 0.95
        + bass * 0.85
        + reverb(pads * pump, 0.45) * 2.0
        + reverb(keys * pump, 0.35) * 1.3
        + reverb(fx, 0.35) * 0.8
    )
    # the last beat before the drop: everything out but the riser tail
    r0, r1 = int((DROP * BAR - BEAT) * SR), int(DROP * BAR * SR)
    fade = int(0.02 * SR)
    gate = np.ones(n)
    gate[r0 : r0 + fade] = np.linspace(1, 0.15, fade)
    gate[r0 + fade : r1] = 0.15
    mix *= gate
    mix = hp(mix, 28)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    fi = int(0.02 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(1.6 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / "ads-music-24.wav", mix, -1.0)


def cash():
    """Cash register: a mechanical 'ka' then a bright 'ching'."""
    out = np.zeros(int(1.1 * SR))
    t = t_axis(0.05)
    ka = bp(RNG.standard_normal(len(t)), 1500, 6000) * np.exp(-t / 0.008)
    out[: len(t)] += ka * 0.8
    t = t_axis(1.0)
    ching = np.zeros_like(t)
    for f, a, d in ((2093, 1.0, 0.5), (2637, 0.7, 0.4), (3520, 0.5, 0.3), (5274, 0.35, 0.2), (2109, 0.6, 0.6)):
        ching += np.sin(2 * np.pi * f * t) * a * np.exp(-t / d)
    i = int(0.06 * SR)
    out[i : i + len(t)] += ching * np.minimum(1, t / 0.002) * 0.5
    write_wav(OUT / "sfx" / "cash.wav", reverb(out, 0.2), -4)


if __name__ == "__main__":
    music()
    cash()
    print("wrote ads-music-24.wav, sfx/cash.wav")

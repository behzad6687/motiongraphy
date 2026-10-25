"""Music for the portfolio Stories: a different bed per Story, all
deterministic like the other tracks in this repo.

    python3 scripts/gen_story_music.py dawn

Writes public/audio/story-<preset>.wav.

dawn (Downtown Dentists, 18 s): 102 BPM, F major, Fmaj7-Am7-Dm9-Bbmaj7.
A city waking up, then a clean groove.
  0-7.06 s   bars 0-2   the film: warm pad swells, soft piano arpeggio, a
                        filtered rise; nothing on the beat yet
  7.06 s     bar 3      DROP as the three devices land: soft kick, rim,
                        shaker 16ths, round bass, the arpeggio moves up
  12.7 s                three stabs for the three feature lines
  14.7 s                the end card: the groove falls away, pad + piano
                        hold the last chord to 18 s
"""

import sys

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, adsr, bp, hp, lp, midi, place, reverb, t_axis, write_wav


def soft_piano(n, dur=1.6, bright=2600):
    """Felt-piano-ish tone: a few decaying harmonics and a soft hammer."""
    t = t_axis(dur)
    f = midi(n)
    sig = np.zeros_like(t)
    for k, a in enumerate([1.0, 0.45, 0.22, 0.1, 0.05]):
        sig += a * np.sin(2 * np.pi * f * (k + 1) * t * (1 + 0.0007 * k)) * np.exp(-t * (1.4 + k * 1.1))
    hammer = lp(g.RNG.standard_normal(len(t)), 1800) * np.exp(-t / 0.006) * 0.08
    env = np.minimum(1, t / 0.004)
    return lp(sig * env + hammer, bright)


def warm_pad(notes, dur, bright=1400):
    st = g.pad_chord(notes, dur, bright=bright, detune=0.006)
    env = adsr(st.shape[1], 1.2, 0.5, 0.9, 1.0)
    return st * env


def shaker(dur=0.09):
    t = t_axis(dur)
    return bp(g.RNG.standard_normal(len(t)), 5000, 11000) * np.exp(-t / 0.025) * 0.09


def rim(dur=0.12):
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.012)
    click = bp(g.RNG.standard_normal(len(t)), 2000, 7000) * np.exp(-t / 0.006)
    return (tone * 0.5 + click * 0.6) * 0.6


def dawn():
    bpm, total = 102, 18.0
    beat = 60 / bpm
    bar = 4 * beat
    s16 = beat / 4
    drop = 3 * bar  # 7.06 s
    feat = 12.67
    end = 14.67
    g.RNG = np.random.default_rng(41)
    buf = np.zeros((2, int(total * SR)))
    # chords: (bass root, pad notes, arpeggio notes)
    prog = [
        (41, [57, 60, 64, 65], [65, 69, 72, 76]),  # Fmaj7
        (45, [57, 60, 64, 67], [64, 69, 72, 76]),  # Am7
        (38, [57, 60, 62, 65], [62, 65, 69, 76]),  # Dm9
        (46, [58, 62, 65, 69], [62, 65, 69, 74]),  # Bbmaj7
    ]
    nbars = int(np.ceil(total / bar))
    for b in range(nbars):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        last = t0 >= end
        # pad: swells in the intro, steady after
        gain = (0.35 + 0.25 * b / 3) if t0 < drop else 0.55
        place(buf, warm_pad(pad, bar + 0.6 if not last else total - t0), t0, gain)
        # piano arpeggio: 8ths in the intro, 16th lift after the drop
        if t0 < drop or last:
            for i in range(8):
                n = arp[i % 4] + (12 if i >= 4 and b >= 1 else 0)
                place(buf, soft_piano(n, 1.4), t0 + i * beat / 2, 0.22, pan=-0.3 + 0.6 * (i % 2))
        elif t0 < end:
            for i in range(16):
                n = arp[(i * 3) % 4] + 12 * (i % 8 >= 4)
                place(buf, soft_piano(n, 0.9, bright=3400), t0 + i * s16, 0.15, pan=-0.35 + 0.7 * (i % 2))
        if drop <= t0 < end:
            for k in range(4):  # beats
                tb = t0 + k * beat
                place(buf, g.kick(0.42, 120, 46, punch=0.6), tb, 0.55)
                if k % 2 == 1:
                    place(buf, rim(), tb, 0.35, pan=0.15)
            for i in range(16):
                place(buf, shaker(), t0 + i * s16, 0.8 if i % 2 else 0.45, pan=0.35)
            for k, (off, ln) in enumerate([(0, 1.5), (1.5, 0.5), (2, 1.5), (3.5, 0.5)]):
                n = root - 12 + (7 if k == 3 else 0)
                place(buf, g.bass_note(n, ln * beat, cutoff=520), t0 + off * beat, 0.5)
    # the rise into the drop + a soft impact
    place(buf, g.riser(2.2) * 0.5, drop - 2.2, 0.5)
    place(buf, g.crash(2.6), drop, 0.6)
    # three stabs for the three feature lines (Story frames 380/398/416)
    for k in range(3):
        at = feat + k * 0.6
        st = g.pad_chord([65, 69, 72, 77], 0.5, bright=3200)
        st *= np.exp(-np.arange(st.shape[1]) / SR / 0.18)
        place(buf, st, at, 0.9)
    # a final bloom on the end card
    place(buf, warm_pad([53, 57, 60, 64, 69], total - end + 0.2, bright=2000), end, 0.5)
    place(buf, soft_piano(77, 3.2), end + 0.05, 0.3)
    place(buf, soft_piano(72, 3.2), end + 0.35, 0.22)
    # master: room, gentle glue, fade the last half second
    buf = reverb(buf, 0.22)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.4) / np.tanh(1.4)
    fade = int(0.5 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-dawn.wav", buf, -1.5)
    print("wrote story-dawn.wav")


PRESETS = {"dawn": dawn}

if __name__ == "__main__":
    PRESETS[sys.argv[1]]()

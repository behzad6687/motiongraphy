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

polish (Pedi n Nails, 20 s): 112 BPM, A major, A-E-F#m-D, bright and light.
  0-4.29 s   bars 0-1   marimba motif over an airy pad, filtered
  4.29 s     bar 2      DROP on the pull-back reveal: soft kick, finger snaps,
                        shaker, plucky bass, marimba in 16ths
  12.9 s     bar 6      a lift as the laptop and tablet arrive
  17.1 s     bar 8      the end card: drums out, marimba + pad ring to 20 s

silk (Samantha, 20 s): 84 BPM, D minor, Dm9-G13-Cmaj9-A7b13, a slow R&B
groove: electric piano, vinyl crackle, swung brushes-and-kick, round sub.
  0-5.71 s   bars 0-1   e-piano chords through a closing-then-opening filter,
                        crackle, no drums (the tight shot on the mirror)
  5.71 s     bar 2      DROP as the camera pulls back from the mirror
  11.4 s     bar 4      a lift as the camera flies to the tablet
  17.1 s     bar 6      the end card: drums out, a rolled Dm9 rings to 20 s
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


def marimba(n, dur=0.7):
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    return sig * np.exp(-t * 6.5) * np.minimum(1, t / 0.002)


def snap(dur=0.18):
    t = t_axis(dur)
    n = bp(g.RNG.standard_normal(len(t)), 1800, 6500)
    return n * (np.exp(-t / 0.012) + 0.4 * np.exp(-np.clip(t - 0.008, 0, None) / 0.03) * (t > 0.008)) * 0.6


def polish():
    bpm, total = 112, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s16 = beat / 4
    drop, lift, end = 2 * bar, 6 * bar, 8 * bar
    g.RNG = np.random.default_rng(53)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (45, [61, 64, 69, 73], [69, 73, 76, 81]),  # A
        (40, [59, 64, 68, 71], [68, 71, 76, 80]),  # E
        (42, [61, 66, 69, 73], [66, 69, 73, 78]),  # F#m
        (38, [62, 66, 69, 74], [66, 69, 74, 78]),  # D
    ]
    motif = [0, 2, 1, 3, 2, 1, 0, 2]  # 8th-note pattern through the arp notes
    for b in range(int(np.ceil(total / bar))):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        last = t0 >= end - 0.01
        place(buf, warm_pad(pad, (total - t0) if last else bar + 0.5, bright=2400), t0, 0.32 if t0 < drop else 0.4)
        if t0 < drop:
            for i, k in enumerate(motif):
                place(buf, lp(marimba(arp[k], 0.6), 2600 + 1400 * b), t0 + i * beat / 2, 0.32, pan=-0.25 + 0.5 * (i % 2))
        elif not last:
            for i in range(16):
                k = motif[i % 8]
                place(buf, marimba(arp[k] + (12 if i % 8 in (3, 7) else 0), 0.45), t0 + i * s16, 0.22 if i % 2 else 0.3, pan=-0.3 + 0.6 * (i % 2))
            for k in range(4):
                tb = t0 + k * beat
                place(buf, g.kick(0.38, 140, 50, punch=0.7), tb, 0.6)
                if k % 2 == 1:
                    place(buf, snap(), tb, 0.55, pan=0.1)
            for i in range(16):
                place(buf, shaker(), t0 + i * s16 + (s16 * 0.12 if i % 2 else 0), 0.75 if i % 2 else 0.4, pan=0.35)
            for off in (0, 0.75, 1.5, 2.5, 3.0):
                place(buf, g.bass_note(root - 12, beat * 0.6, cutoff=650), t0 + off * beat, 0.42)
        else:
            for i, k in enumerate(motif):
                place(buf, marimba(arp[k] + 12, 0.9), t0 + i * beat / 2, 0.22 * (1 - i / 10), pan=-0.25 + 0.5 * (i % 2))
    place(buf, g.riser(1.6) * 0.45, drop - 1.6, 0.5)
    place(buf, g.crash(2.2), drop, 0.5)
    place(buf, g.riser(0.9) * 0.3, lift - 0.9, 0.5)
    place(buf, g.crash(1.8), lift, 0.3)
    place(buf, g.crash(2.6), end, 0.35)
    buf = reverb(buf, 0.2)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.35) / np.tanh(1.35)
    fade = int(0.5 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-polish.wav", buf, -1.5)
    print("wrote story-polish.wav")


def epiano(n, dur=1.8, bright=3000):
    """Rhodes-ish tone: warm fundamental, a bell partial on the attack and a
    slow tremolo."""
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 2.5)
    sig += 0.18 * np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t * 14)
    sig *= np.exp(-t * 1.1) * np.minimum(1, t / 0.003)
    sig *= 1 - 0.14 * (0.5 + 0.5 * np.sin(2 * np.pi * 4.6 * t))
    return lp(sig, bright)


def brush_snare(dur=0.32):
    t = t_axis(dur)
    n = bp(g.RNG.standard_normal(len(t)), 700, 6000)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03) * 0.35
    return (n * (np.exp(-t / 0.05) * 0.7 + np.exp(-t / 0.16) * 0.25) + body) * 0.55


def crackle(dur):
    t = t_axis(dur)
    hiss = bp(g.RNG.standard_normal(len(t)), 1500, 7000) * 0.012
    pops = (g.RNG.random(len(t)) > 0.99965).astype(float) * g.RNG.uniform(-1, 1, len(t))
    pops = bp(pops, 1200, 9000) * 0.6
    return hiss + pops


def silk():
    bpm, total = 84, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s8 = beat / 2
    swing = s8 * 0.18  # late off-beats
    drop, lift, end = 2 * bar, 4 * bar, 6 * bar
    g.RNG = np.random.default_rng(67)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (38, [53, 57, 60, 64]),  # Dm9
        (43, [53, 59, 64]),  # G13
        (36, [52, 55, 59, 62]),  # Cmaj9
        (45, [55, 61, 65]),  # A7b13
    ]
    for b in range(int(np.ceil(total / bar))):
        root, voicing = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        last = t0 >= end - 0.01
        # e-piano: the chord on 1, a softer push on the and-of-2
        bright = 1400 + 900 * b if t0 < drop else 3200
        if not last:
            for k, n in enumerate(voicing):
                place(buf, epiano(n, bar, bright), t0 + k * 0.012, 0.26, pan=-0.2 + 0.4 * k / len(voicing))
                place(buf, epiano(n + 12 if k == len(voicing) - 1 else n, beat * 1.4, bright), t0 + 1.5 * beat + swing + k * 0.01, 0.13, pan=0.2)
        place(buf, warm_pad([n - 12 for n in voicing[:2]] + voicing, bar + 0.4 if not last else total - t0, bright=900), t0, 0.16)
        if drop <= t0 < end:
            for k in range(4):
                tb = t0 + k * beat
                if k in (0,):
                    place(buf, g.kick(0.5, 110, 42, punch=0.4), tb, 0.6)
                if k == 2:
                    place(buf, g.kick(0.5, 110, 42, punch=0.4), tb - s8 + swing, 0.45)
                if k in (1, 3):
                    place(buf, brush_snare(), tb, 0.5, pan=0.08)
            for i in range(8):
                place(buf, g.hat(0.05), t0 + i * s8 + (swing if i % 2 else 0), 0.55 if i % 2 else 0.85, pan=0.3)
            place(buf, g.bass_note(root - 12, beat * 1.7, cutoff=320), t0, 0.62)
            place(buf, g.bass_note(root - 12 + (7 if b % 2 else 12), beat * 0.8, cutoff=320), t0 + 2.5 * beat + swing, 0.5)
            place(buf, g.bass_note(root - 12, beat * 0.9, cutoff=320), t0 + 3 * beat + swing, 0.45)
    # end card: a rolled Dm9 that rings out
    for k, n in enumerate([50, 57, 60, 64, 65, 69, 72]):
        place(buf, epiano(n, total - end, 3000), end + k * 0.07, 0.22, pan=-0.3 + 0.1 * k)
    place(buf, g.crash(2.4), drop, 0.4)
    place(buf, g.riser(1.2) * 0.35, lift - 1.2, 0.5)
    place(buf, g.crash(1.8), lift, 0.25)
    place(buf, g.crash(2.6), end, 0.3)
    st = crackle(total)
    place(buf, np.stack([st, np.roll(st, 337)]), 0, 1.0)
    buf = reverb(buf, 0.24)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.3) / np.tanh(1.3)
    fade = int(0.5 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-silk.wav", buf, -1.5)
    print("wrote story-silk.wav")


PRESETS = {"dawn": dawn, "polish": polish, "silk": silk}

if __name__ == "__main__":
    PRESETS[sys.argv[1]]()

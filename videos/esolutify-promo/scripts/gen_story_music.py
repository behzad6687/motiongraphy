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

atelier (Crown, 20 s): 106.7 BPM (a bar is 67.5 frames), E minor,
Em-Cmaj7-Am9-Bsus, dark and precise like a watch movement.
  0-4.5 s    bars 0-1   tick-tock clockwork, a low drone, sparse piano
  4.5 s      bar 2      DROP into the 3D studio: boom, low drums, a pulsing
                        sub and a 16th pluck arpeggio
  13.5 s     bar 6      a lift for the tablet and phone
  16.9 s     bar 7.5    the end card: drums out, piano and drone ring to 20 s

workshop (Riel Build, 20 s): 96 BPM (a bar is 75 frames), G major,
G-Em7-Cmaj7-D, warm and handmade: picked guitar, upright bass, woodblock.
  0-5 s      bars 0-1   picked guitar alone over a soft pad; a low knock
                        when the plumb bob settles (1.9 s)
  5 s        bar 2      DROP into the laptop: kick, woodblock, shaker, bass
  10 s       bar 4      a lift for the tablet
  16.2 s     bar 6.5    the end card: band out, a slow strum rings to 20 s

skyline (National Aluminium, 20 s): 128 BPM (a bar is 56.25 frames), F minor,
Fm-Db-Ab-Eb, big and engineered: wind and a filtered arp over the clouds,
then a four-on-the-floor pulse with metallic hits.
  0-5.63 s   bars 0-2   wind, a wide pad, a 16th arp opening up
  5.63 s     bar 3      DROP: kick, sub pulse, claps, hats, a metal clang
  13.1 s     bar 7      a lift for the tablet
  16.9 s     bar 9      the end card: the beat stops, pad and a last clang

verdant (HB Developments, 20 s): 120 BPM (a bar is 60 frames), A minor,
Am9-Fmaj7-C-G6, warm and minimal, a soft deep-house pulse.
  0-5 s      intro      felt piano chords and a rising filtered pad
  5 s        beat 10    DROP as the house is finished: kick, rim, shaker,
                        round bass, chord stabs
  10 s       bar 5      a lift for the finish studio
  17 s       beat 34    the end card: the beat drops out, piano rings to 20 s

coolant (Coldloop, 22 s): 108 BPM (a beat is 16.7 frames), E minor,
Em-Cmaj7-Am-B, dark synthwave.
  0-1.1 s    intro      boot blips over a pad
  1.1 s      beat 2     DROP as the desktop page starts to scroll (frame 33):
                        kick, gated snare, octave bass, 16th saw arp
  11.67 s    beat 21    a lift for the phone (frame 350)
  15.56 s    beat 28    a lift for the numbers (frame 467)
  18.89 s    beat 34    the end card (frame 567): the beat stops, pad rings

pulse (N.H.F Clinics, 20 s): 92 BPM (a beat is 19.6 frames), D major,
Dmaj9-Bm7-Gmaj7-A6, calm and clinical: glassy bells, a soft heartbeat.
  0-5.2 s    intro      bells and a warm pad, one heartbeat per bar
  5.2 s      beat 8     the heartbeat settles into a pulse (frame 157): lub-dub
                        kick, shaker, round bass, bell arp in 8ths
  11.1 s     beat 17    a lift (frame 333)
  16.3 s     beat 25    the end card (frame 489): the pulse stops, bells ring
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


def tick(hi=True, dur=0.05):
    t = t_axis(dur)
    f = 3400 if hi else 2500
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004)
    click = bp(g.RNG.standard_normal(len(t)), 4000, 12000) * np.exp(-t / 0.002)
    return (tone * 0.6 + click * 0.5) * 0.5


def low_drum(dur=0.6):
    t = t_axis(dur)
    f = 55 + 70 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25)
    skin = bp(g.RNG.standard_normal(len(t)), 150, 1200) * np.exp(-t / 0.04) * 0.4
    return np.tanh((body + skin) * 1.5)


def boom(dur=3.0):
    t = t_axis(dur)
    f = 32 + 60 * np.exp(-t / 0.12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    air = lp(g.RNG.standard_normal(len(t)), 900) * np.exp(-t / 0.3) * 0.3
    return np.tanh((sub + air) * 1.4)


def atelier():
    bpm, total = 320 / 3, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s16 = beat / 4
    drop, lift, end = 2 * bar, 6 * bar, 7.5 * bar
    g.RNG = np.random.default_rng(79)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (40, [52, 55, 59, 64], [64, 67, 71, 74]),  # Em(add9-ish)
        (36, [52, 55, 59, 60], [60, 64, 67, 71]),  # Cmaj7
        (45, [55, 57, 60, 64], [69, 71, 72, 76]),  # Am9
        (47, [54, 59, 64, 66], [66, 71, 73, 76]),  # Bsus
    ]
    motif = [76, 74, 71, 67]
    nb = int(np.ceil(total / bar))
    for b in range(nb):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        tail = t0 >= end - bar / 2
        # the drone: dark strings, always
        place(buf, warm_pad([root, root + 12] + pad[:2], bar + 0.8, bright=900 if t0 < drop else 1100), t0, 0.48 if t0 < drop else 0.32)
        # clockwork: tick-tock on 8ths until the end card
        if t0 < end:
            for i in range(8):
                at = t0 + i * beat / 2
                if at < end:
                    place(buf, tick(i % 2 == 0), at, 0.36 if t0 < drop else 0.2, pan=-0.4 + 0.8 * (i % 2))
        # piano: one note per beat in the intro, the motif on bar starts later
        if t0 < drop:
            for k in (0, 2, 3):
                place(buf, soft_piano(motif[(b * 3 + k) % 4], 2.4, bright=2400), t0 + k * beat, 0.32, pan=0.2)
        elif t0 < end:
            place(buf, soft_piano(motif[b % 4] + 12, 2.0, bright=3000), t0, 0.12, pan=0.3)
            for i in range(16):
                at = t0 + i * s16
                if at >= end:
                    break
                place(buf, g.pluck(arp[(i * 3) % 4] - 12 + (12 if i % 8 == 7 else 0), 0.22, cutoff=2400 + 1200 * (b % 2)), at, 0.16 if i % 2 else 0.22, pan=-0.3 + 0.6 * (i % 2))
            for k in range(4):
                at = t0 + k * beat
                if at >= end:
                    break
                if k in (0, 2):
                    place(buf, low_drum(), at, 0.6)
                if k in (1, 3):
                    place(buf, g.clap(), at, 0.22, pan=0.1)
                for j in range(2):  # pulsing sub on 8ths
                    place(buf, g.bass_note(root - 12, beat * 0.42, cutoff=260), at + j * beat / 2, 0.5)
            if b % 2 == 1:  # a small fill into the next pair of bars
                for j in range(3):
                    place(buf, low_drum(0.4), t0 + 3 * beat + j * s16 + s16, 0.35)
    place(buf, boom(), drop, 0.85)
    place(buf, g.riser(1.4) * 0.4, drop - 1.4, 0.5)
    place(buf, g.riser(0.9) * 0.3, lift - 0.9, 0.5)
    place(buf, g.crash(1.8), lift, 0.28)
    # end card: boom, a held Em(add9) and the motif once more, slowly
    place(buf, boom(3.2), end, 0.6)
    place(buf, warm_pad([40, 52, 55, 59, 66], total - end, bright=1400), end, 0.36)
    for k, n in enumerate([76, 71, 67, 64]):
        place(buf, soft_piano(n, 3.0, bright=2600), end + 0.15 + k * beat, 0.2, pan=-0.2 + 0.13 * k)
    buf = reverb(buf, 0.26)
    buf = hp(buf, 28)
    buf = np.tanh(buf * 1.35) / np.tanh(1.35)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-atelier.wav", buf, -1.5)
    print("wrote story-atelier.wav")


def guitar(n, dur=1.6, bright=0.5):
    """Karplus-Strong plucked string."""
    f = midi(n)
    period = int(SR / f)
    total = int(dur * SR)
    buf = g.RNG.uniform(-1, 1, period)
    out = np.empty(total)
    decay = 0.996
    for i in range(total):
        out[i] = buf[i % period]
        nxt = buf[(i + 1) % period]
        buf[i % period] = decay * (bright * buf[i % period] + (1 - bright) * nxt)
    t = t_axis(dur)[:total]
    return lp(out, 4200) * np.minimum(1, t / 0.002) * 0.6


def woodblock(dur=0.12):
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.02) + 0.5 * np.sin(2 * np.pi * 1450 * t) * np.exp(-t / 0.012)
    return tone * 0.45


def knock(dur=0.35):
    t = t_axis(dur)
    body = np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.07)
    wood = bp(g.RNG.standard_normal(len(t)), 300, 2500) * np.exp(-t / 0.02) * 0.6
    return (body + wood) * 0.7


def upright(n, dur):
    t = t_axis(dur)
    f = midi(n)
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4)
    thump = lp(g.RNG.standard_normal(len(t)), 400) * np.exp(-t / 0.015) * 0.3
    return (sig * np.exp(-t * 2.2) + thump) * np.minimum(1, t / 0.004)


def workshop():
    bpm, total = 96, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s8 = beat / 2
    drop, lift, end = 2 * bar, 4 * bar, 6.5 * bar
    g.RNG = np.random.default_rng(97)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (43, [55, 59, 62, 67]),  # G
        (40, [52, 55, 59, 62]),  # Em7
        (36, [52, 55, 59, 64]),  # Cmaj7
        (38, [54, 57, 62, 66]),  # D
    ]
    pick = [0, 2, 1, 3, 2, 1, 3, 2]  # travis-ish 8ths
    for b in range(int(np.ceil(total / bar))):
        root, ch = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        place(buf, warm_pad(ch[:3], bar + 0.5, bright=900), t0, 0.26 if t0 < drop else 0.12)
        if t0 < end:
            for i, k in enumerate(pick):
                at = t0 + i * s8
                if at >= end:
                    break
                n = ch[k] if i % 4 else root + 12  # thumb on the beat
                lift_g = 3.4 if t0 < drop else 1.5
                place(buf, guitar(n, 1.4), at, (0.32 if i % 4 == 0 else 0.24) * lift_g, pan=-0.25 + 0.5 * (k / 3))
        if drop <= t0 < end:
            for k in range(4):
                at = t0 + k * beat
                if at >= end:
                    break
                if k in (0, 2):
                    place(buf, g.kick(0.4, 120, 48, punch=0.5), at, 0.5)
                if k in (1, 3):
                    place(buf, woodblock(), at, 0.4, pan=0.2)
                    place(buf, g.clap(), at, 0.12, pan=-0.1)
                for j in range(2):
                    place(buf, shaker(), at + j * s8, 0.55 if j else 0.35, pan=0.35)
            place(buf, upright(root - 12, beat * 1.8), t0, 0.55)
            place(buf, upright(root - 12 + 7, beat * 0.9), t0 + 2 * beat, 0.45)
            place(buf, upright(root - 12 + 12, beat * 0.9), t0 + 3 * beat, 0.4)
    place(buf, knock(), 1.9, 0.9)  # the bob settles
    place(buf, g.riser(1.4) * 0.35, drop - 1.4, 0.5)
    place(buf, g.crash(2.0), drop, 0.4)
    place(buf, g.riser(0.9) * 0.28, lift - 0.9, 0.5)
    place(buf, g.crash(1.6), lift, 0.25)
    # end card: a slow G strum
    for k, n in enumerate([43, 50, 55, 59, 62, 67]):
        place(buf, guitar(n, total - end), end + k * 0.045, 1.1, pan=-0.3 + 0.12 * k)
    place(buf, warm_pad([43, 55, 59, 62], total - end, bright=1200), end, 0.4)
    buf = reverb(buf, 0.2)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.3) / np.tanh(1.3)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-workshop.wav", buf, -1.5)
    print("wrote story-workshop.wav")


def clang(dur=1.6):
    """A struck aluminium beam: inharmonic partials, fast attack."""
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for f, a, d in [(523, 1.0, 0.9), (1347, 0.6, 0.5), (2211, 0.4, 0.35), (3389, 0.25, 0.2), (4870, 0.15, 0.12)]:
        sig += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    hit = bp(g.RNG.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.01) * 0.6
    return (sig * 0.35 + hit) * np.minimum(1, t / 0.001)


def wind(dur):
    t = t_axis(dur)
    n = g.RNG.standard_normal(len(t))
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t)
    return g.sweep_lp(n, 400, 2200, curve=1.0) * (0.3 + 0.4 * lfo) * 0.18


def skyline():
    bpm, total = 128, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s16 = beat / 4
    drop, lift, end = 3 * bar, 7 * bar, 9 * bar
    g.RNG = np.random.default_rng(113)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (41, [53, 56, 60, 65], [65, 68, 72, 77]),  # Fm
        (37, [53, 56, 61, 65], [65, 68, 73, 77]),  # Db
        (44, [51, 56, 60, 63], [63, 68, 72, 75]),  # Ab
        (39, [51, 55, 58, 63], [63, 67, 70, 75]),  # Eb
    ]
    w = wind(drop + 1.0)
    place(buf, np.stack([w, np.roll(w, 911)]), 0, 1.5)
    for b in range(int(np.ceil(total / bar))):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        tail = t0 >= end - 0.01
        place(buf, g.pad_chord(pad, (total - t0) if tail else bar + 0.4, bright=1800 if t0 < drop else 2400), t0, 0.9 if t0 < drop else 0.36)
        if not tail:
            for i in range(16):
                at = t0 + i * s16
                n = arp[(i * 3 + (i // 4)) % 4] + (12 if i % 8 == 6 else 0)
                cut = 900 + 2600 * min(1, t0 / drop) if t0 < drop else 4200
                place(buf, g.pluck(n, 0.2, cutoff=cut), at, 0.5 if t0 < drop else 0.2, pan=-0.35 + 0.7 * ((i * 5) % 8) / 7)
        if drop <= t0 < end:
            for k in range(4):
                at = t0 + k * beat
                place(buf, g.kick(0.36, 150, 46, punch=0.9), at, 0.7)
                place(buf, g.hat(0.04), at + beat / 2, 0.8, pan=0.3)
                if k in (1, 3):
                    place(buf, g.clap(), at, 0.32, pan=-0.05)
                # sidechained sub: 8th-note pumps between the kicks
                place(buf, g.bass_note(root - 12, beat * 0.45, cutoff=300), at + beat / 2, 0.55)
            if b % 2 == 0:
                place(buf, clang(), t0, 0.32, pan=0.15)
    place(buf, g.riser(2.4) * 0.5, drop - 2.4, 0.55)
    place(buf, g.crash(2.4), drop, 0.5)
    place(buf, clang(2.2), drop, 0.5)
    place(buf, g.riser(1.2) * 0.35, lift - 1.2, 0.5)
    place(buf, g.crash(1.8), lift, 0.3)
    place(buf, clang(3.0), end, 0.55)
    place(buf, g.crash(2.6), end, 0.35)
    place(buf, g.bass_note(29, total - end, cutoff=220), end, 0.5)
    buf = reverb(buf, 0.22)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.35) / np.tanh(1.35)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-skyline.wav", buf, -1.5)
    print("wrote story-skyline.wav")


def verdant():
    bpm, total = 120, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s8 = beat / 2
    drop, lift, end = 5.0, 10.0, 17.0
    g.RNG = np.random.default_rng(131)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (45, [55, 60, 64, 67, 71]),  # Am9
        (41, [53, 57, 60, 64]),  # Fmaj7
        (36, [52, 55, 60, 64]),  # C
        (43, [52, 55, 59, 62]),  # G6
    ]
    for b in range(int(np.ceil(total / bar))):
        root, ch = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        # pad under everything; brighter as the house is built
        bright = 700 + 1500 * min(1, t0 / drop)
        place(buf, warm_pad(ch[:4], bar + 0.5, bright=bright), t0, 0.32)
        for k in range(4):
            at = t0 + k * beat
            if at >= total:
                break
            if at < drop:
                if k in (0, 2):  # felt piano chords on 1 and 3
                    for j, n in enumerate(ch):
                        place(buf, soft_piano(n, 1.8, bright=2200), at + j * 0.012, 0.16, pan=-0.2 + 0.1 * j)
            elif at < end:
                place(buf, g.kick(0.34, 130, 48, punch=0.6), at, 0.6)
                place(buf, g.hat(0.05), at + s8, 0.7, pan=0.3)
                if k in (1, 3):
                    place(buf, rim(), at, 0.32, pan=0.15)
                for j in range(2):
                    place(buf, shaker(), at + j * s8 + s8 / 2, 0.35, pan=-0.3)
                # chord stab on the off-beat
                st = g.pad_chord(ch[1:5], 0.32, bright=2600)
                st *= np.exp(-np.arange(st.shape[1]) / SR / 0.12)
                place(buf, st, at + s8, 0.55)
                place(buf, g.bass_note(root - 12 + (7 if k == 3 else 0), beat * 0.7, cutoff=420), at, 0.5)
    place(buf, g.riser(2.0) * 0.4, drop - 2.0, 0.5)
    place(buf, g.crash(2.2), drop, 0.4)
    place(buf, g.riser(1.0) * 0.3, lift - 1.0, 0.5)
    place(buf, g.crash(1.6), lift, 0.25)
    for j, n in enumerate([57, 60, 64, 67, 71, 76]):
        place(buf, soft_piano(n, total - end, bright=2400), end + j * 0.06, 0.24, pan=-0.25 + 0.1 * j)
    place(buf, warm_pad([45, 57, 60, 64, 71], total - end, bright=1600), end, 0.4)
    buf = reverb(buf, 0.24)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.3) / np.tanh(1.3)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-verdant.wav", buf, -1.5)
    print("wrote story-verdant.wav")


def blip(n, dur=0.07):
    t = t_axis(dur)
    sq = np.sign(np.sin(2 * np.pi * midi(n) * t))
    return lp(sq, 5000) * np.exp(-t / 0.03) * 0.25


def gated_snare(dur=0.3):
    t = t_axis(dur)
    n = bp(g.RNG.standard_normal(len(t)), 900, 7000)
    body = np.sin(2 * np.pi * 200 * t) * np.exp(-t / 0.03) * 0.5
    gate = (t < 0.18).astype(float) * np.exp(-t / 0.4)
    return (n * 0.7 + body) * gate


def coolant():
    bpm, total = 108, 22.0
    beat = 60 / bpm
    bar = 4 * beat
    s16 = beat / 4
    drop, lift, lift2, end = 2 * beat, 21 * beat, 28 * beat, 34 * beat
    g.RNG = np.random.default_rng(151)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (40, [52, 55, 59, 64], [64, 67, 71, 76]),  # Em
        (36, [52, 55, 59, 60], [60, 64, 67, 71]),  # Cmaj7
        (45, [52, 57, 60, 64], [64, 69, 72, 76]),  # Am
        (47, [51, 54, 59, 63], [63, 66, 71, 75]),  # B
    ]
    # boot blips over the first second
    for i in range(9):
        place(buf, blip(84 + (i * 7) % 12), 0.05 + i * 0.1, 0.5, pan=-0.4 + 0.8 * ((i * 3) % 5) / 4)
    for b in range(int(np.ceil(total / bar))):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        place(buf, g.pad_chord(pad, bar + 0.4, bright=1200 + 2200 * min(1, t0 / drop)), t0, 1.0 if t0 < drop else 0.34)
        for i in range(16):
            at = t0 + i * s16
            if at < drop or at >= end:
                continue
            n = arp[(i * 3) % 4] + (12 if i % 8 == 7 else 0)
            cut = 700 + 3000 * min(1, at / drop) if at < drop else 4000
            place(buf, g.pluck(n, 0.18, cutoff=cut), at, 0.6 if at < drop else 0.2, pan=-0.35 + 0.7 * (i % 2))
        for k in range(4):
            at = t0 + k * beat
            if not (drop <= at < end):
                continue
            place(buf, g.kick(0.4, 150, 45, punch=1.0), at, 0.7)
            if k in (1, 3):
                place(buf, gated_snare(), at, 0.42, pan=0.05)
            place(buf, g.hat(0.04), at + beat / 2, 0.7, pan=0.3)
            for j in range(2):
                place(buf, g.bass_note(root - 12 + (12 if j else 0), beat * 0.42, cutoff=600), at + j * beat / 2, 0.42)
    place(buf, g.riser(1.0) * 0.45, drop - 1.0, 0.55)
    place(buf, g.crash(2.4), drop, 0.45)
    for lf in (lift, lift2):
        place(buf, g.riser(1.0) * 0.32, lf - 1.0, 0.5)
        place(buf, g.crash(1.8), lf, 0.28)
    place(buf, g.pad_chord([40, 52, 55, 59, 64, 71], total - end, bright=2600), end, 1.3)
    place(buf, g.crash(2.6), end, 0.3)
    buf = reverb(buf, 0.24)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.35) / np.tanh(1.35)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-coolant.wav", buf, -1.5)
    print("wrote story-coolant.wav")


def bell(n, dur=1.6):
    """Glassy FM bell."""
    t = t_axis(dur)
    f = midi(n)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    sig = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.4)
    return sig * np.minimum(1, t / 0.002) * 0.5


def heartbeat(gain=1.0):
    """lub-dub: two soft low thumps."""
    out = np.zeros(int(0.5 * SR))
    for off, a in ((0.0, 1.0), (0.17, 0.7)):
        k = g.kick(0.3, 90, 42, punch=0.2) * a
        i = int(off * SR)
        out[i:i + len(k)] += k[: len(out) - i]
    return lp(out, 900) * gain


def pulse():
    bpm, total = 92, 20.0
    beat = 60 / bpm
    bar = 4 * beat
    s8 = beat / 2
    drop, lift, end = 8 * beat, 17 * beat, 25 * beat
    g.RNG = np.random.default_rng(173)
    buf = np.zeros((2, int(total * SR)))
    prog = [
        (38, [54, 57, 61, 64], [66, 69, 73, 76]),  # Dmaj9
        (35, [54, 57, 59, 62], [62, 66, 69, 74]),  # Bm7
        (43, [54, 59, 62, 66], [62, 66, 71, 74]),  # Gmaj7
        (45, [54, 57, 61, 64], [64, 69, 73, 76]),  # A6
    ]
    for b in range(int(np.ceil(total / bar))):
        root, pad, arp = prog[b % 4]
        t0 = b * bar
        if t0 >= total:
            break
        place(buf, warm_pad(pad, bar + 0.6, bright=1500), t0, 0.5 if t0 < drop else 0.36)
        if t0 < drop:
            place(buf, heartbeat(0.9), t0, 1.0)
            for k, i in enumerate((0, 3, 5)):
                place(buf, bell(arp[(b + k) % 4], 2.0), t0 + i * s8, 0.5, pan=-0.3 + 0.3 * k)
        elif t0 < end:
            for k in range(4):
                at = t0 + k * beat
                if at >= end:
                    break
                if k in (0, 2):
                    place(buf, heartbeat(1.0), at, 0.9)
                place(buf, shaker(), at + s8, 0.6, pan=0.3)
                place(buf, g.bass_note(root - 12 + (7 if k == 3 else 0), beat * 0.8, cutoff=380), at, 0.45)
            for i in range(8):
                at = t0 + i * s8
                if at >= end:
                    break
                place(buf, bell(arp[(i * 3) % 4] + (12 if i == 7 else 0), 1.2), at, 0.32, pan=-0.35 + 0.7 * (i % 2))
    place(buf, g.riser(1.6) * 0.3, drop - 1.6, 0.5)
    place(buf, g.crash(2.0), drop, 0.3)
    place(buf, g.riser(1.0) * 0.25, lift - 1.0, 0.5)
    for k, n in enumerate([62, 66, 69, 73, 78]):
        place(buf, bell(n, total - end), end + k * 0.09, 1.0, pan=-0.3 + 0.15 * k)
    place(buf, warm_pad([38, 54, 57, 61, 64], total - end, bright=1800), end, 1.1)
    buf = reverb(buf, 0.28)
    buf = hp(buf, 30)
    buf = np.tanh(buf * 1.3) / np.tanh(1.3)
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade)
    write_wav(OUT / "story-pulse.wav", buf, -1.5)
    print("wrote story-pulse.wav")


PRESETS = {
    "pulse": pulse,
    "coolant": coolant,
    "verdant": verdant,
    "skyline": skyline,
    "dawn": dawn,
    "polish": polish,
    "silk": silk,
    "atelier": atelier,
    "workshop": workshop,
}

if __name__ == "__main__":
    PRESETS[sys.argv[1]]()

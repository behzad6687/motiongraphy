"""Synthesise the music bed and SFX kit for the eSolutify promo.

Everything is generated from scratch (no samples, no downloads) and is fully
deterministic, so the soundtrack can be re-rendered at any time:

    pip install numpy scipy
    python3 scripts/gen_audio.py

Writes public/audio/music.wav and public/audio/sfx/*.wav.

Music: 120 BPM (15 frames per beat at 30 fps), A minor, i-VI-III-VII.
Arrangement is locked to the storyboard timeline (one bar = 2 s = 60 frames):
  bars 0-2   hook        pad + heartbeat pulse
  bars 3-6   problem     + ticking hats, filtered arp, riser into the drop
  bar  7     14.0 s      DROP on the logo reveal
  bars 7-30  groove      four-on-the-floor, bass, arp, fills every 8 bars
  bars 31-34 CTA         breakdown, final chord rings out to 70 s
"""

from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
TOTAL = 70.0
RNG = np.random.default_rng(7)

OUT = Path(__file__).resolve().parent.parent / "public" / "audio"
(OUT / "sfx").mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------- helpers
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def sweep_lp(x, f0, f1, curve=2.0, block=256):
    """Time-varying low-pass: filter in blocks with a cutoff sweeping f0->f1."""
    y = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, block):
        p = (i / max(n - 1, 1)) ** curve
        fc = f0 + (f1 - f0) * p
        sos = butter(2, min(max(fc, 30), SR / 2 - 200), "low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y[i : i + block], zi = sosfilt(sos, x[i : i + block], zi=zi)
    return y


def saw(freq, t, phase=0.0):
    ph = (freq * t + phase) % 1.0
    return 2 * ph - 1


def adsr(n, a, d, s, r, sus_len=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    sus_n = max(n - a_n - d_n - r_n, 0) if sus_len is None else int(sus_len * SR)
    env = np.concatenate(
        [
            np.linspace(0, 1, max(a_n, 1)),
            np.linspace(1, s, max(d_n, 1)),
            np.full(sus_n, s),
            np.linspace(s, 0, max(r_n, 1)),
        ]
    )
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def reverb_ir(dur=2.2, decay=3.2, seed=3):
    rng = np.random.default_rng(seed)
    t = t_axis(dur)
    ir_l = rng.standard_normal(len(t)) * np.exp(-decay * t)
    ir_r = rng.standard_normal(len(t)) * np.exp(-decay * t)
    ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
    ir_l[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    ir_r[: int(0.017 * SR)] *= np.linspace(0, 1, int(0.017 * SR))
    return ir_l / np.abs(ir_l).sum() * 18, ir_r / np.abs(ir_r).sum() * 18


IR = reverb_ir()


def reverb(mono_or_st, wet=0.3):
    st = mono_or_st if mono_or_st.ndim == 2 else np.stack([mono_or_st, mono_or_st])
    n = st.shape[1]
    l = fftconvolve(st[0], IR[0])[:n]
    r = fftconvolve(st[1], IR[1])[:n]
    return st * (1 - wet) + np.stack([l, r]) * wet


def place(buf, sig, at, gain=1.0, pan=0.0):
    """Mix a mono or stereo signal into buf (2, N) at time `at` seconds."""
    i = int(at * SR)
    if i >= buf.shape[1]:
        return
    st = sig if sig.ndim == 2 else np.stack([sig * (1 - max(pan, 0)), sig * (1 + min(pan, 0))])
    n = min(st.shape[1], buf.shape[1] - i)
    buf[:, i : i + n] += st[:, :n] * gain


def write_wav(path, st, peak_db=-1.0):
    st = np.asarray(st, dtype=np.float64)
    if st.ndim == 1:
        st = np.stack([st, st])
    peak = np.max(np.abs(st)) or 1.0
    st = st / peak * 10 ** (peak_db / 20)
    pcm = (np.clip(st.T, -1, 1) * 32767).astype("<i2")
    import wave

    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------------------------------------------------------------- voices
def kick(dur=0.45, f_hi=160, f_lo=48, punch=1.0):
    t = t_axis(dur)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(RNG.standard_normal(len(t)), 3000) * np.exp(-t / 0.004) * 0.25 * punch
    return np.tanh((body + click) * 1.6)


def clap(dur=0.35):
    t = t_axis(dur)
    n = RNG.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, off in enumerate([0, 0.011, 0.022]):
        env += np.exp(-np.clip(t - off, 0, None) / (0.006 if k < 2 else 0.09)) * (t >= off)
    return bp(n, 900, 5200) * env * 0.8


def hat(dur=0.05, open_=False):
    t = t_axis(0.22 if open_ else dur)
    n = bp(RNG.standard_normal(len(t)), 6500, 12000)
    return n * np.exp(-t / (0.05 if open_ else 0.01)) * 0.16


def pad_chord(notes, dur, bright=1800, detune=0.0045):
    t = t_axis(dur)
    l = np.zeros_like(t)
    r = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for k, d in enumerate([-detune, 0, detune]):
            ph = RNG.random()
            l += saw(f * (1 + d), t, ph) * (0.8 if k == 1 else 0.6)
            r += saw(f * (1 - d * 1.3), t, ph + 0.25) * (0.8 if k == 1 else 0.6)
    env = adsr(len(t), 0.35, 0.4, 0.85, 0.6)
    l, r = lp(l, bright) * env, lp(r, bright) * env
    return np.stack([l, r]) / (len(notes) * 3)


def bass_note(n, dur, cutoff=700):
    t = t_axis(dur)
    f = midi(n)
    sig = saw(f, t) * 0.7 + np.sin(2 * np.pi * f * t) * 0.8
    env = adsr(len(t), 0.004, 0.08, 0.7, 0.05)
    return lp(sig, cutoff) * env


def pluck(n, dur=0.3, cutoff=3200):
    t = t_axis(dur)
    f = midi(n)
    sig = saw(f, t) * 0.5 + np.sign(np.sin(2 * np.pi * f * 2 * t)) * 0.15
    env = np.exp(-t / 0.09)
    return lp(sig, cutoff) * env


def riser(dur=2.0):
    t = t_axis(dur)
    n = RNG.standard_normal(len(t))
    sw = sweep_lp(n, 300, 9000, curve=2.2)
    tone_f = 180 + 900 * (t / dur) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(tone_f) / SR) * 0.25
    env = (t / dur) ** 2.2
    return (sw * 0.6 + tone) * env


def crash(dur=2.4):
    t = t_axis(dur)
    n = hp(RNG.standard_normal(len(t)), 4200)
    return n * np.exp(-t / 0.6) * 0.18


# ---------------------------------------------------------------- music
def configure(bpm, total):
    """Retarget tempo and length (module globals read by music())."""
    global BPM, BEAT, BAR, TOTAL
    BPM, BEAT, BAR, TOTAL = bpm, 60 / bpm, 4 * 60 / bpm, total


def music(
    drop=7,
    outro=31,
    intro=3,
    out="music.wav",
    fade_out=4.0,
    fade_in=0.4,
    drop_crash=0.5,
    drop_clap=0.0,
    riser_gain=0.55,
    hp_hz=28,
    roll_gain=1.0,
    intro_bright=900,
    presence=1.0,
):
    """intro: heartbeat bars; intro..drop: build + riser; drop..outro: groove; outro: ring-out.

    The keyword defaults reproduce the brand film's music.wav exactly. The ad
    passes phone-speaker-friendly values: the bed is present from frame 0, and
    the drop gains presence (crash + clap) instead of only sub bass."""
    n = int(TOTAL * SR)
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    pads = np.zeros((2, n))
    arps = np.zeros((2, n))
    fx = np.zeros((2, n))

    # i - VI - III - VII in A minor (pad voicings / bass roots / arp tones)
    prog = [
        ([57, 60, 64, 69], 33, [69, 72, 76, 81]),  # Am
        ([53, 57, 60, 65], 29, [65, 69, 72, 77]),  # F
        ([55, 60, 64, 67], 36, [67, 72, 76, 79]),  # C
        ([55, 59, 62, 67], 31, [67, 71, 74, 79]),  # G
    ]
    n_bars = int(np.ceil(TOTAL / BAR))
    DROP, OUTRO = drop, outro

    for b in range(n_bars):
        t0 = b * BAR
        chord, root, arp_tones = prog[b % 4]
        grooving = DROP <= b < OUTRO

        # pads: dark in the intro, open after the drop, soft in the outro
        bright = intro_bright if b < intro else 1400 if b < DROP else 2600 if grooving else 1500
        if b == n_bars - 1:
            continue
        pad_len = BAR + 0.6 if b < OUTRO else (TOTAL - t0 if b == OUTRO else 0)
        if b == OUTRO:
            chord = [57, 60, 64, 69, 72]  # final Am9-ish ring-out
        if pad_len > 0:
            place(pads, pad_chord(chord, pad_len, bright), t0, 0.9 if b < DROP else 0.75)

        # heartbeat pulse in the hook
        if b < intro:
            place(drums, kick(0.5, 90, 42, 0.2), t0, 0.55)
            place(drums, kick(0.5, 90, 42, 0.2), t0 + BEAT * 0.75, 0.35)
            place(drums, kick(0.5, 90, 42, 0.2), t0 + BEAT * 2, 0.55)
            place(drums, kick(0.5, 90, 42, 0.2), t0 + BEAT * 2.75, 0.35)

        # problem: ticking clock hats + quiet filtered arp + sub pulse
        if intro <= b < DROP:
            for s in range(16):
                place(drums, hat(), t0 + s * BEAT / 4, 0.35 if s % 2 else 0.6, pan=0.25 if s % 2 else -0.25)
            for q in range(4):
                place(drums, kick(0.5, 100, 42, 0.3), t0 + q * BEAT, 0.5)
            for s in range(8):
                note = arp_tones[s % 4] - 12
                place(arps, pluck(note, 0.25, 900 + 300 * (b - intro)), t0 + s * BEAT / 2, 0.35, pan=-0.3 if s % 2 else 0.3)
            place(bass, bass_note(root, BAR * 0.95, 300), t0, 0.5)

        if b == DROP - 1:
            place(fx, riser(BAR), t0, riser_gain)
            for s in range(8):  # snare roll into the drop
                place(drums, clap(0.15), t0 + BAR / 2 + s * BEAT / 4, (0.12 + 0.06 * s) * roll_gain)

        if grooving:
            fill = (b - DROP) % 8 == 7
            for q in range(4):
                place(drums, kick(), t0 + q * BEAT, 0.7)
                if q in (1, 3):
                    place(drums, clap(), t0 + q * BEAT, 0.55)
                place(drums, hat(open_=True), t0 + q * BEAT + BEAT / 2, 0.28 * presence, pan=0.2)
            for s in range(16):
                if s % 2 == 0:
                    place(drums, hat(), t0 + s * BEAT / 4, 0.22 * presence, pan=-0.3)
            if fill:
                for s in range(4):
                    place(drums, clap(0.15), t0 + 3 * BEAT + s * BEAT / 4, 0.25 + 0.08 * s)
            if (b - DROP) % 8 == 0:
                place(fx, crash(), t0, drop_crash if b == DROP else 0.5)
            # offbeat pumping bass
            for e in range(8):
                note = root + (12 if e in (3, 7) else 0)
                place(bass, bass_note(note, BEAT / 2 * 0.9, 900), t0 + e * BEAT / 2 + BEAT / 4, 0.75)
            # 16th arp, octave jumps every other bar
            up = 12 if (b // 2) % 2 else 0
            for s in range(16):
                note = arp_tones[[0, 2, 1, 3, 2, 0, 3, 1][s % 8]] + up - 12
                place(arps, pluck(note, 0.22, 2800), t0 + s * BEAT / 4, (0.28 if s % 4 else 0.38) * presence, pan=0.35 if s % 2 else -0.35)

        if b == DROP and drop_clap:
            place(drums, clap(), t0, drop_clap)
        if b == DROP:
            place(fx, kick(1.6, 120, 36, 0.6), t0, 0.9)  # impact
        if b >= OUTRO:
            if b == OUTRO:
                place(fx, crash(3.5), t0, 0.55)
                place(fx, kick(1.8, 120, 34, 0.5), t0, 0.8)
                place(bass, bass_note(33, BAR * 2, 250), t0, 0.55)
            for q in (0, 2):
                place(drums, kick(0.5, 100, 42, 0.3), t0 + q * BEAT, 0.45 if b < n_bars - 2 else 0.3)
            for s in range(8):
                place(arps, pluck(arp_tones[s % 4], 0.35, 1600), t0 + s * BEAT / 2, 0.18, pan=-0.3 if s % 2 else 0.3)

    # sidechain pump on pads/bass/arps from the groove kicks
    t = t_axis(TOTAL)
    pump = np.ones(n)
    beat_phase = (t % BEAT) / BEAT
    groove_mask = (t >= DROP * BAR) & (t < OUTRO * BAR)
    pump[groove_mask] = 0.35 + 0.65 * np.clip(beat_phase[groove_mask] / 0.45, 0, 1) ** 0.6

    # ping-pong dotted-eighth delay on the arp
    d = int(BEAT * 0.75 * SR)
    arps_d = arps.copy()
    arps_mono = arps.mean(axis=0)
    for k in range(1, 4):
        arps_d[k % 2, d * k :] += arps_mono[: n - d * k] * 0.35**k

    mix = (
        drums * 0.9
        + reverb(bass * pump, 0.08) * 0.6
        + reverb(pads * pump, 0.35) * 3.0
        + reverb(arps_d * pump, 0.3) * 2.4
        + reverb(fx, 0.4) * 0.7
    )
    mix = hp(mix, hp_hz)
    # gentle glue + soft clip
    mix = np.tanh(mix * 1.25) / np.tanh(1.25)
    # fade in / fade out
    fi = max(1, int(fade_in * SR))
    mix[:, :fi] *= np.linspace(0, 1, fi)
    fo = int(fade_out * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / out, mix, -1.0)


# ---------------------------------------------------------------- SFX kit
def sfx():
    def sine_tone(f, dur, dec):
        t = t_axis(dur)
        return np.sin(2 * np.pi * f * t) * np.exp(-t / dec)

    # notification ping: two bell tones
    p = np.zeros(int(0.9 * SR))
    for f, at in ((1318.5, 0.0), (1760.0, 0.09)):
        tone = sine_tone(f, 0.8, 0.18) + sine_tone(f * 2.76, 0.8, 0.05) * 0.2
        i = int(at * SR)
        p[i : i + len(tone)] += tone[: len(p) - i]
    write_wav(OUT / "sfx" / "ping.wav", reverb(p, 0.25), -3)

    # whooshes: band-limited noise with a sweeping low-pass and swell
    for name, dur, f0, f1 in (("whoosh.wav", 0.55, 400, 7000), ("whoosh-soft.wav", 0.8, 250, 3500)):
        t = t_axis(dur)
        nse = RNG.standard_normal(len(t))
        sw = sweep_lp(nse, f0, f1, curve=1.2)
        env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
        env *= np.exp(-np.clip(t - dur * 0.55, 0, None) * 6)
        st = np.stack([sw * env * np.linspace(1.2, 0.6, len(t)), sw * env * np.linspace(0.6, 1.2, len(t))])
        write_wav(OUT / "sfx" / name, reverb(st, 0.2), -4)

    # pop: pitch-drop blip
    t = t_axis(0.14)
    f = 300 + 700 * np.exp(-t / 0.025)
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045)
    write_wav(OUT / "sfx" / "pop.wav", pop, -4)

    # tick: tiny clock tick
    t = t_axis(0.05)
    tick = (np.sin(2 * np.pi * 3200 * t) * 0.6 + hp(RNG.standard_normal(len(t)), 5000) * 0.4) * np.exp(-t / 0.006)
    write_wav(OUT / "sfx" / "tick.wav", tick, -6)

    # blip: short soft UI blip (pitch it with playbackRate)
    t = t_axis(0.16)
    blip = (np.sin(2 * np.pi * 880 * t) + np.sin(2 * np.pi * 1760 * t) * 0.25) * np.exp(-t / 0.04)
    write_wav(OUT / "sfx" / "blip.wav", reverb(blip, 0.15), -5)

    # thud: dull low "negative" hit
    t = t_axis(0.9)
    f = 70 * np.exp(-t / 0.5) + 38
    thud = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25) + lp(RNG.standard_normal(len(t)), 400) * np.exp(-t / 0.05) * 0.5
    write_wav(OUT / "sfx" / "thud.wav", reverb(thud, 0.25), -3)

    # success chime: C6-E6-G6 bell arpeggio
    c = np.zeros(int(1.3 * SR))
    for k, n_ in enumerate((84, 88, 91)):
        tone = sine_tone(midi(n_), 1.0, 0.3) + sine_tone(midi(n_) * 2.01, 1.0, 0.12) * 0.3
        i = int(k * 0.07 * SR)
        c[i : i + len(tone)] += tone[: len(c) - i]
    write_wav(OUT / "sfx" / "chime.wav", reverb(c, 0.3), -4)

    # impact: cinematic sub hit
    t = t_axis(2.2)
    f = 42 + 90 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    boom += lp(RNG.standard_normal(len(t)), 1200) * np.exp(-t / 0.08) * 0.6
    write_wav(OUT / "sfx" / "impact.wav", reverb(np.tanh(boom * 1.5), 0.35), -2)

    # shimmer: airy bell cluster
    t = t_axis(1.8)
    sh = np.zeros_like(t)
    for n_ in (93, 96, 100, 103, 105):
        sh += np.sin(2 * np.pi * midi(n_) * t + RNG.random() * 6) * (0.6 + 0.4 * np.sin(2 * np.pi * (5 + RNG.random() * 3) * t))
    sh *= np.sin(np.pi * np.clip(t / 1.8, 0, 1)) ** 1.5 * np.exp(-t * 0.8)
    write_wav(OUT / "sfx" / "shimmer.wav", reverb(sh, 0.5), -8)

    # typing: soft keyboard patter
    ty = np.zeros(int(0.6 * SR))
    for k in range(6):
        t = t_axis(0.03)
        cl = bp(RNG.standard_normal(len(t)), 1800, 6000) * np.exp(-t / 0.005)
        i = int((k * 0.09 + RNG.random() * 0.03) * SR)
        ty[i : i + len(cl)] += cl[: len(ty) - i] * (0.6 + RNG.random() * 0.4)
    write_wav(OUT / "sfx" / "typing.wav", ty, -8)

    # riser (for the CTA swell)
    write_wav(OUT / "sfx" / "riser.wav", reverb(riser(1.5), 0.3), -4)

    # ring: classic phone trill, "ring-ring". Pure tones, no RNG, so adding it
    # leaves every other SFX and the music byte-identical.
    t = t_axis(1.25)
    trill = (np.sin(2 * np.pi * 20 * t) > 0).astype(float)
    tone = np.sin(2 * np.pi * 1320 * t) * 0.6 + np.sin(2 * np.pi * 1650 * t) * 0.4
    gate = ((t < 0.42) | ((t > 0.62) & (t < 1.04))).astype(float)
    env = np.minimum(1, t / 0.01) * gate
    write_wav(OUT / "sfx" / "ring.wav", reverb(lp(tone * trill * env, 6000), 0.15), -5)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "ad":
        # python3 scripts/gen_audio.py ad <bpm> <seconds> <drop_bar> <outro_bar> [intro_bars] [fade_out_s]
        bpm, secs, drop, outro = float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
        intro = int(sys.argv[6]) if len(sys.argv) > 6 else 0
        fade = float(sys.argv[7]) if len(sys.argv) > 7 else 1.5
        RNG = np.random.default_rng(11)
        configure(bpm, secs)
        music(
            drop=drop,
            outro=outro,
            intro=intro,
            out="ad-music.wav",
            fade_out=fade,
            fade_in=0.02,
            drop_crash=1.0,
            drop_clap=0.6,
            riser_gain=0.4,
            hp_hz=40,
            roll_gain=0.5,
            intro_bright=2200,
            presence=1.3,
        )
        print("wrote ad-music.wav", bpm, "bpm", secs, "s")
    else:
        sfx()
        music()
        print("wrote", sorted(p.name for p in (OUT).rglob("*.wav")))

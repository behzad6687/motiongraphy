"""Audio for the Sol explainer ("AI receptionist vs virtual receptionist vs
answering service"): a quirky game-show bed, Sol's babble voice and a kit of
comedy stingers. Deterministic, like every other track in this repo.

    python3 scripts/gen_sol_audio.py

Reads src/sol/script.json (Sol's lines and their frames) and writes
public/audio/sol-music-42.wav, public/audio/sol-voice-42.wav and
public/audio/sfx/{boing,wahwah,drumroll,tada,stamp,inflate}.wav.

Music: 120 BPM (15 frames a beat, 60 a bar), C major oom-pah (tuba on 1 & 3,
pizzicato chord on 2 & 4), glockenspiel motif, woodblock. It drops to a
tick-tock for the math round, stops dead for the stamp, ducks under each
drumroll and ends on a cadence.

Voice: cartoon babble (no words). Each word of a line is one or two chirpy
formant syllables, timed to the frame that word appears in the bubble.
"""

import json
from pathlib import Path

import numpy as np

import gen_audio as g
from gen_audio import OUT, SR, bp, hp, lp, midi, place, reverb, saw, t_axis, write_wav

FPS = 30
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
ROOT_SRC = Path(__file__).resolve().parent.parent / "src" / "sol"
SCRIPT = json.loads((ROOT_SRC / "script.json").read_text())
TOTAL = SCRIPT["total"] / FPS
RNG = np.random.default_rng(83)
g.RNG = np.random.default_rng(89)

sec = lambda frame: frame / FPS  # noqa: E731

# C - Am - F - G, one chord a bar: (root, chord tones for the pizz, glock scale)
PROG = [
    (36, [60, 64, 67], [72, 76, 79, 84]),
    (33, [60, 64, 69], [72, 76, 81, 84]),
    (29, [60, 65, 69], [72, 77, 81, 84]),
    (31, [59, 62, 67], [71, 74, 79, 83]),
]
# a cheeky two-bar glock motif: (8th step 0-15, scale index)
MOTIF = [(0, 0), (1, 1), (2, 2), (4, 3), (6, 2), (7, 1), (9, 0), (10, 1), (12, 2), (14, 1)]


# ---------------------------------------------------------------- instruments
def tuba(n, dur=0.32):
    t = t_axis(dur)
    f = midi(n) * (1 - 0.04 * np.exp(-t / 0.03))  # a little scoop
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) + 0.45 * lp(saw(1, np.cumsum(f) / SR), 500)
    env = np.minimum(1, t / 0.012) * np.exp(-t / 0.22)
    return np.tanh(sig * env * 1.4)


def pizz(notes, dur=0.25):
    t = t_axis(dur)
    sig = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        sig += np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.03)
    pluck = bp(RNG.standard_normal(len(t)), 800, 4000) * np.exp(-t / 0.004) * 0.6
    return (sig / len(notes) + pluck) * np.exp(-t / 0.08)


def glock(n, dur=0.7):
    t = t_axis(dur)
    f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.08)) * np.exp(-t / 0.3)


def woodblock(high=True):
    t = t_axis(0.08)
    f = 1400 if high else 1000
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.018) + bp(RNG.standard_normal(len(t)), 900, 3000) * np.exp(-t / 0.004) * 0.3


def clap():
    t = t_axis(0.25)
    env = np.zeros_like(t)
    for k, off in enumerate((0, 0.01, 0.02)):
        env += np.exp(-np.clip(t - off, 0, None) / (0.005 if k < 2 else 0.07)) * (t >= off)
    return bp(RNG.standard_normal(len(t)), 1000, 6000) * env * 0.7


def shaker():
    t = t_axis(0.06)
    return hp(RNG.standard_normal(len(t)), 7000) * np.minimum(1, t / 0.008) * np.exp(-t / 0.02) * 0.2


# ---------------------------------------------------------------- music
def music(total=None, tick=(420, 686), stops=((684, 698),), ducks=None, out="sol-music-42.wav", duck_level=0.3):
    """The show's theme. Defaults reproduce episode 1 (the receptionist showdown)."""
    TOTAL = total if total is not None else globals()["TOTAL"]  # noqa: N806
    if ducks is None:
        ducks = list(zip(SCRIPT["drumrolls"], SCRIPT["verdicts"]))
    n = int(TOTAL * SR)
    mix = np.zeros((2, n))
    bars = int(np.ceil(TOTAL / BAR))
    math_from, math_to = (sec(tick[0]), sec(tick[1])) if tick else (-1, -1)
    for b in range(bars):
        t0 = b * BAR
        root, chord, scale = PROG[b % 4]
        final = b >= bars - 2
        if final:  # cadence: F - G - C
            root, chord, scale = (PROG[2] if b == bars - 2 else (36, [60, 64, 67], [72, 76, 79, 84]))
        in_math = math_from <= t0 < math_to
        for q in range(4):
            at = t0 + q * BEAT
            if at >= TOTAL:
                break
            if q % 2 == 0:
                place(mix, tuba(root + (7 if q == 2 and not final else 0) + 12), at, 0.75)
            else:
                place(mix, pizz(chord), at, 0.55, pan=0.15)
                if not in_math:
                    place(mix, clap(), at, 0.35, pan=-0.1)
        for e in range(8):
            at = t0 + e * BEAT / 2
            if at >= TOTAL:
                break
            if in_math:
                place(mix, woodblock(e % 2 == 0), at, 0.4, pan=0.3 if e % 2 else -0.3)  # tick-tock
            else:
                place(mix, shaker(), at, 0.5, pan=0.3)
                if e % 2:
                    place(mix, woodblock(), at, 0.15, pan=-0.3)
        if not in_math:
            half = 8 if b % 2 else 0
            for step, idx in MOTIF:
                if half <= step < half + 8:
                    at = t0 + (step - half) * BEAT / 2
                    if at < TOTAL - 0.3:
                        place(mix, glock(scale[idx]), at, 0.3, pan=-0.2)
        if final and b == bars - 1:
            place(mix, glock(84, 2.0), t0, 0.4)
            place(mix, pizz([60, 64, 67, 72], 1.2), t0, 0.6)

    mix = reverb(mix, 0.18)
    # dynamics: dead stop before the stamp, ducks under the drumrolls
    gain = np.ones(n)

    def seg(a, b, level, ramp=0.03):
        i0, i1 = int(sec(a) * SR), min(n, int(sec(b) * SR))
        r = int(ramp * SR)
        gain[i0:i1] = np.minimum(gain[i0:i1], level)
        gain[max(0, i0 - r) : i0] = np.minimum(gain[max(0, i0 - r) : i0], np.linspace(1, level, min(r, i0)))
        gain[i1 : i1 + r] = np.minimum(gain[i1 : i1 + r], np.linspace(level, 1, len(gain[i1 : i1 + r])))

    for a, b in stops:
        seg(a, b, 0.0)
    for d, v in ducks:
        seg(d, v, duck_level, 0.12 if duck_level > 0.3 else 0.03)
    mix *= gain
    mix = hp(mix, 35)
    mix = np.tanh(mix * 1.2) / np.tanh(1.2)
    fo = int(1.0 * SR)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    write_wav(OUT / out, mix, -1.0)


# ---------------------------------------------------------------- Sol's voice
VOWELS = {
    "a": (750, 1200), "e": (500, 1900), "i": (330, 2300),
    "o": (480, 850), "u": (370, 950), "y": (400, 2000),
}


def syllable(f0, vowel, dur, rise=0.0):
    t = t_axis(dur)
    f = f0 * (1 + rise * t / dur) * (1 + 0.03 * np.sin(2 * np.pi * 7 * t))
    src = saw(1, np.cumsum(f) / SR)
    f1, f2 = VOWELS[vowel]
    sig = bp(src, f1 * 0.75, f1 * 1.3) * 1.3 + bp(src, f2 * 0.85, f2 * 1.15) * 0.7
    env = np.minimum(1, t / 0.008) * np.minimum(1, (dur - t) / 0.02)
    return sig * env


def voice():
    n = int(TOTAL * SR)
    out = np.zeros(n)
    rng = np.random.default_rng(97)

    def say(at_frame, per, text, base):
        at_frame = max(0, at_frame)  # the hook is on screen at frame 0; speak it from 0
        words = text.replace("*", "").replace("!", "").split()
        for i, w in enumerate(words):
            letters = [c for c in w.lower() if c.isalpha()] or ["a"]
            vowels = [c for c in letters if c in VOWELS] or ["a"]
            nsyl = 1 if len(letters) < 5 else 2
            word_dur = max(0.07, per / FPS * 0.92)
            syl = word_dur / nsyl
            at = sec(at_frame + i * per)
            last = i == len(words) - 1
            for s in range(nsyl):
                v = vowels[(s * 2) % len(vowels)]
                f0 = base * (1 + 0.18 * rng.random() - 0.06)
                rise = 0.35 if (last and w.endswith("?") and s == nsyl - 1) else 0.0
                if last and w.endswith("!"):
                    f0 *= 1.15
                if at + s * syl >= 0:
                    place_mono(out, syllable(f0, v, syl * 0.9, rise), at + s * syl)

    def place_mono(buf, sig, at):
        i = int(at * SR)
        m = min(len(sig), len(buf) - i)
        if m > 0 and i >= 0:
            buf[i : i + m] += sig[:m]

    for b in SCRIPT["bubbles"]:
        for s in b["segs"]:
            raw = s["text"]
            base = 470 if "!" in raw.replace("!$", "").replace("! ", "") or raw.endswith("!") else 420
            say(s["at"], s["per"], raw, base)
        if "aside" in b:
            say(b["aside"]["at"], 3, b["aside"]["text"], 380)
    out = lp(out, 7000)
    out = np.tanh(out / (np.max(np.abs(out)) or 1) * 2.5)  # tame the syllable spikes
    write_wav(OUT / "sol-voice-42.wav", reverb(out, 0.12), -4.0)


# ---------------------------------------------------------------- stingers
def stingers():
    sfx = OUT / "sfx"
    # boing: a spring
    t = t_axis(0.55)
    f = 180 + 260 * (1 - np.exp(-t / 0.05)) * (1 + 0.25 * np.sin(2 * np.pi * 16 * t) * np.exp(-t / 0.2))
    write_wav(sfx / "boing.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22), -5)

    # sad trombone: wah wah wah waaah
    out = np.zeros(int(1.9 * SR))
    for k, (note, dur) in enumerate(((58, 0.3), (57, 0.3), (56, 0.3), (55, 0.9))):
        t = t_axis(dur)
        vib = 1 + (0.025 * np.sin(2 * np.pi * 6 * t) * (t > 0.2) if k == 3 else 0)
        f = midi(note) * vib
        sig = saw(1, np.cumsum(f) / SR)
        wah = 0.5 - 0.5 * np.cos(2 * np.pi * np.clip(t / dur, 0, 1))
        sig = lp(sig, 900) * (1 - wah * 0.6) + lp(sig, 2400) * wah * 0.6
        env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.05)
        i = int(sum(d for _, d in ((58, 0.3), (57, 0.3), (56, 0.3))[:k]) * SR)
        out[i : i + len(t)] += sig * env
    write_wav(sfx / "wahwah.wav", reverb(out, 0.2), -4)

    # drumroll: 32nd snare hits, crescendo
    dur = 0.95
    out = np.zeros(int(dur * SR))
    step = 1 / 26
    k = 0
    while k * step < dur - 0.05:
        t = t_axis(0.08)
        hit = bp(RNG.standard_normal(len(t)), 1200, 7000) * np.exp(-t / 0.03)
        i = int(k * step * SR)
        out[i : i + len(t)] += hit[: len(out) - i] * (0.3 + 0.7 * k * step / dur)
        k += 1
    write_wav(sfx / "drumroll.wav", reverb(out, 0.2), -6)

    # ta-da: two brass-ish chord hits + cymbal
    out = np.zeros(int(1.4 * SR))
    for at, dur, gain in ((0.0, 0.14, 0.7), (0.16, 1.1, 1.0)):
        t = t_axis(dur)
        sig = np.zeros_like(t)
        for nn in (60, 64, 67, 72):
            sig += saw(1, midi(nn) * t + RNG.random())
        sig = lp(sig, 2600) / 4 * np.minimum(1, t / 0.01) * np.exp(-t / (0.08 if dur < 0.2 else 0.5))
        i = int(at * SR)
        out[i : i + len(t)] += sig * gain
    t = t_axis(1.2)
    i = int(0.16 * SR)
    out[i : i + len(t)] += hp(RNG.standard_normal(len(t)), 5000) * np.exp(-t / 0.4) * 0.15
    write_wav(sfx / "tada.wav", reverb(out, 0.25), -3)

    # rubber stamp: thump + paper slap
    t = t_axis(0.5)
    f = 60 + 120 * np.exp(-t / 0.02)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    slap = bp(RNG.standard_normal(len(t)), 500, 5000) * np.exp(-t / 0.015)
    write_wav(sfx / "stamp.wav", reverb(np.tanh((thump + slap) * 2), 0.15), -2)

    # balloon inflating: rising squeak + air
    t = t_axis(1.4)
    f = 260 + 700 * (t / 1.4) ** 1.3
    squeak = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.04 * np.sin(2 * np.pi * 11 * t))) / SR) * 0.4
    air = bp(RNG.standard_normal(len(t)), 1500, 6000) * 0.25
    env = np.minimum(1, t / 0.1) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t) ** 2)
    write_wav(sfx / "inflate.wav", (squeak + air) * env, -6)


# ---------------------------------------------------------------- episodes
def voice_timeline(tl, out_name):
    """Sol's babble for a scheduled episode: one or two syllables per word,
    starting on the frame each word appears (scripts/sol_timeline.py)."""
    total = tl["total"] / FPS
    out = np.zeros(int(total * SR))
    rng = np.random.default_rng(101)
    for b in tl["beats"]:
        if b["kind"] != "say":
            continue
        raw = b["say"]
        base = 470 if raw.rstrip().endswith(("!", "!*")) else 420
        words = [w for ph in b["phrases"] for w in ph["words"]]
        for i, wd in enumerate(words):
            w = wd["w"].replace("*", "").replace("!", "") or "a"
            if wd["w"].endswith("!") and not wd["w"].startswith("!"):
                w += "!"
            letters = [c for c in w.lower() if c.isalpha()] or ["a"]
            vowels = [c for c in letters if c in VOWELS] or ["a"]
            nsyl = 1 if len(letters) < 5 else 2
            word_dur = 0.24
            syl = word_dur / nsyl
            last = i == len(words) - 1
            for s_ in range(nsyl):
                f0 = base * (1 + 0.18 * rng.random() - 0.06)
                rise = 0.35 if (last and w.endswith("?") and s_ == nsyl - 1) else 0.0
                if w.endswith("!"):
                    f0 *= 1.12
                sig = syllable(f0, vowels[(s_ * 2) % len(vowels)], syl * 0.9, rise)
                i0 = int((sec(wd["at"]) + s_ * syl) * SR)
                m = min(len(sig), len(out) - i0)
                if m > 0 and i0 >= 0:
                    out[i0 : i0 + m] += sig[:m]
    out = lp(out, 7000)
    out = np.tanh(out / (np.max(np.abs(out)) or 1) * 2.5)
    write_wav(OUT / out_name, reverb(out, 0.12), -4.0)


def voice_recorded(tl, voices, out_name):
    """Sol's recorded lines placed on their beats, loudness-matched, gently
    compressed so every line sits at the same level over the music."""
    from scipy.signal import resample_poly

    out = np.zeros(int(tl["total"] / FPS * SR))
    for b in tl["beats"]:
        v = voices.get(b["id"])
        if not v:
            continue
        a = v["samples"][v["start"] : v["end"]]
        if v["sr"] != SR:
            a = resample_poly(a, SR, v["sr"])
        rms = np.sqrt(np.mean(a**2)) or 1
        a = a / rms * 0.12  # same loudness for every line
        fade = int(0.01 * SR)
        a[:fade] *= np.linspace(0, 1, fade)
        a[-fade:] *= np.linspace(1, 0, fade)
        i0 = int(sec(b["voice"]["at"]) * SR)
        m = min(len(a), len(out) - i0)
        out[i0 : i0 + m] += a[:m]
    out = hp(out, 80)
    out = np.tanh(out * 2.2) / np.tanh(2.2)  # soft compression
    write_wav(OUT / out_name, out, -1.5)


def episode(ep_id):
    import sol_timeline

    tl, _, voices = sol_timeline.build(ep_id)
    for w in tl["warnings"]:
        print("WARNING", w)
    beats = {b["id"]: b for b in tl["beats"]}
    music_cfg = json.loads((ROOT_SRC / "episodes" / f"{ep_id}.json").read_text()).get("music", {})
    tick = music_cfg.get("tick")
    tick = (beats[tick[0]]["from"], beats[tick[1]]["until"]) if tick else None
    stops = [(beats[b]["from"] - 4, beats[b]["from"] + 8) for b in music_cfg.get("stopBefore", [])]
    voiced = [b for b in tl["beats"] if b.get("voice")]
    # music sits under Sol's voice (ducked while speaking), full between lines
    ducks = [(b["voice"]["at"] - 2, b["voice"]["at"] + b["voice"]["frames"] + 2) for b in voiced]
    music(total=tl["total"] / FPS, tick=tick, stops=stops, ducks=ducks, duck_level=0.5, out=f"sol-{ep_id}-music.wav")
    if voiced:
        voice_recorded(tl, voices, f"sol-{ep_id}-voice.wav")
    else:
        voice_timeline(tl, f"sol-{ep_id}-voice.wav")
    print(f"wrote sol-{ep_id}-music.wav, sol-{ep_id}-voice.wav ({tl['total'] / FPS:.1f} s)")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        episode(sys.argv[1])
        raise SystemExit
    music()
    voice()
    stingers()
    print("wrote sol-music-42.wav, sol-voice-42.wav and 6 stingers")

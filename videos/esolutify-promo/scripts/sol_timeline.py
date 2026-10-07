"""Turn a Sol episode script into frame timings, using reading-speed rules.

    python3 scripts/sol_timeline.py speed-to-lead

Reads  src/sol/episodes/<id>.json
       public/audio/sol/<id>/<beat>.wav   (Sol's recorded lines, optional)
Writes src/sol/episodes/<id>.timeline.json  (read by the episode's Remotion
       composition and by gen_sol_audio.py)
       src/sol/episodes/<id>.mouth.json     (per-frame mouth openness 0..1,
       from the voice's loudness: Sol's lip-sync)

Why: viewers said the first Sol video was hard to keep up with (words came
in at 3 frames each, ~10 words/s). Timing is no longer typed by hand. Each
beat is scheduled from its words:

  text   phrases (split with " | ") appear one at a time. With a recorded
         line, they follow the voice (spread over the measured speech by
         length, a few frames ahead so you read along). Without one, each
         word gets PER_WORD frames (3.75 words/s, comfortable caption pace).
  show   then the picture plays (beat "show", in frames) -- one thing moves
         at a time: text first, then the visual
  hold   then everything holds still (beat "hold"), so the eye can land
  gap    a short exit before the next beat

Round beats ("round": "...") are full-screen signposts, snapped to the
music's beat grid so their sting lands on the downbeat; any slack goes to the
previous beat as hold, so the screen never goes empty.
"""

import json
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
PER_WORD = 8
PHRASE_GAP = 2
GAP = 4
GRID = 15  # 120 BPM at 30 fps
MAX_WORDS = 11  # one idea per bubble
VOICE_LEAD = 4  # the voice starts this many frames into its beat
READ_AHEAD = 3  # phrases appear this many frames before they're spoken


def words_of(text):
    return [w for w in text.replace(" | ", " ").split(" ") if w]


def load_voice(ep_id, beat_id):
    """Mono float samples + rate of a recorded line, trimmed to the speech."""
    p = ROOT / "public" / "audio" / "sol" / ep_id / f"{beat_id}.wav"
    if not p.exists():
        return None
    with wave.open(str(p)) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
        a = np.frombuffer(w.readframes(n), "<i2").astype(np.float64) / 32768
    a = a.reshape(-1, ch).mean(axis=1)
    env = np.abs(a)
    thr = max(1e-4, env.max() * 0.04)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return None
    start = max(0, idx[0] - int(0.03 * sr))
    end = min(len(a), idx[-1] + int(0.08 * sr))
    a = tighten(a[start:end], sr)
    return {"path": p, "sr": sr, "start": 0, "end": len(a), "samples": a, "trim": start / sr}


MAX_PAUSE = 0.22  # s: TTS pauses (often 0.5-1 s) are cut to a natural breath


def tighten(a, sr):
    """Shorten every pause longer than MAX_PAUSE, with short crossfades."""
    hop = int(sr * 0.01)
    env = np.array([np.sqrt(np.mean(a[i : i + hop] ** 2)) for i in range(0, len(a), hop)])
    quiet = env < env.max() * 0.05
    keep = int(MAX_PAUSE * 100)  # in 10 ms hops
    cuts = []
    i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if j - i > keep and i > 0 and j < len(quiet):
                mid = (i + j) // 2
                cuts.append(((mid - (j - i) // 2 + keep // 2) * hop, (mid + (j - i) // 2 - keep // 2) * hop))
            i = j
        else:
            i += 1
    if not cuts:
        return a
    parts, last, x = [], 0, int(0.01 * sr)
    for c0, c1 in cuts:
        seg = a[last:c0].copy()
        seg[-x:] *= np.linspace(1, 0, x)
        parts.append(seg)
        last = c1
    tail = a[last:].copy()
    tail[:x] *= np.linspace(0, 1, x)
    parts.append(tail)
    return np.concatenate(parts)


def schedule(ep):
    t = 0
    beats = []
    warnings = []
    voices = {}
    for b in ep["beats"]:
        v = load_voice(ep["id"], b["id"])
        if v:
            voices[b["id"]] = v
        vframes = int(np.ceil((v["end"] - v["start"]) / v["sr"] * FPS)) if v else 0
        voice = (
            {"at": None, "frames": vframes, "file": f"audio/sol/{ep['id']}/{b['id']}.wav", "trim": round(v["trim"], 4)}
            if v
            else None
        )
        if "round" in b:
            snapped = -(-t // GRID) * GRID  # snap up to the grid...
            if beats:  # ...and give the slack to the previous beat as hold
                beats[-1]["until"] += snapped - t
            t = snapped
            dur = max(b.get("hold", 36), VOICE_LEAD + vframes + 10)
            if voice:
                voice["at"] = t + VOICE_LEAD
            beats.append({**b, "kind": "round", "from": t, "textEnd": t, "showFrom": t, "until": t + dur, "phrases": [], "voice": voice})
            t += dur + GAP
            continue
        text = b["say"]
        n = len(words_of(text))
        if n > MAX_WORDS:
            warnings.append(f"{b['id']}: {n} words (max {MAX_WORDS}) -- split it")
        raw_phrases = [[w for w in ph.split(" ") if w] for ph in text.split(" | ")]
        phrases = []
        if voice:
            # spread the phrases over the spoken line by length
            voice["at"] = t + VOICE_LEAD
            total_chars = sum(len(" ".join(ws)) for ws in raw_phrases) or 1
            done = 0
            for ws in raw_phrases:
                at = max(t, voice["at"] + round(vframes * done / total_chars) - READ_AHEAD)
                span = vframes * len(" ".join(ws)) / total_chars
                phrases.append({"at": at, "words": [{"w": w, "at": round(at + span * i / len(ws))} for i, w in enumerate(ws)]})
                done += len(" ".join(ws))
            text_end = voice["at"] + vframes
            if text_end - t < n * 5:  # never faster than 6 words/s on screen
                warnings.append(f"{b['id']}: voice is very fast for {n} words")
        else:
            at = t
            for ws in raw_phrases:
                phrases.append({"at": at, "words": [{"w": w, "at": at + i * PER_WORD} for i, w in enumerate(ws)]})
                at += len(ws) * PER_WORD + PHRASE_GAP
            text_end = at
        show = b.get("show", 30)
        hold = b.get("hold", 24)
        until = text_end + show + hold
        beats.append(
            {**b, "kind": "say", "from": t, "textEnd": text_end, "showFrom": text_end - 4, "until": until, "phrases": phrases, "voice": voice}
        )
        t = until + GAP
    total = t + ep.get("tail", 0)
    return {"id": ep["id"], "fps": FPS, "total": total, "beats": beats, "warnings": warnings}, voices


def mouth_track(tl, voices):
    """Per-frame mouth openness from each line's loudness (0 when silent)."""
    m = np.zeros(tl["total"])
    for b in tl["beats"]:
        v = voices.get(b["id"])
        if not v:
            continue
        a = v["samples"][v["start"] : v["end"]]
        hop = v["sr"] / FPS
        for k in range(b["voice"]["frames"]):
            seg = a[int(k * hop) : int((k + 1) * hop)]
            if len(seg) and b["voice"]["at"] + k < len(m):
                m[b["voice"]["at"] + k] = np.sqrt(np.mean(seg**2))
    if m.max() > 0:
        m = np.clip(m / np.percentile(m[m > 0], 95), 0, 1) ** 0.7
    return [round(float(x), 2) for x in m]


def build(ep_id):
    src = ROOT / "src" / "sol" / "episodes" / f"{ep_id}.json"
    tl, voices = schedule(json.loads(src.read_text()))
    out = src.with_suffix(".timeline.json")
    out.write_text(json.dumps(tl, indent=1, ensure_ascii=False) + "\n")
    src.with_suffix(".mouth.json").write_text(json.dumps(mouth_track(tl, voices)) + "\n")
    return tl, out, voices


if __name__ == "__main__":
    tl, out, voices = build(sys.argv[1])
    print(f"{out.name}: {len(tl['beats'])} beats, {tl['total']} frames = {tl['total'] / FPS:.1f} s, {len(voices)} voiced")
    for w in tl["warnings"]:
        print("WARNING", w)
    for b in tl["beats"]:
        v = f"voice {b['voice']['frames'] / FPS:3.1f}s" if b.get("voice") else "no voice"
        print(f"  {b['id']:>8} {b['from']:5d}-{b['until']:5d}  {(b['until'] - b['from']) / FPS:4.1f}s  {v}  {b.get('say', b.get('round'))}")

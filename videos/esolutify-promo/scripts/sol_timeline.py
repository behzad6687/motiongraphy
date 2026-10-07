"""Turn a Sol episode script into frame timings, using reading-speed rules.

    python3 scripts/sol_timeline.py speed-to-lead

Reads  src/sol/episodes/<id>.json
Writes src/sol/episodes/<id>.timeline.json  (read by the episode's Remotion
composition and by gen_sol_audio.py for Sol's babble voice).

Why: viewers said the first Sol video was hard to keep up with (words came
in at 3 frames each, ~10 words/s). Timing is no longer typed by hand. Each
beat is scheduled from its words:

  text   phrases (split with " | ") appear one at a time; each phrase gets
         PER_WORD frames per word (8 = 3.75 words/s, comfortable caption
         reading pace) plus PHRASE_GAP
  show   then the picture plays (beat "show", in frames) -- one thing moves
         at a time: text first, then the visual
  hold   then everything holds still (beat "hold"), so the eye can land
  gap    a short exit before the next beat

Round beats ("round": "...") are full-screen signposts, snapped to the
music's beat grid so their sting lands on the downbeat.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
PER_WORD = 8
PHRASE_GAP = 2
GAP = 4
GRID = 15  # 120 BPM at 30 fps
MAX_WORDS = 11  # one idea per bubble


def words_of(text):
    return [w for w in text.replace(" | ", " ").split(" ") if w]


def schedule(ep):
    t = 0
    beats = []
    warnings = []
    for b in ep["beats"]:
        if "round" in b:
            snapped = -(-t // GRID) * GRID  # snap up to the grid...
            if beats:  # ...and give the slack to the previous beat as hold, so the screen never goes empty
                beats[-1]["until"] += snapped - t
            t = snapped
            dur = b.get("hold", 36)
            beats.append({**b, "kind": "round", "from": t, "textEnd": t, "showFrom": t, "until": t + dur, "phrases": []})
            t += dur + GAP
            continue
        text = b["say"]
        n = len(words_of(text))
        if n > MAX_WORDS:
            warnings.append(f"{b['id']}: {n} words (max {MAX_WORDS}) -- split it")
        phrases = []
        at = t
        for ph in text.split(" | "):
            ws = [w for w in ph.split(" ") if w]
            phrases.append({"at": at, "words": [{"w": w, "at": at + i * PER_WORD} for i, w in enumerate(ws)]})
            at += len(ws) * PER_WORD + PHRASE_GAP
        text_end = at
        show = b.get("show", 30)
        hold = b.get("hold", 24)
        until = text_end + show + hold
        beats.append(
            {
                **b,
                "kind": "say",
                "from": t,
                "textEnd": text_end,
                "showFrom": text_end - 4,
                "until": until,
                "phrases": phrases,
            }
        )
        t = until + GAP
    total = t + ep.get("tail", 0)
    return {"id": ep["id"], "fps": FPS, "total": total, "beats": beats, "warnings": warnings}


def build(ep_id):
    src = ROOT / "src" / "sol" / "episodes" / f"{ep_id}.json"
    tl = schedule(json.loads(src.read_text()))
    out = src.with_suffix(".timeline.json")
    out.write_text(json.dumps(tl, indent=1, ensure_ascii=False) + "\n")
    return tl, out


if __name__ == "__main__":
    tl, out = build(sys.argv[1])
    print(f"{out.name}: {len(tl['beats'])} beats, {tl['total']} frames = {tl['total'] / FPS:.1f} s")
    for w in tl["warnings"]:
        print("WARNING", w)
    for b in tl["beats"]:
        print(f"  {b['id']:>8} {b['from']:5d}-{b['until']:5d}  {(b['until'] - b['from']) / FPS:4.1f}s  {b.get('say', b.get('round'))}")

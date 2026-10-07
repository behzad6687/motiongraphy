"""Listen to every Sol line and check it says what the script says.

    python3 scripts/sol_qa.py speed-to-lead          # check, write word timings
    python3 scripts/sol_qa.py speed-to-lead hook r1  # only these beats
    python3 scripts/sol_qa.py speed-to-lead --mix renders/sol/sol-speed-to-lead-9x16.mp4
                                                     # the finished video: is every
                                                     # line still heard over the music
                                                     # and sound effects?

Needs: pip install faster-whisper (the model, ~250 MB, downloads on first run).

For each beat with a recording it transcribes the line exactly as it will be
played (trimmed and tightened by sol_timeline.load_voice), then compares the
words with the beat's "speak" text. Missing, extra or misheard words are
printed; a line that fails should be regenerated (see SOL-CHARACTER.md).

It also writes src/sol/episodes/<id>.words.json: when each spoken word starts
and ends (seconds into the played clip). sol_timeline.py uses it to show each
bubble phrase as Sol starts saying it, instead of guessing from its length.
"""

import difflib
import json
import re
import sys

import numpy as np

import sol_timeline as st

MODEL = "medium.en"

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def spell(n):
    """1260 -> 'one thousand two hundred sixty' (enough for scripts)."""
    n = int(n)
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + spell(n % 100))
    if n < 1_000_000:
        return spell(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + spell(n % 1000))
    return spell(n // 1_000_000) + " million" + ("" if n % 1_000_000 == 0 else " " + spell(n % 1_000_000))


FILLER = {"a", "and", "the", "uh", "um", "dollar"}  # "$400" is read back as "400 dollars"
# spellings that sound the same (the transcriber's choice, not Sol's mistake)
SAME = {"dollars": "dollar", "centre": "center", "saul": "sol", "soul": "sol", "ok": "okay", "two": "to", "too": "to"}
NUM = {w: i for i, w in enumerate(ONES)} | {w: 10 * i for i, w in enumerate(TENS) if w != "_"}
# number words, and what they're read with: a mismatch made only of these is
# the same amount written another way ("$1400" for "fourteen hundred") --
# reported to glance at, not failed
NUMBERISH = set(NUM) | {"hundred", "thousand", "million", "dollar", "cents", "percent", "x", "to", "one"}


def collapse(words):
    """'fourteen hundred' and 'one thousand four hundred' -> '1400'."""
    out, cur, total, run = [], 0, 0, False
    for k, w in enumerate(words + [None]):
        if w == "and" and run and k + 1 < len(words) and words[k + 1] in NUM:
            continue  # "a hundred and fifty"
        if w in NUM:
            cur += NUM[w]
            run = True
        elif w == "hundred" and run:
            cur = (cur or 1) * 100
        elif w in ("thousand", "million") and run:
            total += (cur or 1) * (1000 if w == "thousand" else 1_000_000)
            cur = 0
        else:
            if run:
                out.append(str(total + cur))
            cur, total, run = 0, 0, False
            if w is not None:
                out.append(w)
    return out


def norm(text):
    """Words to compare: lower case, numbers spelled out, no punctuation."""
    t = text.lower().replace("’", "'").replace("—", " ").replace("–", " ")
    t = re.sub(r"(\d),(\d{3})", r"\1\2", t)
    t = re.sub(r"\$(\d+)k\b", lambda m: m.group(1) + " thousand dollars", t)
    t = re.sub(r"\$(\d+)", lambda m: m.group(1) + " dollars", t)
    t = re.sub(r"(\d+)%", lambda m: m.group(1) + " percent", t)
    t = re.sub(r"\d+", lambda m: " " + spell(m.group(0)) + " ", t)
    t = t.replace("-", " ").replace("/", " ")
    t = re.sub(r"[^a-z' ]", " ", t).replace("'", "")
    t = re.sub(r"\ba (hundred|thousand)", r"one \1", t)
    return [SAME.get(w, w) for w in t.split() if w]


def check(ep_id, only=()):
    from faster_whisper import WhisperModel

    ep = json.loads((st.ROOT / "src" / "sol" / "episodes" / f"{ep_id}.json").read_text())
    words_path = st.ROOT / "src" / "sol" / "episodes" / f"{ep_id}.words.json"
    words = json.loads(words_path.read_text()) if words_path.exists() else {}
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    bad = []
    for b in ep["beats"]:
        if only and b["id"] not in only:
            continue
        v = st.load_voice(ep_id, b["id"])
        if not v or "speak" not in b:
            continue
        from scipy.signal import resample_poly

        a = resample_poly(v["samples"], 16000, v["sr"]).astype(np.float32)
        segs, _ = model.transcribe(a, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
        heard = [w for s in segs for w in s.words]
        text = "".join(w.word for w in heard).strip()
        want, got = collapse(norm(b["speak"])), collapse(norm(text))
        ops = [
            o
            for o in difflib.SequenceMatcher(a=want, b=got, autojunk=False).get_opcodes()
            if o[0] != "equal" and not set(want[o[1] : o[2]] + got[o[3] : o[4]]) <= FILLER
        ]
        numeric = lambda o: all(w.isdigit() or w in NUMBERISH for w in want[o[1] : o[2]] + got[o[3] : o[4]])  # noqa: E731
        glance = [o for o in ops if numeric(o)]
        ops = [o for o in ops if not numeric(o)]
        ok = not ops
        words[b["id"]] = {
            "clip": round(len(v["samples"]) / v["sr"], 3),
            "heard": text,
            "ok": ok,
            "words": [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for w in heard],
        }
        if ok:
            print(f"  ok   {b['id']:>6}  {text}" + ("   (numbers written differently)" if glance else ""))
        else:
            diff = "; ".join(
                f"{o[0]}: '{' '.join(want[o[1]:o[2]])}' -> '{' '.join(got[o[3]:o[4]])}'" for o in ops
            )
            print(f"  FAIL {b['id']:>6}  heard: {text}\n{'':14}want:  {b['speak']}\n{'':14}{diff}")
            bad.append(b["id"])
    words_path.write_text(json.dumps(words, indent=1, ensure_ascii=False) + "\n")
    print(f"{ep_id}: {len(bad)} line(s) to check/regenerate: {' '.join(bad) or '-'}")
    return bad


def check_mix(ep_id, video):
    """Transcribe the finished video and check each line within its own span."""
    import subprocess
    import tempfile
    import wave

    from faster_whisper import WhisperModel

    ep = {b["id"]: b for b in json.loads((st.ROOT / "src" / "sol" / "episodes" / f"{ep_id}.json").read_text())["beats"]}
    tl = json.loads((st.ROOT / "src" / "sol" / "episodes" / f"{ep_id}.timeline.json").read_text())
    with tempfile.TemporaryDirectory() as d:
        wav = f"{d}/mix.wav"
        subprocess.run(["npx", "remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", video, "-ac", "1", "-ar", "16000", wav], check=True, cwd=st.ROOT)
        with wave.open(wav) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    bad = []
    for b in tl["beats"]:
        if not b.get("voice"):
            continue
        t0 = max(0, (b["voice"]["at"] - 6) / st.FPS)
        t1 = (b["voice"]["at"] + b["voice"]["frames"] + 6) / st.FPS
        segs, _ = model.transcribe(a[int(t0 * 16000) : int(t1 * 16000)], language="en", beam_size=5, condition_on_previous_text=False)
        text = "".join(s.text for s in segs).strip()
        want, got = collapse(norm(ep[b["id"]]["speak"])), collapse(norm(text))
        ops = [
            o
            for o in difflib.SequenceMatcher(a=want, b=got, autojunk=False).get_opcodes()
            if o[0] != "equal"
            and not set(want[o[1] : o[2]] + got[o[3] : o[4]]) <= FILLER
            and not all(w.isdigit() or w in NUMBERISH for w in want[o[1] : o[2]] + got[o[3] : o[4]])
        ]
        print(f"  {'ok  ' if not ops else 'FAIL'} {b['id']:>6}  {text}")
        if ops:
            bad.append(b["id"])
    print(f"{ep_id} mix: {len(bad)} line(s) not clearly heard: {' '.join(bad) or '-'}")
    return bad


if __name__ == "__main__":
    if "--mix" in sys.argv:
        check_mix(sys.argv[1], sys.argv[sys.argv.index("--mix") + 1])
    else:
        check(sys.argv[1], tuple(sys.argv[2:]))

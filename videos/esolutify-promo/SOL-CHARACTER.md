# Sol: character guide

Sol is eSolutify's AI agent, shown as a character: a small, bouncy sun wearing a receptionist headset. The name means sun, and the look matches the gold "Ask Sol" orb on esolutify.com. The model sheet is `renders/sol/sol-model-sheet.png` (Remotion still `SolModelSheet`).

## Who Sol is

- **Helpful, quick, a little cheeky.** Sol explains things in one line, then reacts.
- **Honest to a fault.** The running joke is "Full disclosure: I'm an AI. I'll be fair." Sol will say when a human is the better choice, which is what makes the character believable.
- **Never smug for long.** After a gloat ("Ahem. That's me."), Sol gets taken down a peg in the next beat.

## How Sol looks, moves and sounds

| | |
|---|---|
| Body | Gold sun (`#F7D474` to `#C8973A`), 12 rounded rays, rosy cheeks, receptionist headset with mic |
| Moods | `happy`, `talk`, `laugh`, `shock` (rays spike), `smug`, `wink`, `worried` (+ sweat), `pout` |
| Props | Retro specs (the "since the 1960s" gag), sweat drop |
| Motion | Hops at the start of every line, squash and stretch, idle bob, blinks every ~3 s, waves |
| Voice | **Luna** (Higgsfield `seed_audio` preset `375a3398-e3b4-4f91-845d-42181e352899`), `speech_rate` +25, WAV 44.1 kHz, one file per line in `public/audio/sol/<episode>/<beat>.wav`. Long silent pauses (over 0.38 s, under -40 dB) are shortened to 0.26 s, with a margin left around every word, and every line is loudness-matched. Every line is transcribed and checked against the script (`scripts/sol_qa.py`) before it is used. Speech bubbles still carry the words, so it works muted. Episode 1 v1 used cartoon babble (`script.json`) |
| Lip-sync | Sol's mouth opens with the voice's loudness, frame by frame (`<episode>.mouth.json`) |

## Pacing rules (from viewer feedback: "too hard to keep up")

Episode 1 showed words every 3 frames (about 10 words a second) and packed 16 bubbles, each with an extra side line, into 42 seconds. From episode 2 on, timing is computed, not typed:

1. **Reading speed is automatic.** Write words only; `scripts/sol_timeline.py` gives each word 8 frames (3.75 words a second, comfortable caption speed). Phrases split with ` | ` pop in one at a time.
2. **One thing moves at a time.** First the text, then the picture (`show`), then a hold (`hold`) so the eye can land.
3. **One idea per bubble.** 11 words at most (the scheduler warns), and no side lines on top of a picture.
4. **Signposts.** A full-screen number card opens each section ("#1 · 5 MINUTES"), and a tracker at the top always shows where you are (5 MIN · 29 H · 78% · FIX).
5. **A recap to screenshot** before the CTA.
6. **Under 60 s.** If it runs long, cut an idea rather than speed up the words.

## The format: "Sol explains" (about 60 s, 9:16)

1. **Hook, readable on frame 0:** one surprising number, with a picture (a countdown, a price tag).
2. **"Hi, I'm Sol!"** plus what's coming ("3 numbers decide…").
3. **Three sections**, each opening with a big signpost card, then one or two bubbles with one picture each.
4. **A stamp line to remember**, for example "FIRST TO ANSWER WINS."
5. **The fix or the honest answer**, then the **recap card**.
6. **CTA:** "Call Sol" (+1 365 360 3545) and "Read the full guide", link in bio.

## Making a new episode

1. Write `src/sol/episodes/<id>.json`: beats with `say` (on screen) and `speak` (what Sol says, numbers spelled out), or `round`, plus `show`/`hold` for each picture. Music cues are optional: `"music": {"tick": [from, to], "stopBefore": [beat], "duck": 0.5}` (`duck` is how far the music dips under Sol's voice).
2. Record Sol's lines: generate each beat's `speak` text with the voice above (Higgsfield `generate_audio`, `seed_audio`, voice Luna, `speech_rate` 25, `format` wav, `sample_rate` 44100) and save it as `public/audio/sol/<id>/<beat>.wav`. The service rate-limits, so send about 4 lines per batch. It costs about 0.3 credits a line.
3. **Check every line:** `python3 scripts/sol_qa.py <id>` (needs `pip install faster-whisper`). It transcribes each line exactly as it will play and compares it with `speak`. Re-record any FAIL; if the same word fails twice, reword the line (the voice garbled "AI receptionist" and "per-minute" at speed 25, and once added a throat-clear) or record it at `speech_rate` 10. "Numbers written differently" is fine. After rendering, `python3 scripts/sol_qa.py <id> --mix <video>` checks every line is still heard over the music and effects. A single short word read back as a sound-alike ("four"/"for", "leak"/"week") is the transcriber guessing without context, not a problem. It also writes `<id>.words.json`, so each bubble phrase appears exactly when Sol starts saying it.
4. Run `python3 scripts/gen_sol_audio.py <id>`. It schedules the timeline from the recorded lines (`<id>.timeline.json`, `<id>.mouth.json`) and writes the voice track and the theme music, ducked under Sol's voice. With no recordings it falls back to babble at reading speed.
5. Draw the pictures in `src/sol/episodes/<Id>.tsx` with the kit (`episodes/kit.tsx`: `PhraseBubble`, `Tracker`, `RoundCard`, `BeatScene`, `Stamp`, `SolOnStage`). See `SpeedToLead.tsx`.
6. Register it in `src/Root.tsx` with `durationInFrames` taken from the timeline.

Episode 1 v1 (`SolExplainer.tsx`) predates the kit and keeps its hand-timed `script.json`. Its re-cut, `Receptionist.tsx` (`SolReceptionistShowdownV2`), uses the kit and the voice.

Keep `say` word for word the same as `speak` (numbers may be written as digits), so viewers never see words Sol doesn't say. Sound effects are ducked under Sol's voice automatically (`speechDuck` in the kit), so a sting never covers a word.

**Pace with the voice.** Phrases appear in step with Sol's speech (about 2.5–3 words a second at `speech_rate` 25), and pictures play after each line. That's slower than silent reading, so keep `show`/`hold` short (about 20–36 and 10–16 frames); 60–95 s is a normal voiced episode; past that, cut a beat.

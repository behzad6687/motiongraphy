# eSolutify promo videos

## Every video deliverable ships with
- a thumbnail / Reel cover (1080×1920, key content inside the 4:5 grid crop, y 285–1635)
- a ready-to-paste caption (≤5 hashtags) and alt text, added to SOCIAL-COPY.md
- send the video, the thumbnail and the caption together

## Voice and subtitles
- Narrated videos get word-by-word subtitles for muted viewing, and the music ducks under the voice.
- Time each scene to its voice line; don't rush the pace.
- Narrator voice (Higgsfield seed_audio): voice_id ceee41dc-0ee8-59a7-b3e8-2744116fcb5e, voice_type preset.
- Transcribe each line (faster-whisper) and check it against the script: the TTS sometimes garbles a line; re-record those.

## Effects skill (~/.claude/skills/effects)
- On screen recordings run it through scripts/fx_screen.py, which turns off the skill's person masking (it cuts effects around any photo of a person on a website) and lets an effect pin its anchor with "anchor": [x, y, width] (fractions of the frame), since there is no face to track.
- Some effects carry the skill author's branding by default (comment-box: handle, reply, chip); always set our own.

## Website demo reels (hand scrolling, phone + desktop)
- The scroll animation is the point of these sites: play it at reading pace, never skip or speed through it. Record the scroll linearly and let the shot length set the pace.
- Hands and rooms: Seedance image-to-video from a start frame with flat #00FF00 screens; then scripts/pin_screens.py (keys, fits screen edges per frame, crops each recording to the screen's proportions, hand-driven scroll with --mix for how much the hand nudges it).
- Phone + desktop together must show the same section at the same moment: record both with the same frame schedule between matching section anchors; record the monitor at its own aspect (VW/VH in record_scroll.mjs).
- Where a scroll film pins a frame (nothing changes while you scroll), skip that stretch in the recording; a hand scrolling over a frozen page looks broken. Check per-frame change of each recording.
- Phone thumb shots: let the thumb drive the scroll (--mix 0.85 --momentum 0.92) so the page moves on every flick and coasts after it.
- Cut to the music: find the drop and breaks and put the scene changes on them.

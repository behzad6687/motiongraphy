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
- On screen recordings run it through scripts/fx_screen.py, which turns off the skill's person masking (it cuts effects around any photo of a person on a website).

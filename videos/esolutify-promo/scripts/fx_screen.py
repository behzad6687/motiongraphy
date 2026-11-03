"""Run the `effects` skill (~/.claude/skills/effects) on a screen recording.

The skill is made for talking-head videos: it tracks a person and tucks its
graphics behind them (behind=True) or keeps them off their face (guard=True).
On a screen recording that misfires: any photo of a person on a website gets
cut out of the effect (the AFTER stamp lost a piece where the hero photo's
boy is). This wrapper runs the skill unchanged, but with that masking off, so
every effect sits on top of the frame, and lets an effect pin its anchor
("anchor": [x, y, width] as fractions of the frame) instead of following a
face.

    ~/.claude/skills/effects/.venv/bin/python scripts/fx_screen.py --plan plan.json in.mp4 out.mp4
"""

import os
import sys

SKILL = os.path.expanduser("~/.claude/skills/effects/scripts")
sys.path.insert(0, SKILL)
import fx  # noqa: E402

_comp = fx.comp


def comp_on_top(c, layer, x, y, alpha=1.0, behind=False, guard=False):
    return _comp(c, layer, x, y, alpha, False, False)


fx.comp = comp_on_top


# A screen recording has no face to track, so face-anchored effects drift to
# wherever the tracker guessed. An effect can pin its anchor instead:
#   {"fx": "comment-box", ..., "anchor": [0.5, 0.66, 0.2]}
# = the "face" centre at x 50 %, y 66 % of the frame, 20 % of the width wide.
def anchored(fn):
    def run(c, e):
        a = e.o.get("anchor")
        if a:
            c.fx, c.fy, c.fw = float(a[0]) * c.W, float(a[1]) * c.H, float(a[2]) * c.W
        return fn(c, e)

    return run


for name, entry in list(fx.EFFECTS.items()):
    fx.EFFECTS[name] = (anchored(entry[0]), *entry[1:])

if __name__ == "__main__":
    fx.main()

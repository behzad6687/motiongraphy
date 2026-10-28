"""Run the `effects` skill (~/.claude/skills/effects) on a screen recording.

The skill is made for talking-head videos: it tracks a person and tucks its
graphics behind them (behind=True) or keeps them off their face (guard=True).
On a screen recording that misfires: any photo of a person on a website gets
cut out of the effect (the AFTER stamp lost a piece where the hero photo's
boy is). This wrapper runs the skill unchanged, but with that masking off, so
every effect sits on top of the frame.

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

if __name__ == "__main__":
    fx.main()

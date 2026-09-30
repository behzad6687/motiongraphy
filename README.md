# motiongraphy

Code-driven motion graphics, built with Claude Code and the agent skills
installed in `.claude/skills/`.

## Videos

| Project | What it is | Output |
| ------- | ---------- | ------ |
| [`videos/esolutify-promo`](videos/esolutify-promo) | 70 s brand explainer for [esolutify.com](https://esolutify.com): "One system. Every lead answered." | 1920×1080 H.264 MP4, 30 fps, original score |

Every project has a `STORYBOARD.md`, the frame-by-frame plan, alongside its source.

## Installed agent skills (`.claude/skills/`)

These are project-level skills, so any Claude Code session in this repo picks them up automatically.

| Source | Skills | License |
| ------ | ------ | ------- |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) @ `ae91433` | Core set: `hyperframes`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-keyframes`, `hyperframes-creative`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-registry`, `hyperframes-studio`, `media-use`. Workflows: `product-launch-video`, `general-video`, `motion-graphics` | Apache-2.0 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) `packages/skills` @ `f64f80e` | `remotion-best-practices` (router), `remotion-create`, `remotion-markup`, `remotion-render`, `remotion-captions`, `remotion-docs`, `remotion-interactivity`, `remotion-maps`, `remotion-multimedia`, `remotion-saas`, `remotion-studio`, `remotion-upgrade` | Remotion License |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) @ `1dcbe5e` | `remotion-motion-graphics`: motion-craft rules and a render → inspect → fix loop | MIT |

HyperFrames recommends its core set plus workflows installed on demand. Add more with
`npx hyperframes skills update <workflow>`, for example `faceless-explainer` or `music-to-video`.
Refresh the Remotion skills with `npx skills add remotion-dev/skills`.

The license texts are in [`THIRD_PARTY_LICENSES/`](THIRD_PARTY_LICENSES).

> **Remotion licensing:** Remotion is free for individuals and for companies with up to 3
> employees. Larger for-profit teams need a [company license](https://www.remotion.pro/license)
> to render with it.

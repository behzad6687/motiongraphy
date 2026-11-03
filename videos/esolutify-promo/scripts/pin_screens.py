"""Pin website recordings onto the green screens of a generated video, with
the scroll driven by the hand in the shot.

    python scripts/pin_screens.py gen.mp4 out.mp4 \
        --screen largest:public/stories/x/desktop-a.mp4 \
        --drive 0.40,0.55,0.85,0.70

The generated clip (e.g. a hand scrolling a laptop trackpad, or a thumb on a
phone) has its screens as flat #00FF00. Every frame:
  1. the green is keyed; each screen is a connected green region, chosen by
     "largest", "top" or "bottom" (for a monitor + phone shot);
  2. its corners are found (extreme points of the region's hull), smoothed
     over time, and the recording is warped into them;
  3. the recording shows only through the key, so a thumb or finger over the
     screen stays in front, and green spill on edges is removed.
The scroll follows the hand: dense optical flow in the --drive box (fractions
of the frame on the first frame; it follows the screen as the camera moves)
measures how far the fingers or thumb move up each frame, and that pushes the
page with a little momentum, like a trackpad or a touch screen. All screens
share that progress, so a desktop and a phone recording made with the same
frame schedule stay on the same section. Recording frame = progress × length.

Runs with any Python that has numpy and opencv (e.g. the effects skill's venv).
"""

import argparse
import subprocess

import cv2
import numpy as np

KEY_LO, KEY_HI = 25, 80  # green dominance: <= LO opaque, >= HI fully keyed


def frames(path):
    cap = cv2.VideoCapture(path)
    while True:
        ok, f = cap.read()
        if not ok:
            break
        yield f
    cap.release()


def info(path):
    cap = cv2.VideoCapture(path)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return n, fps, w, h


def dominance(f):
    f = f.astype(np.int16)
    b, g, r = f[..., 0], f[..., 1], f[..., 2]
    return g - np.maximum(r, b)


def regions(dom, k):
    """The k biggest green regions as masks."""
    m = (dom > 60).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, cents = cv2.connectedComponentsWithStats(m, 8)
    order = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:k]
    return [(lab == i, cents[i]) for i in order]


def corners(mask):
    pts = cv2.findNonZero(mask.astype(np.uint8))
    hull = cv2.convexHull(pts).reshape(-1, 2).astype(np.float64)
    s, d = hull.sum(1), hull[:, 0] - hull[:, 1]
    return np.array([hull[s.argmin()], hull[d.argmax()], hull[s.argmax()], hull[d.argmin()]])  # tl tr br bl


def grow(q, k):
    c = q.mean(0)
    return c + (q - c) * k


def smooth(series, win=7):
    """Moving average over time, per coordinate."""
    a = np.array(series)
    pad = win // 2
    p = np.concatenate([np.repeat(a[:1], pad, 0), a, np.repeat(a[-1:], pad, 0)])
    ker = np.ones(win) / win
    out = np.empty_like(a)
    for idx in np.ndindex(a.shape[1:]):
        out[(slice(None),) + idx] = np.convolve(p[(slice(None),) + idx], ker, "valid")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("gen")
    ap.add_argument("out")
    ap.add_argument("--screen", action="append", required=True, help="pick:recording.mp4, pick = largest|top|bottom")
    ap.add_argument("--drive", help="x0,y0,x1,y1 box (fractions) where the scrolling finger/thumb is")
    ap.add_argument("--grow", type=float, default=1.02)
    ap.add_argument("--momentum", type=float, default=0.86)
    ap.add_argument("--mix", type=float, default=0.6, help="share of the scroll driven by the hand; the rest is steady")
    ap.add_argument("--still", help="comma-separated frame numbers: write PNGs instead of a video")
    a = ap.parse_args()

    screens = []
    for s in a.screen:
        pick, rec = s.split(":", 1)
        rn, _, rw, rh = info(rec)
        screens.append(dict(pick=pick, rec=rec, n=rn, w=rw, h=rh))
    n, fps, W, H = info(a.gen)
    k = len(screens)

    # pass 1: corners per frame, and how far the hand moves up
    quads = [[] for _ in screens]
    ups = []
    prev = None
    box0 = None
    q0 = None
    for f in frames(a.gen):
        dom = dominance(f)
        regs = regions(dom, k)
        if k == 2:
            regs.sort(key=lambda r: r[1][1])  # top first
        for i, sc in enumerate(screens):
            if sc["pick"] == "bottom":
                r = regs[-1]
            elif sc["pick"] == "top":
                r = regs[0]
            else:
                r = max(regs, key=lambda r: r[0].sum())
            quads[i].append(corners(r[0]))
        gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        up = 0.0
        if a.drive:
            # the drive box follows the first screen as the camera moves
            q = quads[0][-1]
            if box0 is None:
                x0, y0, x1, y1 = [float(v) for v in a.drive.split(",")]
                box0 = np.array([[x0 * W, y0 * H], [x1 * W, y1 * H]])
                q0 = q
            sc0 = np.linalg.norm(q0[1] - q0[0])
            sc1 = np.linalg.norm(q[1] - q[0])
            c0, c1 = q0.mean(0), q.mean(0)
            box = (box0 - c0) * (sc1 / sc0) + c1
            bx0, by0 = np.clip(box[0], 0, [W - 2, H - 2]).astype(int)
            bx1, by1 = np.clip(box[1], 2, [W, H]).astype(int)
            if prev is not None and bx1 - bx0 > 8 and by1 - by0 > 8:
                fl = cv2.calcOpticalFlowFarneback(prev[by0:by1, bx0:bx1], gray[by0:by1, bx0:bx1], None, 0.5, 3, 21, 3, 5, 1.2, 0)
                dy = fl[..., 1].ravel()
                mag = np.hypot(fl[..., 0], fl[..., 1]).ravel()
                moving = mag > np.percentile(mag, 70)
                bg = np.median(dy)
                up = max(0.0, -(np.median(dy[moving]) - bg)) if moving.any() else 0.0
        ups.append(up)
        prev = gray

    quads = [smooth(q) for q in quads]
    # progress: finger motion pushes the page, with momentum
    if a.drive and sum(ups) > 1:
        v, prog = 0.0, []
        acc = 0.0
        for u in ups:
            v = v * a.momentum + u
            acc += v
            prog.append(acc)
        prog = np.array(prog) / prog[-1]
        prog = a.mix * prog + (1 - a.mix) * np.linspace(0, 1, n)
    else:
        prog = np.linspace(0, 1, n)
    print(f"{n} frames at {fps:.2f} fps; the hand moved up on {sum(1 for u in ups if u > 0.5)} frames")
    print("progress every 12 frames:", " ".join(f"{p:.2f}" for p in prog[::12]))

    # pass 2: composite
    caps = [cv2.VideoCapture(sc["rec"]) for sc in screens]
    cache = [dict(idx=-1, img=None) for _ in screens]

    def rec_frame(i, idx):
        c = cache[i]
        if idx < c["idx"]:
            caps[i].set(cv2.CAP_PROP_POS_FRAMES, idx)
            c["idx"] = idx - 1
        while c["idx"] < idx:
            ok, img = caps[i].read()
            if not ok:
                break
            c["img"], c["idx"] = img, c["idx"] + 1
        return c["img"]

    stills = [int(s) for s in a.still.split(",")] if a.still else None
    enc = None
    if stills is None:
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", f"{fps}",
                                "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    for t, f in enumerate(frames(a.gen)):
        if stills is not None and t not in stills:
            if t > max(stills):
                break
            continue
        dom = dominance(f)
        alpha = np.clip((dom - KEY_LO) / (KEY_HI - KEY_LO), 0, 1).astype(np.float32)
        alpha = cv2.GaussianBlur(alpha, (5, 5), 0)[..., None]  # soft edges round a thumb or finger
        out = f.astype(np.float32)
        # despill what stays
        bf, gf, rf = out[..., 0], out[..., 1], out[..., 2]
        gf[:] = np.minimum(gf, np.maximum(rf, bf) + 6)
        layer = np.zeros_like(out)
        for i, sc in enumerate(screens):
            idx = int(round(prog[t] * (sc["n"] - 1)))
            img = rec_frame(i, idx)
            if img is None:
                continue
            q = grow(quads[i][t], a.grow).astype(np.float32)
            src = np.float32([[0, 0], [sc["w"], 0], [sc["w"], sc["h"]], [0, sc["h"]]])
            M = cv2.getPerspectiveTransform(src, q)
            warped = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
            region = cv2.warpPerspective(np.ones((sc["h"], sc["w"]), np.float32), M, (W, H))[..., None]
            layer = layer * (1 - region) + warped.astype(np.float32) * 0.96 * region
        comp = out * (1 - alpha) + layer * alpha
        frame = np.clip(comp, 0, 255).astype(np.uint8)
        if stills is not None:
            cv2.imwrite(a.out.replace(".png", f"_{t}.png"), frame)
            print("saved", t)
        else:
            enc.stdin.write(frame.tobytes())
    if enc:
        enc.stdin.close()
        enc.wait()
        print("Done:", a.out)


if __name__ == "__main__":
    main()

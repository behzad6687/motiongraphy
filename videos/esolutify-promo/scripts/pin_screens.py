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


RNG = np.random.default_rng(7)


def ransac_line(u, v, tol=2.5, iters=300):
    """Fit v = a*u + b to the points most of which lie on one straight edge.
    A thumb or finger over the screen bends part of the edge; RANSAC keeps the
    straight, visible part and ignores the rest."""
    if len(u) < 2:
        return None
    best, best_in = None, 0
    for _ in range(iters):
        i, j = RNG.choice(len(u), 2, replace=False)
        if u[i] == u[j]:
            continue
        a = (v[j] - v[i]) / (u[j] - u[i])
        b = v[i] - a * u[i]
        inl = np.abs(v - (a * u + b)) < tol
        n = inl.sum()
        if n > best_in:
            best, best_in = inl, n
    if best is None:
        return None
    a, b = np.polyfit(u[best], v[best], 1)
    return a, b


def corners(mask):
    """Screen corners as the crossings of its four fitted edges (so rounded
    corners and a thumb over one corner don't pull them in)."""
    m = mask.astype(bool)
    ys, xs = np.nonzero(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cols = np.arange(x0, x1 + 1)
    rows = np.arange(y0, y1 + 1)
    sub = m[y0:y1 + 1, x0:x1 + 1]
    has_c, has_r = sub.any(0), sub.any(1)
    top = np.where(has_c, sub.argmax(0), -1) + y0
    bot = np.where(has_c, sub.shape[0] - 1 - sub[::-1].argmax(0), -1) + y0
    lef = np.where(has_r, sub.argmax(1), -1) + x0
    rig = np.where(has_r, sub.shape[1] - 1 - sub[:, ::-1].argmax(1), -1) + x0
    # skip the rounded ends of each edge
    cw, rh = len(cols), len(rows)
    cm = has_c & (np.arange(cw) > cw * 0.1) & (np.arange(cw) < cw * 0.9)
    rm = has_r & (np.arange(rh) > rh * 0.08) & (np.arange(rh) < rh * 0.92)
    lt = ransac_line(cols[cm].astype(float), top[cm].astype(float))  # y = a x + b
    lb = ransac_line(cols[cm].astype(float), bot[cm].astype(float))
    ll = ransac_line(rows[rm].astype(float), lef[rm].astype(float))  # x = a y + b
    lr = ransac_line(rows[rm].astype(float), rig[rm].astype(float))
    if None in (lt, lb, ll, lr):
        pts = cv2.findNonZero(m.astype(np.uint8))
        hull = cv2.convexHull(pts).reshape(-1, 2).astype(np.float64)
        s_, d_ = hull.sum(1), hull[:, 0] - hull[:, 1]
        return np.array([hull[s_.argmin()], hull[d_.argmax()], hull[s_.argmax()], hull[d_.argmin()]])

    def cross(h, v):  # h: y = a x + b, v: x = c y + d
        a, b = h
        c, d = v
        y = (a * d + b) / (1 - a * c)
        return np.array([c * y + d, y])

    return np.array([cross(lt, ll), cross(lt, lr), cross(lb, lr), cross(lb, ll)])  # tl tr br bl


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
    ap.add_argument("--screen", action="append", required=True, help="pick:recording.mp4[:grow[:trim[:solid]]], pick = largest|top|bottom; trim = recording frames to skip at the start (the recorder's warm-up); solid = fill the whole screen, not just where it's green (when nothing covers it and the green isn't perfectly flat)")
    ap.add_argument("--drive", help="x0,y0,x1,y1 box (fractions) where the scrolling finger/thumb is")
    ap.add_argument("--grow", type=float, default=1.02)
    ap.add_argument("--momentum", type=float, default=0.86)
    ap.add_argument("--mix", type=float, default=0.6, help="share of the scroll driven by the hand; the rest is steady")
    ap.add_argument("--still", help="comma-separated frame numbers: write PNGs instead of a video")
    a = ap.parse_args()

    screens = []
    for s in a.screen:
        parts = s.split(":")
        pick, rec = parts[0], parts[1]
        g = float(parts[2]) if len(parts) > 2 else a.grow
        trim = int(parts[3]) if len(parts) > 3 else 0
        solid = len(parts) > 4 and parts[4] == "solid"
        rn, _, rw, rh = info(rec)
        screens.append(dict(pick=pick, rec=rec, n=rn, w=rw, h=rh, grow=g, trim=trim, solid=solid))
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
            idx = sc["trim"] + int(round(prog[t] * (sc["n"] - 1 - sc["trim"])))
            img = rec_frame(i, idx)
            if img is None:
                continue
            qd = quads[i][t]
            q = grow(qd, sc["grow"]).astype(np.float32)
            # keep the page's proportions: crop the recording to the screen's
            # shape (top-aligned) instead of stretching it
            sw_ = (np.linalg.norm(qd[1] - qd[0]) + np.linalg.norm(qd[2] - qd[3])) / 2
            sh_ = (np.linalg.norm(qd[3] - qd[0]) + np.linalg.norm(qd[2] - qd[1])) / 2
            asp = sw_ / sh_
            if asp > sc["w"] / sc["h"]:
                cw_, ch_ = sc["w"], sc["w"] / asp
                ox, oy = 0, 0
            else:
                cw_, ch_ = sc["h"] * asp, sc["h"]
                ox, oy = (sc["w"] - cw_) / 2, 0
            # the grown quad shows a little more than the screen: widen the crop to match
            gx, gy = cw_ * (sc["grow"] - 1) / 2, ch_ * (sc["grow"] - 1) / 2
            src = np.float32([[ox - gx, oy - gy], [ox + cw_ + gx, oy - gy], [ox + cw_ + gx, oy + ch_ + gy], [ox - gx, oy + ch_ + gy]])
            M = cv2.getPerspectiveTransform(src, q)
            warped = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
            region = cv2.warpPerspective(np.ones((sc["h"], sc["w"]), np.float32), M, (W, H), borderMode=cv2.BORDER_CONSTANT)[..., None]
            layer = layer * (1 - region) + warped.astype(np.float32) * 0.96 * region
            if sc["solid"]:
                inner = np.zeros((H, W), np.float32)
                cv2.fillConvexPoly(inner, grow(qd, 1.004).astype(np.int32), 1.0, lineType=cv2.LINE_AA)
                alpha = np.maximum(alpha, cv2.GaussianBlur(inner, (3, 3), 0)[..., None])
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

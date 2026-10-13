"""Analyse the hand-collected sample + AppBrain histogram. Produces charts and numbers used in the deck."""
import csv, json, collections, pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = pathlib.Path(__file__).resolve().parent.parent
hist = {int(r["stars"]): int(r["ratings_approx"]) for r in csv.DictReader(open(ROOT / "data/play_histogram.csv"))}
rows = list(csv.DictReader(open(ROOT / "data/review_sample.csv")))

N = sum(hist.values())
mean = sum(s * n for s, n in hist.items()) / N
share = {s: n / N for s, n in hist.items()}

def avg(h):
    t = sum(h.values())
    return sum(s * n for s, n in h.items()) / t

def scenario(frac, to_star=None):
    """Move `frac` of 1-star ratings to `to_star` (or drop them if None)."""
    h = dict(hist)
    moved = h[1] * frac
    h[1] -= moved
    if to_star:
        h[to_star] += moved
    return avg(h)

scen = {
    "today": mean,
    "1-star share halved, those users become 5-star": scenario(0.5, 5),
    "1-star share halved, those users become 4-star": scenario(0.5, 4),
    "all 1-star users become 4-star": scenario(1.0, 4),
}
needed_5star = (4.5 - mean) * N / (5 - 4.5)  # extra 5-star ratings to lift lifetime avg to 4.5

neg = [r for r in rows if r["themes"] != "positive"]
themes = collections.Counter(t for r in neg for t in r["themes"].split(";"))
platform_neg = collections.Counter(r["platform"] for r in neg)

out = dict(total_ratings=N, mean=round(mean, 3), shares={k: round(v * 100, 1) for k, v in share.items()},
           scenarios={k: round(v, 3) for k, v in scen.items()}, extra_5star_for_4_5=round(needed_5star),
           negative_reviews_in_sample=len(neg), themes=dict(themes), platform_negative=dict(platform_neg))
(ROOT / "data/analysis_output.json").write_text(json.dumps(out, indent=2))
print(json.dumps(out, indent=2))

# ---- charts (one palette, direct labels, no gridline clutter) ----
INK, MUTED, ACCENT, BASE = "#1B2430", "#6B7785", "#D9480F", "#2F6F8F"
plt.rcParams.update({"font.family": "DejaVu Sans", "axes.spines.top": False, "axes.spines.right": False})

# 1) star distribution
fig, ax = plt.subplots(figsize=(7.2, 3.6), dpi=200)
stars = [5, 4, 3, 2, 1]
vals = [share[s] * 100 for s in stars]
cols = [BASE, BASE, "#A9B4BF", "#A9B4BF", ACCENT]
bars = ax.barh([f"{s}★" for s in stars], vals, color=cols, height=0.62)
for b, v, s in zip(bars, vals, stars):
    ax.text(v + 1, b.get_y() + b.get_height() / 2, f"{v:.1f}%  ({hist[s]/1000:.1f}K)", va="center", fontsize=11, color=INK)
ax.invert_yaxis(); ax.set_xlim(0, 90); ax.set_xticks([])
ax.spines[["bottom"]].set_visible(False); ax.tick_params(axis="y", labelsize=12, length=0, colors=INK)
fig.tight_layout(); fig.savefig(ROOT / "charts/star_distribution.png", transparent=False, facecolor="white"); plt.close(fig)

# 2) what-if
fig, ax = plt.subplots(figsize=(7.2, 3.6), dpi=200)
labels = ["Today", "Halve 1★\n(become 4★)", "Halve 1★\n(become 5★)", "All 1★\nbecome 4★"]
vs = [scen["today"], scen["1-star share halved, those users become 4-star"],
      scen["1-star share halved, those users become 5-star"], scen["all 1-star users become 4-star"]]
b = ax.bar(labels, vs, color=[MUTED, BASE, BASE, BASE], width=0.6)
for r_, v in zip(b, vs):
    ax.text(r_.get_x() + r_.get_width() / 2, v + 0.015, f"{v:.2f}", ha="center", fontsize=12, color=INK)
ax.set_ylim(4.0, 4.8); ax.set_yticks([]); ax.spines[["left"]].set_visible(False)
ax.tick_params(axis="x", labelsize=10.5, length=0, colors=INK)
fig.tight_layout(); fig.savefig(ROOT / "charts/what_if.png", facecolor="white"); plt.close(fig)

# 3) themes
names = {"login_otp": "Login / OTP failures", "reliability": "Crashes & bugs", "noshow_boarding": "No-show & boarding friction",
         "booking_clarity": "Booking & notification clarity", "tracking_accuracy": "Tracking accuracy / freshness",
         "ops_service": "Ops & service (outside the app)", "permissions_ads": "Permissions / ads", "offline_state": "No offline trip state"}
items = sorted(themes.items(), key=lambda kv: -kv[1])
fig, ax = plt.subplots(figsize=(7.2, 3.9), dpi=200)
ys = [names[k] for k, _ in items]; xs = [v for _, v in items]
cs = [ACCENT if k == "noshow_boarding" else (MUTED if k == "ops_service" else BASE) for k, _ in items]
bars = ax.barh(ys, xs, color=cs, height=0.62)
for b_, v in zip(bars, xs):
    ax.text(v + 0.1, b_.get_y() + b_.get_height() / 2, str(v), va="center", fontsize=11, color=INK)
ax.invert_yaxis(); ax.set_xticks([]); ax.spines[["bottom"]].set_visible(False)
ax.tick_params(axis="y", labelsize=10.5, length=0, colors=INK)
fig.tight_layout(); fig.savefig(ROOT / "charts/themes.png", facecolor="white"); plt.close(fig)
print("charts written")

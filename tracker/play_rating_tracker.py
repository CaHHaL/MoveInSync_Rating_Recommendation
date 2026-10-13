#!/usr/bin/env python3
"""
MoveInSync Play Store rating tracker  -  answers "How are our Play Store ratings?" on demand.

Live mode  (run from a normal machine / CI with internet; needs `pip install google-play-scraper`):
    python play_rating_tracker.py --app com.moveinsync.ets --days 30

Offline mode (any CSV with columns: date,stars,version,text   -  e.g. a Play Console export):
    python play_rating_tracker.py --csv reviews.csv --days 30

Outputs a Markdown report (stdout + reports/YYYY-MM-DD.md) with:
  * store-level rating + star histogram (live mode)
  * rolling-window average, 1-star share, and change vs. the previous window
  * complaint themes among 1-2 star reviews, with example snippets
  * per-app-version rating (spots a bad release)
  * developer reply rate on 1-2 star reviews (live mode)

Design notes
  * Themes are keyword rules in THEMES below - transparent and editable. Re-check the
    "unclassified" bucket every week and add rules; that bucket is the early-warning for new problems.
  * Reviews are fetched newest-first and stop once older than 2x the window.
"""
import argparse, csv, collections, datetime as dt, pathlib, re, statistics, sys

# theme -> regex (case-insensitive). Order does not matter; a review can hit several themes.
THEMES = {
    "login_otp":         r"\botp\b|log ?in|sign ?in|verification code|not receiv|password",
    "crash_bugs":        r"crash|not open|won'?t open|white screen|freez|stuck|\bbug|glitch|not working|force close|hang",
    "noshow_boarding":   r"no.?show|marked absent|penal|check.?in|reached|board|seat ?belt|cancel",
    "booking_clarity":   r"book(ing|ed)?\b|schedul|roster|shift|edit|change (the )?(location|time|date)|notification|confirm",
    "tracking_accuracy": r"gps|location|track|eta|live|wrong (place|route|position)|not updat|refresh",
    "ops_service":       r"driver|late|delay|wait|pick ?up|drop|cab (is|was)|vehicle|route|rude|complain|transport (team|desk)|support|helpdesk|no response|ignored",
    "permissions_ads":   r"permission|microphone|camera|\bads?\b|advert|privacy|battery",
    "ui_ux":             r"\bui\b|\bux\b|design|interface|confus|difficult to use|too many (steps|clicks)|update(d)? (made|ruined)",
}
THEME_RX = {k: re.compile(v, re.I) for k, v in THEMES.items()}

def classify(text: str):
    hits = [k for k, rx in THEME_RX.items() if rx.search(text or "")]
    return hits or ["unclassified"]

def load_live(app_id, days, lang, country):
    from google_play_scraper import app as gp_app, reviews, Sort   # imported lazily so CSV mode needs no deps
    info = gp_app(app_id, lang=lang, country=country)
    cutoff = dt.datetime.now() - dt.timedelta(days=days * 2)
    rows, token = [], None
    while True:
        batch, token = reviews(app_id, lang=lang, country=country, sort=Sort.NEWEST, count=200, continuation_token=token)
        if not batch:
            break
        for r in batch:
            if r["at"] < cutoff:
                token = None
                break
            rows.append(dict(date=r["at"], stars=r["score"], version=r.get("reviewCreatedVersion") or "?",
                             text=r.get("content") or "", replied=bool(r.get("replyContent"))))
        if token is None:
            break
    return info, rows

def load_csv(path):
    rows = []
    for r in csv.DictReader(open(path, encoding="utf-8")):
        try:
            d = dt.datetime.fromisoformat(r["date"])
        except Exception:
            continue
        rows.append(dict(date=d, stars=int(r["stars"]), version=r.get("version") or "?", text=r.get("text", ""),
                         replied=str(r.get("replied", "")).lower() in ("1", "true", "yes")))
    return None, rows

def window_stats(rows, start, end):
    w = [r for r in rows if start <= r["date"] < end]
    if not w:
        return dict(n=0, avg=None, one_star=None)
    return dict(n=len(w), avg=statistics.mean(r["stars"] for r in w),
                one_star=sum(r["stars"] == 1 for r in w) / len(w))

def fmt(x, pct=False):
    if x is None:
        return "n/a"
    return f"{x*100:.1f}%" if pct else f"{x:.2f}"

def build_report(info, rows, days, live):
    now = max((r["date"] for r in rows), default=dt.datetime.now())
    cur = window_stats(rows, now - dt.timedelta(days=days), now + dt.timedelta(seconds=1))
    prev = window_stats(rows, now - dt.timedelta(days=2 * days), now - dt.timedelta(days=days))
    lines = [f"# Play Store rating report - {now:%Y-%m-%d}", ""]
    if info:
        hist = info.get("histogram") or []
        tot = sum(hist) or 1
        lines += [f"**Store rating:** {info['score']:.2f} from {info['ratings']:,} ratings "
                  f"(installs {info.get('installs')}, version {info.get('version')}, updated "
                  f"{dt.datetime.fromtimestamp(info['updated']):%Y-%m-%d})", ""]
        if hist:
            lines.append("Star histogram (1 to 5): " + ", ".join(f"{i+1}★ {h/tot*100:.1f}%" for i, h in enumerate(hist)))
            lines.append("")
    d_avg = None if cur["avg"] is None or prev["avg"] is None else cur["avg"] - prev["avg"]
    lines += [f"## Last {days} days vs previous {days} days", "",
              "| Window | Reviews | Avg stars | 1-star share |", "|---|---|---|---|",
              f"| Last {days}d | {cur['n']} | {fmt(cur['avg'])} | {fmt(cur['one_star'], True)} |",
              f"| Prev {days}d | {prev['n']} | {fmt(prev['avg'])} | {fmt(prev['one_star'], True)} |", ""]
    if d_avg is not None:
        lines.append(f"Change in average: **{d_avg:+.2f}**  ({'improving' if d_avg > 0.02 else 'worsening' if d_avg < -0.02 else 'flat'})")
        lines.append("")

    win = [r for r in rows if r["date"] >= now - dt.timedelta(days=days)]
    low = [r for r in win if r["stars"] <= 2]
    lines += [f"## Why people give 1-2 stars (last {days}d, {len(low)} reviews)", ""]
    theme_hits = collections.defaultdict(list)
    for r in low:
        for t in classify(r["text"]):
            theme_hits[t].append(r)
    if low:
        lines += ["| Theme | Reviews | Share of 1-2★ | Example |", "|---|---|---|---|"]
        for t, rs in sorted(theme_hits.items(), key=lambda kv: -len(kv[1])):
            ex = re.sub(r"\s+", " ", rs[0]["text"])[:110].replace("|", "/")
            lines.append(f"| {t} | {len(rs)} | {len(rs)/len(low)*100:.0f}% | {ex} |")
        lines.append("")
        lines.append("Add keyword rules for anything in `unclassified` - that bucket is where new problems first appear.")
        lines.append("")

    by_ver = collections.defaultdict(list)
    for r in win:
        by_ver[r["version"]].append(r["stars"])
    lines += ["## Rating by app version (versions with >=10 reviews)", "", "| Version | Reviews | Avg stars | 1★ share |", "|---|---|---|---|"]
    for v, s in sorted(by_ver.items(), key=lambda kv: statistics.mean(kv[1])):
        if len(s) >= 10:
            lines.append(f"| {v} | {len(s)} | {statistics.mean(s):.2f} | {sum(x == 1 for x in s)/len(s)*100:.0f}% |")
    lines.append("")

    if live and low:
        replied = sum(r.get("replied", False) for r in low)
        lines += [f"## Reply coverage on 1-2★ reviews: {replied}/{len(low)} ({replied/len(low)*100:.0f}%)", ""]
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", default="com.moveinsync.ets")
    ap.add_argument("--csv")
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--lang", default="en")
    ap.add_argument("--country", default="in")
    ap.add_argument("--out", default="reports")
    a = ap.parse_args()
    info, rows = load_csv(a.csv) if a.csv else load_live(a.app, a.days, a.lang, a.country)
    if not rows:
        sys.exit("No reviews loaded.")
    report = build_report(info, rows, a.days, live=not a.csv)
    pathlib.Path(a.out).mkdir(exist_ok=True)
    path = pathlib.Path(a.out) / f"{dt.date.today():%Y-%m-%d}.md"
    path.write_text(report, encoding="utf-8")
    print(report)
    print(f"\n[written to {path}]")

if __name__ == "__main__":
    main()

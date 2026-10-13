# MoveInSync Play Store rating: diagnosis, plan and tracker

Assignment: MoveInSync Forward Deployed Engineer (Intern to FTE). Work done 13 Oct 2026.

| File | What it is |
|---|---|
| `RECOMMENDATION.md` | The recommendation: root causes, prioritised plan with owners and metrics, targets, limits |
| `MoveInSync_Play_Store_Rating_Recommendation.pptx` | 10-slide deck of the same story |
| `SUBMISSION_NOTE.md` | Short note on approach and tools |
| `tracker/play_rating_tracker.py` | Weekly rating report from Play reviews (live) or a CSV export (offline) |
| `tracker/analyze_sample.py` | Star-histogram maths, what-if scenarios and theme counts used in the deck |
| `.github/workflows/weekly-rating-report.yml` | Runs the tracker every Monday 09:00 IST and commits the report |
| `data/` | Hand-tagged review sample, AppBrain star histogram, analysis output |
| `charts/` | Charts rendered by `analyze_sample.py` |

## Run it

```bash
pip install google-play-scraper
python tracker/play_rating_tracker.py --app com.moveinsync.ets --days 30        # live
python tracker/play_rating_tracker.py --csv reviews.csv --days 30               # Play Console export
python tracker/analyze_sample.py                                                # reproduces deck numbers
```

CSV columns for offline mode: `date,stars,version,text` (optional `replied`).

## Status and caveats

- The live mode has not been run against Google Play by the author (no access from the build environment). The report generator was tested on synthetic data only.
- The review sample is 25 negative reviews gathered from public aggregators; star counts are AppBrain's rounded figures.

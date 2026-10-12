# How I got there, and the tools I used

**The question.** Why is the MoveInSync Play Store rating lower than it should be, and what should we fix first? It is a question that will be asked again, so I treated it as something to build a repeatable answer for, not a one-time report.

**What I did**
1. **Found the apps and the numbers.** The employee app `com.moveinsync.ets` is the one that matters (3.2M installs, 114,607 ratings, 4.32 stars on 10 Oct 2026). The publisher's other five apps (driver, field, workplace) show no ratings on AppBrain, so they do not drive the score.
2. **Hit a wall and said so.** Google Play disallows automated access, so I did not scrape it. I used AppBrain's snapshot of the listing (rating, star histogram, recent reviews, release timeline), App Store reviews through mwm.ai and appshunter, Play listing snippets from search, G2, MoveInSync's own Help Center and its blog on how it recovered its rating in 2022.
3. **Read the shape before the words.** The star histogram showed the real pattern: 71.8% five-star, 12.3% one-star, 2.7% in between. The rating is polarised, and a halved one-star group would lift it to about 4.5.
4. **Tagged 25 negative reviews by hand** into eight themes, then checked each theme against MoveInSync's own Help Center notes (premature No Show tags, OTP hidden by the seat-belt step, standard OTP and crash support macros). That gave four root causes.
5. **Turned causes into a plan** that Product and Engineering can start on the next day: do first (reply desk, release guardrails, OTP fix), then the No Show and boarding redesign, then an in-app issue route so service failures stop landing in Play reviews. Each item has an owner and a metric.
6. **Built the repeatable part:** a tracker script and a weekly GitHub Action that answer "How are our ratings?" with a Markdown report (30-day vs previous 30, themes, rating by version, reply coverage).

**Tools.** Claude (research, analysis, writing and code), web search and page fetch, AppBrain, mwm.ai, appshunter, G2, MoveInSync Help Center and blog; Python (analysis and matplotlib charts), `google-play-scraper` for the tracker's live mode, PptxGenJS for the deck, GitHub Actions for the weekly run.

**What I am not claiming.** Theme counts come from only 25 reviews, so read them as direction, not percentages. The histogram is rounded by AppBrain. I had no Play Console, crash or trip data, so the share of service-failure complaints is probably understated. The tracker's live mode was not run against Google Play from my environment; its report generator was tested on synthetic data only. With one hour of Play Console access I would replace the sample with the full review export.

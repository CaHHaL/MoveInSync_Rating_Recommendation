# Raising the MoveInSync Play Store rating: what to fix and what to do first

Prepared 13 Oct 2026 for Product and Engineering. App: MoveInSync employee app, `com.moveinsync.ets`.

## 1. Where we stand

- Google Play rating **4.32** from **114,607** ratings, 3.2M installs, version 12.19.0 (AppBrain snapshot, 10 Oct 2026).
- Star split (AppBrain, rounded): 5★ 71.8%, 4★ 13.1%, 3★ 1.9%, 2★ 0.8%, 1★ 12.3%.
- The rating is **polarised**. 14K one-star ratings pull a base that would otherwise sit near 4.8. Almost nobody gives 2 or 3 stars, which means unhappy users are not mildly annoyed: they are stuck.
- Best of the employee-commute apps AppBrain lists (Routematic 3.8, sRide 3.7, eFmFm 3.5), but below our own earlier 4.6 (our blog, 2022 recovery). AppBrain shows 4.36 in July and 4.32 on 10 Oct: a small drift down, direction only because the figures are rounded.
- Between 4 Aug and 16 Sep 2026 the employee app shipped five updates. Several reviewers date their problems to "since the update".

## 2. Why: four root causes

Evidence is 25 negative reviews (10 Play, 15 App Store) in `data/review_sample.csv`. Counts are distinct reviews and a review can carry more than one theme. Treat them as direction, not percentages.

| # | Root cause | Reviews | What users say |
|---|---|---|---|
| 1 | **No Show and boarding rules feel punitive** | 7 | A missed check-in becomes a surprise No Show. Users want to declare No Show themselves, want a reminder when the vehicle passes their pickup, say the Reached confirmation disappears, say OTP is hidden behind the seat-belt step, and call penalties unfair when they warned in advance. |
| 2 | **Reliability, especially around updates and login** | 6 | OTP never arrives (Android and iOS). iOS v10.42.6 white-screens on launch. "Crashes every 20 days". |
| 3 | **Booking became less clear** | 4 | Shuttle booking turned into two steps; a "trip not booked" push arrives after booking; pickup and date cannot be edited; user sees every cab for the slot, not their own; co-passengers hidden (2023). |
| 4 | **Service failures are reviewed as app failures** | 6 | Last drop-off every day, a new cab daily, rain delays, three passengers squeezed in the back, complaints ignored by the transport team. There is no in-app route for these, so the Play Store becomes the complaint box. |

Smaller items: tracking accuracy and stale vehicle changes (3), permissions and an unverified claim that ads were added (2), no offline trip state (1).

Corroboration from our own documentation: the Help Center driver-app notes (6.4.0) record that drivers tag No Show prematurely and propose a geofence check; notes for 6.5.0 record seat-belt compliance overriding the OTP sign-in view; and "OTP not received", "app crash" and "app not opening" are standard support macros. These are known, recurring problems, not one-off reviews.

## 3. What to do, in order

### Do first: this week (mostly process, little build)

**A. Review reply desk** (Owner: Customer Success, with a Product lead)
- Reply to every 1 and 2-star review within 48 hours. Play caps replies at 350 characters. Name the fix or the next step; never paste the same canned reply.
- Our own 2022 playbook credited personalised replies for recovery. Google's Play Console documentation says a reply can lift a negative rating by 0.7 on average (quoted by Appbot; verify in Play Console).
- Metric: reply coverage 90% or more, median reply time under 48 hours.

**B. Release guardrails** (Owner: Android and iOS leads, QA)
- Use staged rollouts: 5% to 20% to 50% to 100%. Halt automatically if crash-free users fall below the previous version's level, or if the new version's 1-star share over 48 hours is more than 5 points above the baseline of 12%.
- Keep a one-click rollback and a release checklist item: log in with OTP on a low-end device and a poor network.
- Metric: rating by version in the weekly report; no version below 4.0 after 7 days.

**C. Fix OTP delivery** (Owner: Backend and Mobile)
- Use SMS autofill on Android, a visible resend timer, and automatic fallback to email or voice OTP. Add an "I still can't log in" button that opens a ticket to the transport desk.
- Log delivery success by carrier and alert below 98%.
- Metric: OTP success rate, login-related 1-star reviews per week.

**D. Verify two claims** (Owner: Mobile, 1 day)
- Reviewers report repeated microphone permission prompts on iOS and, on Android, a newly introduced ad. AppBrain's July snapshot listed no ads. Check both, remove any microphone permission we do not use.

### Next 30 days: the biggest review theme

**E. No Show and boarding redesign** (Owner: Product design, Mobile, Driver app)
1. Let the employee declare "I can't make it" or No Show, with the cutoff shown at booking and again before cancelling, so the rule is never discovered afterwards.
2. Send a push chain: vehicle approaching, vehicle at your pickup. The boarding confirmation stays on the trip screen until it is acted on or the trip ends, and never exists only as a notification.
3. Driver app: No Show requires being inside the pickup geofence, a minimum wait time, and a logged call attempt (extends the 6.4.0 design).
4. Show penalty policy in plain words and offer a one-tap appeal.
5. Show OTP and seat-belt confirmation on one screen so one cannot hide the other.
- Metric: No Show disputes per 1,000 trips; share of 1 and 2-star reviews mentioning No Show or boarding.

**F. Booking clarity** (Owner: Mobile, Design)
- Restore one-step shuttle booking, or add an explicit result screen: "Booked" or "Not booked".
- Suppress the "trip not booked" push whenever a booking exists.
- Show only the user's own cab for the slot; make pickup, drop and date editable; add a monthly roster view.
- Metric: booking-related reviews; booking completion rate.

**G. Fresh and offline trip state** (Owner: Mobile, Backend)
- Cache the next trip (time, vehicle, OTP) with a "last updated" stamp. Push vehicle changes and ETA shifts as data messages and refresh in the app without a manual pull.
- Metric: tracking and vehicle-change reviews; crash-free and ANR rates on low-end devices.

### Next 90 days: stop the Play Store being the complaint box

**H. In-app "Report an issue"** (Owner: Product, Ops, Account Managers)
- Structured categories: late pickup, route, vehicle, driver, safety, other. Offer it at trip end and during the trip. It routes to the client's transport desk with an SLA clock, and the employee sees a ticket number, an owner and a status.
- Include the client account in each ticket. This lets us see which sites generate one-star reviews and take SLA fixes to those accounts.
- Metric: tickets closed within SLA; share of 1-star reviews citing ops; ticket volume vs review volume.

**I. Rating prompt after a good trip** (Owner: Mobile)
- Use Google's In-App Review API after a completed, on-time trip with a successful deboarding OTP. Cap frequency. Do not pre-ask an opinion question: Google's guidance discourages it, so confirm the current rule before shipping.

**J. Ops signal loop** (Owner: Data, Account Management)
- Join review themes with trip data (late pickups, last-drop skew, vehicle changes per day) by client site, to find where service failures cluster.

## 4. Targets and expected effect

- Halving the one-star group lifts the lifetime average from 4.31 to 4.50 (if those users move to 4★) or 4.56 (if to 5★). Moving every one-star user to 4★ gives 4.68.
- Doing nothing, reaching 4.5 would need about 42,000 additional five-star ratings.
- Google said in 2019 that it weights recent ratings more heavily, so the shown score can move faster than lifetime arithmetic. Confirm current behaviour in Play Console.
- Targets: 1-star share from 12.3% to 6% or less in two quarters; rolling 30-day average 4.5 or higher; reply coverage 90% or more.

## 5. Answering "How are our Play Store ratings?" on demand

`tracker/play_rating_tracker.py` produces a Markdown report on demand, and `.github/workflows/weekly-rating-report.yml` runs it every Monday 09:00 IST. The report shows the store rating and star histogram; 30-day average and 1-star share against the previous 30 days; 1 and 2-star themes with examples and an "unclassified" bucket for new problems; rating by app version; and reply coverage.

Pair it with leading indicators owned by Product: OTP success rate, crash-free users by version, No Show disputes per 1,000 trips, and complaint tickets closed within SLA.

## 6. Assumptions and limits

- Google Play disallows automated access, so no direct scrape was made. Data came from AppBrain, mwm.ai, appshunter, Play listing snippets and public MoveInSync pages.
- Theme counts rest on 25 negative reviews; the star histogram is rounded by AppBrain.
- iOS reviews are used on the assumption that flows and defects are shared with Android. Some are older (one is from 2023).
- No Play Console, crash, ANR or trip data was available. The share of service-failure complaints is probably understated.
- The tracker's live mode was not run against Google Play from my build environment. Its report generator was tested on synthetic data only, and the keyword classifier matched 24 of 25 hand-tagged reviews, but those rules were written while looking at that same sample, so this is not an accuracy figure.
- **Next step:** one hour with Play Console access to replace the sample with the full review export and run the tracker on it.

## Sources

- AppBrain, MoveInSync (com.moveinsync.ets): https://www.appbrain.com/app/moveinsync/com.moveinsync.ets
- AppBrain developer page: https://www.appbrain.com/dev/MoveInSync%3A+Enabling+Hybrid+Workplaces/
- MoveInSync blog on Play Store rating recovery: https://moveinsync.com/?p=6499
- MoveInSync Help Center, mobile app issues: https://helpcenter.moveinsync.com/support/solutions/articles/1070000136108-mobile-app-issues
- MoveInSync Help Center, driver app 6.4.0: https://helpcenter.moveinsync.com/support/solutions/articles/1070000137681-new-feature-driver-app-6-4-0
- MoveInSync Help Center, driver app 6.5.0: https://helpcenter.moveinsync.com/support/solutions/articles/1070000137680-new-driver-app-features-6-5-0
- App Store reviews via mwm.ai: https://mwm.ai/apps/moveinsync/962949521
- App Store reviews via appshunter: https://appshunter.io/ios/app/moveinsync/id962949521
- Appbot on replying to reviews: https://appbot.co/best-practices/how-to-reply-to-app-store-reviews/
- Google Play rating update (2019): https://gameworldobserver.com/2019/05/14/google-play-store-rating-latest-reviews

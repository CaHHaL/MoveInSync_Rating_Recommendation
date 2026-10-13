const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");

const THEME = {
  name: "MoveInSync Rating Review",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2430", lt1: "FFFFFF", dk2: "2F6F8F", lt2: "EEF2F5",
    accent1: "D9480F", accent2: "2F6F8F", accent3: "6B7785", accent4: "A9B4BF", accent5: "E8A33D", accent6: "3C8D6A",
    hlink: "2F6F8F", folHlink: "6B7785",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Why our Play Store rating is 4.3 and what to fix first";
pres.author = "Cahal";
const C = pres.SchemeColor;

// hex only where scheme colours are not accepted (chart series colours)
const HEX = { ink: "1B2430", blue: "2F6F8F", orange: "D9480F", grey: "6B7785", light: "A9B4BF" };

pres.defineSlideMaster({
  title: "DARK",
  background: { color: "1B2430" },
  objects: [],
  slideNumber: { x: 9.2, y: 5.25, w: 0.5, h: 0.3, fontSize: 10, color: "A9B4BF" },
});
pres.defineSlideMaster({
  title: "LIGHT",
  background: { color: "FFFFFF" },
  objects: [],
  slideNumber: { x: 9.2, y: 5.25, w: 0.5, h: 0.3, fontSize: 10, color: "6B7785" },
});

const LM = 0.5, W = 9.0;
function title(slide, text, sub) {
  slide.addText(text, { x: LM, y: 0.3, w: W, h: 0.7, fontSize: 32, bold: true, color: C.text1, fontFace: "Cambria", margin: 0, isTextBox: true, objectName: "Title" });
  if (sub) slide.addText(sub, { x: LM, y: 1.0, w: W, h: 0.4, fontSize: 16, color: C.accent3, margin: 0, isTextBox: true, objectName: "Subtitle" });
}
function source(slide, text) {
  slide.addText(text, { x: LM, y: 5.2, w: 8.4, h: 0.3, fontSize: 10, color: C.accent3, margin: 0, isTextBox: true, objectName: "Source" });
}
const chartCommon = (extra) => Object.assign({
  catAxisLabelColor: HEX.ink, valAxisLabelColor: HEX.ink,
  catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt",
  catAxisLabelFontSize: 14, dataLabelFontSize: 14, dataLabelColor: HEX.ink,
  valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, showTitle: false,
  valAxisHidden: true, catAxisLineShow: false,
}, extra);

// ---------- 1. Title ----------
pres.addSection({ title: "Context" });
let s = pres.addSlide({ masterName: "DARK", sectionTitle: "Context" });
s.addText("Why our Play Store rating is 4.3, and what to fix first", { x: 0.7, y: 1.2, w: 8.4, h: 1.6, fontSize: 40, bold: true, color: C.background1, fontFace: "Cambria", margin: 0, valign: "top", isTextBox: true, objectName: "Title" });
s.addText("MoveInSync employee app (com.moveinsync.ets): rating-improvement recommendation for Product and Engineering", { x: 0.7, y: 3.0, w: 7.8, h: 0.8, fontSize: 18, color: C.accent4, margin: 0, valign: "top", isTextBox: true, objectName: "Subtitle" });
s.addText("Cahal  |  Forward Deployed Engineer assignment  |  13 Oct 2026", { x: 0.7, y: 4.7, w: 8, h: 0.35, fontSize: 14, color: C.accent4, margin: 0, isTextBox: true, objectName: "Byline" });
s.addNotes("Rating figures are from AppBrain's snapshot of the Google Play listing on 10 Oct 2026. Google Play itself disallows automated access, so no direct scrape was made.");

// ---------- 2. Short version ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Context" });
title(s, "The short version");
s.addShape(pres.ShapeType.rect, { x: LM, y: 1.3, w: 2.9, h: 3.6, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Stat card" });
s.addText("4.32", { x: LM, y: 1.6, w: 2.9, h: 1.2, fontSize: 66, bold: true, color: C.accent1, align: "center", fontFace: "Cambria", margin: 0, isTextBox: true, objectName: "Big stat" });
s.addText("Google Play rating", { x: LM, y: 2.8, w: 2.9, h: 0.4, fontSize: 16, color: C.text1, align: "center", margin: 0, isTextBox: true, objectName: "Stat label" });
s.addText("114,607 ratings\n3.2M installs\nsnapshot 10 Oct 2026", { x: LM, y: 3.35, w: 2.9, h: 1.2, fontSize: 14, color: C.accent3, align: "center", margin: 0, valign: "top", isTextBox: true, objectName: "Stat detail" });
const pts = [
  ["1", "The rating is polarised, not broadly bad.", "71.8% give five stars, 12.3% give one, and almost nobody sits in between."],
  ["2", "The 1-star group is stuck at key moments.", "Login, boarding, No Show rules and booking confirmation, plus service failures the app takes the blame for."],
  ["3", "Do first: reply desk, release guardrails, OTP fix.", "Then redesign No Show and boarding, then give service issues an in-app route."],
];
pts.forEach((p, i) => {
  const y = 1.3 + i * 1.25;
  s.addShape(pres.ShapeType.ellipse, { x: 3.9, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `Badge ${p[0]}` });
  s.addText(p[0], { x: 3.9, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `Badge text ${p[0]}` });
  s.addText([{ text: p[1], options: { bold: true, fontSize: 18, color: C.text1, breakLine: true } }, { text: p[2], options: { fontSize: 14, color: C.accent3 } }], { x: 4.6, y, w: 4.9, h: 1.1, margin: 0, valign: "top", isTextBox: true, objectName: `Point ${p[0]}` });
});
source(s, "Source: AppBrain listing snapshot for com.moveinsync.ets, 10 Oct 2026 (star counts rounded by AppBrain)");

// ---------- 3. Benchmark ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Context" });
title(s, "Best in category, below our own best", "Employee-commute apps on Google Play, average rating");
s.addChart(pres.charts.BAR, [{ name: "Rating", labels: ["MoveInSync", "Routematic", "sRide", "eFmFm"], values: [4.32, 3.8, 3.7, 3.5] }],
  chartCommon({ x: LM, y: 1.5, w: 4.6, h: 3.5, barDir: "bar", catAxisOrientation: "maxMin", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0#", chartColors: [HEX.orange, HEX.light, HEX.light, HEX.light], valAxisMinVal: 0, valAxisMaxVal: 5, barGapWidthPct: 50 }));
s.addText([
  { text: "We have been here before.", options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: "Our own blog says the rating fell 0.3 as offices reopened in 2022 and recovered to 4.6 through personalised review replies and a better feedback loop.", options: { fontSize: 14, color: C.accent3, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Small drift down again.", options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: "AppBrain shows 4.36 in July and 4.32 on 10 Oct. Direction only; both figures are rounded.", options: { fontSize: 14, color: C.accent3, breakLine: true, paraSpaceAfter: 10 } },
  { text: "iOS is 4.7, on 469 ratings.", options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: "That is 0.4% of Android's volume. Android is where the score is won.", options: { fontSize: 14, color: C.accent3 } },
], { x: 5.4, y: 1.5, w: 4.1, h: 3.6, margin: 0, valign: "top", isTextBox: true, objectName: "Benchmark notes" });
source(s, "Sources: AppBrain (Android ratings, 10 Oct 2026); moveinsync.com rating-playbook blog; AppBrain iOS listing");
s.addNotes("Competitor figures are Android ratings from AppBrain pages and may be a few weeks old. The 4.6 recovery claim is MoveInSync's own blog.");

// ---------- 4. Distribution ----------
pres.addSection({ title: "Diagnosis" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Diagnosis" });
title(s, "One angry 12% drags us to 4.3", "Share of Google Play ratings by star");
s.addChart(pres.charts.BAR, [{ name: "Share", labels: ["5★", "4★", "3★", "2★", "1★"], values: [71.8, 13.1, 1.9, 0.8, 12.3] }],
  chartCommon({ x: LM, y: 1.5, w: 5.0, h: 3.5, barDir: "bar", catAxisOrientation: "maxMin", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', chartColors: [HEX.blue, HEX.blue, HEX.light, HEX.light, HEX.orange], valAxisMinVal: 0, valAxisMaxVal: 90, barGapWidthPct: 45 }));
const stats = [["14K", "one-star ratings"], ["2.7%", "in the middle (2 and 3 stars)"], ["~42K", "extra five-star ratings needed to reach 4.5 without fixing anything"]];
stats.forEach((st, i) => {
  const y = 1.5 + i * 1.2;
  s.addText(st[0], { x: 5.9, y, w: 1.5, h: 0.9, fontSize: 36, bold: true, color: C.accent1, fontFace: "Cambria", margin: 0, valign: "middle", isTextBox: true, objectName: `Stat ${i + 1}` });
  s.addText(st[1], { x: 7.45, y, w: 2.05, h: 0.9, fontSize: 14, color: C.text1, margin: 0, valign: "middle", isTextBox: true, objectName: `Stat label ${i + 1}` });
});
source(s, "Source: AppBrain star histogram, 10 Oct 2026. Counts rounded (82K / 15K / 2.2K / 960 / 14K); mean recomputes to 4.31 vs 4.32 shown");

// ---------- 5. Themes ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Diagnosis" });
title(s, "What the 1-star reviews are about", "Negative reviews by theme (25 reviews, a review can carry several themes)");
const th = [["No Show and boarding friction", 7], ["Login / OTP failures", 2], ["Crashes and bugs", 4], ["Ops and service, outside the app", 6], ["Booking and notification clarity", 4], ["Tracking accuracy and freshness", 3], ["Permissions and ads", 2], ["No offline trip state", 1]];
s.addChart(pres.charts.BAR, [{ name: "Reviews", labels: th.map((t) => t[0]), values: th.map((t) => t[1]) }],
  chartCommon({ x: LM, y: 1.5, w: 6.0, h: 3.5, barDir: "bar", catAxisOrientation: "maxMin", showValue: true, dataLabelPosition: "outEnd", chartColors: [HEX.orange, HEX.blue, HEX.blue, HEX.grey, HEX.blue, HEX.blue, HEX.blue, HEX.blue], valAxisMinVal: 0, valAxisMaxVal: 9, barGapWidthPct: 40, catAxisLabelFontSize: 12, dataLabelFontSize: 12 }));
s.addText([
  { text: "Read this as direction, not percentages.", options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: "10 Play and 15 App Store reviews, mostly Jul to Oct 2026, tagged by hand.", options: { fontSize: 14, color: C.accent3, breakLine: true, paraSpaceAfter: 10 } },
  { text: "No Show leads.", options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: "Reliability (crashes, login, OTP) is next at 6, tied with ops complaints.", options: { fontSize: 14, color: C.accent3 } },
], { x: 6.7, y: 1.5, w: 2.8, h: 3.5, margin: 0, valign: "top", isTextBox: true, objectName: "Theme notes" });
source(s, "Source: data/review_sample.csv in the repo (Play reviews via AppBrain and listing snippets; App Store via mwm.ai, appshunter)");
s.addNotes("Distinct reviews per theme: No Show 7 (A03, A07, A09, I04, I08, I09, I10); reliability or login 6; ops 6; booking 4; tracking 3.");

// ---------- 6. Root causes ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Diagnosis" });
title(s, "Four root causes, in users' words");
const cards = [
  ["Rules feel punitive", "Missed check-in becomes a surprise No Show. Users ask to declare it themselves, get a reminder, and see the rule before they cancel."],
  ["Reliability around updates", "OTP never arrives. Launch crash after an iOS update. Crash every few weeks."],
  ["Booking got less clear", "Shuttle booking became two steps. A 'not booked' push arrives after booking. Pickup cannot be edited. Users see every cab, not their own."],
  ["Service failures hit the app", "Last drop-off every day, rain delays, crowded cabs, ignored complaints. With no in-app route, the store is the complaint box."],
];
cards.forEach((cd, i) => {
  const x = LM + (i % 2) * 4.55, y = 1.3 + Math.floor(i / 2) * 1.95;
  s.addShape(pres.ShapeType.rect, { x, y, w: 4.45, h: 1.8, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: `Card ${i + 1}` });
  s.addText([{ text: cd[0], options: { bold: true, fontSize: 18, color: C.accent1, breakLine: true } }, { text: cd[1], options: { fontSize: 14, color: C.text1 } }], { x: x + 0.2, y: y + 0.12, w: 4.05, h: 1.56, margin: 0, valign: "top", isTextBox: true, objectName: `Card text ${i + 1}` });
});
source(s, "Evidence: review sample; MoveInSync Help Center driver-app notes 6.4.0 and 6.5.0 (premature No Show tags; OTP hidden by seat-belt step)");

// ---------- 7. Plan ----------
pres.addSection({ title: "Plan" });
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Plan" });
title(s, "Do first, then redesign");
const cols = [
  ["This week", C.accent1, ["Reply to every 1 and 2-star review within 48 hours", "Staged rollouts that halt on crash or 1-star spikes", "Fix OTP delivery: autofill, timer, email fallback", "Check the ads and microphone claims"]],
  ["Next 30 days", C.accent2, ["No Show redesign: self-declare, persistent boarding confirm", "OTP never hidden by seat-belt step", "Clear booked state, editable pickup, only my trip", "Cache next trip for offline"]],
  ["Next 90 days", C.accent3, ["In-app issue report routed to the transport desk, with SLA", "Rating prompt after a good trip", "Join review themes to trip data by client site"]],
];
cols.forEach((cl, i) => {
  const x = LM + i * 3.07;
  s.addShape(pres.ShapeType.rect, { x, y: 1.25, w: 2.86, h: 0.5, fill: { color: cl[1] }, line: { color: cl[1] }, objectName: `Head ${i + 1}` });
  s.addText(cl[0], { x, y: 1.25, w: 2.86, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `Head text ${i + 1}` });
  s.addShape(pres.ShapeType.rect, { x, y: 1.75, w: 2.86, h: 3.3, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: `Body ${i + 1}` });
  s.addText(cl[2].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < cl[2].length - 1, paraSpaceAfter: 6 } })), { x: x + 0.15, y: 1.9, w: 2.56, h: 3.0, fontSize: 14, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: `List ${i + 1}` });
});
source(s, "Ticket-ready specs with owners and metrics: RECOMMENDATION.md in the repo");
s.addNotes("Reply desk: Play caps developer replies at 350 characters. Google's Play Console documentation says replying to a negative review can lift that rating by 0.7 on average (as quoted by Appbot). Rating prompt: use Google's In-App Review API after a completed trip, and do not ask an opinion question first (check current Play guidance).");

// ---------- 8. Value ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Plan" });
title(s, "What the fix is worth", "Lifetime average if the 1-star group shrinks");
s.addChart(pres.charts.BAR, [{ name: "Average", labels: ["Today", "Halve 1★, they give 4★", "Halve 1★, they give 5★", "All 1★ give 4★"], values: [4.31, 4.50, 4.56, 4.68] }],
  chartCommon({ x: LM, y: 1.5, w: 5.2, h: 3.5, barDir: "col", showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", chartColors: [HEX.grey, HEX.blue, HEX.blue, HEX.blue], valAxisMinVal: 4.0, valAxisMaxVal: 4.8, barGapWidthPct: 45, catAxisLabelFontSize: 12 }));
s.addText([
  { text: "Targets", options: { bold: true, fontSize: 18, color: C.text1, breakLine: true } },
  { text: "1-star share from 12.3% to 6% or less within two quarters", options: { bullet: true, fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Rolling 30-day average at 4.5 or higher", options: { bullet: true, fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Reply coverage on 1 and 2 stars at 90% or higher", options: { bullet: true, fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Google said in 2019 it would weight recent ratings more, so the shown score can move faster than lifetime maths. Confirm in Play Console.", options: { fontSize: 14, color: C.accent3 } },
], { x: 5.95, y: 1.5, w: 3.55, h: 3.5, margin: 0, valign: "top", isTextBox: true, objectName: "Targets" });
source(s, "Calculation: tracker/analyze_sample.py on the AppBrain histogram. Scenarios are arithmetic, not forecasts");

// ---------- 9. Tracking ----------
s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Plan" });
title(s, "Answering 'how are our ratings?' every week");
const flow = [["Play reviews", "last 60 days, newest first"], ["Tracker script", "themes, versions, replies"], ["Monday report", "Markdown in the repo"]];
flow.forEach((f, i) => {
  const x = LM + i * 3.07;
  s.addShape(pres.ShapeType.rect, { x, y: 1.3, w: 2.66, h: 1.1, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: `Flow ${i + 1}` });
  s.addText([{ text: f[0], options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } }, { text: f[1], options: { fontSize: 14, color: C.accent3 } }], { x: x + 0.15, y: 1.35, w: 2.36, h: 1.0, margin: 0, valign: "middle", isTextBox: true, objectName: `Flow text ${i + 1}` });
  if (i < 2) s.addText("→", { x: x + 2.66, y: 1.55, w: 0.41, h: 0.6, fontSize: 24, bold: true, color: C.accent1, align: "center", margin: 0, isTextBox: true, objectName: `Arrow ${i + 1}` });
});
s.addText("Weekly scorecard", { x: LM, y: 2.7, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "Scorecard head" });
s.addText(["Store rating and 1-star share, 30 days vs prior 30", "Top 1 and 2-star themes, plus an 'unclassified' bucket", "Rating by app version, to catch a bad release", "Reply coverage and time"].map((t, k, a) => ({ text: t, options: { bullet: true, breakLine: k < a.length - 1, paraSpaceAfter: 5 } })),
  { x: LM, y: 3.15, w: 4.3, h: 1.9, fontSize: 14, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "Scorecard list" });
s.addText("Leading indicators from Product", { x: 5.2, y: 2.7, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: "Leading head" });
s.addText(["OTP delivery success rate", "Crash-free users by version", "No Show disputes per 1,000 trips", "Complaint tickets closed within SLA"].map((t, k, a) => ({ text: t, options: { bullet: true, breakLine: k < a.length - 1, paraSpaceAfter: 5 } })),
  { x: 5.2, y: 3.15, w: 4.3, h: 1.9, fontSize: 14, color: C.text1, margin: 0, valign: "top", isTextBox: true, objectName: "Leading list" });
source(s, "Tool: tracker/play_rating_tracker.py with .github/workflows/weekly-rating-report.yml (runs Mondays 09:00 IST)");
s.addNotes("The tracker's live mode could not be run from the build sandbox because it has no route to Google Play. Its report generator was tested on synthetic data only.");

// ---------- 10. Limits ----------
pres.addSection({ title: "Close" });
s = pres.addSlide({ masterName: "DARK", sectionTitle: "Close" });
s.addText("Assumptions and limits", { x: 0.7, y: 0.5, w: 8.6, h: 0.7, fontSize: 32, bold: true, color: C.background1, fontFace: "Cambria", margin: 0, isTextBox: true, objectName: "Title" });
s.addText([
  "Google Play disallows automated access, so I used AppBrain, mwm.ai, appshunter and Play listing snippets, not a scrape.",
  "Theme counts rest on 25 negative reviews. They show direction, not exact shares.",
  "The star histogram is rounded by AppBrain.",
  "iOS reviews are included on the assumption that flows and bugs are shared with Android.",
  "I had no Play Console, crash or trip data. Service-failure share is likely understated.",
].map((t, k, a) => ({ text: t, options: { bullet: true, breakLine: k < a.length - 1, paraSpaceAfter: 8 } })), { x: 0.7, y: 1.4, w: 8.6, h: 2.6, fontSize: 16, color: C.background1, margin: 0, valign: "top", isTextBox: true, objectName: "Limits" });
s.addText("Next step: one hour with Play Console access to swap the sample for the full review export and run the tracker on it.", { x: 0.7, y: 4.3, w: 8.6, h: 0.7, fontSize: 18, bold: true, color: C.accent5, margin: 0, valign: "top", isTextBox: true, objectName: "Next step" });

(async () => {
  await pres.writeFile({ fileName: "/tmp/work/moveinsync/MoveInSync_Play_Store_Rating_Recommendation.pptx" });
  await applyTheme("/tmp/work/moveinsync/MoveInSync_Play_Store_Rating_Recommendation.pptx", THEME);
  console.log("deck written");
})();

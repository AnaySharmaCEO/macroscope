# MacroScope — Visual Audit & Fix Map

> Read alongside `instructions.md` and `tokens.css`.
> Every issue below maps to an exact token fix. No guessing.
> Screens marked ⚠️ NO SS have no screenshot — apply global fixes + `instructions.md` rules anyway.

---

## GLOBAL — fix these first, they affect every screen

### G1. Wrong accent color everywhere
Cyan/teal is used as the brand accent on buttons, active segments, streaks, the Goals ring, link text.
**Fix:** Replace all cyan/teal with `var(--accent)` (`#C9A66B` dark / `#8A5F2C` light).

### G2. All primary buttons are blue
"Log Sleep", "Log Workout", "Add Meal", "Save Changes", "Update Steps" — all blue.
**Fix:** `background: var(--btn-primary-bg); color: var(--btn-primary-text); border-radius: var(--btn-primary-radius);`

### G3. ALL-CAPS labels on virtually every section header and input label
Every label in the app is uppercase. This is the single most widespread problem.
**Fix:** Sentence case everywhere. `font-size: var(--text-caption); color: var(--text-3); font-weight: var(--weight-semibold);` Remove all `text-transform: uppercase` and `letter-spacing` from labels.

### G4. Top bar is wrong
Shows fire emoji + "0" count + "Alerts" text button. Not the design.
**Fix:** Top bar right side = bell icon button (with `--live` dot if alerts exist) + theme toggle only. Remove fire emoji and "Alerts" text from top bar.

### G5. App name duplicated in both top bar and sidebar
"MacroScope" appears in the top-left of the top bar AND in the sidebar header.
**Fix:** Remove from top bar. Sidebar only.

### G6. Active nav item style off
Full-width dark fill, no border distinction.
**Fix:** `background: var(--nav-item-active-bg); color: var(--nav-item-active-text); border: 1px solid var(--nav-item-active-border); border-radius: var(--nav-item-radius);` — inset from edges, not full-width.

### G7. Page `<h1>` inconsistent font
Some use Inter bold, some don't — none consistently use Fraunces.
**Fix:** All page titles → `font-family: var(--font-display); font-size: var(--text-display-md); font-weight: var(--weight-medium);` Subtitle → `var(--font-body); var(--text-body-sm); color: var(--text-2);`

---

## HOME PAGE

**H1. Gauge colors and labels**
Needle is orange, "DAILY SCORE" ALL-CAPS, "STARTING" label meaningless.
Fix: Needle → `var(--accent)`. Score number → Fraunces `var(--text-display-lg)`. Label → "Daily score" sentence case `var(--text-3)`. Replace "STARTING" with actual status text e.g. "Building momentum".

**H2. Streak top-right is cyan + ALL-CAPS "STREAK"**
Fix: Replace with a pill chip using `var(--accent-soft)` bg, `var(--accent)` text, "2-day streak" sentence case. Remove ALL-CAPS "STREAK" label.

**H3. "TODAY'S ACTION" card**
Pulsing animation, cyan signal text, ALL-CAPS eyebrow.
Fix: Remove pulse. Signal text → `var(--text-2)`, not cyan. Eyebrow → "Today's action", `var(--text-3)`. Card → `var(--card-bg); var(--card-border); var(--card-radius);`

**H4. System snapshot cards (Sleep/Nutrition/Activity)**
`bg-white/5` backgrounds, ALL-CAPS labels, hardcoded green/orange/red colors.
Fix: `var(--surface-2); var(--border); var(--card-radius);` Labels sentence case `var(--text-3)`. Status text → `var(--good)` / `var(--warn)` / `var(--danger)`. Progress bars → `var(--progress-fill-good/warn/danger)` on `var(--progress-track)`.

**H5. "ADDITIONAL SIGNALS" rows**
`bg-white/5` unstyled rows, ALL-CAPS label.
Fix: Each signal → `var(--surface-2); var(--border); var(--signal-radius);` Text → `var(--text-2); var(--text-body);` Label → "Additional signals" sentence case.

---

## SLEEP PAGE

**S1. "AVG DURATION (7D)" ALL-CAPS**
Fix: "Avg duration, last 7 days" — `var(--text-3); var(--text-caption);` Number → Fraunces `var(--text-display-lg)`.

**S2. "● STABLE" ALL-CAPS raw dot**
Fix: Pill chip — `var(--good-soft)` bg, `var(--good)` text, "Stable" sentence case.

**S3. Form card labels and controls**
"SLEEP CHECK-IN", "BEDTIME", "WAKE TIME" ALL-CAPS. Quality buttons use `bg-white text-black` when active.
Fix: All labels sentence case `var(--text-3)`. Inputs → `var(--input-bg); var(--input-border); var(--input-radius);` Active quality button → `var(--accent); var(--accent-ink);` `var(--radius-sm)`.

**S4. "SLEEP INSIGHTS" + cyan sub-label**
Fix: "Sleep insights" sentence case `var(--text-3)`. Drop cyan "Based on your recent logs" or make it `var(--text-3) var(--text-body-sm)`.

**S5. Metric cards use `bg-white/5`**
Fix: `var(--surface-2); var(--border); var(--card-radius);` Numbers → `var(--text); var(--weight-semibold);` Labels → `var(--text-3); var(--text-caption);`

---

## NUTRITION PAGE

**N1. "CALORIES" hero section**
ALL-CAPS label, cyan progress bar, "MACROS" ALL-CAPS with colored underlines on macro labels.
Fix: "Calories today" sentence case. Progress → `var(--progress-fill-danger)` on `var(--progress-track)`. "Macros" sentence case. Remove colored underlines from labels. Values right-aligned `var(--text); var(--weight-medium);`

**N2. "● LOW" status**
Fix: Pill chip → `var(--danger-soft)` bg, `var(--danger)` text, "Low" sentence case.

**N3. Primary signal has no container**
Fix: Signal block → `var(--danger-soft)` bg, 1px border `var(--danger)` at 30% opacity, `var(--signal-radius); var(--signal-padding);`

**N4. "DAILY INSIGHTS" — raw percentage cards look broken**
Fix: "Daily insights" sentence case. Small data cells → `var(--surface-2); var(--border); var(--radius-sm); var(--space-3)` padding. Remove "(RDA)" parentheses from label text.

**N5. "SUGGESTED FOODS" — raw score numbers**
Fix: "Suggested foods" sentence case. Remove raw "score 1158.39" — replace with a macro summary or "Recommended" chip. Row hover → `var(--table-row-hover)`.

**N6. "Add Meal" teal banner**
Fix: Primary button only. `var(--btn-primary-bg);` "Log a meal" text. No subtitle inside button.

**N7. "TODAY'S MEALS" grid — middle-dot pattern, ALL-CAPS**
Fix: "Today's meals" sentence case. Remove middle dots ("1 meal • ~65.31 kcal" → two lines). Cards → `var(--surface-2); var(--border); var(--card-radius);`

---

## LOG MEAL PAGE

**LM1. All labels ALL-CAPS**
Fix: All sentence case, `var(--text-3); var(--text-caption);`

**LM2. Meal Type segmented control — cyan active**
Fix: Active → `var(--accent); var(--accent-ink);` Container → `var(--surface-2); var(--border); var(--radius-sm);`

**LM3. "Add Meal" button blue**
Fix: `var(--btn-primary-bg);`

---

## ACTIVITY PAGE

**A1. ALL-CAPS labels everywhere**
"STEPS", "TODAY'S ACTIVITY", "WEEKLY INSIGHT", "AVG STEPS", "WORKOUT DAYS", "LOG WORKOUT", "WORKOUT NAME", "DURATION", "INTENSITY", "UPDATE STEPS", "SECONDARY METRICS"
Fix: All sentence case `var(--text-3); var(--text-caption);`

**A2. Hero progress bar hardcoded green**
Fix: `var(--progress-fill-good)` on `var(--progress-track); var(--progress-height); var(--progress-radius);`

**A3. "● IMBALANCED" ALL-CAPS**
Fix: Pill chip → `var(--warn-soft)` bg, `var(--warn)` text, "Imbalanced".

**A4. "unlock" is cyan in body copy**
Fix: `var(--text-2)` for the whole sentence. If intentionally a link → `var(--accent)` with underline. No cyan.

**A5. Two primary buttons: "Log Workout" + "Update Steps"**
Fix: "Log workout" = primary. "Update steps" = ghost (`var(--btn-ghost-border); var(--btn-ghost-text);`).

**A6. Intensity segmented control — blue active**
Fix: `var(--accent); var(--accent-ink);`

---

## INSIGHTS PAGE

**I1. ALL-CAPS: "WEEKLY INSIGHT", "SLEEP", "ACTIVITY", "NUTRITION", "WEIGHT"**
Fix: All sentence case.

**I2. Score numbers use hardcoded orange/green/red**
Fix: `var(--warn)` for mid, `var(--good)` for high, `var(--danger)` for low.

**I3. "Fix: nutrition → nutrition panel" cyan text with arrow**
Two anti-patterns: arrow suffix + cyan color.
Fix: "Go to Nutrition" — `var(--accent)` color, no arrow, no "Fix:" prefix.

**I4. Section cards mostly empty, wrong styling**
Fix: `var(--card-bg); var(--card-border); var(--card-radius); var(--card-padding-sm);` Add a one-line interpretation below each metric. If card is genuinely empty, add an empty state (see `instructions.md` §6.12).

---

## ALERTS PANEL

**AL1. Rendering bug — card appears twice (ghost duplicate)**
Fix: Check `AlertsPanel.tsx` for duplicate render or wrong absolute positioning. This is a code bug.

**AL2. "ACTIVE ALERTS (1)" ALL-CAPS**
Fix: "Active alerts" + count as a pill badge. `var(--text-3); var(--text-caption);`

**AL3. "NUTRITION" chip ALL-CAPS, hardcoded orange dot**
Fix: Pill chip → `var(--warn-soft)` bg, `var(--warn)` text, "Nutrition" sentence case.

**AL4. "RECOMMENDED ACTION" ALL-CAPS + cyan action text**
Fix: "Recommended action" sentence case `var(--text-3)`. Action text → `var(--text-2)`.

**AL5. Dismiss button has no focus ring**
Fix: `:focus-visible { box-shadow: var(--focus-ring); }`

---

## GOALS PANEL

**G1. 30-day grid uses bright saturated green + cyan "Today" cell**
Fix: Success → `var(--good-soft)` bg, `var(--good)` checkmark. Missed → `var(--surface-2)`. Today → `var(--accent-soft)` bg, `var(--accent)` border. Cells → `var(--radius-sm)`.

**G2. Streak: fire emoji + raw number, no styling**
Fix: Number → Fraunces `var(--text-display-lg); var(--text);` Caption → `var(--text-body-sm); var(--text-3);` "Day streak" — no ALL-CAPS.

**G3. ALL-CAPS labels throughout**
Fix: All sentence case.

**G4. Status row: full-card green fill for completed systems**
Fix: `var(--good-soft)` bg only. Don't fill the whole card. Use a checkmark icon in `var(--good)`. Pending → neutral `var(--surface-2)`.

---

## SETTINGS — MAIN PAGE

**ST1. Each setting category is its own large rounded card**
Fix: One card container (`var(--card-bg); var(--card-border); var(--card-radius);`) with `var(--settings-row-border)` bottom border on each row. "Danger Zone" → `var(--danger)` text on the row label only.

---

## SETTINGS — ACCOUNT PAGE

**SA1. "NAME" ALL-CAPS + nested cards with same radius**
Fix: "Name" sentence case. Outer → `var(--card-radius)`, inner → `var(--radius-sm)` or flat layout.

**SA2. "Log out" styled as a card but acts as a button**
Fix: Ghost button with danger border: `border: 1px solid var(--btn-danger-bg); color: var(--btn-danger-bg); var(--btn-ghost-radius);`

**SA3. "Save Changes" blue**
Fix: `var(--btn-primary-bg);`

---

## SETTINGS — PERSONALIZATION PAGE

**SP1. ALL-CAPS labels throughout**
Fix: All sentence case.

**SP2. Active segment (Goal Type) cyan**
Fix: `var(--accent); var(--accent-ink);`

**SP3. Duration shows "10000 weeks" — data bug**
Fix: Cap at reasonable max (e.g., 104 weeks). This is a logic bug.

**SP4. Stepper (–/+) buttons unstyled**
Fix: `var(--surface-2); var(--border); var(--radius-sm);` Min 36×36px. Focus ring required.

**SP5. "Save Changes" blue**
Fix: `var(--btn-primary-bg);`

---

## SETTINGS — PREFERENCES PAGE

**SPR1. ALL-CAPS labels, giant segmented controls with cyan active**
Fix: Labels sentence case. Controls → max height 40px, `var(--surface-2); var(--border); var(--radius-sm);` Active → `var(--accent); var(--accent-ink);` Max-width ~500px, not full-page-width.

**SPR2. "Save Changes" blue**
Fix: `var(--btn-primary-bg);`

---

## ⚠️ SCREENS WITH NO SCREENSHOT — do not skip

Apply global fixes G1–G7 + `instructions.md` component rules to each:

- **Profile Page** (`ProfilePage.tsx`) — same rules as Account settings.
- **Auth/Login** (`AuthFlow.tsx`) — inputs use token system; submit button = `var(--btn-primary-bg)`. No ALL-CAPS labels.
- **Onboarding** (`OnboardingFlow.tsx`) — step indicators: current = `var(--accent)`, done = `var(--good)`, future = `var(--surface-2)`. No 01/02/03 numbered markers.
- **Settings → Data & Privacy** — settings row pattern. Destructive action button → `var(--btn-danger-bg)` at bottom.
- **Sleep/Nutrition/Weekly/Weight Insight screens** — `var(--card-bg); var(--card-border); var(--card-radius);` No ALL-CAPS. Charts use `--chart-1` through `--chart-6` in sequence. Axis labels sentence case `var(--chart-axis-label)`.
- **Meal Type Extended panel** — input + segmented control tokens.

---

## EXECUTION ORDER

1. Confirm `tokens.css` imported globally. `data-theme="dark"` on `<html>` by default.
2. Global G1–G7 — accent color, button color, ALL-CAPS, top bar, nav.
3. Home (H1–H5).
4. Sleep (S1–S5).
5. Nutrition (N1–N7) + Log Meal (LM1–LM3).
6. Activity (A1–A6).
7. Insights (I1–I4).
8. Alerts panel (AL1–AL5) — fix the rendering bug AL1 first.
9. Goals panel (G1–G4).
10. All Settings pages (ST1, SA1–SA3, SP1–SP5, SPR1–SPR2).
11. Screens without screenshots — don't skip.

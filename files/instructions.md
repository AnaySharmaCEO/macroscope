# MacroScope — Agent Design Instructions  v3

> **Read this entire document before touching any UI code.**
> If a decision isn't covered here, re-read the North Star and Anti-patterns
> first. When still unsure: do less, reuse more.

---

## 1. North Star (memorize this before anything else)

MacroScope is a **personal performance OS** — not enterprise SaaS, not a
generated demo. The feeling is **sleek but alive: engineered, not generated,
built to make someone come back tomorrow.**

Sleekness lives in structure — hairline-bordered cards, restrained serif
numerals, quiet whitespace, nothing decorative without a reason.

Liveliness lives in *specific, deliberate moments only*: a pill-shaped status
chip, a streak badge, one hero number per screen, the ring filling in on load.
Never scattered across every element.

**Test:** If a screen feels loud everywhere — too much animation, too many
colors, too many calls to action — it's wrong.
If it feels flat everywhere — identical card styles, no hierarchy, no alive
moment — it's also wrong. Find the one moment of life per screen and protect it.

---

## 2. Token law — non-negotiable

```
Every color, radius, spacing value, font-size, shadow, and z-index
in every component MUST reference a var(--token) from tokens.css.

Never hardcode a hex value, raw px radius, or inline shadow —
not even "just this once" for a quick fix.
```

- Import `tokens.css` once, globally, before anything else.
- If the token you need does not exist, **add it to `tokens.css` in the
  correct section first**, then consume it. Do not let one-off values
  accumulate in component files.
- Dark and light mode differ **only** by `[data-theme]` resolving different
  token values. Same component tree, same shapes, same font choices —
  only the color values change. Toggling the theme must never feel like a
  different app.

---

## 3. The shape law — the two-tier system

There are exactly **three radius values** in the entire app. No exceptions.

| Radius | Value | When to use |
|---|---|---|
| `--radius-pill` | `999px` | **Alive / status / actionable** — chips, tags, streak badges, notification dot, theme toggle |
| `--radius-card` | `16px` | **Structural containers** — cards, modals, panels, drawers, popovers, tooltips |
| `--radius-sm`   | `8px`  | **Small interactive controls** — buttons, inputs, nav items, segmented controls |

**The test:** Ask — *"Is this element telling the user what's happening right
now?"* → pill. *"Is it holding their data?"* → card. *"Is it a small control
for taking an action?"* → sm.

Never use pill on a card. Never square off a chip. Never invent a fourth radius.
This contrast is the single most important visual signal in the app.

---

## 4. Typography rules

### Font assignment
- `--font-display` (Fraunces serif): page `<h1>`, card/section `<h2>`/`<h3>`,
  hero score number, streak number. **Nowhere else.**
- `--font-body` (Inter): everything else without exception — buttons, nav
  labels, body copy, table cells, form labels, chips, tooltips, captions.

### Size and weight assignment

| Element | Size token | Weight | Font |
|---|---|---|---|
| Page title `<h1>` | `--text-display-md` | medium | Fraunces |
| Card/section title `<h2>` | `--text-display-sm` | medium | Fraunces |
| Hero number (score, streak) | `--text-display-lg` | medium | Fraunces |
| Body / signal text | `--text-body-lg` | regular | Inter |
| Default UI (buttons, nav, cells) | `--text-body` | medium (btn) / regular (body) | Inter |
| Secondary / support copy | `--text-body-sm` | regular | Inter |
| Chips, timestamps, axis labels | `--text-caption` | semibold (chips) / regular (rest) | Inter |

### Case and tracking
- **Sentence case everywhere.** No ALL-CAPS labels — not for eyebrows, not for
  section headers, not for table column headers. This is a recurring problem
  in the existing codebase. Catch and fix it on sight.
- No tracked-out letter-spacing on labels. Hierarchy comes from size, weight,
  and color — not spacing tricks.
- No `monospace` font on data labels or numbers "for a technical look."

---

## 5. Color usage rules

### Status colors
Each status has a **solid** and a **soft** variant:
- Solid (`--good`, `--warn`, `--live`, `--danger`, `--info`) — text on a
  neutral background, or fill color in a ring/progress bar.
- Soft (`--good-soft`, etc.) — tinted background behind a chip or signal block.

**Color is never the only signal.** Pair every colored status element with a
text label ("Good", "Low", "Strong", "At risk"). Screen readers and users in
reduced-color environments depend on this.

### Text hierarchy
- `--text` → primary: headings, hero numbers, active state labels
- `--text-2` → secondary: descriptions, inactive nav, table body
- `--text-3` → tertiary: timestamps, placeholders, axis labels, captions

### Accent
- `--accent` fills primary buttons and the score ring.
- `--accent-soft` backgrounds accent-colored chips or highlight blocks.
- Don't use accent color on more than one focal element per screen.

---

## 6. Component-by-component guidance

### 6.1 Sidebar / Navigation

**Structure:**
- Fixed left column, `var(--nav-bg)` background, `var(--nav-border)`
  right border.
- Brand name in Fraunces (`--nav-brand-font`), `--text-display-sm` size.
- Subline ("Performance OS") in Inter, `--text-caption`, `--text-3` color.

**Nav items:**
- `--radius-sm` border-radius — they are controls, not containers.
- Active: `--nav-item-active-bg`, `--nav-item-active-text`, hairline border
  `--nav-item-active-border`. Not a filled accent — just a subtle surface lift.
- Inactive: `--nav-item-text`, hover shows `--surface-2` bg.
- Icon: 17px, `opacity: 0.85` inactive, `1.0` active.
- Label: `--text-body`, `--weight-medium`.
- No ALL-CAPS labels. No tracking.
- Focus ring on every link: `--focus-ring`.

**Don't:**
- Don't put a streak pill or count badge in the nav — it belongs in the hero.
- Don't use `--radius-card` on nav items.

---

### 6.2 Top Bar

**Minimal.** Right-aligned only. Contains:
- Notification bell icon button (with optional notification dot `--live`).
- Theme toggle button.

Both use `--btn-icon-radius` (pill), `--btn-icon-bg`, `--btn-icon-border`.

**Don't:**
- Don't add a streak number here — it's already in the hero card.
- Don't add page title or breadcrumbs here — the page `<h1>` handles that.
- Don't add a search bar here unless it's truly global and used on every screen.

---

### 6.3 Cards / Panels

**Two variants:**

**Hero card** (main content area, left column):
- `--card-bg`, `--card-border`, `--card-radius`, `--card-shadow`.
- Padding: `--card-padding` (32px).
- Contains the score ring or primary metric at top, then a section divider
  (`--border`), then the focus block.

**Snap / teaser card** (side column, secondary content):
- Same tokens as hero card but smaller padding: `--card-padding-sm` (24px).
- Used for streak, system snapshot items, quick-links.

**Rules:**
- Cards hold data — use `--radius-card` (16px). Never pill.
- Nested surface inside a card uses `--surface-2`, not `--surface` again.
- One card per "information zone" — don't split one logical block across
  two adjacent cards unless there's a genuine structural reason.
- Cards do not animate on hover (no lift, no scale). They are structural.
  Interactive *elements within* a card may have hover states.

---

### 6.4 Hero Number + Score Ring

The score ring is the **one deliberate alive moment** on the Control Center
screen. Treat it accordingly:
- SVG ring: track = `--ring-track`, fill = `--ring-fill` (or status variant).
- Fill animates in on mount: stroke-dashoffset transition, `--ring-animation`
  duration (`--duration-slow`, 400ms).
- Number inside ring: Fraunces, `--text-display-lg`, `--weight-medium`.
- Color the ring based on score range using `--ring-fill-good/warn/danger`.
- One ring per screen. Don't put a ring on every metric card.

---

### 6.5 Chips / Status Tags

Chips are the **alive** elements. They must always use `--radius-pill`.

```
Good chip:    bg = var(--good-soft),    color = var(--good)
Warn chip:    bg = var(--warn-soft),    color = var(--warn)
Live chip:    bg = var(--live-soft),    color = var(--live)
Danger chip:  bg = var(--danger-soft),  color = var(--danger)
Info chip:    bg = var(--info-soft),    color = var(--info)
Accent chip:  bg = var(--accent-soft),  color = var(--accent)
```

- Size: `--chip-font-size` (`--text-caption`, 11.5px), `--chip-weight` (bold).
- Padding: `--chip-padding` (5px 11px).
- Always include a text label inside — color alone is not sufficient.
- Chips do NOT get hover effects unless they are interactive (clickable filter
  chips). Static status chips are read-only; no pointer cursor.

---

### 6.6 Buttons

**Primary:**
```
bg:     var(--btn-primary-bg)
color:  var(--btn-primary-text)
radius: var(--btn-primary-radius)  ← --radius-sm, NOT pill
size:   var(--btn-primary-size)
weight: var(--btn-primary-weight)  ← bold
padding: var(--btn-primary-padding)
hover:  filter: brightness(1.08)  ← subtle, not scale
```

**Ghost:**
```
border: 1px solid var(--btn-ghost-border)
color:  var(--btn-ghost-text)
radius: var(--btn-ghost-radius)
hover:  bg = var(--btn-ghost-bg-hover), color = var(--btn-ghost-text-hover)
```

**Danger:**
- Same structure as primary, using `--btn-danger-bg`.
- Use only for destructive actions (delete, clear all). Never for emphasis.

**Rules:**
- Max one primary button per section. Ghost for secondary actions.
- Button text: sentence case. No arrows (`→`). No ellipsis. No ALL-CAPS.
- Don't use `--radius-pill` on buttons — they are controls, not status chips.
- Focus ring required: `:focus-visible { box-shadow: var(--focus-ring); }`.
- Disabled state: `opacity: 0.45`, `cursor: not-allowed` — no color change.

---

### 6.7 Inputs / Forms

```
bg:          var(--input-bg)
border:      1px solid var(--input-border)
radius:      var(--input-radius)       ← --radius-sm
color:       var(--input-text)
placeholder: var(--input-placeholder)
font-size:   var(--input-font-size)
padding:     var(--input-padding)
focus:       border-color = var(--input-border-focus) [--accent]
             box-shadow = var(--focus-ring)
```

**Labels:**
- Inter, `--text-body-sm`, `--text-2` color, sentence case.
- No emoji in labels unless the emoji carries genuine meaning (sleep check-in
  moon/sun icons are fine — they're navigation cues, not decoration).

**Quality selectors / segmented controls:**
- Use `--radius-sm` on the container.
- Active segment: `--accent` background or `--text` color + `--surface-2` bg.
- Never use pill radius on a segmented control.

**Textarea:**
- Same tokens as input. Min-height: 80px. Resize: vertical only.

**Time inputs:**
- Use native `<input type="time">` styled with input tokens — don't build a
  custom clock unless the AnalogTimePicker component already exists.

---

### 6.8 Modals / Drawers

```
backdrop:  var(--modal-backdrop), z-index: var(--z-modal-backdrop)
container: var(--modal-bg), var(--modal-radius), var(--modal-shadow)
           z-index: var(--z-modal)
max-width: var(--modal-max-width) [560px]
padding:   var(--modal-padding) [32px]
header:    border-bottom: 1px solid var(--modal-header-border) [--border-strong]
```

**Structure:**
- Header: title (Fraunces, `--text-display-sm`) + optional close icon button.
- Body: content with `--modal-padding`.
- Footer (optional): action buttons, right-aligned, with `--border-strong`
  top separator.

**Motion:**
- Backdrop: fade in `--duration-base`.
- Container: fade + translate-y 8px → 0, `--duration-base`, `--ease`.
- On close: reverse, `--duration-fast`.
- `@media (prefers-reduced-motion)`: skip translate, keep fade.

**Don't:**
- Don't open a modal when a panel slide-in would do.
- Don't put more than two primary actions in a modal footer.
- Don't use `--surface` for modal bg — use `--modal-bg` (`--surface-modal`).

---

### 6.9 Tables

```
header row: --table-header-text, --table-header-size, --table-header-weight
            sentence case (never ALL-CAPS)
body cell:  --table-cell-text, --table-cell-size
primary cell (name/title): --table-cell-primary, --weight-medium
row border: border-bottom: 1px solid var(--table-row-border)
row hover:  background: var(--table-row-hover)
```

- No background on the table itself — it sits inside a card.
- No alternating row striping — let the subtle row border do the work.
- Sortable column: indicate with a small icon, not color change.
- Numeric columns: right-aligned, `--weight-medium`, tabular-nums.

---

### 6.10 Charts (Recharts / Victory / custom SVG)

**Colors:** Always use `--chart-1` through `--chart-6` in order for
multi-series. Never introduce an ad-hoc color.

```
gridlines:   stroke: var(--chart-grid), strokeWidth: 1
axis text:   fill: var(--chart-axis-label), font-size: var(--text-caption)
tooltip bg:  var(--chart-tooltip-bg)
tooltip border: var(--chart-tooltip-border)
tooltip text: var(--chart-tooltip-text)
tooltip label: var(--chart-tooltip-label)
tooltip radius: var(--chart-tooltip-radius)
```

**Chart-specific rules:**
- **Line charts:** stroke-width 2px, dots only on data points (not between).
  Active/hover dot: 5px radius, `--chart-1` fill.
- **Bar charts:** gap between bars ~30% of bar width. Rounded top corners
  only: `border-radius: 4px 4px 0 0`.
- **Area charts:** fill opacity 0.12–0.15. Don't make it opaque.
- **Donut / ring charts:** Use the SVG ring pattern from DailyScoreGauge.
  Track: `--ring-track`. Fill: status-appropriate ring token. Animate once
  on mount with `--ring-animation` duration.
- **Axis labels:** sentence case. Never ALL-CAPS. `--chart-axis-label` color.
- **No legend unless there are 2+ series.** Single-series charts need no legend.
- Chart has no title of its own if the card/section heading above it already
  names the metric — don't repeat it.
- Empty chart state: show the track/grid in muted state + empty state copy
  (see 6.12).

---

### 6.11 Progress Bars

```
track:  background: var(--progress-track), height: var(--progress-height)
        border-radius: var(--progress-radius) [pill]
fill:   transition: width var(--duration-slow) var(--ease) [animate on mount]
        border-radius: var(--progress-radius)
        color: var(--progress-fill-good/warn/danger/accent)
```

- Progress bars are structural data indicators — their *track* is pill-radius,
  but the containing card is still `--radius-card`.
- Always animate the fill width from 0 on mount. Respect reduced-motion.
- Don't show a numeric % label inside the bar — show it adjacent in text.

---

### 6.12 Empty States

An empty state is an **invitation to act**, not an apology.

Structure:
- Optional muted icon (24–32px, `--empty-icon-opacity`).
- Primary copy: what's missing, in plain language. `--text-body`, `--text-2`.
- Secondary copy: why it matters (optional). `--text-body-sm`, `--text-3`.
- One action button (primary or ghost). No more than one CTA.

Example pattern:
```
[icon]
No sleep logged yet
Log your first night to start tracking patterns.
[Log sleep]       ← primary button
```

**Don't:**
- "Nothing to show here" — says nothing.
- "Oops! No data found" — wrong voice.
- Two CTAs ("Log sleep" + "Learn more") — pick one.

---

### 6.13 Error States

```
Format: What happened + how to fix it, in the product's voice.
```

- Use `--danger` for the indicator, `--danger-soft` for the bg tint.
- Never: "Oops!", "Something went wrong", "Error 500".
- Do: "Sleep log failed to save — check your connection and try again."
- Pair the error message with a retry action where possible.
- Loading and error states use the same layout region as the content they
  replace — don't shift the page layout on error.

---

### 6.14 Loading / Skeleton States

- Use skeleton placeholders (not spinners) for content that has a known shape.
- Skeleton bars: `--skeleton-base` bg, subtle shimmer with `--skeleton-shine`,
  `--skeleton-radius`.
- Match skeleton shape to the content: card-height skeleton for a card,
  text-line skeleton for a label, circle for a ring.
- Spinners: only for indeterminate operations (file upload, save in progress).
  Use `--accent` color. 24px, centered.

---

### 6.15 Signals / Cross-system Alerts

Signals are system-driven, not user reflections. They appear as prominent text
blocks, not toasts.

```
container: var(--signal-radius), var(--signal-padding)
bg:        status-appropriate soft color (--live-soft, --good-soft, etc.)
border:    1px solid matching solid color at ~30% opacity
text:      var(--signal-text-size), var(--signal-text-leading)
icon:      16px, matching solid status color, aria-hidden
```

**Format rule (from ARCHITECTURE.md):**
`"[Condition] is affecting [System Outcome]"`

- Never prefix with a middle dot or ALL-CAPS eyebrow.
- One primary signal prominent, secondary signals compressed below a divider.
- Don't animate the icon (no pulsing ⚡) — it becomes noise.

---

### 6.16 Settings Rows

```
row:    border-bottom: 1px solid var(--settings-row-border)
        padding: var(--space-4) 0
label:  var(--settings-label-text), var(--settings-label-size), --weight-medium
sub:    var(--settings-sub-text), var(--settings-sub-size)
control: right-aligned (toggle, select, value)
```

- Group settings into labelled sections with a section heading (Inter,
  `--text-body-sm`, `--text-3`, sentence case — never ALL-CAPS).
- Don't put a border-radius on individual settings rows — they're list items
  inside a card container.
- Destructive settings (delete account, clear data) live in their own clearly
  separated section, with danger styling.

---

### 6.17 Toasts / Notifications

```
bg:     var(--toast-bg)
border: 1px solid var(--toast-border)
radius: var(--toast-radius)
shadow: var(--toast-shadow)
z:      var(--z-toast)
position: fixed, bottom-right, 16px margin
```

- Auto-dismiss after 4s. Provide a manual close button.
- Success: `--good` accent dot or icon. Error: `--danger`.
- One toast at a time on screen. Queue multiple if needed.
- Text: `--text-body`, sentence case, concise ("Sleep logged").

---

## 7. Screen-by-screen guidance

### Control Center (Home)

**Layout:** Two-column grid — hero card (left, 1.55fr) + side column (right, 1fr).

**Left column — hero card:**
- Score ring (top-left of card) + status text (top-right): "Today is [state]"
  in Fraunces `--text-display-sm`.
- Divider.
- Focus block: live chip (pill, `--live-soft`/`--live`) naming the focus area +
  action heading (Fraunces, `--text-display-sm`) + body copy (Inter,
  `--text-body-lg`, `--text-2`) + one primary button + one ghost button.
- The focus chip and heading must carry *different* information — not the same
  thing rephrased. If they overlap, cut the chip label.

**Right column (side):**
- Streak card: Fraunces number (`--text-display-lg`), "day streak" in
  `--text-body-sm`, accent bar or sparkline below.
- System snapshot: three snap-cards (Sleep, Nutrition, Activity), each with
  label, value, status chip, and progress bar. Not three identical rounded cards
  — differentiate by the status chip color and progress fill, not by layout.
- Optional: one teaser for the next priority system.

**Existing code issues to fix (ControlCenterPage.tsx):**
1. Remove hardcoded hex values: `#737373`, `#1c1c1e`, `#2a2a2d`, `#00D4FF`,
   `#e5e5e5`. Replace with appropriate token vars.
2. Remove ALL-CAPS section labels (`TODAY'S ACTION`, `SYSTEM SNAPSHOT`,
   `ADDITIONAL SIGNALS`) — use sentence case.
3. Remove pulsing animation on the ⚡ icon in the System Interaction block.
4. Remove box-shadow pulse loop animation on the action card — it's ambient
   decoration. Replace with a deliberate static design.
5. Remove fade-and-slide-up on every section — keep only the score ring fill
   animation as the one alive moment.
6. Remove `hover:scale-[1.01]` on the action card — cards don't lift.

---

### Sleep Page

**Layout:** Single column (max-width: 4xl / ~56rem), centered.

**Hero metric:** Avg duration (7D), Fraunces `--text-display-lg`, full-width,
no box around it.

**Log sleep form:**
- FormContainer card: `--card-bg`, `--card-border`, `--card-radius`.
- Bedtime / wake time: side-by-side grid, input tokens.
- Auto-calculated duration block: `--surface-2` bg, `--border` border,
  `--radius-sm`. Not `--radius-card` — it's a small inline indicator.
- Quality selector: 5-button row, `--radius-sm`, active = `--accent` bg /
  `--accent-ink` text. Not `bg-white text-black` (hardcoded).
- Textarea: standard input tokens. Placeholder: `--input-placeholder` color.
- Submit button: primary, full-width on mobile.

**Existing code issues to fix (SleepPage.tsx):**
1. Remove ALL-CAPS labels (`AVG DURATION (7D)`, `ADDITIONAL SIGNALS`,
   `Sleep Insights`). Use sentence case.
2. Remove hardcoded hex: `#737373`, `#dc2626`, `#10b981`, `#f59e0b`, `#ef4444`.
3. Active quality button uses hardcoded `bg-white text-black` — replace with
   accent tokens.
4. Auto-duration block uses `bg-white/5 border border-white/10` — replace with
   `--surface-2` and `--border` tokens (works in both themes).
5. Textarea uses `focus:ring-2 focus:ring-white/20` — replace with `--focus-ring`.
6. Remove `backdrop-blur-sm` on the metric cards — not needed, creates
   unnecessary GPU layer.

---

### Nutrition Page

**Layout:** Panel-based (left log list / right add-meal panel) or single column
with expandable panel — whatever PanelLayout implements.

**Daily summary row:** Calories, Protein, Carbs, Fat as horizontal chips or
a 4-column mini-grid. Values in `--weight-semibold`, labels in `--text-3`.

**Meal list:** Table or stacked list. Each meal row:
- Meal name: `--table-cell-primary`, `--weight-medium`.
- Time, type chip (pill, neutral bg), macros: `--table-cell-text`, `--text-3`.
- Remove action: icon button (trash), `--danger` color, always visible or on
  row hover.

**Add meal form (panel):**
- SearchableInput: input tokens + dropdown panel with `--surface-2`,
  `--border`, `--radius-card`, `--shadow-raised`.
- Quantity + unit: side-by-side, input tokens.
- Macro fields: 4-column grid, input tokens, inter-dependent (auto-update
  from food db selection).
- Submit: primary button.

**Existing code issues to fix (NutritionPage.tsx — from what's visible):**
- Any hardcoded colors, bg-white/5, border-white/10 → replace with tokens.
- Segmented control for meal type: verify `--radius-sm` on the container.
- Section labels: sentence case only.

---

### Activity Page

**Layout:** Single column, similar to Sleep.

**Hero metric:** Steps today or weekly average. Fraunces number.

**Log workout form:**
- Type selector (segmented control, `--radius-sm`).
- Duration, intensity inputs: input tokens.
- Submit: primary button.

**Workout history:** Table or list, same styling rules as Nutrition.

---

### Insights Page

**Layout:** Single column or two-column grid of insight cards.

Each insight card:
- `--card-bg`, `--card-border`, `--card-radius`.
- Status chip (pill) naming the insight category.
- Body copy in `--text-body-lg`.
- Optional chart below the copy (not before it — text leads, chart supports).

No numbered markers (01/02/03) — insights are not a sequence.

---

### Profile / Settings Page

**Layout:** Single column, max-width ~3xl, section-grouped settings rows.

**Section structure:**
- Section label: Inter, `--text-body-sm`, `--text-3`, sentence case.
- Rows inside a card container.
- Destructive section (delete, clear) physically separated at the bottom,
  with danger-colored button (`--btn-danger-bg`).

**Existing code issues to fix (SettingsPage.tsx):**
- This is the largest file (34KB). Likely contains many hardcoded values.
  Go through methodically: ctrl+F for `#`, `rgba(`, `rounded-`, `shadow-`,
  `text-sm`, `text-xs`, `text-gray`, `bg-white`, `border-white`. Replace all
  with token vars.
- Any ALL-CAPS section labels → sentence case.

---

## 8. Motion — the complete rulebook

### What animates (deliberate moments)
| Element | Animation | Token |
|---|---|---|
| Score ring on mount | stroke-dashoffset 0 → value | `--ring-animation` (400ms) |
| Progress bar on mount | width 0% → value | `--duration-slow` (400ms) |
| Modal open | opacity 0→1 + translateY(8px)→0 | `--duration-base` (200ms) |
| Modal close | opacity 1→0 + translateY(0)→8px | `--duration-fast` (120ms) |
| Toast enter | opacity 0→1 + translateY(8px)→0 | `--duration-base` |
| Theme toggle | background/color transition | `--duration-base` |
| Focus ring | box-shadow transition | `--duration-fast` |
| Nav item hover | background color | `--duration-fast` |
| Button hover | filter/background | `--duration-fast` |
| Input focus border | border-color | `--duration-fast` |

### What does NOT animate
- Cards on page load — no fade-in, no slide-up on every card.
- Every element on scroll.
- Icon pulse/bounce loops as ambient decoration.
- Card hover lift (`hover:scale-[1.01]`).
- Group-hover scale on child numbers.

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all non-essential transitions. Only keep focus ring transitions
     (for usability) and color transitions for theme toggle. */
}
```
The base layer in `tokens.css` already handles this globally. Don't override it.

---

## 9. Anti-patterns — reject these immediately

If you catch yourself producing any of these, stop and pick something specific
to MacroScope instead.

1. **ALL-CAPS eyebrow labels** — "TODAY'S ACTION", "SYSTEM SNAPSHOT",
   "AVG DURATION (7D)". Fix: sentence case.

2. **Middle-dot metadata** — "Alerts · 1", "3 items · Today", "Sleep · 7.2h".
   Fix: plain prose or two separate elements.

3. **Spaced em dash labels** — "Status — Good". Fix: restructure or use a chip.

4. **Arrow-suffixed links** — "View details →". Fix: just "View details".

5. **Monospace data labels** — "for that technical feel". Fix: Inter, always.

6. **Identical rounded cards for everything** — same border-radius, same
   shadow, same gray on every element. Fix: apply the two-tier shape rule.

7. **Cream + terracotta palette drift** — warm beige background + clay/rust
   accent. This app's palette is dark charcoal + warm gold. Watch for it
   especially in light mode.

8. **Ambient entrance animation on everything** — every section fading+sliding
   in. Fix: remove all entrance animations. Keep only the one ring/progress
   fill moment.

9. **Pulsing icon loops** — `⚡` or status icons animating indefinitely.
   Fix: static icon, colored with the status token.

10. **Hover lift on data cards** — `hover:scale-[1.01]`, `hover:shadow-lg`.
    Fix: cards are structural. No lift. Interactive *elements inside* a card
    may have hover states.

11. **Hardcoded hex values** — `#737373`, `#0a0a0a`, `#00D4FF`, `bg-white/5`,
    `border-white/10`. Fix: find the nearest semantic token and use it.

12. **`bg-white/5` and `border-white/10`** — these are dark-only shorthand
    that break in light mode. Fix: `var(--surface-2)` and `var(--border)`.

13. **`backdrop-blur-sm` everywhere** — creates GPU layers with no benefit for
    opaque surfaces. Fix: only use blur on actual blurred surfaces (overlays).

14. **`text-gray-400`, `text-gray-500`** — Tailwind grays, not system tokens.
    Fix: `var(--text-2)` or `var(--text-3)`.

15. **Numbered sequence markers (01/02/03)** on non-sequential content.

---

## 10. Accessibility floor (every component, no exceptions)

- `:focus-visible` with `var(--focus-ring)` on every interactive element.
  Never remove focus outlines; replace if customizing.
- Color is never the only signal — pair every status color with text.
- `aria-label` on every icon-only button. `aria-hidden="true"` on every
  decorative icon.
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` on rings and progress bars.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on modals. Trap
  focus inside modal while open.
- Contrast: minimum AA (4.5:1 for body text, 3:1 for large text/UI components)
  in both themes. The light-mode status colors in tokens.css were already
  darkened for this — if you add a new color, check contrast before shipping.
- All form inputs have associated `<label>` elements (not just placeholder text).

---

## 11. Extending to new screens or components

1. **Reuse the existing hero + focus-block + side-column layout** wherever the
   content fits. Don't invent a new layout skeleton for each screen.

2. **Reuse existing component patterns** (`.hero`, status chip, progress bar,
   signals list) before writing a new component. A new component is justified
   only when nothing existing fits structurally.

3. **Every new metric must pass the "does the user need to act on this?" test.**
   If it's decoration or completeness-padding, cut it.

4. **Every new color must be added to tokens.css** under the correct theme
   section with both dark and light values, then verified for AA contrast in
   both themes.

5. **Charts on new screens:** use the same `--chart-*` sequence. Reuse the
   same tooltip component. Don't style chart components inline.

6. **Modals for new forms:** use the modal tokens. Header divider `--border-strong`.
   Confirm/cancel in footer. One primary CTA.

---

## 12. When still unsure

Default to doing **less**: fewer new colors, fewer new shapes, fewer new
patterns, more reuse of what's already in `tokens.css` and the existing
component set.

> It is easier to deliberately add one bold moment later than to
> walk back five small inconsistent ones.

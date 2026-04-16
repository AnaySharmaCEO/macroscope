# MACROSCOPE — Insights Page Refactor
## Implementation Prompt for AI with Full Codebase Access

---

## YOUR GOAL

Refactor the Insights page into a modular, multi-file intelligence dashboard.
You are making **additive, surgical changes** to a working codebase.
Do NOT break existing components, hooks, or design patterns.
Match the existing visual style exactly — colors, spacing, border styles, typography.

---

## BEFORE YOU WRITE A SINGLE LINE

1. Read the existing `InsightsPage` file fully.
2. Read `InsightCard` and `PanelLayout` components — understand their props and rendered output.
3. Read `useSleepSystem`, `useNutritionSystem`, `useActivitySystem` hooks — understand the exact shape of the data they return (field names, types, date format).
4. Note the existing color tokens in use: `#737373`, `#e5e5e5`, `#00D4FF`, `#10b981`, `bg-white/5`, `border-white/10`, etc. Use only these.
5. Note the existing `ViewMode` and `ActivePanel` types if they exist — extend them, do not replace.

---

## FILE STRUCTURE TO CREATE

Create these new files alongside the existing `InsightsPage`. Use whatever path convention the codebase already follows.

```
insights/
├── types.ts                        ← shared type definitions
├── engine.ts                       ← pure logic, no UI imports
├── primitives.tsx                  ← shared UI atoms
├── InsightsPage.tsx                ← rewrite existing file (router only)
└── panels/
    ├── WeeklyInsightPanel.tsx
    ├── SleepPanel.tsx
    ├── NutritionPanel.tsx
    ├── ActivityPanel.tsx
    └── WeightPanel.tsx
```

---

## STEP 1 — CREATE `types.ts`

Define these types. **Adapt field names to match what the real hooks actually return.**

```ts
// Raw data shapes — match your actual hook return types
export interface SleepEntry {
  id: string;
  date: Date;
  duration: number;   // hours
  quality: number;    // 0–100
  bedtime?: string;
  wakeTime?: string;
}

export interface NutritionEntry {
  id: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ActivityEntry {
  id: string;
  date: Date;
  steps: number;
  workouts: string[];
  activeMinutes?: number;
}

export type SystemKey = 'sleep' | 'activity' | 'nutrition';

export interface SystemScores {
  sleep: number;
  activity: number;
  nutrition: number;
}

export interface CrossSystemPattern {
  systems: SystemKey[];   // MUST have ≥ 2 entries
  message: string;
}

export interface PriorityAction {
  focus: SystemKey;
  message: string;
  panelLink: string;      // which panel to navigate to
}

export interface WeeklyInsightData {
  summary: string;
  scores: SystemScores;
  bottleneck: SystemKey;
  patterns: CrossSystemPattern[];
  action: PriorityAction;
  confidence: number;
  overallScore: number;
}

export type ViewMode = 'simple' | 'detailed';

export type ActivePanel =
  | null
  | 'weeklyInsight'
  | 'sleep'
  | 'nutrition'
  | 'activity'
  | 'weight';
```

---

## STEP 2 — CREATE `engine.ts`

Pure functions only. Zero UI imports. Zero side effects.
This is the "Strategist" — it processes all three data sources together.

### 2a. Scoring functions

**`scoreSleep(data: SleepEntry[]): number`** → 0–100
- Average duration vs 8h target (50% weight)
- Average quality score (50% weight)
- Variance penalty: mean absolute deviation from avg duration × 10, capped at 30 points
- Return 50 if no data

**`scoreActivity(data: ActivityEntry[]): number`** → 0–100
- Average steps vs 10,000 target
- If `activeMinutes` data exists: 60% steps + 40% active minutes (30 min target)
- Return 30 if no data

**`scoreNutrition(data: NutritionEntry[]): number`** → 0–100
- Calorie score: 80pts if avg calories in 1600–2500 range; proportional penalties outside
- Protein score: avg protein / 120g × 100, capped at 100
- Final: calScore × 0.55 + proteinScore × 0.45
- Return 40 if no data

### 2b. Cross-system pattern detection

**`detectPatterns(scores, sleepData, activityData, nutritionData): CrossSystemPattern[]`**

Each pattern object MUST have `systems` array with ≥ 2 entries.
Detect these conditions (check in order, collect all that match, return max 4):

| Condition | Systems | Message theme |
|-----------|---------|---------------|
| sleep < 65 AND activity < 65 | ['sleep','activity'] | Negative feedback loop between the two |
| sleep < 65 AND activity >= 65 | ['sleep','activity'] | Sleep acting as ceiling on activity |
| activity >= 75 AND sleep < 60 AND nutrition < 65 | ['activity','sleep','nutrition'] | High training + poor nutrition degrading sleep |
| nutrition < 60 AND (sleep < 70 OR activity < 70) | ['nutrition','sleep','activity'] | Nutrition gap limiting recovery across systems |
| sleepVariance > 1.2 AND activity < 75 | ['sleep','activity'] | Circadian disruption suppressing daytime energy |
| activity >= 70 AND nutrition >= 70 AND sleep < 60 | ['sleep','activity','nutrition'] | Sleep as outlier drag on otherwise aligned system |
| sleep >= 75 AND activity >= 75 AND nutrition >= 75 | ['sleep','activity','nutrition'] | All systems compounding positively |
| fallback (no patterns matched) | ['sleep','nutrition'] | No strong negatives, small consistency gains |

Write specific, causal messages. Not generic. Reference both/all systems named.

### 2c. Priority action builder

**`buildPriorityAction(bottleneck, scores, sleepData, activityData, nutritionData)`**

Returns `{ message: string, panelLink: string }`.

The message must:
- Target the bottleneck system
- Explain the cross-system benefit of fixing it (not just the bottleneck itself)
- Be time-bound and specific

Example messages:
- Sleep bottleneck (high variance): "Lock in a fixed bedtime for the next 5 nights. Circadian consistency will improve recovery quality and raise daytime energy — which directly lifts activity output."
- Activity bottleneck (low steps): "Add a 20-minute walk after dinner for the next 5 days. Low-intensity movement signals the body to regulate sleep pressure — improving both sleep depth and next-day energy."
- Nutrition bottleneck (low protein): "Add 30–40g of protein to your daily intake for the next 7 days. Protein drives overnight muscle repair — this directly upgrades recovery quality and training adaptation."

`panelLink` = the panel name to navigate to ('sleep', 'activity', 'nutrition').

### 2d. Summary builder

**`buildSummary(bottleneck, scores, overallScore): string`**

- If overallScore >= 75: acknowledge strength, name bottleneck as marginal constraint, reference second-lowest system
- If overallScore >= 55: name bottleneck as the limiting factor, say fixing it unlocks the other systems
- If overallScore < 55: acknowledge multi-system weakness, call out bottleneck as highest-leverage fix

Always mention at least two systems. Never give a single-system verdict.

### 2e. Main export

```ts
export function generateWeeklyInsight(
  sleepData: SleepEntry[],
  nutritionData: NutritionEntry[],
  activityData: ActivityEntry[]
): WeeklyInsightData
```

Calls all the above in sequence. Returns the full `WeeklyInsightData` object.
Confidence = `0.55 + min(1, totalEntries / 21) * 0.45`.

---

## STEP 3 — CREATE `primitives.tsx`

Shared UI atoms. Import and use in every panel.
Match the existing design tokens exactly.

### `ViewToggle`
```tsx
// Props: { viewMode: ViewMode, setViewMode: (v: ViewMode) => void }
// Renders two buttons: "Simple" | "Detailed"
// Active: bg-white text-black
// Inactive: bg-white/10 text-[#e5e5e5] hover:bg-white/20
// Both: px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all
```

### `SectionLabel`
```tsx
// Wraps children in: text-xs uppercase tracking-wider text-[#737373] mb-3
```

### `MetricCard`
```tsx
// Props: { label, value, unit?, accent? }
// Container: p-4 rounded-xl bg-white/5 border border-white/10
// Label: text-xs text-[#737373] mb-2
// Value: text-2xl font-light (+ accent class if provided)
// Unit: text-xs text-[#737373] mt-0.5
```

### `KvRow`
```tsx
// Props: { label, value, valueAccent? }
// Row: flex justify-between p-4 rounded-lg bg-white/5 border border-white/10
// Label: text-sm text-[#737373]
// Value: text-sm (+ valueAccent class, default text-[#e5e5e5])
```

### `ChartPlaceholder`
```tsx
// Props: { icon: string, label: string }
// Container: h-56 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
// Icon: text-4xl mb-3
// Label: text-sm text-[#737373]
```

### `ScoreBar`
```tsx
// Props: { label, score: 0–100, isBottleneck?: boolean }
// Color: score >= 75 → #10b981, >= 50 → #f59e0b, else #ef4444
// If isBottleneck: label is text-white font-medium + shows a small "bottleneck" tag
// Track: h-1.5 rounded-full bg-white/10; fill: same color, width = score%
```

### `PanelContent`
```tsx
// Wrapper: <div className="p-6 space-y-6">{children}</div>
// Use inside every PanelLayout to ensure consistent inner padding
```

### `DataSourceBadge`
```tsx
// Props: { sleepCount, nutritionCount, activityCount }
// Container: p-4 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20
// Label: text-xs uppercase tracking-wider text-[#00D4FF]
// Text: "{n} sleep entries · {n} nutrition logs · {n} activity records"
```

### `ScoreTag`
```tsx
// Props: { label, score }
// Small stacked tag for the main page preview card
// Label: text-[10px] uppercase tracking-wider text-[#737373]
// Score: text-sm font-medium, color-coded same as ScoreBar
```

---

## STEP 4 — CREATE `panels/WeeklyInsightPanel.tsx`

**THIS IS THE STRATEGIST. It must never contain sleep-only, activity-only, or nutrition-only content.**

Props:
```ts
{
  insight: WeeklyInsightData
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  onBack: () => void
  onNavigateToPanel: (panel: ActivePanel) => void
  sleepCount: number
  nutritionCount: number
  activityCount: number
}
```

Wrap in existing `<PanelLayout title="Weekly Insight" onBack={onBack}>`.
Inside use `<PanelContent>`.

**Layout hierarchy (both views):**
```
<ViewToggle />
{viewMode === 'simple' && <SimpleView />}
{viewMode === 'detailed' && <DetailedView />}
```

**Simple view contains:**
1. System Scores block (`p-5 rounded-xl bg-white/5 border border-white/10`)
   - `<SectionLabel>System Scores</SectionLabel>` + overall score in top-right
   - `<ScoreBar>` for Sleep, Activity, Nutrition — pass `isBottleneck` for the bottleneck
2. System Analysis block
   - `<SectionLabel>System Analysis</SectionLabel>`
   - `insight.summary` as `text-sm leading-relaxed text-[#e5e5e5]`
3. Cross-System Patterns
   - `<SectionLabel>Cross-System Patterns</SectionLabel>`
   - For each pattern: container with system tags (small pills) + message text
   - System tags: `px-2 py-0.5 rounded text-[10px] uppercase bg-white/10 text-[#737373]`
4. Priority Action card
   - `bg-gradient-to-br from-white to-[#f0f0f0] border-2 border-white text-black`
   - Shows: "Priority Action" label + focus system + confidence % + action message
   - A button: "Open {focus} panel →" that calls `onNavigateToPanel(action.panelLink)`

**Detailed view contains:**
1. `<ChartPlaceholder icon="📊" label="7-day combined system trend (Sleep · Activity · Nutrition)" />`
2. Daily Combined Signals list (generate 7 days of mock data: sleepH, steps, kcal → status Strong/Moderate/Weak)
   - Status colors: Strong=#10b981, Moderate=#f59e0b, Weak=#ef4444
3. `<DataSourceBadge>` with the three counts

---

## STEP 5 — CREATE `panels/SleepPanel.tsx`

**ALL sleep-specific analysis lives here and ONLY here.**
Weekly Insight may reference sleep as a bottleneck but never details it.

Props: `{ sleepData: SleepEntry[], viewMode, setViewMode, onBack }`

Derive internally:
- `avgDuration`, `avgQuality`, `variance` (mean absolute deviation)
- `trend`: compare last 3 entries vs previous 4 — "↑ Improving" / "↓ Declining" / "→ Stable"
- `recommendation`: sleep-specific string based on variance/duration/quality

**Simple view:**
- 2×2 grid of `<MetricCard>`: Last Night duration, Quality score, 7-Day Avg, Consistency (±Xh variance)
- `<KvRow>` for Weekly Trend, Avg Quality
- Sleep Recommendation block (`bg-white/5 border border-white/10`)

**Detailed view:**
- `<ChartPlaceholder icon="😴" label="Sleep duration + quality trend" />`
- Sleep log: last 7 entries reversed, each showing date, duration, quality, bedtime/wakeTime if available

---

## STEP 6 — CREATE `panels/NutritionPanel.tsx`

Props: `{ nutritionData: NutritionEntry[], viewMode, setViewMode, onBack }`

**Simple view:**
- `<MetricCard>` for Today's calories and 7-Day Avg calories
- Today's macros as `<KvRow>` rows: Protein, Carbs, Fat

**Detailed view:**
- `<ChartPlaceholder icon="🥗" label="Calorie + macro trend" />`
- 7-day averages as `<KvRow>` rows
- Recent logs: last 7 entries, each showing date, calories, and macro breakdown

---

## STEP 7 — CREATE `panels/ActivityPanel.tsx`

Props: `{ activityData: ActivityEntry[], viewMode, setViewMode, onBack }`

**Simple view:**
- `<MetricCard>` for Today's steps and 7-Day Avg steps
- `<KvRow>` for Active Days (steps >= 7500), Workouts count
- If today has workouts: list them

**Detailed view:**
- `<ChartPlaceholder icon="🏃" label="Steps + active minutes trend" />`
- Last 7 activity entries: date, steps, active minutes (if available), workout count

---

## STEP 8 — CREATE `panels/WeightPanel.tsx`

Props: `{ viewMode, setViewMode, onBack }`
(Use real weight hook if it exists. If not, generate 14 days of mock data locally.)

**Simple view:**
- `<MetricCard>` for current weight
- `<KvRow>` for 7-day change and 14-day change (color: negative=green, positive=red)

**Detailed view:**
- `<ChartPlaceholder icon="⚖️" label="Weight trend over 14 days" />`
- Last 14 weight entries as rows

---

## STEP 9 — REWRITE `InsightsPage.tsx`

This file becomes a **thin router with no business logic**.

```tsx
// Imports: all panels, generateWeeklyInsight, primitives (ScoreTag), hooks
// State: activePanel (ActivePanel), viewMode (ViewMode)

// On mount / data ready: call generateWeeklyInsight(sleepData, nutritionData, activityData)

// openPanel(panel): setActivePanel(panel) + setViewMode('simple')  ← always reset to simple
// handleBack(): setActivePanel(null) + setViewMode('simple')

// Routing (if/else chain):
if activePanel === 'weeklyInsight' → <WeeklyInsightPanel ... />
if activePanel === 'sleep'         → <SleepPanel ... />
if activePanel === 'nutrition'     → <NutritionPanel ... />
if activePanel === 'activity'      → <ActivityPanel ... />
if activePanel === 'weight'        → <WeightPanel ... />

// Default: main overview grid
```

**Main overview — card order and content:**

1. **Weekly Insight card** (`InsightCard` existing component)
   - 3-column grid of `<ScoreTag>` (Sleep / Activity / Nutrition scores)
   - Divider line (`border-b border-white/10`)
   - `insight.summary` — line-clamp-2
   - Bottom row: "Fix: {action.focus} → {action.panelLink} panel" in `#00D4FF` + Overall score right-aligned

2. **Sleep card**
   - Left: last night's duration (large) + "last night" label
   - Right: quality score

3. **Nutrition card**
   - Left label "Avg Calories", right: 7-day avg value (large)

4. **Activity card**
   - Left label "Avg Steps", right: avg steps (large)

5. **Weight card**
   - Left: current weight (large), right: 7-day change with color

---

## HARD RULES — DO NOT VIOLATE

1. **Weekly Insight contains zero sleep-only content.** Every sentence in summary, every pattern, every action must reference ≥ 2 systems.

2. **Sleep-specific advice (bedtime, quality tips, duration targets) only appears inside SleepPanel.**

3. **`engine.ts` imports nothing from React, no UI.** It is pure TypeScript functions.

4. **`ViewToggle` is one component from `primitives.tsx`.** Do not inline toggle buttons in individual panels.

5. **Every panel opens in Simple view.** `setViewMode('simple')` is called in `openPanel()`.

6. **Do not remove or rename existing `InsightCard`, `PanelLayout` components.** Use them as-is.

7. **Do not change hook signatures or data shapes.** Adapt `types.ts` field names to match the real hook output.

8. **Do not add new npm packages.**

9. **Match existing Tailwind classes exactly.** Do not introduce new color values.

10. **The `onNavigateToPanel` prop in WeeklyInsightPanel must work.** The "Open Sleep panel" button must call it with `'sleep'` — which sets `activePanel` in the parent and renders `<SleepPanel>`.

---

## VERIFICATION CHECKLIST

Before marking this complete, confirm:

- [ ] `engine.ts` has no React imports
- [ ] Every `CrossSystemPattern` has `systems.length >= 2`
- [ ] Weekly Insight Simple view shows: scores → analysis → patterns → action (in that order)
- [ ] Weekly Insight has no sleep-specific recommendations
- [ ] Sleep panel has sleep-specific recommendations not found in Weekly Insight
- [ ] All 5 panels use `<ViewToggle>` from primitives (not inlined)
- [ ] All 5 panels use `<PanelContent>` wrapper from primitives
- [ ] `openPanel()` always calls `setViewMode('simple')`
- [ ] Priority Action card has a working "Open X panel →" button
- [ ] Main overview shows all 5 preview cards
- [ ] Loading state still works
- [ ] `handleBack()` returns to main overview from any panel
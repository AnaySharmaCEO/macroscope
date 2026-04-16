You are a senior full-stack engineer and product designer.

Your task is to build **MacroScope — a Personal Performance Operating System**, strictly following the rules below.

This is NOT a typical app.
This is a **system-level product**.

---

# 🎯 PRODUCT IDENTITY

MacroScope is:

> A system that allows users to monitor, control, and optimize their physical performance across Sleep, Nutrition, and Activity.

It is NOT:

* a tracker
* a dashboard
* a wellness app

---

# 🧠 CORE MODEL

```text
Monitor → Detect Signals → Adjust → Improve Stability
```

---

# 🧭 PRODUCT STRUCTURE

## Primary Screens:

* Control Center (main)
* Sleep System
* Nutrition System
* Activity System
* Data (secondary)
* Profile

---

# ⚙️ ARCHITECTURE (NON-NEGOTIABLE)

## Folder Structure

/core
/hooks
/services
/types
/logic

/web
/ui
/layouts
/pages

/desktop
/ui
/pages

/mobile
/ui
/screens

---

## Rules

* UI MUST NOT contain business logic
* UI MUST NOT call API directly
* UI ONLY uses hooks
* Hooks manage state + orchestration
* Services handle API interaction
* API layer already exists (do not modify)

---

# 🌐 RESPONSIVENESS

Web MUST be responsive:

* Desktop → sidebar layout
* Mobile → bottom navigation

Same codebase. No duplication.

---

# 🔗 HOOK SYSTEM

Implement:

* useSystemOverview
* useSleepSystem
* useNutritionSystem
* useActivitySystem
* useProfile

---

## Hooks MUST include:

### Data:

* systemStatus
* signals
* metrics

### Mutations:

* addMeal()
* logSleep()
* logActivity()
* updateProfile()

---

# 🧠 INTERACTION SYSTEM

## Logging

### Nutrition:

* add meal (name, calories, macros)

### Sleep:

* log duration, sleep time, wake time

### Activity:

* steps, workouts, duration

---

## Onboarding

Flow:

1. Basic info (height, weight, goal)
2. Baseline system inputs
3. Initialize system state
4. Redirect to Control Center

---

## Profile Editing

* editable fields
* update via hook

---

# 🏠 CONTROL CENTER (MOST IMPORTANT)

## Structure:

```text
Header

System Status

Primary Signal

Recommended Action

Secondary Signals

Metrics Strip
```

---

## Design Rules:

### 1. System Status (SIGNATURE ELEMENT)

```text
SYSTEM STATUS

Sleep        ● Stable
Nutrition    ● Stable
Activity     ● Low
```

* aligned columns
* subtle dot indicators
* single block

---

### 2. Primary Signal (DOMINANT)

* largest readable text
* text-first
* no clutter

---

### 3. Recommended Action

```text
RECOMMENDED ACTION

Increase activity today to stabilize system
```

* slightly emphasized
* feels decisive

---

### 4. Secondary Signals

* small list
* muted

---

### 5. Metrics Strip

```text
2365 kcal    7121 steps    7.5h sleep
```

* inline
* no boxes
* secondary importance

---

# 🛌 SYSTEM PAGES (SLEEP / NUTRITION / ACTIVITY)

## Structure:

```text
Header

System State

Primary Metric

Primary Signal

Input / Logging

Secondary Metrics

Trends
```

---

## Rules:

* ONE dominant metric (large text)
* Logging UI must be above fold
* Secondary metrics compressed (no boxes)
* Signals clearly visible

---

# 📊 DATA PAGE

* secondary
* detailed tracking only
* no visual dominance

---

# 👤 PROFILE PAGE

* user info
* goal
* system settings
* summary

---

# 🎨 DESIGN SYSTEM

## Colors

* bg-primary: dark neutral
* bg-secondary: subtle contrast
* border: soft
* text-primary: high contrast
* text-secondary: muted
* accent: ONE color only

---

## Typography

* Primary Metric → very large
* Signal → readable
* Labels → small + muted

---

## Spacing

Use strict scale:

* 8 / 16 / 24 / 32 / 48

---

## Surfaces

Use ONLY:

1. Base (no box)
2. Soft panel
3. Emphasis panel (rare)

---

## Rules:

* Avoid box overload
* Use spacing for grouping
* Maintain vertical rhythm

---

# ⚡ INTERACTION DESIGN

* hover: subtle brightness shift
* click: slight scale (0.98)
* transitions: 120–160ms

---

# 🧠 VISUAL PRINCIPLES

* minimal
* structured
* calm
* system-like

---

## DO NOT

* use multiple accent colors
* create dashboard-style UI
* overuse cards
* add unnecessary animations
* mix logic into UI

---

# 🔥 FINAL POLISH REQUIREMENTS

## Alignment

* strict vertical alignment
* consistent margins

---

## Density

* show only essential info
* avoid clutter

---

## Hierarchy

```text
1. Signal
2. System State
3. Action
4. Secondary Info
5. Metrics
```

---

## Width Control

* max-width: ~800px
* centered or controlled layout

---

## Signature Feel

The UI must feel like:

> a controlled system interface

NOT:

> a generic app

---

# 🎯 FINAL GOAL

User should feel:

* “I understand my system instantly”
* “I know what to do next”
* “This is precise and serious”

---

# 🚀 EXECUTION INSTRUCTION

Build the entire system:

* architecture
* hooks
* services
* screens
* interactions
* responsive UI
* design system
* polished UI

All must be:

* cohesive
* scalable
* modular
* clean

---

Do NOT improvise beyond these rules.

Execute with precision.

# MacroScope Performance OS - Architecture Documentation

## Overview

MacroScope is built as a multi-platform Performance OS with strict separation of concerns and platform-agnostic core logic.

---

## Architecture Layers

### 1. Core Layer (`/src/core`)

**Shared across all platforms** - Contains all business logic, state management, and data operations.

#### Structure

```
/core
  /types          - TypeScript type definitions
  /services       - Data operations and API integration
  /hooks          - State management and orchestration
  /logic          - Future signal engine (placeholder)
```

#### Key Principles

- **Platform Agnostic**: No UI dependencies
- **Pure Logic**: Business rules and data processing only
- **Reusable**: Used by web, desktop, and mobile platforms

#### Components

**Types** (`/core/types`)
- System types (Sleep, Nutrition, Activity)
- Data structures (Signal, Metric, etc.)
- Status enums and interfaces

**Services** (`/core/services`)
- `sleepService` - Sleep data operations
- `nutritionService` - Nutrition data operations
- `activityService` - Activity data operations

Services handle:
- API calls (currently mocked)
- Data transformation
- Status calculation
- Signal generation

**Hooks** (`/core/hooks`)
- `useSystemOverview` - Unified system state
- `useSleepSystem` - Sleep system management
- `useNutritionSystem` - Nutrition system management
- `useActivitySystem` - Activity system management

Hooks provide:
- State management
- Service orchestration
- Error handling
- Data refresh logic

---

### 2. Platform Layer

Each platform has its own UI implementation while sharing core logic.

#### Web Platform (`/src/web`)

```
/web
  /config         - Navigation and configuration
  /hooks          - Web-specific hooks (useResponsive)
  /layouts        - Responsive layouts
  /pages          - Page components
  /ui
    /components   - UI components
```

**Features**
- Responsive layout (desktop sidebar / mobile bottom nav)
- React Router for navigation
- Tailwind CSS styling

#### Desktop Platform (`/src/desktop`)

Placeholder for Electron implementation.

Will share:
- Core logic from `/core`
- Navigation structure
- Data flow patterns

Will differ:
- Window management
- System tray integration
- Desktop-specific UI components

#### Mobile Platform (`/src/mobile`)

Placeholder for React Native implementation.

Will share:
- Core logic from `/core`
- Navigation structure
- Data flow patterns

Will differ:
- React Navigation
- Native components
- Touch interactions
- Platform-specific APIs

---

## Data Flow

### Strict Layer Separation

```
UI Layer (Platform-specific)
    ↓ consumes
Hooks Layer (Core)
    ↓ calls
Services Layer (Core)
    ↓ calls
API Layer (External)
```

### Rules

1. **UI MUST NOT call services directly**
2. **UI ONLY consumes hooks**
3. **Hooks orchestrate services**
4. **Services handle external operations**

### Example Flow

```typescript
// ❌ WRONG - UI calling service directly
const data = await sleepService.getSleepData();

// ✅ CORRECT - UI consuming hook
const { sleepData, loading, error } = useSleepSystem();
```

---

## Responsive Strategy

### Breakpoint

- **Desktop**: ≥ 768px
- **Mobile**: < 768px

### Layout Switching

The `RootLayout` component dynamically switches between:
- **Desktop**: Sidebar + main content
- **Mobile**: Bottom navigation + full content

### Implementation

```typescript
const { isMobile } = useResponsive();

if (isMobile) {
  return <MobileLayout />;
}
return <DesktopLayout />;
```

---

## Navigation System

### Centralized Config

`/src/web/config/navigation.ts` defines all routes:

```typescript
const navigationItems = [
  { id: 'control-center', label: 'Control Center', path: '/', icon: LayoutGrid },
  { id: 'sleep', label: 'Sleep', path: '/sleep', icon: Moon },
  // ...
];
```

### Benefits

- Single source of truth
- Reusable across platforms
- Easy to extend
- Type-safe

---

## System Architecture

### Core Systems

1. **Sleep System**
   - Duration tracking
   - Timing consistency
   - Quality metrics

2. **Nutrition System**
   - Calorie tracking
   - Macronutrient balance
   - Meal timing

3. **Activity System**
   - Step tracking
   - Workout logging
   - Intensity monitoring

### Cross-System Dependencies

Systems are **interdependent**:
- Poor sleep → reduced activity capacity
- Late meals → lower sleep quality
- Low activity → unstable recovery

Signals reflect these dependencies:
> "Late meals are reducing sleep consistency"

---

## Signal System

### Definition

Signals are system-driven alerts that replace traditional "insights":

**Format**: `"[Condition] is affecting [System Outcome]"`

**Properties**:
- Short and precise
- System-derived (not user reflections)
- Actionable
- Prioritized by severity

### Implementation

Currently distributed across services:
- `sleepService.generateSignals()`
- `nutritionService.generateSignals()`
- `activityService.generateSignals()`

**Future**: Centralized signal engine in `/core/logic`

---

## State Management

### Hook Pattern

Each system hook provides:

```typescript
{
  data: SystemData[],
  status: SystemStatus,
  signals: Signal[],
  loading: boolean,
  error: string | null,
  actions: {
    logEntry: () => Promise<void>,
    refresh: () => Promise<void>
  }
}
```

### Benefits

- Consistent interface
- Easy to test
- Platform-agnostic
- Clear data flow

---

## Extension Points

### For Prompt 2 (Screen Implementation)

1. Import hooks in pages
2. Build UI components
3. Connect to existing data flow
4. No service layer changes needed

### For Prompt 3 (UI Polish)

1. Apply design system
2. Add animations
3. Refine components
4. No logic layer changes needed

---

## Mock Data

Currently, all services return mock data for development:

```typescript
// In services
private getMockSleepData(): SleepData[] {
  // Generates realistic test data
}
```

**To Replace with Real API**:
1. Update service methods
2. Remove mock data generators
3. Add error handling
4. No hook or UI changes needed

---

## Technology Stack

### Core
- TypeScript
- React 18
- Custom hooks

### Web
- React Router (data mode)
- Tailwind CSS v4
- Lucide icons

### Build
- Vite
- TypeScript

---

## File Organization

```
/src
  /core                 # Shared logic
    /types
    /services
    /hooks
    /logic
  /web                  # Web platform
    /config
    /hooks
    /layouts
    /pages
    /ui
  /desktop              # Desktop platform (placeholder)
  /mobile               # Mobile platform (placeholder)
  /app
    App.tsx             # Entry point
```

---

## Key Principles

1. **Separation of Concerns**: UI, hooks, services, API
2. **Platform Agnostic Core**: Shared business logic
3. **Responsive by Design**: Single codebase, multiple layouts
4. **Signal-Driven UX**: System alerts over manual insights
5. **Scalable Architecture**: Ready for future enhancements

---

## Next Steps

### Prompt 2: Screen Implementation
- Build detailed page layouts
- Add data visualization components
- Implement interaction patterns
- Add loading and error states

### Prompt 3: UI Polish
- Apply design system
- Add animations and transitions
- Refine typography and spacing
- Optimize responsive behavior

---

## Notes

- All mock data uses realistic patterns
- Services can be replaced without changing hooks
- Hooks can be used across any UI framework
- Navigation config is platform-agnostic

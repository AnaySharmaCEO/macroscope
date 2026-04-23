# MacroScope Performance OS - Technical Deep Dive Documentation

**Comprehensive Analysis of React Components, Libraries, Hooks, Services, APIs, Concepts & Techniques**

---

## Table of Contents

1. [React Fundamentals & Hooks](#react-fundamentals--hooks)
2. [Third-Party Libraries & Dependencies](#third-party-libraries--dependencies)
3. [UI Components & Custom Hooks](#ui-components--custom-hooks)
4. [State Management Pattern](#state-management-pattern)
5. [API & Data Layer](#api--data-layer)
6. [Advanced React Techniques](#advanced-react-techniques)
7. [Page Architecture & Components](#page-architecture--components)
8. [Performance & Best Practices](#performance--best-practices)

---

## React Fundamentals & Hooks

### Core React Hooks Used

#### 1. **useState Hook**
Used throughout the application for managing local component state.

**Examples:**

```typescript
// ControlCenterPage.tsx
const [actionCompleted, setActionCompleted] = useState(false);

// NutritionPage.tsx
const [activePanel, setActivePanel] = useState<ActivePanel>(null);
const [mealName, setMealName] = useState('');
const [calories, setCalories] = useState(0);
const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
const [searching, setSearching] = useState(false);

// SleepPage.tsx
const [duration, setDuration] = useState<number>(0);
const [bedtime, setBedtime] = useState('');
const [quality, setQuality] = useState<number>(0);
const [submitting, setSubmitting] = useState(false);

// AuthFlow.tsx
const [inputEmail, setInputEmail] = useState('');
const [otp, setOtp] = useState('');
const [cooldown, setCooldown] = useState(0);
```

**Key Patterns:**
- State variables for form inputs
- Boolean flags for UI states (loading, submitting, searching)
- Array state for list data (searchResults, signals)
- Single value state for selected options

#### 2. **useEffect Hook**
Used for side effects, data fetching, and lifecycle management.

**Examples:**

```typescript
// AuthFlow.tsx - Countdown timer for OTP resend
useEffect(() => {
  let timer: number;
  if (cooldown > 0) {
    timer = window.setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
  }
  return () => clearInterval(timer);
}, [cooldown]);

// App.tsx - Theme application
useEffect(() => {
  applyThemeClass();
  const onPrefs = () => applyThemeClass();
  window.addEventListener('macroscope-preferences-update', onPrefs);
  window.addEventListener('storage', onPrefs);
  return () => {
    window.removeEventListener('macroscope-preferences-update', onPrefs);
    window.removeEventListener('storage', onPrefs);
  };
}, []);

// useSystemOverview - Data fetching on mount
useEffect(() => {
  fetchOverview();
  const handleUpdate = () => fetchOverview();
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('macroscope-api-update', handleUpdate);
    return () => window.removeEventListener('macroscope-api-update', handleUpdate);
  }
}, []);
```

**Key Patterns:**
- Cleanup functions for event listeners
- Timer intervals with proper cleanup
- Custom event listeners for cross-component communication
- Dependency arrays for optimization

#### 3. **useContext Hook**
Used for global state management via React Context API.

**Implementation:**

```typescript
// useAuth.tsx - Authentication Context Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullyOnboarded, setIsFullyOnboarded] = useState(false);
  
  // ... context logic
  
  return (
    <AuthContext.Provider value={{
      user,
      userId: user?.id ?? null,
      loading,
      error,
      isFullyOnboarded,
      // ... methods
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Usage:**
```typescript
// In any component
const { user, userId, loading, isFullyOnboarded, sendOtp, verifyOtp } = useAuth();
```

### Custom Hooks (Core Layer)

#### 4. **useSystemOverview Hook**
Master hook that orchestrates all three systems (sleep, nutrition, activity).

**Architecture:**
```typescript
export function useSystemOverview() {
  const { userId } = useAuth();
  const [overview, setOverview] = useState<SystemOverview>({/* ... */});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    // 1. Fetch data from all 3 services using Promise.all
    const [sleepData, nutritionData, activityData] = await Promise.all([
      sleepService.getSleepData(userId, weekAgo, today),
      nutritionService.getNutritionData(userId, weekAgo, today),
      activityService.getActivityData(userId, weekAgo, today),
    ]);

    // 2. Calculate statuses
    const sleepStatus = sleepService.calculateStatus(sleepData);
    const nutritionStatus = nutritionService.calculateStatus(nutritionData);
    const activityStatus = activityService.calculateStatus(activityData);

    // 3. Generate cross-system signals
    const alerts = generateAlerts(sleepData, nutritionData, activityData, settings);
    const priorityAlerts = prioritizeAlerts(alerts);

    // 4. Map to Signal objects
    const allSignals: Signal[] = alerts.map(/* ... */).slice(0, 3);

    // 5. Push notifications
    alerts.forEach(a => {
      if (a.state === 'NEW' && a.severity === 'high') {
        notificationService.notifySignal(/* ... */);
      }
    });

    // 6. Set state
    setOverview({
      sleepStatus,
      nutritionStatus,
      activityStatus,
      systemStatus: score.status,
      dailyScore: score.score,
      signals: allSignals,
      priorityAction,
      // ...
    });
  };

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
    acknowledgeSignal,
  };
}
```

**Returns:**
```typescript
{
  overview: SystemOverview,
  loading: boolean,
  error: string | null,
  refresh: () => Promise<void>,
  acknowledgeSignal: (signalId: string) => Promise<void>
}
```

#### 5. **useSleepSystem Hook**
Manages sleep-specific state and operations.

```typescript
const { 
  sleepData,      // SleepData[]
  status,         // SystemStatus
  signals,        // Signal[]
  loading,        // boolean
  error,          // string | null
  logSleep        // (data: SleepData) => Promise<void>
} = useSleepSystem();
```

#### 6. **useNutritionSystem Hook**
Manages nutrition-specific state with enhanced features.

```typescript
const {
  nutritionData,     // NutritionData[]
  status,            // SystemStatus
  signals,           // Signal[]
  dailyInsights,     // DailyInsights | null
  suggestedFoods,    // FoodSuggestion[]
  loading,           // boolean
  error,             // string | null
  logMeal,           // (date: Date, meal: Meal) => Promise<void>
  removeMeal         // (mealId: string) => Promise<void>
} = useNutritionSystem();
```

#### 7. **useActivitySystem Hook**
Manages activity and workout tracking.

```typescript
const {
  activityData,      // ActivityData[]
  status,            // SystemStatus
  signals,           // Signal[]
  loading,           // boolean
  error,             // string | null
  logActivity,       // (date: Date, workout: Workout) => Promise<void>
  updateSteps        // (steps: number) => Promise<void>
} = useActivitySystem();
```

#### 8. **useProfile Hook**
Manages user profile data.

```typescript
const {
  profile,           // UserProfile | null
  loading,           // boolean
  error,             // string | null
  updateProfile,     // (updates: Partial<UserProfile>) => Promise<void>
  initializeProfile  // (profile: UserProfile) => Promise<void>
} = useProfile();
```

#### 9. **useSettings Hook**
Manages application settings.

```typescript
const {
  settings,          // SystemSettings
  loading,           // boolean
  error,             // string | null
  updateSettings,    // (updates: Partial<SystemSettings>) => Promise<void>
} = useSettings();
```

#### 10. **useAlerts Hook**
Manages alert/signal history and state.

```typescript
const {
  alerts,            // Alert[]
  acknowledgeAlert,  // (alertId: string) => Promise<void>
  resolveAlert       // (alertId: string) => Promise<void>
} = useAlerts();
```

#### 11. **useGoals Hook**
Manages user goals tracking.

```typescript
const {
  goals,             // Goal[]
  progress,          // GoalProgress[]
  updateGoal         // (goalId: string, updates: Partial<Goal>) => Promise<void>
} = useGoals();
```

---

## Third-Party Libraries & Dependencies

### 1. **UI Framework & Styling**

#### React & React DOM
```json
"react": "18.3.1",
"react-dom": "18.3.1"
```
- Core rendering engine
- Event handling
- Component lifecycle

#### Tailwind CSS v4
```json
"tailwindcss": "4.1.12",
"@tailwindcss/vite": "4.1.12"
```

**Usage Patterns:**

```typescript
// Responsive classes
className="p-6 md:p-8 max-w-4xl mx-auto"

// Conditional styling
className={`${actionCompleted ? 'scale-[0.98] opacity-80' : 'hover:scale-[1.01]'}`}

// Dark mode
className="dark:bg-[#0a0a0a] dark:text-[#e5e5e5]"

// Custom color tokens
className="bg-[#1c1c1e] border border-[#2a2a2d] rounded-2xl p-6 md:p-8"
```

**Key Features Used:**
- Responsive breakpoints (md, sm, lg)
- Grid layout system (grid-cols-1, md:grid-cols-3)
- Flex utilities
- Typography utilities
- Spacing utilities (p-6, mb-8, gap-4)
- Border utilities
- Color opacity (bg-white/5, text-gray-400)
- Animation utilities (animate-in, duration-500)

#### Emotion (CSS-in-JS)
```json
"@emotion/react": "11.14.0",
"@emotion/styled": "11.14.1"
```
- Used for dynamic styling in complex components
- Complements Tailwind for runtime styles

### 2. **Animation & Motion**

#### Framer Motion (as "motion")
```json
"motion": "12.23.24"
```

**Animation Patterns Used:**

```typescript
// Fade in with scale
<motion.div 
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, delay: 0.1 }}
>
  Content
</motion.div>

// Slide in from left
<motion.div 
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, delay: 0.5 }}
>
  Content
</motion.div>

// Continuous pulse animation
<motion.div 
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
>
  Content
</motion.div>

// Ring pulse effect
animate={actionCompleted ? {} : { 
  boxShadow: [
    '0 0 0 0 rgba(255,255,255,0.05)', 
    '0 0 0 8px rgba(255,255,255,0)', 
    '0 0 0 0 rgba(255,255,255,0)'
  ]
}}
transition={{ 
  boxShadow: { duration: 2, repeat: Infinity, repeatDelay: 1 }
}}

// Tap animation
whileTap={{ scale: actionCompleted ? 1 : 0.95 }}
```

**Animation Techniques:**
- Stagger animations (delay per item)
- Continuous animations with repeat
- Conditional animations based on state
- Box shadow animations for glow effects
- Color animations

### 3. **Data Visualization**

#### Recharts
```json
"recharts": "2.15.2"
```

**Usage in Pages:**
- Sleep duration trends (line chart)
- Nutrition macro breakdown (bar/pie chart)
- Activity intensity distribution
- Historical data visualization

**Components:**
```typescript
<BarChart data={data}>
  <Bar dataKey="value" fill="#00D4FF" />
</BarChart>

<PieChart>
  <Pie data={macroData} dataKey="value" />
</PieChart>

<LineChart data={trendData}>
  <Line type="monotone" dataKey="duration" stroke="#00D4FF" />
</LineChart>
```

### 4. **Form Handling**

#### React Hook Form
```json
"react-hook-form": "7.55.0"
```

**Pattern in NutritionPage:**
```typescript
// While not explicitly shown as FormProvider, form state is managed
// via useState and manual submission handlers
const handleAddMeal = async () => {
  if (!mealName || !calories) return;
  await logMeal(new Date(), {
    name: mealName,
    time: mealTime,
    mealType,
    foodId: selectedFoodId,
    quantity: Number(quantity),
    calories: Number(calories),
    protein: Number(protein),
    carbs: Number(carbs),
    fat: Number(fat),
  });
  // Reset form
};
```

#### Input OTP
```json
"input-otp": "1.4.2"
```

**OTP Component in AuthFlow:**
```typescript
import { OTPInput } from 'input-otp';

<OTPInput
  maxLength={6}
  value={otp}
  onChange={handleOtpChange}
  autoFocus
  render={({ slots }) => (
    <div className="flex justify-center gap-2">
      {slots.map((slot, idx) => (
        <Slot key={idx} {...slot} />
      ))}
    </div>
  )}
/>
```

**Features:**
- 6-digit OTP input
- Auto-submission when complete
- Custom slot rendering for styling
- Cursor animation

### 5. **UI Component Library**

#### Radix UI Components
```json
"@radix-ui/react-*": "1.x.x" (22 packages)
```

**Components Used:**
- Accordion
- Alert Dialog
- Avatar
- Checkbox
- Collapsible
- Context Menu
- Dialog
- Dropdown Menu
- Hover Card
- Label
- Menubar
- Navigation Menu
- Popover
- Progress
- Radio Group
- Scroll Area
- Select
- Separator
- Slider
- Switch
- Tabs
- Toggle
- Toggle Group
- Tooltip

**Example Usage:**
```typescript
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@radix-ui/react-select';
```

### 6. **Icon Library**

#### Lucide React
```json
"lucide-react": "0.487.0"
```

**Icons Used:**
- Layout Grid (LayoutGrid) - Home icon
- Moon - Sleep icon
- Utensils - Nutrition icon
- Activity - Activity icon
- Lightbulb - Insights icon
- Settings - Settings icon

**Implementation:**
```typescript
import { Activity, Moon, Utensils, LayoutGrid, User, Lightbulb, Settings } from 'lucide-react';

const navigationItems = [
  { icon: LayoutGrid, label: 'Home' },
  { icon: Moon, label: 'Sleep' },
  { icon: Utensils, label: 'Nutrition' },
  // ...
];

// In components
<Moon className="w-5 h-5" />
```

### 7. **Routing**

#### React Router v7
```json
"react-router": "7.13.0"
```

**Router Configuration:**
```typescript
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: ControlCenterPage },
      { path: 'sleep', Component: SleepPage },
      { path: 'nutrition', Component: NutritionPage },
      { path: 'activity', Component: ActivityPage },
      { path: 'insights', Component: InsightsPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);
```

**Features:**
- Nested routing with RootLayout
- Index routes (default path)
- Component-based routing
- Data mode configuration

### 8. **Backend & Authentication**

#### Supabase JavaScript Client
```json
"@supabase/supabase-js": "^2.101.1"
```

**Authentication Methods:**
```typescript
// OTP Authentication
await supabase.auth.signInWithOtp({ 
  email,
  options: { shouldCreateUser: true }
});

await supabase.auth.verifyOtp({
  email,
  token,
  type: 'email'
});

// Session Management
const { data, error } = await supabase.auth.getSession();

// Sign Out
await supabase.auth.signOut();
```

**Database Operations:**
```typescript
// Select
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// Insert
const { data } = await supabase
  .from('sleep_entries')
  .insert({ /* ... */ })
  .select();

// Update
const { error } = await supabase
  .from('profiles')
  .update({ /* ... */ })
  .eq('id', userId);

// Upsert
const { data } = await supabase
  .from('profiles')
  .upsert({ id: userId, /* ... */ }, { onConflict: 'id' });

// Delete
await supabase.from('meals').delete().eq('id', mealId);

// RPC Calls
const { data } = await supabase.rpc('get_daily_insights', {
  p_user_id: userId,
  p_date: dateString,
});
```

### 9. **Notifications & Toast**

#### Sonner (Toast Library)
```json
"sonner": "2.0.3"
```

**Usage:**
```typescript
import { toast } from 'sonner';

// In notificationService
export const notifySignal = (message: string, action: string, severity: 'high' | 'medium' | 'low') => {
  toast[severity === 'high' ? 'error' : 'info'](message);
};
```

### 10. **Celebration Effects**

#### Canvas Confetti
```json
"canvas-confetti": "1.9.4"
```

**Usage:**
```typescript
import confetti from 'canvas-confetti';

// Trigger celebration on milestone
if (actionCompleted) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

### 11. **Utility Libraries**

#### Class Variance Authority (CVA)
```json
"class-variance-authority": "0.7.1"
```

**Pattern:**
```typescript
const buttonVariants = cva(
  "px-4 py-2 rounded font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white",
        secondary: "bg-gray-200 text-gray-800",
      },
      size: {
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
);
```

#### clsx (Conditional Classnames)
```json
"clsx": "2.1.1"
```

**Usage:**
```typescript
className={clsx(
  'p-6 rounded-lg',
  isActive && 'bg-blue-500 text-white',
  !isActive && 'bg-gray-100 text-gray-800'
)}
```

#### Tailwind Merge
```json
"tailwind-merge": "3.2.0"
```

**Usage:** Merges conflicting Tailwind classes intelligently.

#### Date-fns
```json
"date-fns": "3.6.0"
```

**Usage:**
```typescript
import { format, isSameDay, subDays } from 'date-fns';

const today = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Calculate date ranges
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);
```

### 12. **Build Tools**

#### Vite
```json
"vite": "^6.4.2"
```

**Configuration:**
```typescript
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
```

#### TypeScript
```json
"typescript": "^5.7.3"
```

**Key Type Definitions:**
```typescript
// Core types in /src/core/types/system.ts
export type SystemType = "sleep" | "nutrition" | "activity";
export type SystemStatus = "stable" | "imbalanced" | "low" | "unknown";
export interface Signal { /* ... */ }
export interface SystemOverview { /* ... */ }
export interface UserProfile { /* ... */ }
```

---

## UI Components & Custom Hooks

### Custom UI Components Library (`/src/web/ui/components/`)

#### 1. **ActionButton.tsx**
Reusable button component with multiple variants.

```typescript
interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

<ActionButton onClick={handleClick} disabled={loading} fullWidth>
  {loading ? 'Loading...' : 'Submit'}
</ActionButton>
```

**Variants:**
- Primary (blue/white)
- Secondary (gray)
- Danger (red)

#### 2. **InputField.tsx**
Flexible input component with label and unit support.

```typescript
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'email' | 'number' | 'time' | 'date';
  placeholder?: string;
  unit?: string;
}

<InputField
  label="Bedtime"
  value={bedtime}
  onChange={setBedtime}
  type="time"
/>
```

#### 3. **SearchableInput.tsx**
Input with search suggestions and select capability.

```typescript
interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<void>;
  onSelect: (item: FoodItem) => void;
  searchResults: FoodItem[];
  getItemLabel: (item: FoodItem) => string;
  getItemDescription: (item: FoodItem) => string;
  searching: boolean;
}

<SearchableInput
  label="Meal Name"
  value={mealName}
  onChange={setMealName}
  onSearch={handleSearchFood}
  onSelect={handleSelectFood}
  searchResults={searchResults}
  getItemLabel={(item) => item.name}
  getItemDescription={(item) => `${item.calories} cal`}
  placeholder="Search for food..."
  searching={searching}
/>
```

**Features:**
- Real-time search
- Dropdown results
- Custom label/description rendering
- Loading state handling

#### 4. **DailyScoreGauge.tsx**
Circular progress gauge for daily score visualization.

```typescript
interface DailyScoreGaugeProps {
  score: number; // 0-100
}

<DailyScoreGauge score={dailyScore} />
```

**Implementation:**
- Circular SVG-based gauge
- Color gradient based on score (red → yellow → green)
- Animated ring effect
- Large typography display

#### 5. **SystemCard.tsx**
Card component for displaying system metrics.

```typescript
interface SystemCardProps {
  label: string;
  value: string;
  status: 'good' | 'low' | 'high';
  trend: 'up' | 'down' | 'stable';
  progress: number; // 0-100
}

<SystemCard
  label="Sleep"
  value="7.5h"
  status="good"
  trend="up"
  progress={85}
/>
```

**Features:**
- Color-coded status (green, orange, red)
- Trend indicator with arrow
- Progress bar
- Flexible sizing

#### 6. **SegmentedControl.tsx**
Toggle-style control for selecting between options.

```typescript
interface SegmentedControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

<SegmentedControl
  label="Meal Type"
  value={mealType}
  onChange={setMealType}
  options={[
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
  ]}
/>
```

#### 7. **SelectOptionGroup.tsx**
Native select dropdown wrapper with styling.

```typescript
interface SelectOptionGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

<SelectOptionGroup
  label="Activity Level"
  value={activityLevel}
  onChange={setActivityLevel}
  options={[
    { value: 'low', label: 'Low - Sedentary' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High - Very active' },
  ]}
/>
```

#### 8. **FormContainer.tsx**
Layout wrapper for form sections.

```typescript
interface FormContainerProps {
  title: string;
  children: React.ReactNode;
}

<FormContainer title="Sleep Check-in">
  {/* Form fields */}
</FormContainer>
```

#### 9. **PanelLayout.tsx**
Full-screen panel layout with back button.

```typescript
interface PanelLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

<PanelLayout title="Log Meal" onBack={() => setActivePanel(null)}>
  {/* Panel content */}
</PanelLayout>
```

#### 10. **Sidebar.tsx**
Navigation sidebar component for desktop layout.

```typescript
<Sidebar items={navigationItems} currentPath={location.pathname} />
```

**Features:**
- Navigation link rendering
- Active route highlighting
- Icon support
- Collapse functionality (mobile)

#### 11. **BottomNav.tsx**
Bottom navigation for mobile layout.

```typescript
<BottomNav items={navigationItems} currentPath={location.pathname} />
```

**Features:**
- Sticky bottom positioning
- Icon-only design
- Active state styling

#### 12. **TopBar.tsx**
Header component with user profile access.

```typescript
<TopBar />
```

**Features:**
- Logo/title display
- User profile dropdown
- Settings access
- Notification indicators

#### 13. **AlertsPanel.tsx**
Displays system signals/alerts.

```typescript
<AlertsPanel 
  signals={overview.signals}
  onAcknowledge={handleAcknowledge}
/>
```

#### 14. **GoalsPanel.tsx**
Shows user goals and progress.

```typescript
<GoalsPanel goals={userGoals} />
```

#### 15. **SettingsRow.tsx**
Single setting row component.

```typescript
interface SettingsRowProps {
  label: string;
  value: string | boolean;
  onChange: (value: any) => void;
  type: 'toggle' | 'input' | 'select';
}

<SettingsRow
  label="Dark Mode"
  value={isDarkMode}
  onChange={setIsDarkMode}
  type="toggle"
/>
```

#### 16. **MetricsRow.tsx**
Displays metric value and optional progress.

```typescript
<MetricsRow label="Sleep" value="7.5h" progress={75} />
```

#### 17. **InsightCard.tsx**
Card for displaying insight/signal.

```typescript
<InsightCard
  title="System Interaction"
  description="Low sleep is reducing activity output"
  severity="high"
/>
```

#### 18. **SignalsList.tsx**
Renders list of signals with filtering.

```typescript
<SignalsList signals={signals} onAcknowledge={acknowledge} />
```

#### 19. **PageHeader.tsx**
Standard page header component.

```typescript
<PageHeader title="Sleep System" subtitle="Monitor patterns" />
```

#### 20. **AnalogTimePicker.tsx**
Interactive analog clock time picker.

```typescript
<AnalogTimePicker value={time} onChange={setTime} />
```

**Features:**
- Analog clock display
- Click to set time
- AM/PM toggle
- Hour/minute adjustment

#### 21. **TrendsPlaceholder.tsx**
Placeholder for trend visualization.

```typescript
<TrendsPlaceholder />
```

#### 22. **ActionBlock.tsx**
Large action block for primary CTA.

```typescript
<ActionBlock
  title="Add Meal"
  description="Tap to log a meal"
  onClick={handleClick}
/>
```

#### 23. **SystemStatusBlock.tsx**
Displays current system status.

```typescript
<SystemStatusBlock status="stable" />
```

---

## State Management Pattern

### Context-Based Architecture

```
AuthProvider (Root)
├── useAuth() hook
├── AuthFlow component
├── OnboardingFlow component
└── RouterProvider
    └── RootLayout
        ├── Sidebar/BottomNav (uses navigation config)
        ├── useSystemOverview()
        │   ├── useSleepSystem()
        │   ├── useNutritionSystem()
        │   └── useActivitySystem()
        ├── useProfile()
        ├── useSettings()
        ├── useGoals()
        └── useAlerts()
```

### Data Flow

**1. Authentication Flow:**
```
User Input (Email) 
  → AuthFlow component 
  → useAuth.sendOtp() 
  → authService.sendOtp() 
  → api.login() 
  → supabase.auth.signInWithOtp()
  
User Input (OTP)
  → useAuth.verifyOtp()
  → authService.verifyOtp()
  → api.verifyOtp()
  → supabase.auth.verifyOtp()
  → setUser & setIsFullyOnboarded
```

**2. System Overview Fetch:**
```
useSystemOverview()
  → Promise.all([
      sleepService.getSleepData(),  → api.getSleepData()  → supabase query
      nutritionService.getNutritionData(),  → api.getNutritionData()  → supabase query
      activityService.getActivityData()  → api.getActivityData()  → supabase query
    ])
  → Calculate statuses
  → generateAlerts()
  → setOverview(state)
  → Re-render ControlCenterPage with new data
```

**3. Meal Logging Flow:**
```
User fills form (NutritionPage)
  → handleAddMeal()
  → logMeal(date, mealData)
  → nutritionService.logMeal()
  → api.logMeal()
  → supabase: create custom food, meal record, meal items
  → Reset form state
  → Re-fetch overview data (custom event)
  → Components re-render
```

---

## API & Data Layer

### Supabase API Integration (`/src/core/api.ts`)

#### Authentication APIs

```typescript
// OTP Sign-in
export const login = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({ 
    email,
    options: { shouldCreateUser: true }
  });
  if (error) throw error;
  return { success: true };
};

// OTP Verification
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.session;
};

// Get Session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Logout
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

#### Profile Management APIs

```typescript
// Get Profile with Auto-Creation
export const getProfile = async (userId: string, email?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;

  // Auto-create if doesn't exist
  if (!data) {
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: email ?? 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();
    if (createError) throw createError;
    return mapDbProfileToUserProfile(created);
  }

  return mapDbProfileToUserProfile(data);
};

// Save Profile with Upsert
export const saveProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const dbUpdates = mapUserProfileUpdatesToDb(updates);
  
  // Mark onboarding complete if full payload
  if (updates.name && updates.height && updates.weight && updates.stepTarget) {
    (dbUpdates as any).onboarding_complete = true;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...dbUpdates, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle();

  if (error) throw error;

  // Trigger RPC to recalculate targets if physical params changed
  const touchedTargets = 
    'height' in updates || 'weight' in updates || 'goal' in updates;
  if (touchedTargets) {
    try {
      await supabase.rpc('calculate_targets', { p_user_id: userId });
    } catch {
      // Ignore if RPC unavailable
    }
  }

  return mapDbProfileToUserProfile(data);
};
```

#### Sleep APIs

```typescript
// Get Sleep Data Range
export const getSleepData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', toDateString(startDate))
    .lte('date', toDateString(endDate));

  if (error) throw error;
  
  return (data || []).map((s: any) => ({ 
    ...s, 
    date: new Date(s.date) 
  })) as SleepData[];
};

// Log Sleep Entry
export const logSleep = async (userId: string, entry: Omit<SleepData, 'id'>) => {
  const { data, error } = await supabase
    .from('sleep_entries')
    .insert({
      user_id: userId,
      date: toDateString(entry.date),
      duration: entry.duration,
      sleep_time: entry.bedtime,
      wake_time: entry.wakeTime,
      quality: entry.quality,
      consistency: entry.consistency,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return { ...data, date: new Date(data.date) } as SleepData;
};
```

#### Nutrition APIs

```typescript
// Get Nutrition Data with Joined Meals
export const getNutritionData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*, meal_items(*, foods(*))')
    .eq('user_id', userId)
    .gte('meal_date', toDateString(startDate))
    .lte('meal_date', toDateString(endDate));

  if (error) throw error;

  const nutritionMap = new Map<string, NutritionData>();

  (meals || []).forEach((meal: any) => {
    const dateStr = String(meal.meal_date).split('T')[0];
    let dayData = nutritionMap.get(dateStr);

    if (!dayData) {
      dayData = {
        id: `nut_${dateStr}`,
        date: new Date(dateStr),
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meals: [],
        lastMealTime: ''
      };
      nutritionMap.set(dateStr, dayData);
    }

    // Calculate totals from meal items
    let mealCalories = 0, mealProtein = 0, mealCarbs = 0, mealFat = 0;
    if (meal.meal_items) {
      meal.meal_items.forEach((item: any) => {
        mealCalories += item.calories || 0;
        mealProtein += item.protein || 0;
        mealCarbs += item.carbs || 0;
        mealFat += item.fat || 0;
      });
    }

    dayData.meals.push({
      id: meal.id,
      time: meal.time ?? '',
      calories: mealCalories,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFat,
      name: meal.meal_items?.[0]?.foods?.food_name ?? 'Meal',
      mealType: meal.meal_type ?? undefined,
    });

    dayData.calories += mealCalories;
    dayData.protein += mealProtein;
    dayData.carbs += mealCarbs;
    dayData.fat += mealFat;
  });

  return Array.from(nutritionMap.values());
};

// Log Meal with Food Database
export const logMeal = async (userId: string, date: Date, meal: Omit<Meal, 'id'>) => {
  const mealDate = toDateString(date);
  const grams = meal.quantity && meal.quantityUnit 
    ? meal.quantity * unitToGrams(meal.quantityUnit) 
    : 100;

  // 1. Create or retrieve food
  let foodId = meal.foodId;
  if (!foodId) {
    const per100Factor = grams > 0 ? 100 / grams : 1;
    const { data: foodRow } = await supabase
      .from('foods')
      .insert({
        food_code: 'custom',
        food_name: meal.name,
        energy_kcal: meal.calories * per100Factor,
        protein_g: meal.protein * per100Factor,
        carb_g: meal.carbs * per100Factor,
        fat_g: meal.fat * per100Factor,
        is_common: false,
      })
      .select('id')
      .maybeSingle();
    foodId = foodRow.id;
  }

  // 2. Find or create meal record
  let { data: existingMeal } = await supabase
    .from('meals')
    .select('id')
    .eq('user_id', userId)
    .eq('meal_date', mealDate)
    .eq('meal_type', meal.mealType ?? 'meal')
    .maybeSingle();

  let mealRow;
  if (existingMeal) {
    mealRow = existingMeal;
  } else {
    const { data: created } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        meal_date: mealDate,
        meal_type: meal.mealType ?? 'meal',
        time: meal.time ?? new Date().toTimeString().slice(0, 5),
      })
      .select()
      .maybeSingle();
    mealRow = created;
  }

  // 3. Log food via RPC (handles scaling + micronutrients)
  const { error: logError } = await supabase.rpc('log_food', {
    p_meal_id: mealRow.id,
    p_food_id: foodId,
    p_quantity: grams,
  });
  if (logError) throw logError;

  return { ...meal, id: mealRow.id } as Meal;
};
```

#### Activity APIs

```typescript
// Get Activity Data with Workouts
export const getActivityData = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('activity_days')
    .select('*, workouts(*)')
    .eq('user_id', userId)
    .gte('date', toDateString(startDate))
    .lte('date', toDateString(endDate));

  if (error) throw error;
  
  return (data || []).map((day: any) => ({
    id: day.id,
    date: new Date(day.date),
    steps: day.steps || 0,
    workouts: day.workouts || [],
    intensity: day.intensity || 'low',
    totalDuration: day.total_duration || 0
  })) as ActivityData[];
};

// Log Activity/Workout
export const logActivity = async (userId: string, date: Date, workout: Omit<Workout, 'id'>) => {
  const dateStr = toDateString(date);

  // Find or create activity day
  let { data: activityDay } = await supabase
    .from('activity_days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (!activityDay) {
    const { data: newDay } = await supabase
      .from('activity_days')
      .insert({
        user_id: userId,
        date: dateStr,
        steps: 0,
        intensity: workout.intensity,
        total_duration: workout.duration
      })
      .select()
      .maybeSingle();
    activityDay = newDay;
  } else {
    // Update with new workout duration
    const newDuration = (activityDay.total_duration || 0) + workout.duration;
    await supabase
      .from('activity_days')
      .update({ total_duration: newDuration })
      .eq('id', activityDay.id);
  }

  // Insert workout
  const { data: workoutRow } = await supabase
    .from('workouts')
    .insert({
      activity_day_id: activityDay.id,
      name: workout.name,
      duration: workout.duration,
      intensity: workout.intensity,
    })
    .select()
    .maybeSingle();

  return workoutRow as Workout;
};

// Update Steps for Day
export const updateSteps = async (userId: string, date: Date, steps: number) => {
  const dateStr = toDateString(date);

  const { error } = await supabase
    .from('activity_days')
    .upsert({
      user_id: userId,
      date: dateStr,
      steps
    }, { onConflict: 'user_id, date' })
    .select();

  if (error) throw error;
};
```

#### RPC Functions (Server-Side Logic)

```typescript
// Get Daily Insights (aggregated nutrition data)
export const getDailyInsights = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('get_daily_insights', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as DailyInsights | null;
};

// Get Food Suggestions
export const suggestFoods = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('suggest_foods', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  return (data ?? []) as FoodSuggestion[];
};

// Get Sleep Insights
export const getSleepInsights = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_sleep_insights', {
    p_user_id: userId,
    p_start: toDateString(startDate),
    p_end: toDateString(endDate),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as SleepInsights | null;
};

// Get Activity Insights
export const getActivityInsights = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('get_activity_insights', {
    p_user_id: userId,
    p_start: toDateString(startDate),
    p_end: toDateString(endDate),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as ActivityInsights | null;
};

// Get Control Center Snapshot
export const getControlCenterSnapshot = async (userId: string, date: Date) => {
  const { data, error } = await supabase.rpc('get_control_center_snapshot', {
    p_user_id: userId,
    p_date: toDateString(date),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as ControlCenterSnapshot | null;
};
```

#### Data Transformation Functions

```typescript
// Map Database Profile to App Profile Type
const mapDbProfileToUserProfile = (row: DbProfileRow): UserProfile => {
  const goalMap: Record<string, UserProfile['goal']> = {
    maintain: 'maintain',
    recomposition: 'improve',
    fat_loss: 'lose',
    lean_bulk: 'gain',
  };

  return {
    id: row.id,
    name: row.full_name ?? 'User',
    stepTarget: row.step_target ?? 8000,
    height: row.height_cm ?? 0,
    weight: Number(row.weight_kg ?? 0),
    goal: goalMap[String(row.goal_type ?? 'maintain')] ?? 'maintain',
    // ...
  };
};

// Map App Profile Updates to Database Format
const mapUserProfileUpdatesToDb = (updates: Partial<UserProfile>): Partial<DbProfileRow> => {
  const db: Partial<DbProfileRow> = {};
  if (updates.name !== undefined) db.full_name = updates.name;
  if (updates.height !== undefined) db.height_cm = updates.height;
  if (updates.weight !== undefined) db.weight_kg = updates.weight;
  // ...
  return db;
};
```

---

## Advanced React Techniques

### 1. **Conditional Rendering Patterns**

```typescript
// Ternary operator
{isLoading ? <Loading /> : <Content />}

// Logical AND for optional rendering
{showSignals && <SignalsList signals={signals} />}

// Multiple conditions
{!user ? (
  <AuthFlow />
) : !isFullyOnboarded ? (
  <OnboardingFlow />
) : (
  <MainApp />
)}

// Early return pattern
if (loading) return <LoadingState />;
if (error) return <ErrorState />;
return <SuccessState />;
```

### 2. **Event Listener Management**

```typescript
// Custom event broadcasting
window.dispatchEvent(new Event('macroscope-api-update'));
window.dispatchEvent(new Event('macroscope-preferences-update'));

// Event listener attachment with cleanup
useEffect(() => {
  const handleUpdate = () => fetchOverview();
  window.addEventListener('macroscope-api-update', handleUpdate);
  return () => window.removeEventListener('macroscope-api-update', handleUpdate);
}, []);
```

### 3. **LocalStorage Integration**

```typescript
// Store data
localStorage.setItem('macroscope_theme', 'dark');
localStorage.setItem('macroscope_user_email', user.email);
localStorage.setItem('macroscope_alerts_history', JSON.stringify(alerts));

// Retrieve data
const theme = localStorage.getItem('macroscope_theme') || 'dark';
const email = localStorage.getItem('macroscope_user_email');

// Fallback pattern (SSR-safe)
const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
if (storage) {
  storage.setItem(key, value);
}
```

### 4. **Form State Management**

```typescript
// Multiple related form fields
const [mealName, setMealName] = useState('');
const [mealTime, setMealTime] = useState('');
const [calories, setCalories] = useState(0);
const [protein, setProtein] = useState(0);

// Form submission with validation
const handleAddMeal = async () => {
  if (!mealName || !calories) return; // Validate

  try {
    setSubmitting(true);
    await logMeal(new Date(), {
      name: mealName,
      time: mealTime,
      calories: Number(calories),
      protein: Number(protein),
      // ...
    });

    // Reset form
    setMealName('');
    setMealTime('');
    setCalories(0);
    setProtein(0);
  } finally {
    setSubmitting(false);
  }
};
```

### 5. **Async/Await Pattern**

```typescript
// Fetch with error handling
const fetchOverview = async () => {
  try {
    setLoading(true);
    setError(null);

    const [sleepData, nutritionData, activityData] = await Promise.all([
      sleepService.getSleepData(userId, startDate, endDate),
      nutritionService.getNutritionData(userId, startDate, endDate),
      activityService.getActivityData(userId, startDate, endDate),
    ]);

    // Process data
    setOverview(/* ... */);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

### 6. **Higher-Order Component Pattern (Context)**

```typescript
// Provider wrapper
<AuthProvider>
  <AppContent />
</AuthProvider>

// Hook consumer
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 7. **Type-Safe Props**

```typescript
interface ComponentProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'time' | 'date' | 'email';
  disabled?: boolean;
  placeholder?: string;
}

export function Component(props: ComponentProps) {
  // Component implementation
}
```

### 8. **Render Optimization Techniques**

```typescript
// Component memoization
const MemoizedComponent = React.memo(ExpensiveComponent);

// Key in lists
{items.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}

// Conditional rendering to avoid unnecessary renders
{showPanel && <PanelComponent />}
```

### 9. **Side Effect Optimization**

```typescript
// Dependency array prevents unnecessary runs
useEffect(() => {
  fetchData();
}, [userId]); // Only re-run when userId changes

// Empty dependency array = run once on mount
useEffect(() => {
  checkSession();
}, []);

// No dependency array = run on every render (avoid!)
useEffect(() => {
  // This runs every render
});
```

### 10. **Dynamic Styling**

```typescript
// Conditional classes
className={`p-6 ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}

// Template literals
className={`
  p-6 rounded-lg
  ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100'}
  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}
`}

// Style objects
style={{
  backgroundColor: getStatusColor(status),
  width: `${progress}%`,
}}

// HSL color calculation
style={{
  backgroundColor: `hsl(${(progress / 100) * 120}, 80%, 50%)`
}}
```

### 11. **Array Methods in Rendering**

```typescript
// Map
{signals.map((signal) => (
  <SignalItem key={signal.id} signal={signal} />
))}

// Filter then map
{signals
  .filter(s => s.severity === 'high')
  .map((signal) => (
    <HighSeveritySignal key={signal.id} signal={signal} />
  )
)
}

// Slice for pagination
{signals.slice(0, 3).map((signal) => (
  <SignalItem key={signal.id} signal={signal} />
))}

// Find
const highSeveritySignal = signals.find(s => s.severity === 'high');

// Reduce for calculations
const avgDuration = sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length;
```

### 12. **Nullish Coalescing & Optional Chaining**

```typescript
// Nullish coalescing
const value = data?.property ?? 'default';
const target = userSettings?.stepTarget || 10000;

// Optional chaining
const duration = sleepData?.[0]?.duration;
const calories = overview?.keyMetrics?.calories;

// Safe property access
const name = profile?.name ?? 'User';
```

### 13. **Ref and DOM Manipulation (Limited Use)**

```typescript
// Auto-focus on input
<input 
  autoFocus
  className="..."
/>

// Form handling
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Process form
};
```

---

## Page Architecture & Components

### ControlCenterPage Flow

```
ControlCenterPage
├── useSystemOverview() → fetches all data
├── useProfile() → gets user profile
├── State: actionCompleted (boolean)
├── Calculate display data (progress values, status colors)
├── Motion animations
│   ├── Header with streak display (animated number)
│   ├── DailyScoreGauge (animated circular progress)
│   ├── TODAY'S ACTION section (pulsing shadow)
│   ├── SYSTEM SNAPSHOT (3 SystemCards)
│   ├── SYSTEM INTERACTION (if applicable)
│   └── ADDITIONAL SIGNALS (mapped list)
└── All wrapped in motion.div for stagger animations
```

### NutritionPage State Management

```
NutritionPage
├── useNutritionSystem()
├── useSettings()
├── Local state:
│   ├── activePanel: 'addMeal' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
│   ├── Form fields: mealName, mealTime, quantity, etc.
│   ├── selectedFoodId
│   ├── searchResults: FoodItem[]
│   ├── searching: boolean
│   └── submitting: boolean
├── Conditional rendering based on activePanel:
│   ├── Main page (calories, macros, meals)
│   ├── Add meal panel (search + form)
│   └── Meal type detail panel (list of meals)
└── Handlers:
    ├── handleSearchFood() → foodDatabaseService
    ├── handleSelectFood() → populate form
    ├── handleAddMeal() → nutritionService.logMeal()
    └── handleRemoveMeal() → nutritionService.removeMeal()
```

### SleepPage Helpers

```typescript
// Calculate duration from bedtime/waketime
const calculateDuration = (bed: string, wake: string) => {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes < bedMinutes) wakeMinutes += 24 * 60; // overnight
  return ((wakeMinutes - bedMinutes) / 60).toFixed(1);
};

// Generate contextual insight
const generateSleepInsight = (avgQuality: number, entries: number) => {
  if (entries < 5) return "Still forming pattern";
  if (avgQuality >= 4) return "Strong sleep quality";
  if (avgQuality >= 3) return "Decent, could improve";
  return "Quality needs attention";
};
```

### AuthFlow Two-Stage Pattern

```
AuthFlow (isOtpStage = false)
├── Email form
├── On submit → useAuth.sendOtp()
└── Set cooldown timer

AuthFlow (isOtpStage = true)
├── OTP input display
├── Auto-submit on 6 digits
├── Resend button (with cooldown)
└── Change email button
```

### OnboardingFlow Multi-Step

```
OnboardingFlow
├── Step 1: Terms agreement
│   ├── Checkbox
│   └── "Accept & Continue" button
├── Step 2: Basic info
│   ├── Name, age, gender
│   ├── Height, weight, body fat
│   ├── Step target
│   └── Back/Continue buttons
└── Step 3: Baseline patterns
    ├── Primary goal
    ├── Activity level
    ├── Eating pattern
    ├── Sleep hours
    ├── Goal timeline
    └── Back/"Complete Setup" buttons
```

---

## Performance & Best Practices

### 1. **Component Code Splitting**

All pages are route-based and loaded dynamically:
```typescript
const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: ControlCenterPage },
      { path: 'sleep', Component: SleepPage },
      // Loaded on demand
    ],
  },
]);
```

### 2. **Promise.all for Parallel Requests**

```typescript
const [sleepData, nutritionData, activityData] = await Promise.all([
  sleepService.getSleepData(userId, startDate, endDate),
  nutritionService.getNutritionData(userId, startDate, endDate),
  activityService.getActivityData(userId, startDate, endDate),
]);
```

### 3. **Lazy Rendering with Slice**

```typescript
// Render only top 3 signals instead of all
{overview.signals.slice(0, 3).map((signal) => (
  <SignalItem key={signal.id} signal={signal} />
))}
```

### 4. **Efficient State Updates**

```typescript
// Batch updates in single setState
setOverview({
  sleepStatus,
  nutritionStatus,
  activityStatus,
  systemStatus: score.status,
  dailyScore: score.score,
  signals: allSignals,
  // All at once
});
```

### 5. **Error Boundaries (Implicit)**

```typescript
// Services handle errors
try {
  await operation();
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed');
}

// Components show error states
if (error) {
  return <div className="text-red-600">Error: {error}</div>;
}
```

### 6. **Loading States**

```typescript
// Triple state management
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

if (loading) return <LoadingUI />;
if (error) return <ErrorUI />;
return <SuccessUI />;
```

### 7. **Type Safety**

```typescript
// Full TypeScript coverage
interface SystemOverview {
  sleepStatus: SystemStatus;
  nutritionStatus: SystemStatus;
  activityStatus: SystemStatus;
  // All properties typed
}

type SystemStatus = "stable" | "imbalanced" | "low" | "unknown";
```

### 8. **Custom Hooks for Logic Reuse**

```typescript
// useSystemOverview can be used in multiple components
const ControlCenter = () => {
  const { overview } = useSystemOverview();
  // ...
};

const Dashboard = () => {
  const { overview } = useSystemOverview();
  // Same logic
};
```

### 9. **Memoization of Calculations**

```typescript
// Calculate once, not on every render
const avgDuration = sleepData.length > 0
  ? sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length
  : 0;

// Stored in component state/memoized
```

### 10. **Event Listener Cleanup**

```typescript
useEffect(() => {
  const handler = () => fetchData();
  window.addEventListener('event-name', handler);
  return () => window.removeEventListener('event-name', handler); // Cleanup
}, []);
```

---

## Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Entry)                        │
│              AuthProvider → AppContent                       │
└──────────────┬────────────────────────────────────────────┘
               │
        ┌──────┴───────┬──────────────┬────────────────────┐
        │              │              │                    │
    AuthFlow    OnboardingFlow  RouterProvider         Loading
        │              │              │
        │              │         ┌────▼─────────┐
        │              │         │ RootLayout   │
        │              │         │              │
        │              │         ├─ Sidebar     │
        │              │         ├─ BottomNav   │
        │              │         ├─ TopBar      │
        │              │         │              │
        │              │         └──────┬───────┘
        │              │                │
        │              │      ┌─────────┴─────────┐
        │              │      │                   │
        │              │  ┌───▼──────────┐  ┌────▼───────────┐
        │              │  │ useSystemOver│  │                │
        │              │  │ overview()   │  │ Page Component │
        │              │  │              │  │   (7 pages)    │
        │              │  └───┬──────────┘  │                │
        │              │      │             └────────────────┘
        │              │  ┌───┴──────────────────────────┐
        │              │  │    System Hooks             │
        │              │  ├─ useSleepSystem()           │
        │              │  ├─ useNutritionSystem()       │
        │              │  ├─ useActivitySystem()        │
        │              │  ├─ useProfile()               │
        │              │  └─ useSettings()              │
        │              │      │                         │
        │              │  ┌───▼──────────────────────────┐
        │              │  │    Services Layer           │
        │              │  ├─ sleepService              │
        │              │  ├─ nutritionService          │
        │              │  ├─ activityService           │
        │              │  ├─ authService               │
        │              │  ├─ settingsService           │
        │              │  └─ profileService            │
        │              │      │                         │
        │              │  ┌───▼──────────────────────────┐
        │              │  │    API Layer (api.ts)       │
        │              │  │    - Database queries       │
        │              │  │    - RPC functions          │
        │              │  │    - Authentication         │
        │              │  └───┬──────────────────────────┘
        │              │      │
        │              │      ▼
        │              │  Supabase
        │              │  ├─ Auth
        │              │  ├─ Database
        │              │  └─ RPC
        │              │
        ▼              ▼
    UI Components
    ├─ ActionButton
    ├─ InputField
    ├─ SearchableInput
    ├─ FormContainer
    ├─ DailyScoreGauge
    ├─ SystemCard
    ├─ Sidebar
    ├─ BottomNav
    └─ ... (20+ components)
```

---

## Conclusion

MacroScope is a sophisticated, well-architected TypeScript/React application leveraging:

- **Modern React patterns** (hooks, context, custom hooks)
- **Comprehensive animation** (Framer Motion)
- **Type-safe development** (TypeScript throughout)
- **Professional UI library** (Radix UI)
- **Backend integration** (Supabase with real-time features)
- **Advanced data visualization** (Recharts)
- **Form handling** (React Hook Form, custom patterns)
- **Authentication** (OTP-based with Supabase)
- **Performance optimization** (parallel requests, lazy rendering, code splitting)
- **Cross-platform architecture** (shared core logic)

All components are designed to be reusable, maintainable, and optimized for performance while maintaining strict separation of concerns between UI, state management, business logic, and data access layers.


/**
 * MACROSCOPE PERFORMANCE OS - SETTINGS PAGE
 * Panel-based settings system
 */

import { useState, useEffect } from 'react';
import { useSettings, useProfile, useAuth } from '../../core/hooks';
import { SettingsRow } from '../ui/components/SettingsRow';
import { PanelLayout } from '../ui/components/PanelLayout';
import { InputField } from '../ui/components/InputField';
import { SegmentedControl } from '../ui/components/SegmentedControl';
import { ActionButton } from '../ui/components/ActionButton';
import { FormContainer } from '../ui/components/FormContainer';
import { toast } from 'sonner';
import { displayHeightValue, displayWeightValue, parseHeightToCm, parseWeightToKg } from '../../core/utils/units';

type Panel = 
  | 'root'
  | 'account'
  | 'editProfile'
  | 'systemConfig'
  | 'preferences'
  | 'dataPrivacy'
  | 'clearDataConfirm'
  | 'legal'
  | 'terms'
  | 'privacy'
  | 'support'
  | 'about'
  | 'dangerZone'
  | 'deleteAccountConfirm';

interface StepperCardProps {
  label: string;
  value: number;
  setValue: (val: number) => void;
  unit: string;
  min: number;
  max?: number;
  step?: number;
  helperText?: string;
}

function StepperCard({
  label,
  value,
  setValue,
  unit,
  min,
  max,
  step = 1,
  helperText
}: StepperCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-400">{label}</p>
        {helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => value - step >= min && setValue(value - step)}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-lg"
        >
          −
        </button>

        <div className="text-center">
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-gray-500">{unit}</p>
        </div>

        <button
          onClick={() => (!max || value + step <= max) && setValue(value + step)}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { settings, account, loading, updateSettings, updateAccount, exportData, clearAllData, deleteAccount } = useSettings();
  const { profile, updateProfile } = useProfile();
  const { logout } = useAuth();
  const [activePanel, setActivePanel] = useState<Panel>('root');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [profileHeight, setProfileHeight] = useState<number>(0);
  const [profileWeight, setProfileWeight] = useState<number>(0);
  const [sleepTarget, setSleepTarget] = useState<number>(0);
  const [calorieTarget, setCalorieTarget] = useState<number>(0);
  const [activityTarget, setActivityTarget] = useState<number>(0);
  const [goalMode, setGoalMode] = useState<'maintain' | 'cut' | 'bulk'>('maintain');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [notifications, setNotifications] = useState(true);
  const [showSleepConfirm, setShowSleepConfirm] = useState(false);
  const [showTimelineConfirm, setShowTimelineConfirm] = useState(false);
  const [sleepConfirmed, setSleepConfirmed] = useState(false);
  const [timelineConfirmed, setTimelineConfirmed] = useState(false);

  // Initialize form states when data loads
  useEffect(() => {
    if (account) {
      setAccountName(account.name);
      setAccountEmail(account.email);
    }
    if (profile) {
      const currentUnits = settings?.units ?? 'metric';
      setProfileHeight(displayHeightValue(profile.height, currentUnits));
      setProfileWeight(displayWeightValue(profile.weight, currentUnits));
    }
    if (settings) {
      setSleepTarget(settings.sleepTarget);
      setCalorieTarget(settings.calorieTarget);
      setActivityTarget(settings.activityTarget);
      setGoalMode(settings.goalMode);
      setTheme(settings.theme);
      setUnits(settings.units);
      setNotifications(settings.notifications);
    }
  }, [account, profile, settings]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Loading settings...</div>
      </div>
    );
  }

  const handleBack = () => {
    if (activePanel === 'editProfile' || activePanel === 'clearDataConfirm') {
      setActivePanel('dataPrivacy');
    } else if (activePanel === 'deleteAccountConfirm') {
      setActivePanel('dangerZone');
    } else if (['terms', 'privacy', 'support', 'about'].includes(activePanel)) {
      setActivePanel('legal');
    } else {
      setActivePanel('root');
    }
  };

  const handleUpdateAccount = async () => {
    try {
      setSubmitting(true);
      await updateAccount({ name: accountName, email: accountEmail });
      setActivePanel('root');
    } catch (err) {
      console.error('Failed to update account:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      const currentUnits = settings?.units ?? 'metric';
      await updateProfile({ 
        height: Math.round(parseHeightToCm(profileHeight, currentUnits)),
        weight: parseWeightToKg(profileWeight, currentUnits),
      });
      setActivePanel('account');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSystemConfig = async () => {
    try {
      setSubmitting(true);
      await updateSettings({
        sleepTarget,
        calorieTarget,
        activityTarget,
        goalMode,
      });
      setActivePanel('root');
    } catch (err) {
      console.error('Failed to update system config:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setSubmitting(true);
      await updateSettings({ theme, units, notifications });
      setActivePanel('root');
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setSubmitting(true);
      await exportData();
      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Failed to export data:', err);
      toast.error('Failed to export data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      setSubmitting(true);
      await clearAllData();
      setActivePanel('root');
      toast.success('All data cleared');
    } catch (err) {
      console.error('Failed to clear data:', err);
      toast.error('Failed to clear data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSubmitting(true);
      await deleteAccount();
      toast.success('Account deleted');
      // Sign the user out of the app after account deletion
      await logout();
    } catch (err) {
      console.error('Failed to delete account:', err);
      toast.error('Failed to delete account');
    } finally {
      setSubmitting(false);
    }
  };

  // ROOT PANEL
  if (activePanel === 'root') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl tracking-tight mb-2">Settings</h1>
          <div className="text-sm text-[#737373]">Manage your account and preferences</div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#262626] rounded overflow-hidden">
          <SettingsRow label="Account" onClick={() => setActivePanel('account')} />
          <SettingsRow label="Personalization" onClick={() => setActivePanel('systemConfig')} />
          <SettingsRow label="Preferences" onClick={() => setActivePanel('preferences')} />
          <SettingsRow label="Data & Privacy" onClick={() => setActivePanel('dataPrivacy')} />
          <SettingsRow label="Legal & Support" onClick={() => setActivePanel('legal')} />
          <SettingsRow label="Danger Zone" onClick={() => setActivePanel('dangerZone')} variant="danger" />
        </div>
      </div>
    );
  }

// ACCOUNT PANEL
if (activePanel === 'account') {
  return (
    <PanelLayout title="Account" onBack={handleBack}>
      <div className="p-6 max-w-xl mx-auto space-y-6">

        {/* PROFILE CARD */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">

          {/* PROFILE IMAGE */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                accountName?.charAt(0) || "U"
              )}
            </div>

            {/* UPLOAD BUTTON */}
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-black text-xs flex items-center justify-center cursor-pointer">
              +
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      try {
                        await updateProfile({ avatar: reader.result as string });
                        toast.success('Profile photo updated');
                      } catch (err) {
                        toast.error('Failed to update photo');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* NAME + EMAIL */}
          <div className="flex-1 min-w-0">
            <InputField
              label="Name"
              value={accountName}
              onChange={v => setAccountName(String(v))}
            />

            <p className="text-sm text-gray-500 mt-2 truncate">
              {accountEmail}
            </p>
          </div>

        </div>

        {/* SAVE BUTTON */}
        <ActionButton
          onClick={handleUpdateAccount}
          disabled={submitting}
          fullWidth
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </ActionButton>

        {/* ACCOUNT ACTIONS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">

          <button
            onClick={() => {
              logout();
              toast.success('Logged out successfully');
            }}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
          >
            Log out
          </button>

        </div>

      </div>
    </PanelLayout>
  );
}

  // EDIT PROFILE PANEL
  if (activePanel === 'editProfile') {
    return (
      <PanelLayout title="Edit Profile" onBack={handleBack}>
        <div className="p-6">
          <FormContainer title="Physical Metrics">
            <InputField
              label="Height"
              value={profileHeight}
              onChange={v => setProfileHeight(Number(v))}
              type="number"
              unit={(settings?.units ?? 'metric') === 'imperial' ? 'in' : 'cm'}
            />
            <InputField
              label="Weight"
              value={profileWeight}
              onChange={v => setProfileWeight(Number(v))}
              type="number"
              unit={(settings?.units ?? 'metric') === 'imperial' ? 'lb' : 'kg'}
            />
            <ActionButton onClick={handleUpdateProfile} disabled={submitting} fullWidth>
              {submitting ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </FormContainer>
        </div>
      </PanelLayout>
    );
  }

  // SYSTEM CONFIG PANEL
  if (activePanel === 'systemConfig') {
    return (
    <PanelLayout title="Personalisation" onBack={handleBack}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">

  {/* USER BODY METRICS */}
  <FormContainer title="Your Body">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InputField
        label="Height"
        value={profileHeight}
        onChange={(v) => setProfileHeight(Number(v))}
        type="number"
        unit={(settings?.units ?? 'metric') === 'imperial' ? 'in' : 'cm'}
      />
      <InputField
        label="Weight"
        value={profileWeight}
        onChange={(v) => setProfileWeight(Number(v))}
        type="number"
        unit={(settings?.units ?? 'metric') === 'imperial' ? 'lb' : 'kg'}
      />
    </div>
  </FormContainer>

  {/* GOAL SYSTEM */}
<FormContainer title="Your Goal">
  <div className="space-y-6">

    {/* GOAL TYPE */}
    <div className="space-y-2">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Goal Type</p>
      <SegmentedControl
        value={goalMode}
        onChange={(value) => setGoalMode(value as 'maintain' | 'cut' | 'bulk')}
        options={[
          { value: 'maintain', label: 'Maintain' },
          { value: 'cut', label: 'Cut' },
          { value: 'bulk', label: 'Bulk' },
        ]}
      />
    </div>

    {/* TIMELINE CARD */}
    <div className="space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>

      <StepperCard
        label="Duration"
        value={activityTarget}
        setValue={(val) => {
          const minTime = goalMode === 'cut' ? 4 : goalMode === 'bulk' ? 6 : 2;

          if (val < minTime) return;

          setActivityTarget(val);

          const isAggressive =
            (goalMode === 'cut' && val <= 5) ||
            (goalMode === 'bulk' && val <= 7);

          if (isAggressive) {
            setShowTimelineConfirm(true);
            setTimelineConfirmed(false);
          } else {
            setShowTimelineConfirm(false);
            setTimelineConfirmed(true);
          }
        }}
        unit="weeks"
        min={goalMode === 'cut' ? 4 : goalMode === 'bulk' ? 6 : 2}
        max={24}
        step={1}
        helperText="Shorter = more aggressive"
      />

      {/* WARNING */}
      {showTimelineConfirm && !timelineConfirmed && (
        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-300">
          ⚠️ Aggressive timeline — consistency will be harder.

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setTimelineConfirmed(true)}
              className="px-3 py-1 rounded-lg bg-yellow-400 text-black text-xs font-medium transition active:scale-95"
            >
              I can commit
            </button>
            <button
              onClick={() => {
                setActivityTarget(
                  goalMode === 'cut' ? 6 :
                  goalMode === 'bulk' ? 8 : 3
                );
                setShowTimelineConfirm(false);
              }}
              className="px-3 py-1 rounded-lg bg-white/10 text-xs transition active:scale-95"
            >
              Adjust
            </button>
          </div>
        </div>
      )}
    </div>

    {/* SYSTEM FEEDBACK */}
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
      Your targets will adapt based on your goal and timeline.
    </div>

  </div>
</FormContainer>


{/* SLEEP SYSTEM */}
<FormContainer title="Sleep">
  <div className="space-y-6">

    {/* SLEEP CONTROL */}
    <div className="space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Daily Target</p>

      <StepperCard
        label="Sleep Duration"
        value={sleepTarget}
        setValue={(val) => {
          if (val < 6) return;

          setSleepTarget(val);

          if (val >= 6 && val < 7) {
            setShowSleepConfirm(true);
            setSleepConfirmed(false);
          } else {
            setShowSleepConfirm(false);
            setSleepConfirmed(true);
          }
        }}
        unit="hours"
        min={6}
        max={10}
        step={0.5}
        helperText="Optimal: 7.5–8.5"
      />

      {/* WARNING */}
      {showSleepConfirm && !sleepConfirmed && (
        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-300">
          ⚠️ Below optimal sleep — recovery may drop.

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSleepConfirmed(true)}
              className="px-3 py-1 rounded-lg bg-yellow-400 text-black text-xs font-medium transition active:scale-95"
            >
              I understand
            </button>
            <button
              onClick={() => {
                setSleepTarget(7.5);
                setShowSleepConfirm(false);
              }}
              className="px-3 py-1 rounded-lg bg-white/10 text-xs transition active:scale-95"
            >
              Use optimal
            </button>
          </div>
        </div>
      )}
    </div>

    {/* SLEEP GUIDANCE */}
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
      Consistent sleep improves energy, recovery, and long-term performance.
    </div>

  </div>
</FormContainer>
  {/* SAVE */}
  <ActionButton
    onClick={handleUpdateSystemConfig}
    disabled={
      submitting ||
      (showSleepConfirm && !sleepConfirmed) ||
      (showTimelineConfirm && !timelineConfirmed)
    }
    fullWidth
  >
    {submitting ? 'Saving...' : 'Save Changes'}
  </ActionButton>

</div>
    </PanelLayout>
  );
}

  // PREFERENCES PANEL
  if (activePanel === 'preferences') {
    return (
      <PanelLayout title="Preferences" onBack={handleBack}>
        <div className="p-6">
          <FormContainer title="App Preferences">
            <SegmentedControl
              label="Theme"
              value={theme}
              onChange={(value) => setTheme(value as 'dark' | 'light')}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
            <SegmentedControl
              label="Units"
              value={units}
              onChange={(value) => setUnits(value as 'metric' | 'imperial')}
              options={[
                { value: 'metric', label: 'Metric' },
                { value: 'imperial', label: 'Imperial' },
              ]}
            />
            <SegmentedControl
              label="Notifications"
              value={notifications ? 'on' : 'off'}
              onChange={(value) => setNotifications(value === 'on')}
              options={[
                { value: 'on', label: 'On' },
                { value: 'off', label: 'Off' },
              ]}
            />
            <ActionButton onClick={handleUpdatePreferences} disabled={submitting} fullWidth>
              {submitting ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </FormContainer>
        </div>
      </PanelLayout>
    );
  }

  // DATA & PRIVACY PANEL
  if (activePanel === 'dataPrivacy') {
    return (
      <PanelLayout title="Data & Privacy" onBack={handleBack}>
        <div className="bg-[#0a0a0a] border-t border-[#262626]">
          <SettingsRow label="Export Data" onClick={handleExportData} />
          <SettingsRow label="Clear All Data" onClick={() => setActivePanel('clearDataConfirm')} variant="danger" />
          <SettingsRow label="Sync Status" value="Connected" />
        </div>
      </PanelLayout>
    );
  }

  // CLEAR DATA CONFIRMATION
  if (activePanel === 'clearDataConfirm') {
    return (
      <PanelLayout title="Clear All Data" onBack={handleBack}>
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-[#737373]">
              This will permanently delete all your tracked data including sleep, nutrition, and activity records. 
              This action cannot be undone.
            </p>
          </div>
          <div className="space-y-3">
            <ActionButton onClick={handleClearAllData} disabled={submitting} fullWidth variant="danger">
              {submitting ? 'Clearing...' : 'Confirm Clear All Data'}
            </ActionButton>
            <ActionButton onClick={handleBack} fullWidth>
              Cancel
            </ActionButton>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // LEGAL & SUPPORT PANEL
  if (activePanel === 'legal') {
    return (
      <PanelLayout title="Legal & Support" onBack={handleBack}>
        <div className="bg-[#0a0a0a] border-t border-[#262626]">
          <SettingsRow label="Terms of Service" onClick={() => setActivePanel('terms')} />
          <SettingsRow label="Privacy Policy" onClick={() => setActivePanel('privacy')} />
          <SettingsRow label="Support" onClick={() => setActivePanel('support')} />
          <SettingsRow label="About" onClick={() => setActivePanel('about')} />
        </div>
      </PanelLayout>
    );
  }

  // TERMS OF SERVICE PANEL
  if (activePanel === 'terms') {
    return (
      <PanelLayout title="Terms of Service" onBack={handleBack}>
        <div className="p-6">
          <div className="text-sm text-[#737373] space-y-4">
            <p>Last updated: March 30, 2026</p>
            <p>By using MacroScope Performance OS, you agree to these terms...</p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // PRIVACY POLICY PANEL
if (activePanel === 'privacy') {
  return (
    <PanelLayout title="Privacy Policy" onBack={handleBack}>
      <div className="p-6">
        <div className="text-sm text-[#737373] space-y-6 leading-relaxed">
          
          <p>Last updated: March 30, 2026</p>

          <div>
            <p className="font-medium text-[#e5e5e5]">Operator</p>
            <p>MacroScope is operated by Ascendancy, based in India.</p>
            <p>For any privacy-related questions or requests, you can contact us at: [insert email address]</p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">1. Introduction</p>
            <p>
              MacroScope is designed to help you understand patterns in your daily life by connecting simple inputs like sleep, energy, stress, food, and activity.
            </p>
            <p>
              Your privacy is fundamental to how MacroScope is built. This policy explains what data we collect, how we use it, and the control you have over it.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">2. Information We Collect</p>
            <p>MacroScope collects only the data necessary to provide meaningful insights.</p>

            <p className="mt-2 font-medium">a. Account Information</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address (if account login is required)</li>
              <li>Basic authentication details</li>
            </ul>

            <p className="mt-2 font-medium">b. User Input Data</p>
            <p>Information you choose to log, such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sleep quality</li>
              <li>Energy level</li>
              <li>Stress level</li>
              <li>Food type</li>
              <li>Physical activity</li>
              <li>Optional notes</li>
            </ul>

            <p className="mt-2 font-medium">c. Device & Usage Data</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Step count and general activity patterns</li>
              <li>Device type and operating system</li>
              <li>Basic app usage metadata (e.g., interactions, session activity)</li>
            </ul>

            <p className="mt-2 font-medium">d. Storage Technologies</p>
            <p>We may use:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cookies</li>
              <li>Local storage / session storage</li>
            </ul>
            <p>These help maintain sessions and improve app performance.</p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">3. How We Use Your Data</p>
            <p>Your data is used strictly to improve your experience within MacroScope.</p>
            <p>This includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identifying patterns across your inputs</li>
              <li>Generating personalized insights</li>
              <li>Providing simple, actionable daily suggestions</li>
            </ul>
            <p>MacroScope focuses on trends over time, not isolated data points.</p>
            <p className="mt-2">We do not:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sell your data</li>
              <li>Use your data for advertising</li>
              <li>Build external behavioral profiles</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">4. Legal Basis for Processing</p>
            <p>We process your data based on:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consent — when you voluntarily input data into the app</li>
              <li>Legitimate Interest — to improve functionality and generate meaningful insights</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">5. Data Sharing & Third Parties</p>
            <p>
              MacroScope does not sell or share your personal data with third parties for marketing or profiling.
            </p>
            <p>We may use trusted third-party services for infrastructure and operations, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Backend and database services (e.g., Supabase)</li>
              <li>Hosting providers</li>
              <li>Payment processors (if introduced in the future)</li>
            </ul>
            <p>
              These providers process data only as necessary to support the app and are obligated to protect it.
            </p>
            <p>
              We may also use aggregated and anonymized data to improve system performance. This data cannot identify you.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">6. Data Retention</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your data is retained as long as your account remains active</li>
              <li>This allows MacroScope to detect meaningful long-term patterns</li>
            </ul>
            <p className="mt-2">If you delete your account:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your personal data will be permanently removed within a reasonable timeframe</li>
              <li>Limited data may be retained only if required for legal or system integrity purposes</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">7. Your Rights & Control</p>
            <p>You remain fully in control of your data.</p>
            <p>You can:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your data within the app</li>
              <li>Modify or update your entries</li>
              <li>Delete specific logs</li>
              <li>Request full account deletion</li>
            </ul>
            <p className="mt-2">
              To request deletion or raise concerns, contact: [insert email address]
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">8. Data Security</p>
            <p>
              We use standard security practices to protect your data from unauthorized access or misuse.
            </p>
            <p>
              While no system can guarantee absolute security, MacroScope is designed to minimize risk.
            </p>
            <p>
              In the event of a data breach, we will take reasonable steps to notify affected users where required.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">9. Cookies & Storage</p>
            <p>MacroScope uses cookies and similar technologies (such as local storage) to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintain your session</li>
              <li>Improve performance</li>
              <li>Ensure a smooth user experience</li>
            </ul>
            <p>You can control these through your browser settings.</p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">10. Children’s Privacy</p>
            <p>
              MacroScope is not intended for users under the age of 13 (or applicable minimum age in your region).
            </p>
            <p>
              We do not knowingly collect data from children. If such data is discovered, it will be deleted promptly.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">11. International Users</p>
            <p>
              MacroScope is operated from India.
            </p>
            <p>
              By using the app, you understand that your data may be processed and stored in India or other jurisdictions where our service providers operate.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">12. No Manipulation Policy</p>
            <p>MacroScope is designed to guide—not control.</p>
            <p>We do not use your data to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manipulate behavior</li>
              <li>Create addictive engagement loops</li>
              <li>Push unnecessary notifications</li>
            </ul>
            <p>You decide what actions to take.</p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">13. Policy Updates</p>
            <p>
              This Privacy Policy may be updated as MacroScope evolves.
            </p>
            <p>
              If significant changes are made, we will notify users clearly within the app or via email.
            </p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">14. Contact Information</p>
            <p>For any privacy-related questions, requests, or complaints:</p>
            <p>📧 Email: [insert email address]</p>
            <p>🏢 Operator: Ascendancy</p>
            <p>🌍 Location: India</p>
          </div>

          <div>
            <p className="font-medium text-[#e5e5e5]">15. Final Note</p>
            <p>
              MacroScope exists to help you understand your patterns—not exploit them.
            </p>
            <p>Your data is not a product.</p>
            <p>It’s a tool for your clarity.</p>
          </div>

        </div>
      </div>
    </PanelLayout>
  );
}

  // SUPPORT PANEL
  if (activePanel === 'support') {
    return (
      <PanelLayout title="Support" onBack={handleBack}>
        <div className="p-6">
          <div className="text-sm text-[#737373] space-y-4">
            <p>Need help? Contact us at support@macroscope.app</p>
            <p>We typically respond within 24 hours.</p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // ABOUT PANEL
  if (activePanel === 'about') {
    return (
      <PanelLayout title="About" onBack={handleBack}>
        <div className="p-6">
          <div className="text-sm text-[#737373] space-y-4">
            <p><strong>MacroScope Performance OS</strong></p>
            <p>Version 1.0.0</p>
            <p>A multi-platform Performance OS for tracking and optimizing sleep, nutrition, and activity systems.</p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  // DANGER ZONE PANEL
  if (activePanel === 'dangerZone') {
    return (
      <PanelLayout title="Danger Zone" onBack={handleBack}>
        <div className="bg-[#0a0a0a] border-t border-[#262626]">
          <SettingsRow 
            label="Delete Account" 
            onClick={() => setActivePanel('deleteAccountConfirm')} 
            variant="danger" 
          />
        </div>
      </PanelLayout>
    );
  }

  // DELETE ACCOUNT CONFIRMATION
  if (activePanel === 'deleteAccountConfirm') {
    return (
      <PanelLayout title="Delete Account" onBack={handleBack}>
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-[#737373]">
              This will permanently delete your account and all associated data. 
              This action cannot be undone.
            </p>
          </div>
          <div className="space-y-3">
            <ActionButton onClick={handleDeleteAccount} disabled={submitting} fullWidth variant="danger">
              {submitting ? 'Deleting...' : 'Confirm Delete Account'}
            </ActionButton>
            <ActionButton onClick={handleBack} fullWidth>
              Cancel
            </ActionButton>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return null;
}
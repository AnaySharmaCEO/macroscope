/**
 * MACROSCOPE PERFORMANCE OS - PROFILE PAGE
 * User profile and settings
 */

import { useState, useEffect } from 'react';
import { useSystemOverview, useProfile } from '../../core/hooks';
import { useSettings } from '../../core/hooks/useSettings';
import { FormContainer } from '../ui/components/FormContainer';
import { InputField } from '../ui/components/InputField';
import { SelectOptionGroup } from '../ui/components/SelectOptionGroup';
import { ActionButton } from '../ui/components/ActionButton';
import { displayHeightValue, displayWeightValue, parseHeightToCm, parseWeightToKg } from '../../core/utils/units';

export function ProfilePage() {
  const { overview, loading: overviewLoading } = useSystemOverview();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { settings } = useSettings();
  const units = settings?.units ?? 'metric';

  // Form state
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [goal, setGoal] = useState<'maintain' | 'improve' | 'lose' | 'gain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [eatingPattern, setEatingPattern] = useState<'light' | 'balanced' | 'heavy'>('balanced');
  const [typicalSleepHours, setTypicalSleepHours] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with current profile values
  useEffect(() => {
    if (profile) {
      setHeight(displayHeightValue(profile.height, units));
      setWeight(displayWeightValue(profile.weight, units));
      setGoal(profile.goal);
      setActivityLevel(profile.activityLevel);
      setEatingPattern(profile.eatingPattern);
      setTypicalSleepHours(profile.typicalSleepHours);
    }
  }, [profile, units]);

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      await updateProfile({
        height: Math.round(parseHeightToCm(Number(height), units)),
        weight: Number(parseWeightToKg(Number(weight), units)),
        goal,
        activityLevel,
        eatingPattern,
        typicalSleepHours: Number(typicalSleepHours),
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (overviewLoading || profileLoading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--text-3)]">Loading profile...</div>
      </div>
    );
  }

  // Status badge mapping
  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'stable':
      case 'optimal':
        return { bg: 'var(--good-soft)', text: 'var(--good)', border: 'var(--good-border)' };
      case 'warning':
      case 'imbalanced':
        return { bg: 'var(--warn-soft)', text: 'var(--warn)', border: 'var(--warn-border)' };
      case 'low':
      case 'critical':
        return { bg: 'var(--danger-soft)', text: 'var(--danger)', border: 'var(--danger-border)' };
      default:
        return { bg: 'var(--surface-2)', text: 'var(--text-2)', border: 'var(--border)' };
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--text-1)] tracking-tight mb-2">Profile</h1>
        <p className="text-sm text-[var(--text-2)]">Manage your physical metrics and baseline habits</p>
      </div>

      {/* User Info */}
      <FormContainer title="User information">
        <InputField
          label="Height"
          value={height}
          onChange={setHeight}
          type="number"
          unit={units === 'imperial' ? 'in' : 'cm'}
        />
        <InputField
          label="Weight"
          value={weight}
          onChange={setWeight}
          type="number"
          unit={units === 'imperial' ? 'lb' : 'kg'}
        />
        <SelectOptionGroup
          label="Goal"
          value={goal}
          onChange={(value) => setGoal(value as 'maintain' | 'improve' | 'lose' | 'gain')}
          options={[
            { value: 'maintain', label: 'Maintain' },
            { value: 'improve', label: 'Improve' },
            { value: 'lose', label: 'Lose weight' },
            { value: 'gain', label: 'Gain weight' },
          ]}
        />
      </FormContainer>

      {/* System Summary */}
      <div 
        className="p-6 border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div className="text-sm font-semibold text-[var(--text-1)]">System summary</div>
        <div className="space-y-3">
          {(['sleep', 'nutrition', 'activity'] as const).map((system) => {
            const statusVal = system === 'sleep' ? overview.sleepStatus : system === 'nutrition' ? overview.nutritionStatus : overview.activityStatus;
            const badge = getStatusBadge(statusVal);
            return (
              <div 
                key={system} 
                className="flex items-center justify-between p-3 border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span className="text-sm font-medium text-[var(--text-1)] capitalize">{system}</span>
                <span 
                  className="px-2.5 py-0.5 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {statusVal}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <FormContainer title="System settings">
        <SelectOptionGroup
          label="Activity level"
          value={activityLevel}
          onChange={(value) => setActivityLevel(value as 'low' | 'moderate' | 'high')}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
          ]}
        />
        <SelectOptionGroup
          label="Eating pattern"
          value={eatingPattern}
          onChange={(value) => setEatingPattern(value as 'light' | 'balanced' | 'heavy')}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'heavy', label: 'Heavy' },
          ]}
        />
        <InputField
          label="Typical sleep"
          value={typicalSleepHours}
          onChange={setTypicalSleepHours}
          type="number"
          unit="hours"
        />
        <div className="pt-2">
          <ActionButton
            variant="primary"
            onClick={handleUpdateProfile}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Updating profile...' : 'Save changes'}
          </ActionButton>
        </div>
      </FormContainer>
    </div>
  );
}
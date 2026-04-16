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
        <div className="text-sm text-[#737373]">Loading...</div>
      </div>
    );
  }

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#737373';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl tracking-tight mb-2">Profile</h1>
        <div className="text-sm text-[#737373]">Manage your settings and preferences</div>
      </div>

      {/* User Info */}
      <div className="mb-8">
        <FormContainer title="User Information">
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
              { value: 'lose', label: 'Lose Weight' },
              { value: 'gain', label: 'Gain Weight' },
            ]}
          />
        </FormContainer>
      </div>

      {/* System Summary */}
      <div className="mb-8 pb-8 border-b border-[#262626]">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">SYSTEM SUMMARY</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStatusColor(overview.sleepStatus) }}
              />
              <span className="text-sm">Sleep</span>
            </div>
            <span className="text-sm text-[#737373] capitalize">{overview.sleepStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStatusColor(overview.nutritionStatus) }}
              />
              <span className="text-sm">Nutrition</span>
            </div>
            <span className="text-sm text-[#737373] capitalize">{overview.nutritionStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getStatusColor(overview.activityStatus) }}
              />
              <span className="text-sm">Activity</span>
            </div>
            <span className="text-sm text-[#737373] capitalize">{overview.activityStatus}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-8">
        <FormContainer title="System Settings">
          <SelectOptionGroup
            label="Activity Level"
            value={activityLevel}
            onChange={(value) => setActivityLevel(value as 'low' | 'moderate' | 'high')}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'high', label: 'High' },
            ]}
          />
          <SelectOptionGroup
            label="Eating Pattern"
            value={eatingPattern}
            onChange={(value) => setEatingPattern(value as 'light' | 'balanced' | 'heavy')}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'heavy', label: 'Heavy' },
            ]}
          />
          <InputField
            label="Typical Sleep"
            value={typicalSleepHours}
            onChange={setTypicalSleepHours}
            type="number"
            unit="hours"
          />
          <ActionButton
            onClick={handleUpdateProfile}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Updating...' : 'Update Profile'}
          </ActionButton>
        </FormContainer>
      </div>
    </div>
  );
}
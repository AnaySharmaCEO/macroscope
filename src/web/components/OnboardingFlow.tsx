/**
 * MACROSCOPE PERFORMANCE OS - ONBOARDING FLOW
 * Multi-step onboarding process
 */

import { useState } from 'react';
import { useProfile } from '../../core/hooks';
import { FormContainer } from '../ui/components/FormContainer';
import { InputField } from '../ui/components/InputField';
import { SelectOptionGroup } from '../ui/components/SelectOptionGroup';
import { ActionButton } from '../ui/components/ActionButton';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { initializeProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Agreements
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Step 2: Basic Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyfatPercentage, setBodyfatPercentage] = useState('');
  const [stepTarget, setStepTarget] = useState('8000');

  // Step 3: Baseline Inputs
  const [goal, setGoal] = useState<'maintain' | 'improve' | 'lose' | 'gain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [eatingPattern, setEatingPattern] = useState<'light' | 'balanced' | 'heavy'>('balanced');
  const [typicalSleepHours, setTypicalSleepHours] = useState('');
  const [goalTimelineWeeks, setGoalTimelineWeeks] = useState('12');

  const handleNext = () => {
    if (step === 1 && agreedToTerms) {
      setStep(2);
    } else if (step === 2 && name && age && height && weight && stepTarget) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    if (!typicalSleepHours) return;

    try {
      setSubmitting(true);
      await initializeProfile({
        name,
        stepTarget: Number(stepTarget),
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        bodyfatPercentage: bodyfatPercentage ? Number(bodyfatPercentage) : undefined,
        goal,
        activityLevel,
        eatingPattern,
        typicalSleepHours: Number(typicalSleepHours),
        goalTimelineWeeks: Number(goalTimelineWeeks) || 12,
      });
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl tracking-tight mb-2">MacroScope</h1>
          <p className="text-sm text-[#737373] tracking-wide">
            PERFORMANCE OS
          </p>
          <p className="text-sm text-[#737373] mt-4">
            Initialize your system to begin monitoring
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 ${step >= 1 ? 'bg-[#3b82f6]' : 'bg-[#262626]'}`} />
          <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#3b82f6]' : 'bg-[#262626]'}`} />
          <div className={`flex-1 h-1 ${step >= 3 ? 'bg-[#3b82f6]' : 'bg-[#262626]'}`} />
        </div>

        {/* Step 1: Agreements */}
        {step === 1 && (
          <FormContainer title="System Initialization">
            <div className="space-y-6">
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <h3 className="text-sm font-medium text-blue-200 mb-2">Early Access Notice</h3>
                <p className="text-xs text-blue-300 leading-relaxed">
                  MacroScope Performance OS is currently in early access. By proceeding, you acknowledge that features may change, and the system is still being actively developed.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreements"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-900"
                />
                <label htmlFor="agreements" className="text-sm text-zinc-400">
                  I accept the Terms of Service and Privacy Policy, and understand that my health data will be processed to provide insights.
                </label>
              </div>

              <ActionButton
                onClick={handleNext}
                disabled={!agreedToTerms}
                fullWidth
              >
                Accept & Continue
              </ActionButton>
            </div>
          </FormContainer>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <FormContainer title="Basic Information">
            <p className="text-sm text-[#737373] mb-4">
              Tell us about yourself to get started
            </p>
            <InputField
              label="Display Name"
              value={name}
              onChange={v => setName(String(v))}
              type="text"
              placeholder="e.g., Alex"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <InputField
                  label="Age"
                  value={age}
                  onChange={v => setAge(String(v))}
                  type="number"
                  placeholder="e.g., 24"
                />
              </div>
              <div className="flex-1">
                <SelectOptionGroup
                  label="Gender"
                  value={gender}
                  onChange={(value) => setGender(value as any)}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <InputField
                  label="Height"
                  value={height}
                  onChange={v => setHeight(String(v))}
                  type="number"
                  unit="cm"
                  placeholder="175"
                />
              </div>
              <div className="flex-1">
                <InputField
                  label="Weight"
                  value={weight}
                  onChange={v => setWeight(String(v))}
                  type="number"
                  unit="kg"
                  placeholder="70"
                />
              </div>
            </div>
            <InputField
              label="Body Fat (optional)"
              value={bodyfatPercentage}
              onChange={v => setBodyfatPercentage(String(v))}
              type="number"
              unit="%"
              placeholder="e.g., 18"
            />
            <InputField
              label="Daily Step Target"
              value={stepTarget}
              onChange={v => setStepTarget(String(v))}
              type="number"
              unit="steps"
              placeholder="e.g., 10000"
            />
            <div className="flex gap-3 mt-6">
              <ActionButton
                onClick={() => setStep(1)}
                variant="secondary"
                fullWidth
              >
                Back
              </ActionButton>
              <ActionButton
                onClick={handleNext}
                disabled={!name || !age || !height || !weight || !stepTarget}
                fullWidth
              >
                Continue
              </ActionButton>
            </div>
          </FormContainer>
        )}

        {/* Step 3: Baseline Inputs */}
        {step === 3 && (
          <FormContainer title="Baseline Patterns">
            <p className="text-sm text-[#737373] mb-4">
              Help us understand your current patterns
            </p>
            <SelectOptionGroup
              label="Primary Goal"
              value={goal}
              onChange={(value) => setGoal(value as 'maintain' | 'improve' | 'lose' | 'gain')}
              options={[
                { value: 'maintain', label: 'Maintain' },
                { value: 'improve', label: 'Improve Performance' },
                { value: 'lose', label: 'Lose Weight' },
                { value: 'gain', label: 'Gain Weight' },
              ]}
            />
            <SelectOptionGroup
              label="Activity Level"
              value={activityLevel}
              onChange={(value) => setActivityLevel(value as 'low' | 'moderate' | 'high')}
              options={[
                { value: 'low', label: 'Low - Mostly sedentary' },
                { value: 'moderate', label: 'Moderate - Some activity' },
                { value: 'high', label: 'High - Very active' },
              ]}
            />
            <SelectOptionGroup
              label="Eating Pattern"
              value={eatingPattern}
              onChange={(value) => setEatingPattern(value as 'light' | 'balanced' | 'heavy')}
              options={[
                { value: 'light', label: 'Light - Smaller meals' },
                { value: 'balanced', label: 'Balanced - Regular meals' },
                { value: 'heavy', label: 'Heavy - Larger meals' },
              ]}
            />
            <InputField
              label="Typical Sleep Duration"
              value={typicalSleepHours}
              onChange={(v) => setTypicalSleepHours(String(v))}
              type="number"
              unit="hours"
              placeholder="e.g., 7.5"
            />
            <InputField
              label="Goal Timeline"
              value={goalTimelineWeeks}
              onChange={(v) => setGoalTimelineWeeks(String(v))}
              type="number"
              unit="weeks"
              placeholder="12"
            />
            <div className="flex gap-3 mt-6">
              <ActionButton
                onClick={() => setStep(2)}
                variant="secondary"
                fullWidth
              >
                Back
              </ActionButton>
              <ActionButton
                onClick={handleComplete}
                disabled={submitting || !typicalSleepHours || !goalTimelineWeeks}
                fullWidth
              >
                {submitting ? 'Setting up...' : 'Complete Setup'}
              </ActionButton>
            </div>
          </FormContainer>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-[#737373] mt-8">
          Step {step} of 3
        </div>
      </div>
    </div>
  );
}
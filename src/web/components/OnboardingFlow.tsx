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
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-1)',
      }}
    >
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-semibold text-[var(--text-1)] tracking-tight mb-2">MacroScope</h1>
          <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">
            Performance OS
          </p>
          <p className="text-sm text-[var(--text-2)] mt-2">
            Initialize your system to begin monitoring
          </p>
        </div>

        {/* Step indicators: current = var(--accent), done = var(--good), future = var(--surface-2) */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => {
            let barBg = 'var(--surface-2)';
            if (step > s) barBg = 'var(--good)';
            else if (step === s) barBg = 'var(--accent)';
            return (
              <div 
                key={s} 
                className="flex-1 h-1 rounded-full transition-colors duration-300"
                style={{ backgroundColor: barBg }}
              />
            );
          })}
        </div>

        {/* Step 1: Agreements */}
        {step === 1 && (
          <FormContainer title="System initialization">
            <div className="space-y-6">
              <div 
                className="p-4 border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <h3 className="text-sm font-semibold text-[var(--text-1)] mb-1">Early access notice</h3>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  MacroScope Performance OS is designed to guide your daily performance habits through data-driven baseline monitoring. Features and models are actively updated.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreements"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded cursor-pointer accent-[var(--accent)]"
                />
                <label htmlFor="agreements" className="text-xs text-[var(--text-2)] cursor-pointer leading-relaxed">
                  I accept the Terms of Service and Privacy Policy, and agree that health and activity inputs will be processed to generate performance insights.
                </label>
              </div>

              <div className="pt-2">
                <ActionButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={!agreedToTerms}
                  fullWidth
                >
                  Accept & continue
                </ActionButton>
              </div>
            </div>
          </FormContainer>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <FormContainer title="Basic information">
            <p className="text-xs text-[var(--text-2)] mb-4">
              Enter your physical baseline to calibrate tracking models
            </p>
            <InputField
              label="Display name"
              value={name}
              onChange={v => setName(String(v))}
              type="text"
              placeholder="e.g., Alex"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Age"
                value={age}
                onChange={v => setAge(String(v))}
                type="number"
                placeholder="e.g., 24"
              />
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
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Height"
                value={height}
                onChange={v => setHeight(String(v))}
                type="number"
                unit="cm"
                placeholder="175"
              />
              <InputField
                label="Weight"
                value={weight}
                onChange={v => setWeight(String(v))}
                type="number"
                unit="kg"
                placeholder="70"
              />
            </div>
            <InputField
              label="Body fat percentage (optional)"
              value={bodyfatPercentage}
              onChange={v => setBodyfatPercentage(String(v))}
              type="number"
              unit="%"
              placeholder="e.g., 18"
            />
            <InputField
              label="Daily step target"
              value={stepTarget}
              onChange={v => setStepTarget(String(v))}
              type="number"
              unit="steps"
              placeholder="e.g., 10000"
            />
            <div className="flex gap-3 pt-4">
              <ActionButton
                variant="ghost"
                onClick={() => setStep(1)}
                fullWidth
              >
                Back
              </ActionButton>
              <ActionButton
                variant="primary"
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
          <FormContainer title="Baseline patterns">
            <p className="text-xs text-[var(--text-2)] mb-4">
              Select current baseline habits to configure recommendation engines
            </p>
            <SelectOptionGroup
              label="Primary goal"
              value={goal}
              onChange={(value) => setGoal(value as 'maintain' | 'improve' | 'lose' | 'gain')}
              options={[
                { value: 'maintain', label: 'Maintain' },
                { value: 'improve', label: 'Improve performance' },
                { value: 'lose', label: 'Lose weight' },
                { value: 'gain', label: 'Gain weight' },
              ]}
            />
            <SelectOptionGroup
              label="Activity level"
              value={activityLevel}
              onChange={(value) => setActivityLevel(value as 'low' | 'moderate' | 'high')}
              options={[
                { value: 'low', label: 'Low - Mostly sedentary' },
                { value: 'moderate', label: 'Moderate - Some activity' },
                { value: 'high', label: 'High - Very active' },
              ]}
            />
            <SelectOptionGroup
              label="Eating pattern"
              value={eatingPattern}
              onChange={(value) => setEatingPattern(value as 'light' | 'balanced' | 'heavy')}
              options={[
                { value: 'light', label: 'Light - Smaller meals' },
                { value: 'balanced', label: 'Balanced - Regular meals' },
                { value: 'heavy', label: 'Heavy - Larger meals' },
              ]}
            />
            <InputField
              label="Typical sleep duration"
              value={typicalSleepHours}
              onChange={(v) => setTypicalSleepHours(String(v))}
              type="number"
              unit="hours"
              placeholder="e.g., 7.5"
            />
            <InputField
              label="Goal timeline"
              value={goalTimelineWeeks}
              onChange={(v) => setGoalTimelineWeeks(String(v))}
              type="number"
              unit="weeks"
              placeholder="12"
            />
            <div className="flex gap-3 pt-4">
              <ActionButton
                variant="ghost"
                onClick={() => setStep(2)}
                fullWidth
              >
                Back
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleComplete}
                disabled={submitting || !typicalSleepHours || !goalTimelineWeeks}
                fullWidth
              >
                {submitting ? 'Setting up...' : 'Complete setup'}
              </ActionButton>
            </div>
          </FormContainer>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-[var(--text-3)]">
          Step {step} of 3
        </div>
      </div>
    </div>
  );
}
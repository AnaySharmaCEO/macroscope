/**
 * MACROSCOPE PERFORMANCE OS - ACTIVITY PAGE
 * Activity system monitoring and control
 * Structured faithfully to the 2-column desktop architecture from macroscope-desktop-system-v2.html
 */

import { useState } from 'react';
import { useActivitySystem } from '../../core/hooks';
import { useSettings } from '../../core/hooks/useSettings';
import { InputField } from '../ui/components/InputField';
import { SelectOptionGroup } from '../ui/components/SelectOptionGroup';
import { ActionButton } from '../ui/components/ActionButton';

export function ActivityPage() {
  const { activityData, status, signals, insights, loading, error, logWorkout, updateSteps } = useActivitySystem();
  const { settings } = useSettings();

  // Workout form state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [workoutIntensity, setWorkoutIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [submittingWorkout, setSubmittingWorkout] = useState(false);

  // Steps form state
  const [steps, setSteps] = useState<number>(0);
  const [submittingSteps, setSubmittingSteps] = useState(false);

  const handleLogWorkout = async () => {
    if (!workoutName || !workoutDuration) return;

    try {
      setSubmittingWorkout(true);
      await logWorkout(new Date(), {
        name: workoutName,
        duration: Number(workoutDuration),
        intensity: workoutIntensity,
        timestamp: new Date(),
      });

      // Reset form
      setWorkoutName('');
      setWorkoutDuration(0);
      setWorkoutIntensity('moderate');
    } catch (err) {
      console.error('Failed to log workout:', err);
    } finally {
      setSubmittingWorkout(false);
    }
  };

  const handleUpdateSteps = async () => {
    if (!steps) return;

    try {
      setSubmittingSteps(true);
      await updateSteps(new Date(), Number(steps));

      // Reset form
      setSteps(0);
    } catch (err) {
      console.error('Failed to update steps:', err);
    } finally {
      setSubmittingSteps(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--text-3)]">Loading activity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--danger)]">Error: {error}</div>
      </div>
    );
  }

  // Calculate metrics
  const avgSteps = activityData.length > 0
    ? activityData.reduce((sum, d) => sum + d.steps, 0) / activityData.length
    : 0;

  const totalWorkouts = activityData.reduce((sum, d) => sum + d.workouts.length, 0);

  const todayData = activityData.length > 0 ? activityData[activityData.length - 1] : null;
  const todaySteps = todayData?.steps || 0;
  const todayWorkouts = todayData?.workouts || [];
  const todayWorkoutCount = todayWorkouts.length;
  const todayWorkoutDuration = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);

  // Get target from settings
  const stepsTarget = settings?.activityTarget || 10000;
  const stepsProgress = (todaySteps / stepsTarget) * 100;

  // Status color mapping
  const getStatusBadge = (s: string) => {
    switch (s.toLowerCase()) {
      case 'stable':
        return { bg: 'var(--good-soft)', text: 'var(--good)', label: 'Stable' };
      case 'imbalanced':
        return { bg: 'var(--warn-soft)', text: 'var(--warn)', label: 'Imbalanced' };
      case 'low':
        return { bg: 'var(--live-soft)', text: 'var(--live)', label: 'Needs attention' };
      default:
        return { bg: 'var(--good-soft)', text: 'var(--good)', label: 'Stable' };
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--text)',
              lineHeight: '1.2',
            }}
            className="mb-1"
          >
            Activity system
          </h1>
          <p 
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-2)',
            }}
          >
            Monitor step pacing, workout stimulus, and movement consistency
          </p>
        </div>

        {/* System State Pill */}
        <span
          style={{
            backgroundColor: statusBadge.bg,
            color: statusBadge.text,
            borderRadius: 'var(--radius-pill)',
            padding: '5px 12px',
            fontSize: '11.5px',
            fontWeight: 'var(--weight-bold)',
          }}
          className="inline-flex items-center gap-1.5"
        >
          <span>●</span>
          <span>{statusBadge.label}</span>
        </span>
      </div>

      {/* 2-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
        {/* LEFT COLUMN: Steps Hero, Workout Logger, & Quick Steps Entry */}
        <div className="flex flex-col gap-5">
          {/* Dominant Hero Card: Steps */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)',
              padding: '28px 30px',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div 
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-3)',
                    fontWeight: 'var(--weight-semibold)',
                    marginBottom: '4px',
                  }}
                >
                  Today's steps
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '36px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                      lineHeight: '1.1',
                    }}
                  >
                    {todaySteps.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '18px', color: 'var(--text-3)' }}>
                    / {stepsTarget.toLocaleString()}
                  </span>
                </div>
              </div>

              {todaySteps >= stepsTarget ? (
                <span 
                  style={{
                    backgroundColor: 'var(--good-soft)',
                    color: 'var(--good)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 'var(--weight-bold)',
                  }}
                >
                  Target hit
                </span>
              ) : (
                <span 
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 'var(--weight-bold)',
                  }}
                >
                  In progress
                </span>
              )}
            </div>

            {/* Tokenized progress bar */}
            <div 
              style={{
                backgroundColor: 'var(--progress-track)',
                height: '6px',
                borderRadius: 'var(--radius-pill)',
              }}
              className="overflow-hidden mb-6"
            >
              <div 
                style={{ 
                  width: `${Math.min(stepsProgress, 100)}%`,
                  backgroundColor: stepsProgress >= 100 ? 'var(--good)' : 'var(--accent)',
                  borderRadius: 'var(--radius-pill)',
                }}
                className="h-full transition-all duration-500 ease-out"
              />
            </div>

            {/* Primary Signal Box */}
            {signals.length > 0 && (
              <div 
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  fontSize: '13.5px',
                  color: 'var(--text-2)',
                  lineHeight: '1.55',
                }}
                className="border"
              >
                {signals[0].message}
              </div>
            )}
          </div>

          {/* Form Card: Log Workout */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)',
              padding: '28px 30px',
            }}
          >
            <div 
              style={{
                fontSize: '13.5px',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text)',
                marginBottom: '18px',
              }}
            >
              Log workout
            </div>

            <div className="space-y-4">
              <InputField
                label="Workout name"
                value={workoutName}
                onChange={setWorkoutName}
                placeholder="e.g., Morning run, Heavy lifting"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Duration"
                  value={workoutDuration}
                  onChange={setWorkoutDuration}
                  type="number"
                  unit="min"
                />

                <SelectOptionGroup
                  label="Intensity"
                  value={workoutIntensity}
                  onChange={(value) => setWorkoutIntensity(value as 'low' | 'moderate' | 'high')}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </div>

              <div className="pt-2">
                <ActionButton
                  variant="primary"
                  onClick={handleLogWorkout}
                  disabled={submittingWorkout || !workoutName || !workoutDuration}
                  fullWidth
                >
                  {submittingWorkout ? 'Logging workout...' : 'Log workout'}
                </ActionButton>
              </div>
            </div>
          </div>

          {/* Quick Steps Update Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)',
              padding: '22px 24px',
            }}
          >
            <div 
              style={{
                fontSize: '13px',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text)',
                marginBottom: '14px',
              }}
            >
              Update step count
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <InputField
                  label="Current steps"
                  value={steps}
                  onChange={setSteps}
                  type="number"
                  placeholder="e.g., 10000"
                />
              </div>
              <ActionButton
                variant="ghost"
                onClick={handleUpdateSteps}
                disabled={submittingSteps || !steps}
                className="w-full sm:w-auto"
              >
                {submittingSteps ? 'Updating...' : 'Sync steps'}
              </ActionButton>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Workout History, Weekly Insights, & Cross-System Card */}
        <div className="flex flex-col gap-4">
          {/* 1. Today's Activity Snapshot */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div 
              style={{
                fontSize: '12px',
                color: 'var(--text-3)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: '14px',
              }}
            >
              Today's activity output
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                }}
                className="border"
              >
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '4px' }}>
                  Workouts
                </div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {todayWorkoutCount}
                </div>
              </div>

              <div 
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                }}
                className="border"
              >
                <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '4px' }}>
                  Total duration
                </div>
                <div className="flex items-baseline gap-1">
                  <span 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                    }}
                  >
                    {todayWorkoutDuration}
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>min</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Weekly Consistency Insight */}
          {insights && (
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '22px 24px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '8px',
                }}
              >
                Weekly movement cadence
              </div>

              <p 
                style={{
                  fontSize: '13px',
                  color: 'var(--text-2)',
                  lineHeight: '1.55',
                  marginBottom: '14px',
                }}
              >
                {insights.insight}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div 
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                  className="border"
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '3px' }}>
                    7-day avg steps
                  </div>
                  <div 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                    }}
                  >
                    {Math.round(avgSteps).toLocaleString()}
                  </div>
                </div>

                <div 
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                  className="border"
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '3px' }}>
                    Active days
                  </div>
                  <div 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                    }}
                  >
                    {insights.workout_days} / {insights.days}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Cross-System Recovery Connection */}
          <div 
            style={{
              background: 'linear-gradient(160deg, var(--surface), var(--surface-2))',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div 
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: '8px',
              }}
            >
              Stimulus & recovery loop
            </div>
            <p 
              style={{
                fontSize: '13.5px',
                color: 'var(--text-2)',
                lineHeight: '1.55',
              }}
            >
              Hitting 8,000+ steps on days after short sleep activates lymphatic flushing and prevents evening lethargy, resetting your next sleep window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
/**
 * MACROSCOPE PERFORMANCE OS - ACTIVITY PAGE
 * Activity system monitoring and control
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
        <div className="text-sm text-[#737373]">Loading activity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#dc2626]">Error: {error}</div>
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

  // Calculate progress bar color (gradient from red to yellow to green)
  const getProgressColor = (progress: number) => {
    if (progress < 50) {
      // Red to Yellow (0-50%)
      const ratio = progress / 50;
      const r = 239; // #ef4444 red
      const g = Math.round(68 + (234 - 68) * ratio); // Transition to #f59e0b yellow
      const b = 68;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Green (50-100%)
      const ratio = (progress - 50) / 50;
      const r = Math.round(245 - (245 - 16) * ratio); // #f59e0b to #10b981
      const g = Math.round(158 + (185 - 158) * ratio);
      const b = Math.round(11 + (129 - 11) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return '#10b981';
      case 'imbalanced': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#737373';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl tracking-tight mb-2">Activity System</h1>
        <div className="text-sm text-[#737373]">Monitor movement and workouts</div>
      </div>

      {/* System State */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: getStatusColor(status) }}
          />
          <span className="text-sm uppercase tracking-wider text-[#737373]">
            {status}
          </span>
        </div>
      </div>

      {/* PRIMARY METRIC - STEPS (DOMINANT) */}
      <div className="mb-12">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-3">STEPS</div>
        <div className="tracking-tight mb-1 text-[40px]">
          {todaySteps.toLocaleString()}<span className="text-3xl text-[#737373]"> / {stepsTarget.toLocaleString()}</span>
        </div>
        {/* Color gradient progress bar */}
        <div className="mt-4 h-1 bg-[#262626] rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${Math.min(stepsProgress, 100)}%`,
              backgroundColor: getProgressColor(stepsProgress)
            }}
          />
        </div>
      </div>

      {/* WORKOUT SUMMARY */}
      {todayData && (
        <div className="mb-16">
          <div className="tracking-wider uppercase text-[#737373] mb-3 text-[24px]">TODAY'S ACTIVITY</div>
          <div className="flex gap-8">
            <div>
              <span className="text-xl text-[#737373]">Workouts: </span>
              <span className="text-2xl">{todayWorkoutCount}</span>
            </div>
            <div>
              <span className="text-xl text-[#737373]">Duration: </span>
              <span className="text-2xl">{todayWorkoutDuration} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Signal */}
      {signals.length > 0 && (
        <div className="mb-16">
          <div className="text-xl leading-relaxed">
            {signals[0].message}
          </div>
        </div>
      )}
      {signals.length === 0 && (
        <div className="mb-16 text-sm text-[#737373]">
          Log a few workouts and step days to unlock stronger activity insights.
        </div>
      )}

      {insights && (
        <div className="mb-16">
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-3">WEEKLY INSIGHT</div>
          <div className="text-sm text-[#e5e5e5]">{insights.insight}</div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 border border-[#262626] rounded bg-[#0a0a0a]">
              <div className="text-[#737373] text-xs uppercase tracking-wider">Avg Steps</div>
              <div className="text-lg mt-1">{Math.round(insights.avg_steps).toLocaleString()}</div>
            </div>
            <div className="p-4 border border-[#262626] rounded bg-[#0a0a0a]">
              <div className="text-[#737373] text-xs uppercase tracking-wider">Workout Days</div>
              <div className="text-lg mt-1">{insights.workout_days} / {insights.days}</div>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY ACTION - LOG WORKOUT */}
      <div className="mb-12">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">LOG WORKOUT</div>
        <div className="space-y-4">
          <InputField
            label="Workout Name"
            value={workoutName}
            onChange={setWorkoutName}
            placeholder="e.g., Morning Run"
          />
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
          <ActionButton
            onClick={handleLogWorkout}
            disabled={submittingWorkout || !workoutName || !workoutDuration}
            fullWidth
          >
            {submittingWorkout ? 'Logging...' : 'Log Workout'}
          </ActionButton>
        </div>
      </div>

      {/* SECONDARY ACTION - UPDATE STEPS */}
      <div className="mb-16 pt-8 border-t border-[#262626]">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">UPDATE STEPS</div>
        <div className="space-y-4">
          <InputField
            label="Steps"
            value={steps}
            onChange={setSteps}
            type="number"
            placeholder="e.g., 10000"
          />
          <ActionButton
            onClick={handleUpdateSteps}
            disabled={submittingSteps || !steps}
            fullWidth
          >
            {submittingSteps ? 'Updating...' : 'Update Steps'}
          </ActionButton>
        </div>
      </div>

      {/* SECONDARY METRICS */}
      <div className="mb-12 pt-8 border-t border-[#262626]">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">SECONDARY METRICS</div>
        <div className="flex gap-12">
          <div>
            <div className="text-sm text-[#737373] mb-1">Avg Steps (7d)</div>
            <div className="text-2xl">{Math.round(avgSteps).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-[#737373] mb-1">Total Workouts</div>
            <div className="text-2xl">{totalWorkouts}</div>
          </div>
        </div>
      </div>

      {/* Additional Signals */}
      {signals.length > 1 && (
        <div className="mb-12">
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-3">ADDITIONAL SIGNALS</div>
          <div className="space-y-2">
            {signals.slice(1).map((signal) => (
              <div key={signal.id} className="text-sm text-[#737373]">
                {signal.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
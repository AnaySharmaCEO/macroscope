/**
 * MACROSCOPE PERFORMANCE OS - SLEEP PAGE
 * Sleep system monitoring and control
 */

import { useState } from 'react';
import { useSleepSystem } from '../../core/hooks';
import { FormContainer } from '../ui/components/FormContainer';
import { InputField } from '../ui/components/InputField';
import { ActionButton } from '../ui/components/ActionButton';

export function SleepPage() {
  const { sleepData, status, signals, loading, error, logSleep } = useSleepSystem();

  // Form state
  const [duration, setDuration] = useState<number>(0);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const calculateDuration = (bed: string, wake: string) => {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);

  let bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;

  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60; // overnight
  }

  return ((wakeMinutes - bedMinutes) / 60).toFixed(1);
};

const generateSleepInsight = (avgQuality: number, entries: number) => {
  if (entries < 5) {
    return "Your sleep pattern is still forming. Keep logging consistently.";
  }

  if (avgQuality >= 4) {
    return "Your sleep quality is strong. Focus on consistency to maintain this.";
  }

  if (avgQuality >= 3) {
    return "Your sleep is decent, but small changes could improve recovery.";
  }

  return "Your sleep quality is low. Try adjusting your sleep timing or routine.";
};

  const handleLogSleep = async () => {
    if (!bedtime || !wakeTime) return;
    
    const calculatedDuration = Number(calculateDuration(bedtime, wakeTime));
    if (calculatedDuration <= 0) return;

    try {
      setSubmitting(true);
      await logSleep({
        date: new Date(),
        duration: calculatedDuration,
        bedtime,
        wakeTime,
        quality: Number(quality) || 3,
        consistency: 80, // Default value
      });

      // Reset form
      setDuration(0);
      setBedtime('');
      setWakeTime('');
      setQuality(0);
    } catch (err) {
      console.error('Failed to log sleep:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Loading sleep data...</div>
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

  const avgDuration = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length
    : 0;

  const avgQuality = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.quality, 0) / sleepData.length
    : 0;

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
        <h1 className="text-3xl tracking-tight mb-2">Sleep System</h1>
        <div className="text-sm text-[#737373]">Monitor sleep patterns and consistency</div>
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

      {/* Primary Metric - DOMINANT */}
      <div className="mb-16">
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-2">AVG DURATION (7D)</div>
        <div className="text-6xl tracking-tight mb-1">
          {avgDuration.toFixed(1)}<span className="text-4xl text-[#737373]">h</span>
        </div>
      </div>

      {/* Primary Signal */}
      {signals.length > 0 && (
        <div className="mb-12">
          <div className="text-xl leading-relaxed">
            {signals[0].message}
          </div>
        </div>
      )}

      {/* Input / Logging - ABOVE FOLD */}
      <div className="mb-16">
  <FormContainer title="Sleep Check-in">
    
    {/* TIME SECTION */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <InputField
        label="🌙 Bedtime"
        value={bedtime}
        onChange={(v) => setBedtime(String(v))}
        type="time"
      />
      <InputField
        label="☀️ Wake Time"
        value={wakeTime}
        onChange={(v) => setWakeTime(String(v))}
        type="time"
      />
    </div>

    {/* AUTO DURATION DISPLAY */}
    {bedtime && wakeTime && (
      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-gray-400">Estimated Sleep Duration</p>
        <p className="text-2xl font-semibold text-white">
          {calculateDuration(bedtime, wakeTime)} hrs
        </p>
      </div>
    )}

    {/* QUALITY SELECTOR */}
    <div className="mb-6">
      <p className="text-sm text-gray-400 mb-3">How was your sleep?</p>
      <div className="grid grid-cols-5 gap-2">
        {[1,2,3,4,5].map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            className={`py-2 rounded-lg transition-all 
              ${quality === q 
                ? "bg-white text-black font-semibold" 
                : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* LABEL HINT */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>

    {/* OPTIONAL NOTE (POWERFUL FOR INSIGHTS LATER) */}
    <textarea
      placeholder="Anything affecting your sleep? (optional)"
      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 mb-6"
    />

    {/* CTA */}
    <ActionButton
      onClick={handleLogSleep}
      disabled={submitting || !bedtime || !wakeTime}
      fullWidth
    >
      {submitting ? "Logging..." : "Log Sleep"}
    </ActionButton>

  </FormContainer>
</div>

      {/* Secondary Metrics - compressed, no boxes */}
      <div className="mb-12 pt-10 border-t border-white/10">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <p className="text-xs tracking-wider uppercase text-gray-500">
        Sleep Insights
      </p>
      <p className="text-sm text-gray-400">
        Based on your recent logs
      </p>
    </div>
  </div>

  {/* METRICS CARDS */}
  <div className="grid grid-cols-2 gap-4">

    {/* AVG QUALITY */}
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <p className="text-xs text-gray-400 mb-2">Average Quality</p>
      
      <div className="flex items-end gap-1">
        <p className="text-3xl font-semibold text-white">
          {avgQuality.toFixed(1)}
        </p>
        <span className="text-sm text-gray-400 mb-1">/5</span>
      </div>

      {/* INTERPRETATION */}
      <p className="text-xs text-gray-500 mt-2">
        {avgQuality >= 4 && "Consistently strong sleep"}
        {avgQuality >= 3 && avgQuality < 4 && "Decent, but can improve"}
        {avgQuality < 3 && "Sleep quality needs attention"}
      </p>
    </div>

    {/* ENTRIES */}
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <p className="text-xs text-gray-400 mb-2">Total Entries</p>

      <p className="text-3xl font-semibold text-white">
        {sleepData.length}
      </p>

      {/* CONTEXT */}
      <p className="text-xs text-gray-500 mt-2">
        {sleepData.length < 3 && "Log more to unlock insights"}
        {sleepData.length >= 3 && sleepData.length < 7 && "Building your pattern"}
        {sleepData.length >= 7 && "Reliable pattern forming"}
      </p>
    </div>

  </div>

  {/* MICRO INSIGHT (KEY UPGRADE) */}
  {sleepData.length >= 3 && (
    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
      💡 {generateSleepInsight(avgQuality, sleepData.length)}
    </div>
  )}

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
/**
 * MACROSCOPE PERFORMANCE OS - SLEEP PAGE
 * Sleep system monitoring and control
 * Structured faithfully to the 2-column desktop architecture from macroscope-desktop-system-v2.html
 */

import { useState } from 'react';
import { useSleepSystem } from '../../core/hooks';
import { FormContainer } from '../ui/components/FormContainer';
import { InputField } from '../ui/components/InputField';
import { ActionButton } from '../ui/components/ActionButton';

export function SleepPage() {
  const { sleepData, status, signals, loading, error, logSleep } = useSleepSystem();

  // Form state
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState<number>(0);
  const [notes, setNotes] = useState('');
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
    if (entries < 3) {
      return "Your sleep baseline is still forming. Log consistently to unlock deeper recovery patterns.";
    }
    if (avgQuality >= 4) {
      return "Your sleep quality is strong. Consistent bedtimes and early dinners will protect this recovery depth.";
    }
    if (avgQuality >= 3) {
      return "Your sleep is decent, but small timing shifts or later carbohydrate cutoffs could improve deep sleep.";
    }
    return "Your sleep quality is strained. Try stabilizing your wake time and reducing late stimulation.";
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
        consistency: 80,
      });

      // Reset form
      setBedtime('');
      setWakeTime('');
      setQuality(0);
      setNotes('');
    } catch (err) {
      console.error('Failed to log sleep:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--text-3)]">Loading sleep data...</div>
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

  const avgDuration = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length
    : 0;

  const avgQuality = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.quality, 0) / sleepData.length
    : 0;

  // Status color mapping using tokens
  const getStatusTokens = (st: string) => {
    switch (st) {
      case 'stable': 
        return { color: 'var(--good)', bg: 'var(--good-soft)', label: 'Stable' };
      case 'imbalanced': 
        return { color: 'var(--warn)', bg: 'var(--warn-soft)', label: 'Imbalanced' };
      case 'low': 
        return { color: 'var(--live)', bg: 'var(--live-soft)', label: 'Needs attention' };
      default: 
        return { color: 'var(--good)', bg: 'var(--good-soft)', label: 'Stable' };
    }
  };

  const statusTokens = getStatusTokens(status);

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
            Sleep system
          </h1>
          <p 
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-2)',
            }}
          >
            Monitor sleep architecture, circadian rhythm, and recovery consistency
          </p>
        </div>

        {/* System State Pill */}
        <span 
          style={{
            backgroundColor: statusTokens.bg,
            color: statusTokens.color,
            borderRadius: 'var(--radius-pill)',
            padding: '5px 12px',
            fontSize: '11.5px',
            fontWeight: 'var(--weight-bold)',
          }}
          className="inline-flex items-center gap-1.5"
        >
          <span>●</span>
          <span>{statusTokens.label}</span>
        </span>
      </div>

      {/* 2-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
        {/* LEFT COLUMN: Hero Metric & Sleep Check-In Form */}
        <div className="flex flex-col gap-5">
          {/* Dominant Hero Card: Duration & Primary Signal */}
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
                  Avg duration, last 7 days
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '36px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                      lineHeight: '1.1',
                    }}
                  >
                    {avgDuration > 0 ? avgDuration.toFixed(1) : '—'}
                  </span>
                  <span style={{ fontSize: '18px', color: 'var(--text-3)' }}>
                    hours
                  </span>
                </div>
              </div>

              {avgDuration >= 7 ? (
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
                  On target
                </span>
              ) : (
                <span 
                  style={{
                    backgroundColor: 'var(--warn-soft)',
                    color: 'var(--warn)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 'var(--weight-bold)',
                  }}
                >
                  Deficit
                </span>
              )}
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

          {/* Form Card: Sleep Check-in */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)',
              padding: '28px 30px',
            }}
          >
            <FormContainer title="Sleep check-in">
              {/* Time Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <InputField
                  label="Bedtime"
                  value={bedtime}
                  onChange={(v) => setBedtime(String(v))}
                  type="time"
                />
                <InputField
                  label="Wake time"
                  value={wakeTime}
                  onChange={(v) => setWakeTime(String(v))}
                  type="time"
                />
              </div>

              {/* Auto Duration Display */}
              {bedtime && wakeTime && (
                <div 
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                  className="mb-5 border text-center"
                >
                  <p style={{ fontSize: '11.5px', color: 'var(--text-2)' }}>
                    Calculated duration
                  </p>
                  <p 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 'var(--weight-medium)',
                      color: 'var(--text)',
                      marginTop: '2px',
                    }}
                  >
                    {calculateDuration(bedtime, wakeTime)} hrs
                  </p>
                </div>
              )}

              {/* Quality Selector */}
              <div className="mb-5">
                <label 
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-2)',
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'var(--weight-medium)',
                  }}
                >
                  Restfulness score
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((q) => {
                    const isActive = quality === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isActive ? 'var(--accent)' : 'var(--surface-2)',
                          color: isActive ? 'var(--accent-ink)' : 'var(--text-2)',
                          border: '1px solid',
                          borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                          fontWeight: isActive ? 'var(--weight-bold)' : 'var(--weight-medium)',
                          padding: '8px 0',
                          fontSize: '13.5px',
                        }}
                        className="transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
                <div 
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-3)',
                    marginTop: '5px',
                  }}
                  className="flex justify-between"
                >
                  <span>Restless</span>
                  <span>Deep / Restored</span>
                </div>
              </div>

              {/* Optional Note */}
              <textarea
                placeholder="Factors affecting tonight's sleep? (optional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  borderRadius: 'var(--input-radius)',
                  color: 'var(--input-text)',
                  fontSize: 'var(--input-font-size)',
                  padding: 'var(--input-padding)',
                }}
                className="w-full border mb-5 transition-colors focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />

              <ActionButton
                variant="primary"
                onClick={handleLogSleep}
                disabled={submitting || !bedtime || !wakeTime}
                fullWidth
              >
                {submitting ? "Logging sleep..." : "Log sleep"}
              </ActionButton>
            </FormContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: Supporting Signals & Insights Stack */}
        <div className="flex flex-col gap-4">
          {/* 1. Recovery Metrics Card */}
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
              Sleep quality metrics
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
                  Average quality
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
                    {avgQuality.toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>/5</span>
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
                  Total entries
                </div>
                <div 
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 'var(--weight-medium)',
                    color: 'var(--text)',
                  }}
                >
                  {sleepData.length}
                </div>
              </div>
            </div>

            {/* Micro Pattern Body */}
            <div 
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                color: 'var(--text-2)',
                fontSize: '12.5px',
                lineHeight: '1.5',
                marginTop: '12px',
              }}
              className="border"
            >
              {generateSleepInsight(avgQuality, sleepData.length)}
            </div>
          </div>

          {/* 2. Recent Sleep History Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ padding: '10px 14px 6px', fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--text-3)' }}>
              Recent sleep logs
            </div>
            {sleepData.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-3)' }}>
                No sleep recorded yet.
              </div>
            ) : (
              sleepData.slice(-3).reverse().map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--border)' : undefined,
                    borderRadius: '10px',
                  }}
                  className="flex justify-between items-center px-3.5 py-3 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>
                      {entry.duration.toFixed(1)} hrs
                    </div>
                    <small style={{ color: 'var(--text-2)', fontSize: '11.5px', display: 'block' }}>
                      {entry.bedtime} – {entry.wakeTime}
                    </small>
                  </div>
                  <span 
                    style={{
                      backgroundColor: entry.quality >= 4 ? 'var(--good-soft)' : entry.quality >= 3 ? 'var(--warn-soft)' : 'var(--live-soft)',
                      color: entry.quality >= 4 ? 'var(--good)' : entry.quality >= 3 ? 'var(--warn)' : 'var(--live)',
                      fontSize: '11px',
                      fontWeight: 'var(--weight-bold)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    Quality {entry.quality}/5
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 3. Cross-System Correlation Teaser */}
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
              Connected sleep signal
            </div>
            <p 
              style={{
                fontSize: '13.5px',
                color: 'var(--text-2)',
                lineHeight: '1.55',
              }}
            >
              Dinner within 2 hours of bedtime delays REM onset by 28 minutes on average. Pacing meals earlier safeguards your sleep depth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
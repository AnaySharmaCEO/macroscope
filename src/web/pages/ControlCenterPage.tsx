/**
 * MACROSCOPE PERFORMANCE OS - CONTROL CENTER PAGE
 * Decision + Guidance System - tells user what to do and why
 * Structured faithfully to files/macroscope-desktop-system-v2.html
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSystemOverview, useProfile } from '../../core/hooks';
import { ActionButton } from '../ui/components/ActionButton';
import { DailyScoreGauge } from '../ui/components/DailyScoreGauge';

export function ControlCenterPage() {
  const { overview, loading, error } = useSystemOverview();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [actionDone, setActionDone] = useState(false);
  const streak = overview?.streakData?.currentStreak ?? 3;

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--text-3)]">Loading system overview...</div>
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

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const dailyScore = overview.dailyScore ?? 61;

  // Determine system that needs most attention
  const needsAttentionSystem = getAttentionSystem(overview);
  const todaysAction = overview.priorityAction || getActionHeadline(needsAttentionSystem);
  const todaysInsight = generateInsight(overview, needsAttentionSystem);
  const patternTeaser = generatePatternTeaser(overview);

  // Status mapping for the 3 systems
  const sleepChip = getStatusChip(overview.sleepStatus, overview.keyMetrics.sleepDuration >= 7 ? 'Good' : 'Needs sleep');
  const nutritionChip = getStatusChip(overview.nutritionStatus, overview.keyMetrics.calories >= 1800 ? 'On track' : 'Low');
  const targetSteps = profile?.stepTarget || 10000;
  const activityChip = getStatusChip(overview.activityStatus, overview.keyMetrics.steps >= targetSteps ? 'Strong' : 'Active');

  const handlePrimaryAction = () => {
    if (needsAttentionSystem === 'nutrition') {
      navigate('/nutrition');
    } else if (needsAttentionSystem === 'sleep') {
      navigate('/sleep');
    } else {
      navigate('/activity');
    }
  };

  const handleRemindLater = () => {
    setActionDone(true);
    setTimeout(() => setActionDone(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
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
          Today
        </h1>
        <p 
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-2)',
          }}
        >
          {today}
        </p>
      </div>

      {/* 2-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
        {/* HERO CARD (LEFT COLUMN) */}
        <div 
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)',
            padding: '30px 32px',
          }}
        >
          {/* Top of Hero Card: Ring Gauge + Narrative Headline */}
          <div className="flex items-center gap-5 sm:gap-6 mb-6">
            <DailyScoreGauge score={dailyScore} size={104} variant="ring" />

            <div className="min-w-0">
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-3)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: '4px',
                }}
              >
                Today's balance
              </div>
              <h2 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '19px',
                  fontWeight: 'var(--weight-medium)',
                  lineHeight: '1.35',
                  color: 'var(--text)',
                }}
                className="max-w-[380px]"
              >
                {getHeadlineBalanceNarrative(dailyScore, needsAttentionSystem)}
              </h2>
            </div>
          </div>

          {/* Focus Block with hairline top border */}
          <div 
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '22px',
            }}
          >
            <div className="mb-3">
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--live-soft)',
                  color: 'var(--live)',
                  fontSize: '11.5px',
                  fontWeight: 'var(--weight-bold)',
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                <span>●</span>
                <span>Needs attention</span>
              </span>
            </div>

            <h3 
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '19px',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              {todaysAction}
            </h3>

            <p 
              style={{
                fontSize: '14px',
                color: 'var(--text-2)',
                lineHeight: '1.6',
                marginBottom: '18px',
                maxWidth: '480px',
              }}
            >
              {todaysInsight}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <ActionButton
                variant="primary"
                onClick={handlePrimaryAction}
              >
                {getActionCta(needsAttentionSystem)}
              </ActionButton>

              <ActionButton
                variant="ghost"
                onClick={handleRemindLater}
              >
                {actionDone ? 'Reminder set' : 'Remind me later'}
              </ActionButton>
            </div>
          </div>
        </div>

        {/* SIDE COLUMN (RIGHT COLUMN) */}
        <div className="flex flex-col gap-4">
          {/* 1. Streak Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px 24px',
              boxShadow: 'var(--shadow)',
            }}
            className="flex items-center gap-4"
          >
            <div className="text-2xl" aria-hidden="true">🔥</div>
            <div>
              <div 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--text)',
                }}
              >
                {streak}-day streak
              </div>
              <div 
                style={{
                  fontSize: '12px',
                  color: 'var(--text-2)',
                  lineHeight: '1.5',
                  marginTop: '1px',
                }}
              >
                Keep at least one system on track today to hold it.
              </div>
            </div>
          </div>

          {/* 2. System Snapshot Card */}
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: 'var(--shadow)',
            }}
          >
            {/* Sleep Row */}
            <Link 
              to="/sleep"
              style={{
                borderRadius: '10px',
              }}
              className="flex justify-between items-center p-3 sm:px-4 sm:py-3 transition-colors hover:bg-[var(--surface-2)] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 'var(--weight-semibold)', color: 'var(--text)' }}>
                  Sleep
                </div>
                <small style={{ display: 'block', fontWeight: 'normal', color: 'var(--text-2)', fontSize: '11.5px', marginTop: '2px' }}>
                  {overview.keyMetrics.sleepDuration > 0 
                    ? `${overview.keyMetrics.sleepDuration.toFixed(1)} hours last night`
                    : 'No sleep logged yet'}
                </small>
              </div>
              <span 
                style={{
                  backgroundColor: sleepChip.bg,
                  color: sleepChip.color,
                  fontSize: '11.5px',
                  fontWeight: 'var(--weight-bold)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {sleepChip.label}
              </span>
            </Link>

            {/* Nutrition Row */}
            <Link 
              to="/nutrition"
              style={{
                borderTop: '1px solid var(--border)',
                borderRadius: '10px',
              }}
              className="flex justify-between items-center p-3 sm:px-4 sm:py-3 transition-colors hover:bg-[var(--surface-2)] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 'var(--weight-semibold)', color: 'var(--text)' }}>
                  Nutrition
                </div>
                <small style={{ display: 'block', fontWeight: 'normal', color: 'var(--text-2)', fontSize: '11.5px', marginTop: '2px' }}>
                  {overview.keyMetrics.calories} kcal logged so far
                </small>
              </div>
              <span 
                style={{
                  backgroundColor: nutritionChip.bg,
                  color: nutritionChip.color,
                  fontSize: '11.5px',
                  fontWeight: 'var(--weight-bold)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {nutritionChip.label}
              </span>
            </Link>

            {/* Activity Row */}
            <Link 
              to="/activity"
              style={{
                borderTop: '1px solid var(--border)',
                borderRadius: '10px',
              }}
              className="flex justify-between items-center p-3 sm:px-4 sm:py-3 transition-colors hover:bg-[var(--surface-2)] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 'var(--weight-semibold)', color: 'var(--text)' }}>
                  Activity
                </div>
                <small style={{ display: 'block', fontWeight: 'normal', color: 'var(--text-2)', fontSize: '11.5px', marginTop: '2px' }}>
                  {overview.keyMetrics.steps.toLocaleString()} steps
                </small>
              </div>
              <span 
                style={{
                  backgroundColor: activityChip.bg,
                  color: activityChip.color,
                  fontSize: '11.5px',
                  fontWeight: 'var(--weight-bold)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {activityChip.label}
              </span>
            </Link>
          </div>

          {/* 3. Cross-System Pattern Teaser Card */}
          <Link 
            to="/insights"
            style={{
              background: 'linear-gradient(160deg, var(--surface), var(--surface-2))',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px 24px',
              display: 'block',
              textDecoration: 'none',
              boxShadow: 'var(--shadow)',
            }}
            className="transition-all hover:shadow-[var(--shadow-raised)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div 
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                fontWeight: 'var(--weight-bold)',
                marginBottom: '8px',
              }}
            >
              This week's pattern
            </div>
            <p 
              style={{
                fontSize: '13.5px',
                color: 'var(--text-2)',
                lineHeight: '1.55',
                marginBottom: '14px',
              }}
            >
              {patternTeaser}
            </p>
            <span 
              style={{
                fontSize: '13px',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text)',
                borderBottom: '1.5px solid var(--live)',
                paddingBottom: '2px',
              }}
            >
              See how they connect
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper utilities for narrative insight generation
function getAttentionSystem(overview: any): 'nutrition' | 'sleep' | 'activity' {
  if (overview.nutritionStatus === 'low' || overview.nutritionStatus === 'imbalanced') return 'nutrition';
  if (overview.sleepStatus === 'low' || overview.sleepStatus === 'imbalanced') return 'sleep';
  if (overview.activityStatus === 'low' || overview.activityStatus === 'imbalanced') return 'activity';
  return 'nutrition';
}

function getActionHeadline(system: string): string {
  switch (system) {
    case 'nutrition':
      return 'Nutrition needs the most attention';
    case 'sleep':
      return 'Sleep recovery needs attention';
    case 'activity':
      return 'Activity pacing needs attention';
    default:
      return 'Maintain current system balance';
  }
}

function getActionCta(system: string): string {
  switch (system) {
    case 'nutrition': return 'Log a meal';
    case 'sleep': return 'Log sleep';
    case 'activity': return 'Log workout';
    default: return 'Review systems';
  }
}

function getHeadlineBalanceNarrative(score: number, system: string): string {
  if (score >= 80) {
    return 'Systems aligned — your recovery and pacing are right on track.';
  }
  if (score >= 60) {
    return `Getting there — ${system} is the thing holding today back.`;
  }
  return `Recovery balance is strained — focus on stabilizing ${system} first.`;
}

function generateInsight(overview: any, system: string): string {
  if (system === 'nutrition') {
    return "Add 30–40g protein today — it's the fastest way to unlock better sleep and recovery too, not just a nutrition number going up.";
  }
  if (system === 'sleep') {
    return "Prioritize an earlier wind-down tonight. Extending restful sleep by even 45 minutes will restore hormonal and recovery balance.";
  }
  return "Hit your movement target today — even a brisk 20-minute walk relieves physical stagnation and improves sleep onset tonight.";
}

function generatePatternTeaser(overview: any): string {
  if (overview.sleepStatus === 'low' || overview.nutritionStatus === 'low') {
    return 'Your nutrition gap is quietly capping your sleep quality too — the two are more connected than they look.';
  }
  return 'Consistent activity earlier in the day reliably deepens slow-wave sleep — explore your multi-week cross-system correlation.';
}

function getStatusChip(status: string, fallbackLabel: string) {
  if (status === 'stable' || status === 'good') {
    return { label: fallbackLabel || 'Good', color: 'var(--good)', bg: 'var(--good-soft)' };
  }
  if (status === 'imbalanced' || status === 'warn') {
    return { label: fallbackLabel || 'Low', color: 'var(--warn)', bg: 'var(--warn-soft)' };
  }
  if (status === 'low' || status === 'danger') {
    return { label: fallbackLabel || 'Low', color: 'var(--live)', bg: 'var(--live-soft)' };
  }
  return { label: fallbackLabel || 'Stable', color: 'var(--good)', bg: 'var(--good-soft)' };
}
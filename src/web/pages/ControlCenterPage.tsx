/**
 * MACROSCOPE PERFORMANCE OS - CONTROL CENTER PAGE
 * Decision + Guidance System - tells user what to do and why
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { useSystemOverview, useProfile } from '../../core/hooks';
import { DailyScoreGauge } from '../ui/components/DailyScoreGauge';
import { SystemCard } from '../ui/components/SystemCard';

export function ControlCenterPage() {
  const { overview, loading, error } = useSystemOverview();
  const { profile } = useProfile();
  const [actionCompleted, setActionCompleted] = useState(false);
  const streak = overview?.streakData?.currentStreak || 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[#737373]">Loading system overview...</div>
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

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const dailyScore = overview.dailyScore;

  // Generate today's action and insight
  const todaysAction = overview.priorityAction || 'Maintain current system balance';
  const todaysInsight = generateInsight(overview);
  const systemInteraction = generateSystemInteraction(overview);

  // Calculate system card data
  const sleepProgress = overview.keyMetrics.sleepDuration >= 7 ? 85 : (overview.keyMetrics.sleepDuration / 7) * 85;
  const sleepStatus = overview.sleepStatus === 'stable' ? 'good' : overview.sleepStatus === 'low' ? 'low' : 'high';
  
  const nutritionProgress = overview.keyMetrics.calories >= 1800 ? 75 : (overview.keyMetrics.calories / 2200) * 75;
  const nutritionStatus = overview.nutritionStatus === 'stable' ? 'good' : overview.nutritionStatus === 'low' ? 'low' : 'high';
  
  const targetSteps = profile?.stepTarget || 10000;
  const activityProgress = overview.keyMetrics.steps >= targetSteps ? 80 : (overview.keyMetrics.steps / targetSteps) * 80;
  const activityStatus = overview.activityStatus === 'stable' ? 'good' : overview.activityStatus === 'low' ? 'low' : 'high';

  const handleActionComplete = () => {
    setActionCompleted(true);
    setTimeout(() => setActionCompleted(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header with streak */}
      <motion.div 
        className="mb-8 flex items-start justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl tracking-tight mb-2">Today</h1>
          <div className="text-sm text-[#737373]">{today}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-[#737373] mb-1">Streak</div>
          <motion.div 
            className="text-2xl font-light text-[#00D4FF]"
            key={streak}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#00D4FF' }}
            transition={{ duration: 0.5 }}
          >
            {streak} days
          </motion.div>
        </div>
      </motion.div>

      {/* Daily Score Gauge */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <DailyScoreGauge score={dailyScore} />
        <div className="mt-3 text-center text-xs uppercase tracking-wider text-[#737373]">
          {overview.systemStatus}
        </div>
      </motion.div>

      {/* PRIMARY: Today's Action */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">TODAY'S ACTION</div>
        <motion.div 
  className={`bg-[#1c1c1e] border border-[#2a2a2d] rounded-2xl p-6 md:p-8 transition-all duration-300
    ${actionCompleted ? 'scale-[0.98] opacity-80' : 'hover:scale-[1.01] hover:shadow-lg'}
  `}
  animate={actionCompleted ? {} : { 
    boxShadow: ['0 0 0 0 rgba(255,255,255,0.05)', '0 0 0 8px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)']
  }}
  transition={{ 
    boxShadow: { duration: 2, repeat: Infinity, repeatDelay: 1 }
  }}
>
  <div className="text-gray-100 mb-4">
    <div className="text-xl md:text-2xl font-light leading-relaxed mb-3">
      {todaysAction}
    </div>
    <div className="text-sm text-gray-400">
      {todaysInsight}
    </div>
  </div>
  
  {/* <motion.button
    onClick={handleActionComplete}
    disabled={actionCompleted}
    className={`w-full md:w-auto px-8 py-3 rounded-xl font-medium transition-all duration-300
      ${actionCompleted 
        ? 'bg-green-600 text-gray-100 cursor-not-allowed' 
        : 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:scale-95'
      }`}
    whileTap={{ scale: actionCompleted ? 1 : 0.95 }}
  >
    {actionCompleted ? '✓ Completed' : 'Mark as Done'}
  </motion.button> */}
</motion.div>
      </motion.div>

      {/* System Snapshot */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">SYSTEM SNAPSHOT</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SystemCard
            label="Sleep"
            value={`${overview.keyMetrics.sleepDuration.toFixed(1)}h`}
            status={sleepStatus}
            trend={overview.keyMetrics.sleepDuration < 7 ? 'down' : 'up'}
            progress={sleepProgress}
          />
          <SystemCard
            label="Nutrition"
            value={`${overview.keyMetrics.calories} kcal`}
            status={nutritionStatus}
            trend="stable"
            progress={nutritionProgress}
          />
          <SystemCard
            label="Activity"
            value={`${overview.keyMetrics.steps.toLocaleString()} steps`}
            status={activityStatus}
            trend={overview.keyMetrics.steps >= 8000 ? 'up' : 'down'}
            progress={activityProgress}
          />
        </div>
      </motion.div>

      {/* System Interaction Insight */}
      {systemInteraction && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <motion.div 
                className="text-[#00D4FF] text-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                ⚡
              </motion.div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#00D4FF] mb-2">System Interaction</div>
                <div className="text-sm text-[#e5e5e5]">{systemInteraction}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Signals */}
      {overview.signals.length > 0 && (
        <motion.div 
          className="pt-8 border-t border-[#262626]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-xs tracking-wider uppercase text-[#737373] mb-4">ADDITIONAL SIGNALS</div>
          <div className="space-y-3">
            {overview.signals.slice(0, 2).map((signal, index) => (
              <motion.div 
                key={signal.id} 
                className="text-sm text-[#737373] p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
              >
                {signal.message}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Generate contextual insight based on system state
 */
function generateInsight(overview: any): string {
  if (overview.sleepStatus === 'low') {
    return 'Your recent sleep inconsistency is lowering energy levels';
  }
  if (overview.activityStatus === 'low') {
    return 'Low activity is affecting recovery and system balance';
  }
  if (overview.nutritionStatus === 'low') {
    return 'Insufficient calories are impacting energy and performance';
  }
  return 'Maintaining this pattern will optimize system stability';
}

/**
 * Generate system interaction insight
 */
function generateSystemInteraction(overview: any): string | null {
  if (overview.sleepStatus === 'low' && overview.activityStatus === 'low') {
    return 'Low sleep is reducing your activity output';
  }
  if (overview.activityStatus === 'low' && overview.sleepStatus === 'imbalanced') {
    return 'Low activity days are followed by poorer sleep quality';
  }
  if (overview.nutritionStatus === 'low' && overview.activityStatus === 'low') {
    return 'Insufficient nutrition is limiting your activity capacity';
  }
  return null;
}
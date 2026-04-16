/**
 * MACROSCOPE PERFORMANCE OS - NUTRITION PANEL
 * All nutrition-specific analysis lives here
 */

import type { NutritionData, ViewMode } from '../types';
import { ViewToggle, SectionLabel, MetricCard, KvRow, PanelContent } from '../primitives';
import { PanelLayout } from '../../ui/components/PanelLayout';

interface NutritionPanelProps {
  nutritionData: NutritionData[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onBack: () => void;
}

export function NutritionPanel({
  nutritionData,
  viewMode,
  setViewMode,
  onBack
}: NutritionPanelProps) {
  const latestEntry = nutritionData.length > 0 ? nutritionData[nutritionData.length - 1] : null;

  // Calculate 7-day averages
  const avgCalories = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum, d) => sum + d.calories, 0) / nutritionData.length)
    : 0;
  const avgProtein = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum, d) => sum + d.protein, 0) / nutritionData.length)
    : 0;
  const avgCarbs = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum, d) => sum + d.carbs, 0) / nutritionData.length)
    : 0;
  const avgFat = nutritionData.length > 0
    ? Math.round(nutritionData.reduce((sum, d) => sum + d.fat, 0) / nutritionData.length)
    : 0;

  return (
    <PanelLayout title="Nutrition" onBack={onBack}>
      <PanelContent>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'simple' && (
          <div className="space-y-6">
            {/* Calorie Overview */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Today"
                value={latestEntry?.calories || 0}
                unit="kcal"
              />
              <MetricCard
                label="7-Day Avg"
                value={avgCalories}
                unit="kcal"
              />
            </div>

            {/* Today's Macros */}
            {latestEntry && (
              <div className="space-y-3">
                <SectionLabel>Today's Macros</SectionLabel>
                <KvRow label="Protein" value={`${latestEntry.protein}g`} />
                <KvRow label="Carbs" value={`${latestEntry.carbs}g`} />
                <KvRow label="Fat" value={`${latestEntry.fat}g`} />
              </div>
            )}
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <SectionLabel>Calories vs Macro Balance (Last 7)</SectionLabel>
              <div className="space-y-2">
                {nutritionData.slice(-7).map((entry) => {
                  const caloriesPct = Math.min((entry.calories / 3000) * 100, 100);
                  const macroTotal = Math.max(entry.protein + entry.carbs + entry.fat, 1);
                  const proteinPct = (entry.protein / macroTotal) * 100;
                  const carbsPct = (entry.carbs / macroTotal) * 100;
                  const fatPct = (entry.fat / macroTotal) * 100;
                  return (
                    <div key={`viz-${entry.id}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#737373]">
                        <span>{entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{entry.calories} kcal</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-[#00D4FF]" style={{ width: `${caloriesPct}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                        <div className="h-full bg-[#10b981]" style={{ width: `${proteinPct}%` }} />
                        <div className="h-full bg-[#f59e0b]" style={{ width: `${carbsPct}%` }} />
                        <div className="h-full bg-[#ef4444]" style={{ width: `${fatPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Averages */}
            <div className="space-y-3">
              <SectionLabel>7-Day Averages</SectionLabel>
              <KvRow label="Calories" value={`${avgCalories} kcal`} />
              <KvRow label="Protein" value={`${avgProtein}g`} />
              <KvRow label="Carbs" value={`${avgCarbs}g`} />
              <KvRow label="Fat" value={`${avgFat}g`} />
            </div>

            {/* Recent Logs */}
            <div className="space-y-3">
              <SectionLabel>Recent Logs</SectionLabel>
              {nutritionData.slice(-7).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-[#e5e5e5]">
                      {entry.calories} kcal
                    </div>
                  </div>
                  <div className="text-xs text-[#737373]">
                    P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PanelContent>
    </PanelLayout>
  );
}

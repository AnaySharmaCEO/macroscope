/**
 * MACROSCOPE PERFORMANCE OS - WEIGHT PANEL
 * Weight tracking and trends
 */

import { useState } from 'react';
import type { ViewMode } from '../types';
import { ViewToggle, SectionLabel, MetricCard, KvRow, PanelContent, ChartPlaceholder } from '../primitives';
import { PanelLayout } from '../../ui/components/PanelLayout';
import { formatWeight, kgToLb } from '../../../core/utils/units';

interface WeightPanelProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onBack: () => void;
}

interface WeightEntry {
  date: Date;
  weight: number;
}

export function WeightPanel({
  viewMode,
  setViewMode,
  onBack
}: WeightPanelProps) {
  const units = (localStorage.getItem('macroscope_units') as any) || 'metric';
  // Generate mock weight data
  const weightData = generateMockWeightData();

  const currentWeight = weightData[weightData.length - 1].weight;
  const weekAgoWeight = weightData[weightData.length - 8]?.weight || currentWeight;
  const twoWeeksAgoWeight = weightData[0].weight;

  const sevenDayChange = currentWeight - weekAgoWeight;
  const fourteenDayChange = currentWeight - twoWeeksAgoWeight;
  const displayCurrent = units === 'imperial' ? kgToLb(currentWeight) : currentWeight;
  const display7 = units === 'imperial' ? kgToLb(sevenDayChange) : sevenDayChange;
  const display14 = units === 'imperial' ? kgToLb(fourteenDayChange) : fourteenDayChange;
  const unitLabel = units === 'imperial' ? 'lb' : 'kg';

  return (
    <PanelLayout title="Weight" onBack={onBack}>
      <PanelContent>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {viewMode === 'simple' && (
          <div className="space-y-6">
            {/* Current Weight */}
            <MetricCard
              label="Current Weight"
              value={displayCurrent.toFixed(1)}
              unit={unitLabel}
            />

            {/* Changes */}
            <div className="space-y-3">
              <SectionLabel>Changes</SectionLabel>
              <KvRow
                label="7-Day Change"
                value={`${display7 > 0 ? '+' : ''}${display7.toFixed(1)} ${unitLabel}`}
                valueAccent={display7 < 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}
              />
              <KvRow
                label="14-Day Change"
                value={`${display14 > 0 ? '+' : ''}${display14.toFixed(1)} ${unitLabel}`}
                valueAccent={display14 < 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}
              />
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Chart Placeholder */}
            <ChartPlaceholder
              icon="⚖️"
              label="Weight trend over 14 days"
            />

            {/* Weight Log */}
            <div className="space-y-3">
              <SectionLabel>Weight Log</SectionLabel>
              {weightData.slice().reverse().map((entry, i) => {
                const prevEntry = i < weightData.length - 1
                  ? weightData[weightData.length - 1 - (i + 1)]
                  : null;
                const change = prevEntry ? entry.weight - prevEntry.weight : 0;

                return (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-[#e5e5e5]">
                        {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-[#e5e5e5]">
                          {formatWeight(entry.weight, units)}
                        </div>
                        {prevEntry && (
                          <div className={`text-xs ${change < 0 ? 'text-[#10b981]' : change > 0 ? 'text-[#ef4444]' : 'text-[#737373]'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PanelContent>
    </PanelLayout>
  );
}

/**
 * Generate mock weight data for 14 days
 */
function generateMockWeightData(): WeightEntry[] {
  const data: WeightEntry[] = [];
  let weight = 70.5;

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));

    // Gradual downward trend with some variance
    weight -= 0.05 + (Math.random() * 0.1 - 0.05);

    data.push({
      date,
      weight: Math.max(68, Math.min(72, weight))
    });
  }

  return data;
}

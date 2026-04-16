/**
 * Minimal analog time picker (HH:mm).
 * Pure client component; no external deps.
 */

import { useMemo, useState } from 'react';

type Mode = 'hour' | 'minute';

export interface AnalogTimePickerProps {
  label: string;
  value: string; // "HH:mm"
  onChange: (value: string) => void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const parseTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  const hour = Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 0;
  const minute = Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0;
  return { hour, minute };
};

export function AnalogTimePicker({ label, value, onChange }: AnalogTimePickerProps) {
  const { hour, minute } = useMemo(() => parseTime(value || '00:00'), [value]);
  const [mode, setMode] = useState<Mode>('hour');

  const setHour = (h: number) => onChange(`${pad2(h)}:${pad2(minute)}`);
  const setMinute = (m: number) => onChange(`${pad2(hour)}:${pad2(m)}`);

  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;
  const minuteAngle = (minute / 60) * 360;

  const numbers = mode === 'hour'
    ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
    : Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs tracking-wider uppercase text-[#737373]">{label}</label>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('hour')}
            className={`px-2 py-1 rounded border ${mode === 'hour' ? 'border-[#00D4FF] text-[#e5e5e5]' : 'border-[#262626] text-[#737373]'}`}
          >
            Hour
          </button>
          <button
            type="button"
            onClick={() => setMode('minute')}
            className={`px-2 py-1 rounded border ${mode === 'minute' ? 'border-[#00D4FF] text-[#e5e5e5]' : 'border-[#262626] text-[#737373]'}`}
          >
            Minute
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-44 h-44 rounded-full border border-[#262626] bg-[#0a0a0a] relative">
          {/* ticks */}
          {numbers.map((n, idx) => {
            const angle = (idx / 12) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const r = 64;
            const x = 88 + Math.cos(rad) * r;
            const y = 88 + Math.sin(rad) * r;
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (mode === 'hour') {
                    // map 12 -> 0 or 12 depending on current half-day
                    const base = Math.floor(hour / 12) * 12;
                    const h = (n % 12) + base;
                    setHour(Math.min(23, h));
                  } else {
                    setMinute(n);
                  }
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-[#e5e5e5] hover:text-[#00D4FF]"
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                {n}
              </button>
            );
          })}

          {/* hands */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#e5e5e5]" />
          </div>
          <div
            className="absolute left-1/2 top-1/2 origin-bottom w-[2px] h-[54px] bg-[#00D4FF] rounded"
            style={{ transform: `translateX(-50%) translateY(-100%) rotate(${mode === 'hour' ? hourAngle : minuteAngle}deg)` }}
          />
        </div>

        <div className="flex-1">
          <div className="text-2xl tabular-nums">
            {pad2(hour)}:{pad2(minute)}
          </div>
          <div className="text-xs text-[#737373] mt-1">
            Tap numbers on the dial.
          </div>
          {mode === 'hour' && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs"
                onClick={() => setHour((hour + 12) % 24)}
              >
                Toggle AM/PM
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


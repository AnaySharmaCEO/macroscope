/**
 * MACROSCOPE PERFORMANCE OS - INSIGHT CARD
 * Reusable card component for insights page
 */

import { ReactNode } from 'react';

interface InsightCardProps {
  title: string;
  children: ReactNode;
  onClick?: () => void;
}

export function InsightCard({ title, children, onClick }: InsightCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 ${
        onClick ? 'hover:bg-white/10 cursor-pointer hover:border-white/20' : ''
      }`}
    >
      <p className="text-xs text-[#737373] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

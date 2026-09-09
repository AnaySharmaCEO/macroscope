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
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderRadius: 'var(--card-radius)',
      }}
      className={`p-6 border transition-all duration-150 ${
        onClick ? 'hover:border-[var(--border-strong)] cursor-pointer' : ''
      }`}
    >
      <div className="text-xs font-medium text-[var(--text-2)] mb-3">{title}</div>
      {children}
    </div>
  );
}

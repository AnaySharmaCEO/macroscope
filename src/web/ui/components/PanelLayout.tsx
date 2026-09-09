/**
 * MACROSCOPE PERFORMANCE OS - PANEL LAYOUT COMPONENT
 * Full-screen panel with back navigation
 */

import { ArrowLeft } from 'lucide-react';

interface PanelLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function PanelLayout({ title, onBack, children }: PanelLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-1)',
      }}
    >
      {/* Header */}
      <div 
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-1)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 transition-colors cursor-pointer text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            style={{ borderRadius: 'var(--radius-sm)' }}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-serif text-xl text-[var(--text-1)] tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

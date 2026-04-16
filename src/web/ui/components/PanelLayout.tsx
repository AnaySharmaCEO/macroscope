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
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-[#262626] px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-[#737373] hover:text-[#e5e5e5] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl tracking-tight">{title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/**
 * MACROSCOPE PERFORMANCE OS - DESKTOP SIDEBAR
 * Left sidebar navigation for desktop layout
 */

import { Link, useLocation } from 'react-router';
import { navigationItems } from '../../config/navigation';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#262626] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#262626]">
        <h1 className="text-xl tracking-tight text-[#e5e5e5]">MacroScope</h1>
        <p className="text-xs text-[#737373] mt-1 tracking-wide">PERFORMANCE OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded transition-colors
                ${
                  isActive
                    ? 'bg-[#1a1a1a] text-[#e5e5e5] border border-[#262626]'
                    : 'text-[#737373] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
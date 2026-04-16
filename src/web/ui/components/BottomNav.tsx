/**
 * MACROSCOPE PERFORMANCE OS - MOBILE BOTTOM NAVIGATION
 * Bottom navigation bar for mobile layout
 */

import { Link, useLocation } from 'react-router';
import { navigationItems } from '../../config/navigation';

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#262626] safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-0.5 transition-colors
                flex-1 min-w-0
                ${isActive ? 'text-[#e5e5e5]' : 'text-[#737373]'}
              `}
            >
              <Icon className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
              <span className="text-[10px] sm:text-xs md:text-sm truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
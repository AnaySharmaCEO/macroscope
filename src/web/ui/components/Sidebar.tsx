/**
 * MACROSCOPE PERFORMANCE OS - DESKTOP SIDEBAR
 * Left sidebar navigation for desktop layout
 */

import { Link, useLocation } from 'react-router';
import { navigationItems } from '../../config/navigation';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside 
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderRight: '1px solid var(--nav-border)',
      }}
      className="w-60 flex flex-col shrink-0 transition-colors duration-200"
    >
      {/* Brand Header */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '24px 20px',
        }}
      >
        <h1 
          style={{
            fontFamily: 'var(--nav-brand-font)',
            fontSize: 'var(--nav-brand-size)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--text)',
            lineHeight: 'var(--leading-tight)',
          }}
        >
          MacroScope
        </h1>
        <p 
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-caption)',
            color: 'var(--text-3)',
            marginTop: '3px',
          }}
        >
          Performance OS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                borderRadius: 'var(--nav-item-radius)',
                backgroundColor: isActive ? 'var(--nav-item-active-bg)' : 'transparent',
                color: isActive ? 'var(--nav-item-active-text)' : 'var(--nav-item-text)',
                borderColor: isActive ? 'var(--nav-item-active-border)' : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--weight-medium)' as any,
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <Icon 
                className="w-4 h-4 transition-opacity" 
                style={{ opacity: isActive ? 1 : 0.85 }} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
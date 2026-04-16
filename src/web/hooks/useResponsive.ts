/**
 * MACROSCOPE PERFORMANCE OS - RESPONSIVE HOOK
 * Detects screen size and returns layout mode
 */

import { useState, useEffect } from 'react';

export type LayoutMode = 'desktop' | 'mobile';

export function useResponsive() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop');

  useEffect(() => {
    const checkLayout = () => {
      // Mobile breakpoint: < 768px (iPad and below)
      setLayoutMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  return {
    layoutMode,
    isMobile: layoutMode === 'mobile',
    isDesktop: layoutMode === 'desktop',
  };
}

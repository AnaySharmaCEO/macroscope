/**
 * MACROSCOPE PERFORMANCE OS - PLATFORM UTILITY
 * Detects the current running environment
 */

export const isWeb = typeof window !== 'undefined' && !window.process;
export const isElectron = typeof window !== 'undefined' && window.process && (window.process as any).type === 'renderer';
export const isMobile = !isWeb && !isElectron; // Simplified for now, can be refined for RN

export const getPlatform = () => {
  if (isElectron) return 'desktop';
  if (isMobile) return 'mobile';
  return 'web';
};

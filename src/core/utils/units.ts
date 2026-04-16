import type { SystemSettings } from '../types';

export type Units = SystemSettings['units'];

export const kgToLb = (kg: number) => kg * 2.2046226218;
export const lbToKg = (lb: number) => lb / 2.2046226218;

export const cmToIn = (cm: number) => cm / 2.54;
export const inToCm = (inch: number) => inch * 2.54;

export const cmToFtIn = (cm: number) => {
  const totalIn = cmToIn(cm);
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return { ft, in: inch };
};

export const formatHeight = (cm: number, units: Units) => {
  if (units === 'imperial') {
    const { ft, in: inch } = cmToFtIn(cm);
    return `${ft}'${inch}"`;
  }
  return `${cm} cm`;
};

export const formatWeight = (kg: number, units: Units) => {
  if (units === 'imperial') return `${kgToLb(kg).toFixed(1)} lb`;
  return `${kg.toFixed(1)} kg`;
};

export const displayWeightValue = (kg: number, units: Units) => (units === 'imperial' ? kgToLb(kg) : kg);
export const displayHeightValue = (cm: number, units: Units) => (units === 'imperial' ? cmToIn(cm) : cm);

export const parseWeightToKg = (value: number, units: Units) => (units === 'imperial' ? lbToKg(value) : value);
export const parseHeightToCm = (value: number, units: Units) => (units === 'imperial' ? inToCm(value) : value);


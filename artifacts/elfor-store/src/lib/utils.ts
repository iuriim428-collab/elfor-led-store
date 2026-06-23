import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatValueWithUnit(value: string | number, unit: string) {
  const normalizedValue = String(value).trim();
  const normalizedUnit = unit.trim();

  if (!normalizedValue) {
    return normalizedUnit;
  }

  return normalizedValue.toLowerCase().endsWith(normalizedUnit.toLowerCase())
    ? normalizedValue
    : `${normalizedValue} ${normalizedUnit}`;
}

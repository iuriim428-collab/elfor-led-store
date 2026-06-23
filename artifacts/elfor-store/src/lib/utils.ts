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

export function resolveStorageUrl(path: string) {
  if (!path) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/api/storage/")) {
    return path;
  }

  if (path.startsWith("/objects/") || path.startsWith("/public-objects/")) {
    return `/api/storage${path}`;
  }

  return path;
}

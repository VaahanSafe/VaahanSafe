import { VEHICLE_NUMBER_REGEX, INDIAN_MOBILE_REGEX } from '@/lib/constants';

/**
 * Validates 10-digit Indian Mobile Numbers (with optional +91 prefix).
 */
export function isValidIndianMobile(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s+|-/g, '');
  return INDIAN_MOBILE_REGEX.test(cleaned);
}

/**
 * Validates Indian Vehicle Registration Plates (Standard State & Bharat Series).
 * Examples: MH-12-AB-1234, KA03XY9876, 22BH1234A
 */
export function isValidVehicleNumber(plate: string): boolean {
  if (!plate || typeof plate !== 'string') return false;
  const cleaned = plate.replace(/\s+|-/g, '').toUpperCase();
  return VEHICLE_NUMBER_REGEX.test(cleaned);
}

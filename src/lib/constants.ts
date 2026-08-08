/**
 * Enterprise Infrastructure Constants
 * Synchronized 1:1 with FastAPI backend model constraints.
 */

// Maximum priority emergency contacts per vehicle QR profile
export const MAX_EMERGENCY_CONTACTS = 5;

// One-Time Password Parameters
export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 300; // 5 minutes validity
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Regular Expressions for Form Validation
// Supports standard Indian plates (MH-12-AB-1234) and Bharat Series (22BH1234A)
export const VEHICLE_NUMBER_REGEX = /^(?:[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/;

// 10-digit Indian Mobile Numbers with optional country code
export const INDIAN_MOBILE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;

// Emergency Photo Capture Size Limits
export const SCAN_PHOTO_MAX_SIZE_KB = 500;

// Subscription Tier Identifiers
export const SUBSCRIPTION_TIERS = ['Basic', 'Shield', 'Family Pro'] as const;

// Sticker Delivery Statuses
export const STICKER_STATUSES = ['Processing', 'Shipped', 'Delivered'] as const;

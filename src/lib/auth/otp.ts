/**
 * Splits an OTP string into an array of 6 characters.
 * Pads with empty strings if length is less than 6.
 */
export function splitOtp(otp: string): string[] {
  const sanitized = sanitizeOtp(otp);
  const result = Array(6).fill("");
  for (let i = 0; i < sanitized.length; i++) {
    result[i] = sanitized[i];
  }
  return result;
}

/**
 * Joins an array of OTP digits into a single string.
 */
export function joinOtp(otpArray: string[]): string {
  return otpArray.join("");
}

/**
 * Strips out non-numeric characters and limits length to 6.
 */
export function sanitizeOtp(otp: string): string {
  return otp.replace(/\D/g, "").slice(0, 6);
}

/**
 * Returns true if the OTP is exactly 6 digits.
 */
export function isOtpComplete(otp: string): boolean {
  return sanitizeOtp(otp).length === 6;
}

/**
 * Checks if the OTP string contains only numeric characters.
 */
export function isNumericOtp(otp: string): boolean {
  return /^\d+$/.test(otp);
}

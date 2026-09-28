export const isRequired = (value: unknown) => {
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "boolean") return true;
  return value !== null && value !== undefined;
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/**
 * Mobile Number Validator (Client-Bitezo standard):
 * Relaxed format - accepts numeric characters (optional leading +), maximum 15 digits.
 * No tight country-specific numbering plan restrictions.
 */
export const isValidMobile = (
  value: string,
  _country?: unknown
) => {
  if (!value) return false;
  const cleaned = value.trim().replace(/[\s\-()]/g, "");
  return /^\+?[0-9]{1,15}$/.test(cleaned);
};

/**
 * Sanitizes mobile number input:
 * Rejects all alphabetic and special characters.
 * Allows only digits and optional leading '+'.
 * Automatically restricts length to maximum 15 digits.
 */
export const sanitizeMobileNumber = (val: string): string => {
  if (!val) return "";
  let cleaned = val.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = "+" + cleaned.slice(1).replace(/\+/g, "").slice(0, 15);
  } else {
    cleaned = cleaned.replace(/\+/g, "").slice(0, 15);
  }
  return cleaned;
};

export const isNumber = (value: string) =>
  !isNaN(Number(value));

export const countryCodeMap: Record<string, string> = {
  India: "IN",
  UAE: "AE",
  Saudi: "SA",
};
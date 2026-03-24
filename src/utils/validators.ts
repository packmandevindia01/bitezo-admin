import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export const isRequired = (value: any) => {
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "boolean") return true;
  return value !== null && value !== undefined;
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export const isValidMobile = (
  value: string,
  country?: CountryCode
) => {
  const phone = parsePhoneNumberFromString(value, country);
  return phone ? phone.isValid() : false;
};

export const isNumber = (value: string) =>
  /^-?\d+(\.\d+)?$/.test(value.trim());

export const countryCodeMap: Record<string, string> = {
  India: "IN",
  UAE: "AE",
  Saudi: "SA",
};
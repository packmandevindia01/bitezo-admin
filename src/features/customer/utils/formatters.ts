import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export const formatPhone = (
  value: string,
  country: CountryCode
): string => {
  const phone = parsePhoneNumberFromString(value, country);
  return phone ? phone.number : value;
};
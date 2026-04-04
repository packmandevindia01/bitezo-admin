import { getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export const getPhonePrefix = (country: CountryCode): string =>
  `+${getCountryCallingCode(country)}`;

export const ensurePhonePrefix = (value: string, country: CountryCode): string => {
  const prefix = getPhonePrefix(country);
  const trimmed = value.trim();

  if (!trimmed) {
    return `${prefix} `;
  }

  if (trimmed.startsWith(prefix)) {
    return trimmed;
  }

  const withoutExistingPrefix = trimmed.replace(/^\+\d+\s*/, "");
  return withoutExistingPrefix ? `${prefix} ${withoutExistingPrefix}` : `${prefix} `;
};

export const syncPhonePrefix = (
  value: string,
  previousCountry: CountryCode,
  nextCountry: CountryCode
): string => {
  const previousPrefix = getPhonePrefix(previousCountry);
  const nextPrefix = getPhonePrefix(nextCountry);
  const trimmed = value.trim();

  if (!trimmed) {
    return `${nextPrefix} `;
  }

  if (trimmed.startsWith(previousPrefix)) {
    const localNumber = trimmed.slice(previousPrefix.length).trimStart();
    return localNumber ? `${nextPrefix} ${localNumber}` : `${nextPrefix} `;
  }

  if (trimmed.startsWith(nextPrefix)) {
    return trimmed;
  }

  return ensurePhonePrefix(trimmed, nextCountry);
};

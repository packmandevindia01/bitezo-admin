import type { CountryCode } from "libphonenumber-js";

const COUNTRY_NAME_BY_CODE: Record<string, string> = {
  IN: "India",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  BH: "Bahrain",
  OM: "Oman",
  QA: "Qatar",
  KW: "Kuwait",
  SG: "Singapore",
  MY: "Malaysia",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
};

export const getCountryName = (country?: string | null): string => {
  if (!country) return "India";

  const trimmed = country.trim();
  const normalizedCode = trimmed.toUpperCase();

  if (COUNTRY_NAME_BY_CODE[normalizedCode]) {
    return COUNTRY_NAME_BY_CODE[normalizedCode];
  }

  const c = trimmed.toLowerCase();

  if (c.includes("india")) return "India";
  if (c.includes("uae") || c.includes("united arab emirates")) {
    return "United Arab Emirates";
  }
  if (c.includes("saudi")) return "Saudi Arabia";
  if (c.includes("bahrain")) return "Bahrain";
  if (c.includes("oman")) return "Oman";
  if (c.includes("qatar")) return "Qatar";
  if (c.includes("kuwait")) return "Kuwait";
  if (c.includes("singapore")) return "Singapore";
  if (c.includes("malaysia")) return "Malaysia";
  if (c.includes("thailand")) return "Thailand";
  if (c.includes("indonesia")) return "Indonesia";
  if (c.includes("philippines")) return "Philippines";
  if (c.includes("china")) return "China";
  if (c.includes("japan")) return "Japan";
  if (c.includes("korea")) return "South Korea";

  return trimmed;
};

export const mapCountry = (country?: string | null): CountryCode => {
  const c = getCountryName(country).toLowerCase();

  if (c.includes("india")) return "IN";
  if (c.includes("united arab emirates")) return "AE";
  if (c.includes("saudi")) return "SA";
  if (c.includes("bahrain")) return "BH";
  if (c.includes("oman")) return "OM";
  if (c.includes("qatar")) return "QA";
  if (c.includes("kuwait")) return "KW";
  if (c.includes("singapore")) return "SG";
  if (c.includes("malaysia")) return "MY";
  if (c.includes("thailand")) return "TH";
  if (c.includes("indonesia")) return "ID";
  if (c.includes("philippines")) return "PH";
  if (c.includes("china")) return "CN";
  if (c.includes("japan")) return "JP";
  if (c.includes("korea")) return "KR";

  return "IN";
};

import type { CountryCode } from "libphonenumber-js";
export interface CustomerFormData {
  custName: string;
  custMob: string;
  custTel: string;
  country: CountryCode;
  block?: string;
  area?: string;
  road?: string;
  building?: string;
  flatNo?: string;
  crNo: string;
  email: string;
  taxRegNo?: string;
  branchCount: number;
  regId: string;
  database: string;
  conMode: string;
  fileName?: string;
  filePath?: string;
  isDemo: boolean;
  createdDate: string;
}

export interface Customer {
  custId: number;
  custName: string;
  custMob: string;
  country: string; // API gives string, not CountryCode
  area: string;
  branchCount: number;
  regId: string;
  isDemo: string; // "Demo"
}
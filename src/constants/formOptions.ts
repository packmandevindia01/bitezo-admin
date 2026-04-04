export interface SelectOption {
  label: string;
  value: string;
}

export const COUNTRY_OPTIONS: SelectOption[] = [
  { label: "India", value: "India" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
  { label: "Bahrain", value: "Bahrain" },
  { label: "Oman", value: "Oman" },
  { label: "Qatar", value: "Qatar" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Singapore", value: "Singapore" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Thailand", value: "Thailand" },
];

export const COUNTRY_FILTER_OPTIONS: SelectOption[] = [
  { label: "All", value: "All" },
  ...COUNTRY_OPTIONS,
];

export const CONNECTION_MODE_OPTIONS: SelectOption[] = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

export const CONNECTION_MODE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All", value: "All" },
  ...CONNECTION_MODE_OPTIONS,
];

export const DEMO_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All", value: "All" },
  { label: "Demo", value: "Demo" },
  { label: "Licenced", value: "Licenced" },
];

export const MOBILE_PLACEHOLDERS: Record<string, string> = {
  IN: "+91 9876543210",
  AE: "+971 501234567",
  SA: "+966 512345678",
  BH: "+973 36001234",
  OM: "+968 92001234",
  QA: "+974 33001234",
  KW: "+965 51001234",
  SG: "+65 91234567",
  MY: "+60 121234567",
  TH: "+66 812345678",
};

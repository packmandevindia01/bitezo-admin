export interface CustomerFormData {
  custName: string;
  custMob: string;
  custMob2?: string;
  country: string;
  block?: string;
  area?: string;
  road?: string;
  building?: string;
  branchCount: number;
  regId: string;
  startDate: string;
  isDemo: boolean;
  database: string;
}
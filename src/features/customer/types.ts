export interface CustomerFormData {
  custName: string;
  custMob: string;
  custTel: string;
  country: string;
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
  dealerId: number;
  empId?: number;
  createdDate: string;
}

export interface Customer {
  custId: number;
  custName: string;
  custMob: string;
  custTel?: string;

  country: string;
  block?: string;
  area?: string;
  road?: string;
  building?: string;
  flatNo?: string;

  crNo?: string;
  email?: string;
  taxRegNo?: string;

  branchCount: number;
  regId: string;

  database?: string;
  conMode?: string; // ✅ FIX ADDED

  fileName?: string;
  filePath?: string;

  version?: string;
  isDemo: string;
  dealerId?: number;
  empId?: number;
  dealerName?: string;
  employeeName?: string;

  createdDate?: string;
}

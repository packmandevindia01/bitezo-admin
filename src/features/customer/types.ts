export interface TerminalItem {
  terminalId: number;
  terminalName: string;
  status: string;
  activeDate?: string;
}

export interface BranchListItem {
  branchId?: number;
  branchDescription: string;
  terminalCount: number;
  terminals?: TerminalItem[];
}

export interface CustomerFormData {
  custName: string;
  custMob: string;
  custTel: string;
  country: string;         // internal: used for phone prefix/formatting in form
  countryId: number;       // API: what backend expects (from /api/Customer/country-list)
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
  branchLists: BranchListItem[];
}

export interface Customer {
  custId: number;
  custName: string;
  custMob: string;
  custTel?: string;
  countryId?: number;
  country?: string;
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
  conMode?: string;
  fileName?: string;
  filePath?: string;
  version?: string;
  isDemo: string;
  dealerId?: number;
  empId?: number;
  dealerName?: string;
  employeeName?: string;
  createdDate?: string;
  modifiedDate?: string;
  branchLists?: BranchListItem[];
}

export interface CustomerListParams {
  custName?: string;
  regId?: string;
}

export interface CustomerRptListParams {
  CustName?: string;
  RegId?: string;
  Country?: string;
  IsDemo?: string;
  Database?: string;
  ConMode?: string;
  DealerId?: number;
  EmpId?: number;
}
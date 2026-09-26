// src/features/customer/services/customerApi.ts
import api from '../../../utils/api';
import type { Customer, CustomerFormData, CustomerListParams, CustomerRptListParams, BranchListItem, TerminalItem } from '../types';

const mapCustomer = (item: Record<string, unknown>): Customer => ({
  custId:
    (item.custId as number | undefined) ??
    (item.id as number | undefined) ??
    0,
  custName: (item.custName as string | undefined) ?? '',
  custMob:  (item.custMob  as string | undefined) ?? '',
  custTel:  (item.custTel  as string | undefined) ?? '',
  countryId: (item.countryId as number | undefined) ?? undefined,
  country:  (item.country   as string | undefined) ?? '',
  block:    (item.block    as string | undefined) ?? '',
  area:     (item.area     as string | undefined) ?? '',
  road:     (item.road     as string | undefined) ?? '',
  building: (item.building as string | undefined) ?? '',
  flatNo:   (item.flatNo   as string | undefined) ?? '',
  crNo:     (item.crNo     as string | undefined) ?? '',
  email:    (item.email    as string | undefined) ?? '',
  taxRegNo: (item.taxRegNo as string | undefined) ?? '',
  branchCount: (item.branchCount as number | undefined) ?? 0,
  regId:    (item.regId    as string | undefined) ?? '',
  database: (item.database as string | undefined) ?? '',
  conMode:  (item.conMode  as string | undefined) ?? '',
  fileName: (item.fileName as string | undefined) ?? '',
  filePath: (item.filePath as string | undefined) ?? '',
  version:
    (item.version as string | undefined) ??
    (typeof item.isDemo === 'boolean'
      ? item.isDemo ? 'Demo' : 'Licenced'
      : ((item.isDemo as string | undefined) ?? '')),
  isDemo:
    (item.version as string | undefined) ??
    (typeof item.isDemo === 'boolean'
      ? item.isDemo ? 'Demo' : 'Licenced'
      : ((item.isDemo as string | undefined) ?? '')),
  dealerId:     (item.dealerId     as number | undefined) ?? 0,
  empId:
    (item.empId       as number | undefined) ??
    (item.employeeId  as number | undefined) ??
    0,
  dealerName:
    (item.dealerName as string | undefined) ??
    (item.dealer     as string | undefined) ??
    '',
  employeeName:
    (item.employeeName as string | undefined) ??
    (item.empName      as string | undefined) ??
    (item.employee     as string | undefined) ??
    '',
  createdDate:  (item.createdDate  as string | undefined) ?? undefined,
  modifiedDate: (item.modifiedDate as string | undefined) ?? undefined,
  branchLists: Array.isArray(item.branchLists)
    ? item.branchLists.map((b: Record<string, unknown>) => ({
        branchDescription: (b.branchDescription as string | undefined) ?? '',
        terminalCount: Number(b.terminalCount ?? 0),
      }))
    : [],
});

// ✅ CREATE  POST /api/Customer
export const createCustomer = async (
  data: CustomerFormData,
  otpToken?: string
) => {
  const payload = {
    custName: data.custName ?? '',
    custMob: data.custMob ?? '',
    custTel: data.custTel ?? '',
    countryId: Number(data.countryId ?? 0),
    block: data.block ?? '',
    area: data.area ?? '',
    road: data.road ?? '',
    building: data.building ?? '',
    flatNo: data.flatNo ?? '',
    crNo: data.crNo ?? '',
    email: data.email ?? '',
    taxRegNo: data.taxRegNo ?? '',
    branchCount: Number(data.branchCount ?? 0),
    regId: data.regId ?? '',
    database: data.database ?? '',
    fileName: data.fileName ?? '',
    filePath: data.filePath ?? '',
    isDemo: Boolean(data.isDemo),
    dealerId: Number(data.dealerId ?? 0),
    empId: Number(data.empId ?? 0),
    createdDate: data.createdDate ?? new Date().toISOString(),
    branchLists: Array.isArray(data.branchLists)
      ? data.branchLists.map((b: BranchListItem) => ({
          branchDescription: b.branchDescription ?? '',
          terminalCount: Number(b.terminalCount ?? 0),
        }))
      : [],
  };

  const response = await api.post('/api/Customer', payload, {
    headers: otpToken ? { 'Otp-Token': otpToken } : undefined,
  });
  return response.data;
};

// âœ… GET LIST  GET /api/Customer/list
export const getCustomers = async (params?: CustomerListParams) => {
  const response = await api.get('/api/Customer/list', { params });
  const body = response.data;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];
  return list.map((item: Record<string, unknown>) => mapCustomer(item));
};

// âœ… GET BY ID  GET /api/Customer/{custId}
export const getCustomerById = async (id: number) => {
  const response = await api.get('/api/Customer/' + id);
  const body = response.data;
  const item = (body?.data ?? body ?? {}) as Record<string, unknown>;
  return mapCustomer(item);
};

// ✅ GET NEXT REG ID  GET /api/Customer/nextregid
export const getNextRegId = async (): Promise<string> => {
  const response = await api.get('/api/Customer/nextregid');
  const body = response.data;
  if (typeof body === 'string') return body;
  if (typeof body?.regId === 'string') return body.regId;
  if (typeof body?.data === 'string') return body.data;
  if (typeof body?.data?.regId === 'string') return body.data.regId;
  if (typeof body?.result === 'string') return body.result;
  if (typeof body?.value === 'string') return body.value;
  return body ? String(body) : '';
};

// ✅ UPDATE  PUT /api/Customer/{custId}
export const updateCustomer = async (
  id: number,
  data: CustomerFormData & { custId: number },
  otpToken?: string
) => {
  const payload = {
    custId: Number(id || data.custId || 0),
    custName: data.custName ?? '',
    custMob: data.custMob ?? '',
    custTel: data.custTel ?? '',
    countryId: Number(data.countryId ?? 0),
    block: data.block ?? '',
    area: data.area ?? '',
    road: data.road ?? '',
    building: data.building ?? '',
    flatNo: data.flatNo ?? '',
    crNo: data.crNo ?? '',
    email: data.email ?? '',
    taxRegNo: data.taxRegNo ?? '',
    branchCount: Number(data.branchCount ?? 0),
    regId: data.regId ?? '',
    database: data.database ?? '',
    fileName: data.fileName ?? '',
    filePath: data.filePath ?? '',
    isDemo: Boolean(data.isDemo),
    dealerId: Number(data.dealerId ?? 0),
    empId: Number(data.empId ?? 0),
    modifiedDate: new Date().toISOString(),
    branchLists: Array.isArray(data.branchLists)
      ? data.branchLists.map((b: BranchListItem) => ({
          branchDescription: b.branchDescription ?? '',
          terminalCount: Number(b.terminalCount ?? 0),
        }))
      : [],
  };

  const response = await api.put('/api/Customer/' + id, payload, {
    headers: otpToken ? { 'Otp-Token': otpToken } : undefined,
  });
  return response.data;
};

// ✅ GET CUSTOMER BRANCH LIST  GET /api/Customer/branch-list?customerId={customerId}
export const getCustomerBranchList = async (customerId: number): Promise<BranchListItem[]> => {
  const response = await api.get('/api/Customer/branch-list', {
    params: { customerId },
  });
  const body = response.data;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];
  return list.map((item: Record<string, unknown>) => ({
    branchId: (item.branchId as number | undefined) ?? (item.id as number | undefined) ?? undefined,
    branchDescription:
      (item.description as string | undefined) ??
      (item.branchDescription as string | undefined) ??
      '',
    terminalCount: Number(item.terminalCount ?? 0),
  }));
};

// ✅ GET TERMINAL LIST  GET /api/Customer/terminal-list?branchId={branchId}
export const getCustomerTerminalList = async (branchId: number): Promise<TerminalItem[]> => {
  const response = await api.get('/api/Customer/terminal-list', {
    params: { branchId },
  });
  const body = response.data;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];
  return list.map((item: Record<string, unknown>) => ({
    terminalId: Number(item.terminalId ?? item.id ?? 0),
    terminalName:
      (item.terminalNane as string | undefined) ??
      (item.terminalName as string | undefined) ??
      (item.name as string | undefined) ??
      '',
    status: (item.status as string | undefined) ?? 'InActive',
    activeDate: (item.activeDate as string | undefined) ?? undefined,
  }));
};

export interface AddBranchParams {
  customerId: number;
  description: string;
  terminalCount: number;
}

// ✅ ADD ADDITIONAL BRANCH  POST /api/Customer/branch?CustomerId={id}&Description={desc}&TerminalCount={count}
export const addCustomerBranch = async (params: AddBranchParams) => {
  const response = await api.post('/api/Customer/branch', null, {
    params: {
      CustomerId: params.customerId,
      Description: params.description,
      TerminalCount: params.terminalCount,
    },
  });
  return response.data;
};

export interface UpdateBranchParams {
  branchId: number;
  description: string;
}

// ✅ UPDATE BRANCH DESCRIPTION  PUT /api/Customer/branch?BranchId={id}&Description={desc}
export const updateCustomerBranch = async (params: UpdateBranchParams) => {
  const response = await api.put('/api/Customer/branch', null, {
    params: {
      BranchId: params.branchId,
      Description: params.description,
    },
  });
  return response.data;
};

export interface DeleteBranchParams {
  branchId: number;
  customerId: number;
}

// ✅ DELETE BRANCH  DELETE /api/Customer/branch?branchId={branchId}&customerId={customerId}
export const deleteCustomerBranch = async (params: DeleteBranchParams) => {
  const response = await api.delete('/api/Customer/branch', {
    params: {
      branchId: params.branchId,
      customerId: params.customerId,
    },
  });
  return response.data;
};

export interface AddTerminalParams {
  branchId: number;
  customerId: number;
}

// ✅ ADD TERMINAL  POST /api/Customer/terminal?BranchId={branchId}&CustomerId={customerId}
export const addCustomerTerminal = async (params: AddTerminalParams) => {
  const response = await api.post('/api/Customer/terminal', null, {
    params: {
      BranchId: params.branchId,
      CustomerId: params.customerId,
    },
  });
  return response.data;
};

export interface DeleteTerminalParams {
  terminalId: number;
  branchId: number;
}

// ✅ DELETE TERMINAL  DELETE /api/Customer/terminal?terminalId={terminalId}&branchId={branchId}
export const deleteCustomerTerminal = async (params: DeleteTerminalParams) => {
  const response = await api.delete('/api/Customer/terminal', {
    params: {
      terminalId: params.terminalId,
      branchId: params.branchId,
    },
  });
  return response.data;
};

// âœ… GET REPORT LIST  GET /api/Customer/rptlist
export const getCustomerRptList = async (params?: CustomerRptListParams) => {
  const response = await api.get('/api/Customer/rptlist', { params });
  const body = response.data;
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : [];
  return list.map((item: Record<string, unknown>) => mapCustomer(item));
};

// ✅ GET CUSTOMER EMAIL  GET /api/Customer/{custId}/email
export const getCustomerEmail = async (custId: number): Promise<string> => {
  const response = await api.get('/api/Customer/' + custId + '/email');
  const body = response.data;
  return typeof body === 'string' ? body : (body?.data ?? body?.email ?? '');
};

// ✅ GET COUNTRY LIST  GET /api/Customer/country-list
export interface CountryOption {
  countryId: number;
  countryName: string;
}

export const getCountryList = async (): Promise<CountryOption[]> => {
  const response = await api.get('/api/Customer/country-list');
  const body = response.data;
  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return list.map((item: Record<string, unknown>) => ({
    countryId: (item.countryId ?? item.id ?? 0) as number,
    countryName: (item.countryName ?? item.name ?? item.country ?? '') as string,
  }));
};
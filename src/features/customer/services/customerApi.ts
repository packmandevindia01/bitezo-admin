// src/features/customer/services/customerApi.ts
import api from '../../../utils/api';
import type { Customer, CustomerFormData, CustomerListParams, CustomerRptListParams } from '../types';

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
});

// âœ… CREATE  POST /api/Customer
export const createCustomer = async (
  data: CustomerFormData,
  otpToken?: string
) => {
  const response = await api.post('/api/Customer', data, {
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

// âœ… GET NEXT REG ID  GET /api/Customer/nextregid
export const getNextRegId = async (): Promise<string> => {
  const response = await api.get('/api/Customer/nextregid');
  const body = response.data;
  return typeof body === 'string' ? body : (body?.data ?? body ?? '');
};

// âœ… UPDATE  PUT /api/Customer/{custId}
export const updateCustomer = async (
  id: number,
  data: CustomerFormData & { custId: number },
  otpToken?: string
) => {
  const response = await api.put('/api/Customer/' + id, data, {
    headers: otpToken ? { 'Otp-Token': otpToken } : undefined,
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
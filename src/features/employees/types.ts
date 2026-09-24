export interface Employee {
  empId: number;
  name: string;
  mobNo: string;
  email: string;
  countryId?: number;
  country?: string;
  dealerId: number;
  dealer?: string;
  isActive: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

export interface EmployeeFormData {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  countryId: number;
  dealerId: number;
  isActive: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

export interface CreateEmployeePayload {
  name: string;
  mobNo: string;
  email: string;
  countryId: number;
  dealerId: number;
  isActive: boolean;
  createdDate: string;
}

export interface UpdateEmployeePayload {
  empId: number;
  name: string;
  mobNo: string;
  email: string;
  countryId: number;
  dealerId: number;
  isActive: boolean;
  modifiedDate: string;
}

export interface EmployeeNameOption {
  empId: number;
  name: string;
}

export interface EmployeeApiResponse {
  success: boolean;
  message: string;
  data: any;
}

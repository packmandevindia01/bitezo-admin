export interface Employee {
  id: number;
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
}

export interface EmployeeFormData {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
}

export interface UpdateEmployeePayload {
  id: number;
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
}

export interface EmployeeApiResponse {
  success: boolean;
  message: string;
  data: any;
}
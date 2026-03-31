export interface Employee {
  empId: number;
  name: string;
  mobNo: string;
  email: string;
  country: string;
  dealerId: number;
  dealer?: string;
  isActive: boolean;
  createdDate?: string;
}

export interface EmployeeFormData {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  dealerId: number;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  dealerId: number;
  isActive: boolean;
  createdDate: string;
}

export interface UpdateEmployeePayload {
  empId: number;
  name: string;
  mobNo: string;
  email: string;
  country: string;
  dealerId: number;
  isActive: boolean;
}

export interface EmployeeApiResponse {
  success: boolean;
  message: string;
  data: any;
}

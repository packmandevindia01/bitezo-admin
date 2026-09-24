export interface Dealer {
  dealerId: number;
  name: string;
  mobNo: string;
  email: string;
  countryId?: number;
  country?: string;
  isActive: boolean;
  createdDate: string; // ISO string
  modifiedDate?: string;
}

export interface DealerFormData {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  countryId: number;
  isActive: boolean;
  createdDate: string; // ISO string
  modifiedDate?: string;
}

export interface CreateDealerPayload {
  name: string;
  mobNo: string;
  email: string;
  countryId: number;
  isActive: boolean;
  createdDate: string; // ISO string
}

export interface UpdateDealerPayload {
  dealerId: number;
  name: string;
  mobNo: string;
  email: string;
  countryId: number;
  isActive: boolean;
  modifiedDate: string;
}

export interface DealerApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}



export interface Dealer {
  dealerId: number;
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
  createdDate: string; // ISO string
}

export interface DealerFormData {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
  createdDate: string; // ISO string
}

export interface CreateDealerPayload {
  name: string;
  mobNo: string;
  email: string;
  country: string;
  isActive: boolean;
  createdDate: string; // ISO string
}

export interface UpdateDealerPayload extends CreateDealerPayload {
  dealerId: number;
}

export interface DealerApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}


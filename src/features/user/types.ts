  // ✅ UI TABLE TYPE (what you show in table)
  export interface User {
    id: number;
    name: string;        // UI friendly
    email: string;
    active: boolean;
    isMaster: boolean;
  }

  // ✅ FORM TYPE (frontend only)
  export interface UserFormData {
    name: string;               // UI field
    password: string;
    confirmPassword: string;    // only for validation
    email: string;
    active: boolean;
    isMaster: boolean;
  }

  // ✅ API REQUEST PAYLOAD (backend contract)
  export interface CreateUserPayload {
    userName: string;   // backend field
    password: string;
    email: string;
    isActive: boolean;
    isMaster: boolean;
  }

  // ✅ API RESPONSE
  export interface CreateUserResponse {
    success: boolean;
    message: string;
    data: {
      id: number;
    };
  }
  
  // ✅ API UPDATE PAYLOAD (no password)
  export interface UpdateUserPayload {
    userId: number;
    userName: string;
    email: string;
    isActive: boolean;
    isMaster: boolean;
  }
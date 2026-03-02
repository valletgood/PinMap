export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: "male" | "female";
  agreeToTerms: boolean;
}

export interface SignupResponse {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

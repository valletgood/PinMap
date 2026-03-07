import { useMutation } from "@tanstack/react-query";
import { authService } from "./service";
import { type LoginRequest, type SignupRequest } from "./types";

export const useCheckEmailDuplicate = () => {
  return useMutation({
    mutationFn: (email: string) => authService.checkEmailDuplicate(email),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (signupData: SignupRequest) => authService.signup(signupData),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (loginData: LoginRequest) => authService.login(loginData),
  });
};

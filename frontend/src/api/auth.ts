import type {
  LoginPostData,
  LoginResponse,
  SignUpPostData,
  User,
} from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from ".";

export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignUpPostData) =>
      apiFetch<User>(`/signup`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginPostData) =>
      apiFetch<LoginResponse>(`/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
  });
};

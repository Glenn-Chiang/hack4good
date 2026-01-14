import type { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from ".";

export const useSignup = () => {
  return useMutation({
    mutationFn: (newUser: Omit<User, "id">) =>
      apiFetch<User>(`/auth/signup`, {
        method: "POST",
        body: JSON.stringify(newUser),
      }),
  });
};

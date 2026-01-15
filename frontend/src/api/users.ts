// Tanstack Query hooks for data fetching

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./index.ts";
import type { CareRequest, Recipient } from "@/types/users.ts";
import type { User } from "@/types/auth.ts";

// ======================
// Users
// ======================
export const useGetUser = (userId: string) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiFetch<User>(`/users/${userId}`),
  });

  
  export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
    mutationFn: (data: Partial<User> & { id: string }) =>
      apiFetch<User>(`/users/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
    },
  });
};

// ======================
// Caregivers
// ======================


// ======================
// Recipients
// ======================
export const useGetRecipientsByCaregiver = (caregiverId: string) =>
  useQuery({
    queryKey: ["recipients", caregiverId],
    queryFn: () =>
      apiFetch<Recipient[]>(`/caregivers/${caregiverId}/recipients`),
  });
  
export const useGetAllRecipients = (caregiverId?: string) =>
  useQuery({
    queryKey: ["recipients"],
    queryFn: () => apiFetch<Recipient[]>(`/recipients?caregiverId=${caregiverId}`),
  });

  export const useGetRecipientById = (recipientId: number) =>
    useQuery({
      queryKey: ['recipient', recipientId],
      queryFn: () => apiFetch<User>(`/recipients/${recipientId}`),
      enabled: recipientId > 0,
  });
  
  export const useGetRecipientByUserId = (userId: string) => 
    useQuery({
      queryKey: ["recipients", userId],
    queryFn: () => apiFetch<Recipient>(`/recipients/user/${userId}`),
  })

// ======================
// Care Requests
// ======================
export const useSendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { caregiverId: string; recipientId: string }) =>
      apiFetch<CareRequest>(`/requests`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
};

export const useGetPendingRequestsForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ["pending-requests", recipientId],
    queryFn: () =>
      apiFetch<CareRequest[]>(
        `/recipients/${recipientId}/requests?status=pending`
      ),
  });

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      requestId: string;
      status: "accepted" | "rejected";
    }) =>
      apiFetch<CareRequest>(`/requests/${data.requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      queryClient.invalidateQueries({ queryKey: ["caregivers"] });
    },
  });
};

export const useCaregiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ["caregivers", recipientId],
    queryFn: () => apiFetch<User[]>(`/recipients/${recipientId}/caregivers`),
  });

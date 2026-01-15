// Tanstack Query hooks for data fetching

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./index.ts";
import type { CareRelationship, Recipient } from "@/types/users.ts";
import type { User } from "@/types/auth.ts";

// ======================
// Users
// ======================
export const useGetUser = (userId: string) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiFetch<User>(`/users/${userId}`),
  });

export const useRecipientFromId = (recipientId: number) =>
  useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: () => apiFetch<User>(`/recipients/${recipientId}`),
    enabled: recipientId > 0,
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
// Recipients
// ======================
export const useGetRecipientsByCaregiver = (caregiverId: string) =>
  useQuery({
    queryKey: ["recipients", caregiverId],
    queryFn: () =>
      apiFetch<Recipient[]>(`/caregivers/${caregiverId}/recipients`),
  });

export const useGetAllRecipients = () =>
  useQuery({
    queryKey: ["recipients"],
    queryFn: () =>
      apiFetch<Recipient[]>('/recipients'),
  });

// ======================
// Care Relationships
// ======================

export const useAssignRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { caregiverId: string; recipientId: string }) =>
      apiFetch<CareRelationship>(`/care-relationships`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      queryClient.invalidateQueries({ queryKey: ["all-recipients"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
    },
  });
};

export const usePendingRequests = (recipientId: string) =>
  useQuery({
    queryKey: ["pending-requests", recipientId],
    queryFn: () =>
      apiFetch<CareRelationship[]>(
        `/recipients/${recipientId}/pending-requests`
      ),
  });

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      requestId: string;
      status: "accepted" | "rejected";
    }) =>
      apiFetch<CareRelationship>(`/care-relationships/${data.requestId}`, {
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

export const useCareRelationship = (caregiverId: string, recipientId: string) =>
  useQuery({
    queryKey: ["care-relationship", caregiverId, recipientId],
    queryFn: () =>
      apiFetch<CareRelationship | null>(
        `/care-relationships?caregiverId=${caregiverId}&recipientId=${recipientId}`
      ),
  });

export const useCaregiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ["caregivers", recipientId],
    queryFn: () => apiFetch<User[]>(`/recipients/${recipientId}/caregivers`),
  });

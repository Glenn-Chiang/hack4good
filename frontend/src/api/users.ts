// Tanstack Query hooks for data fetching

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from './index.ts'
import type { Caregiver, CareRequest, Recipient } from '@/types/users.ts'
import type { User } from '@/types/auth.ts'
import { useAuth } from '@/auth/AuthProvider'

// ======================
// Users
// ======================

// ======================
// Caregivers
// ======================

export const useUpdateCaregivers = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()

  return useMutation({
    mutationFn: (data: Partial<User> & { id: string }) =>
      apiFetch<User>(`/caregivers/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['user', user.id] })
      queryClient.invalidateQueries({ queryKey: ['recipients'] })
      updateUser({ name: user.name })
    },
  })
}

// ======================
// Caregivers
// ======================
export const useGetCaregiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ['recipients', recipientId, 'caregivers'],
    queryFn: () =>
      apiFetch<Caregiver[]>(`/recipients/${recipientId}/caregivers`),
    enabled: !!recipientId,
  })

export const useGetCaregiverByUserId = (userId: string) =>
  useQuery({
    queryKey: ['caregivers', 'user', userId],
    queryFn: () => apiFetch<Caregiver>(`/caregivers/user/${userId}`),
    enabled: !!userId,
  })

// ======================
// Recipients
// ======================
export const useGetRecipientsByCaregiver = (caregiverId: string) =>
  useQuery({
    queryKey: ['caregivers', caregiverId, 'recipients'],
    queryFn: () =>
      apiFetch<Recipient[]>(`/caregivers/${caregiverId}/recipients`),
    enabled: !!caregiverId,
  })

export const useGetAllRecipients = (caregiverId?: string) =>
  useQuery({
    queryKey: ['recipients'],
    queryFn: () =>
      apiFetch<Recipient[]>(`/recipients?caregiverId=${caregiverId}`),
    enabled: !!caregiverId,
  })

export const useGetRecipientById = (recipientId: string) =>
  useQuery({
    queryKey: ['recipients', recipientId],
    queryFn: () => apiFetch<Recipient>(`/recipients/${recipientId}`),
    enabled: recipientId !== '',
  })

export const useGetRecipientByUserId = (userId: string) =>
  useQuery({
    queryKey: ['recipients', 'user', userId],
    queryFn: () => apiFetch<Recipient>(`/recipients/user/${userId}`),
    enabled: userId !== '',
  })

export const useUpdateRecipient = () => {
  const queryClient = useQueryClient()
  const { updateUser } = useAuth()
  return useMutation({
    mutationFn: (data: Partial<Recipient> & { id: string }) =>
      apiFetch<Recipient>(`/recipients/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (recipient) => {
      queryClient.invalidateQueries({ queryKey: ['recipients', recipient.id] })
      updateUser({ name: recipient.name })
    },
  })
}

// ======================
// Care Requests
// ======================
export const useSendRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { caregiverId: string; recipientId: string }) =>
      apiFetch<CareRequest>(`/requests`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] })
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
    },
  })
}

export const useGetPendingRequestsForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ['pending-requests', recipientId],
    queryFn: () =>
      apiFetch<CareRequest[]>(
        `/recipients/${recipientId}/requests?status=pending`,
      ),
    enabled: !!recipientId,
  })

export const useRespondToRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      requestId: string
      status: 'accepted' | 'rejected'
    }) =>
      apiFetch<CareRequest>(`/requests/${data.requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
      queryClient.invalidateQueries({ queryKey: ['recipients'] })
      queryClient.invalidateQueries({ queryKey: ['caregivers'] })
    },
  })
}

export const useCaregiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ['caregivers', recipientId],
    queryFn: () => apiFetch<User[]>(`/recipients/${recipientId}/caregivers`),
    enabled: recipientId !== '',
  })

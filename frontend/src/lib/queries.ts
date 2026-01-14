// Tanstack Query hooks for data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Todo,
  JournalEntry,
  Comment,
  MoodType,
  User,
  CareRelationship,
} from '../types/types.ts';

// ======================
// Backend API helper
// ======================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}

// ======================
// Users
// ======================

export const useRecipients = (caregiverId: string) =>
  useQuery({
    queryKey: ['recipients', caregiverId],
    queryFn: () => api<User[]>(`/caregivers/${caregiverId}/recipients`),
  });

export const useUser = (userId: string) =>
  useQuery({
    queryKey: ['user', userId],
    queryFn: () => api<User>(`/users/${userId}`),
  });

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User> & { id: string }) =>
      api<User>(`/users/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useAddRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<User, 'id' | 'role'>) =>
      api<User>(`/recipients`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useAllRecipients = () =>
  useQuery({
    queryKey: ['all-recipients'],
    queryFn: () => api<User[]>(`/recipients`),
  });

// ======================
// Care Relationships
// ======================

export const useAssignRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { caregiverId: string; recipientId: string }) =>
      api<CareRelationship>(`/care-relationships`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['all-recipients'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (newUser: Omit<User, 'id'>) =>
      api<User>(`/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(newUser),
      }),
  });
};


export const usePendingRequests = (recipientId: string) =>
  useQuery({
    queryKey: ['pending-requests', recipientId],
    queryFn: () =>
      api<CareRelationship[]>(`/recipients/${recipientId}/pending-requests`),
  });

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      requestId: string;
      status: 'accepted' | 'rejected';
    }) =>
      api<CareRelationship>(`/care-relationships/${data.requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });
};

export const useCareRelationship = (
  caregiverId: string,
  recipientId: string
) =>
  useQuery({
    queryKey: ['care-relationship', caregiverId, recipientId],
    queryFn: () =>
      api<CareRelationship | null>(
        `/care-relationships?caregiverId=${caregiverId}&recipientId=${recipientId}`
      ),
  });

export const useNonCareGiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ['non-caregivers', recipientId],
    queryFn: () =>
      api<User[]>(`/recipients/${recipientId}/non-caregivers`),
  });
  

export const useCaregiversForRecipient = (recipientId: string) =>
  useQuery({
    queryKey: ['caregivers', recipientId],
    queryFn: () =>
      api<User[]>(`/recipients/${recipientId}/caregivers`),
  });

// ======================
// Todos
// ======================

export const useTodos = (caregiverId: string) =>
  useQuery({
    queryKey: ['todos', caregiverId],
    queryFn: () =>
      api<Todo[]>(`/caregivers/${caregiverId}/todos`),
  });

export const useRecipientTodos = (recipientId: string) =>
  useQuery({
    queryKey: ['recipient-todos', recipientId],
    queryFn: () =>
      api<Todo[]>(`/recipients/${recipientId}/todos`),
  });

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) =>
      api<Todo>(`/todos/${todoId}/toggle`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Todo, 'id'>) =>
      api<Todo>(`/todos`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// ======================
// Journal Entries
// ======================

export const useJournalEntries = (recipientId: string) =>
  useQuery({
    queryKey: ['journal-entries', recipientId],
    queryFn: () =>
      api<JournalEntry[]>(`/recipients/${recipientId}/journals`),
  });

export const useAllJournalEntries = () =>
  useQuery({
    queryKey: ['all-journal-entries'],
    queryFn: () =>
      api<JournalEntry[]>(`/journals`),
  });

export const useAddJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recipientId: string;
      content: string;
      mood: MoodType;
      hasVoiceMessage?: boolean;
    }) =>
      api<JournalEntry>(`/journals`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['all-journal-entries'] });
    },
  });
};

// ======================
// Comments
// ======================

export const useComments = (journalEntryId: string) =>
  useQuery({
    queryKey: ['comments', journalEntryId],
    queryFn: () =>
      api<Comment[]>(`/journals/${journalEntryId}/comments`),
  });

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      journalEntryId: string;
      content: string;
      authorId: string;
      authorRole: 'caregiver' | 'recipient';
    }) =>
      api<Comment>(`/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', vars.journalEntryId],
      });
    },
  });
};


// ======================
// Journal Entries
// ======================

import type { Comment, JournalEntry, MoodType } from "@/types/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiFetch } from ".";

export const useJournalEntries = (recipientId: string) =>
  useQuery({
    queryKey: ["journal-entries", recipientId],
    queryFn: () =>
      apiFetch<JournalEntry[]>(`/journal-entries?recipientId=${recipientId}`),
  });

export const useAcceptedJournalEntries = (caregiverId: string) =>
  useQuery({
    queryKey: ["all-journal-entries"],
    queryFn: () => apiFetch<JournalEntry[]>(`/journal-entries/accepted?caregiverId=${caregiverId}`),
  });

export const useAddJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      recipientId: string;
      content: string;
      mood: MoodType;
    }) =>
      apiFetch<JournalEntry>(`/journal-entries`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["all-journal-entries"] });
    },
  });
};


// ======================
// Comments
// ======================

export const useComments = (journalEntryId : number) =>
  useQuery({
    queryKey: ["comments", journalEntryId],
    queryFn: () =>
      apiFetch<Comment[]>(`/comments?journalEntryId=${journalEntryId}`),
    enabled: !!journalEntryId,
  });


export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      journalEntryId: string;
      content: string;
      authorId: string;
    }) =>
      apiFetch<Comment>(`/comments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", vars.journalEntryId],
      });
    },
  });
};


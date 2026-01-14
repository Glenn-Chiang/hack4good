// ======================
// Journal Entries
// ======================

import type { JournalEntry, MoodType } from "@/types/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiFetch } from ".";

export const useJournalEntries = (recipientId: string) =>
  useQuery({
    queryKey: ["journal-entries", recipientId],
    queryFn: () =>
      apiFetch<JournalEntry[]>(`/recipients/${recipientId}/journals`),
  });

export const useAllJournalEntries = () =>
  useQuery({
    queryKey: ["all-journal-entries"],
    queryFn: () => apiFetch<JournalEntry[]>(`/journals`),
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
      apiFetch<JournalEntry>(`/journals`, {
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

export const useComments = (journalEntryId: string) =>
  useQuery({
    queryKey: ["comments", journalEntryId],
    queryFn: () => apiFetch<Comment[]>(`/journals/${journalEntryId}/comments`),
  });

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      journalEntryId: string;
      content: string;
      authorId: string;
      authorRole: "caregiver" | "recipient";
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

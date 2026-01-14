// ======================
// Todos
// ======================

import type { Todo } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from ".";

export const useTodos = (caregiverId: string) =>
  useQuery({
    queryKey: ["todos", caregiverId],
    queryFn: () => apiFetch<Todo[]>(`/caregivers/${caregiverId}/todos`),
  });

export const useRecipientTodos = (recipientId: string) =>
  useQuery({
    queryKey: ["recipient-todos", recipientId],
    queryFn: () => apiFetch<Todo[]>(`/recipients/${recipientId}/todos`),
  });

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) =>
      apiFetch<Todo>(`/todos/${todoId}/toggle`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Todo, "id">) =>
      apiFetch<Todo>(`/todos`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

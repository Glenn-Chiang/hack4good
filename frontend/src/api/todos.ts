// ======================
// Todos
// ======================

import type { Todo } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from ".";

export type CreateTodoInput = {
  title: string;
  description: string;
  dueDate: string; 
  recipientId: number;
  caregiverId: number;
  priority: "low" | "medium" | "high";
};

export const useTodos = (caregiverId: string) =>
  useQuery({
    queryKey: ["todos", caregiverId],
    enabled: !!caregiverId,
    queryFn: () => apiFetch<Todo[]>(`/caregivers/${caregiverId}/todos`),
  });

export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: number) =>
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
    mutationFn: (data: CreateTodoInput) =>
      apiFetch<Todo>(`/todos`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
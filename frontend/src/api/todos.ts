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

export const useTodos = (caregiverId: string, recipientId?: string) =>
  useQuery({
    queryKey: ["todos", caregiverId, recipientId],
    enabled: !!caregiverId,
    queryFn: () => {
      const qs = new URLSearchParams({ caregiverId });
      if (recipientId) qs.set("recipientId", recipientId);
      return apiFetch<Todo[]>(`/todos?${qs.toString()}`);
    },
  });


export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: { id: number; completed: boolean }) =>
      apiFetch<Todo>(`/todos/${todo.id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !todo.completed }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
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
// Tanstack Query hooks for data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecipientsByCaregiver,
  getTodosByCaregiver,
  getJournalsByRecipient,
  getCommentsByJournalEntry,
  getUserById,
  getAllRecipients,
  getCareRelationship,
  getPendingRequestsForRecipient,
  getCaregiversForRecipient,
  todos,
  journalEntries,
  comments,
  users,
  careRelationships,
  type Todo,
  type JournalEntry,
  type Comment,
  type MoodType,
  type User,
  type CareRelationship,
} from './mock-data';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Users
export const useRecipients = (caregiverId: string) => {
  return useQuery({
    queryKey: ['recipients', caregiverId],
    queryFn: async () => {
      await delay(300);
      return getRecipientsByCaregiver(caregiverId);
    },
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      await delay(200);
      return getUserById(userId);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedUser: Partial<User> & { id: string }) => {
      await delay(300);
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        return users[userIndex];
      }
      throw new Error('User not found');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useAddRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newRecipient: Omit<User, 'id' | 'role'>) => {
      await delay(300);
      const recipient: User = {
        ...newRecipient,
        id: `recipient-${Date.now()}`,
        role: 'recipient',
      };
      users.push(recipient);
      return recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
};

export const useAllRecipients = () => {
  return useQuery({
    queryKey: ['all-recipients'],
    queryFn: async () => {
      await delay(300);
      return getAllRecipients();
    },
  });
};

export const useAssignRecipient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recipientId, caregiverId }: { recipientId: string; caregiverId: string }) => {
      await delay(300);
      
      // Check if relationship already exists
      const existing = getCareRelationship(caregiverId, recipientId);
      if (existing) {
        throw new Error('Request already sent or relationship already exists');
      }
      
      // Create a pending relationship request
      const relationship: CareRelationship = {
        id: `rel-${Date.now()}`,
        caregiverId,
        recipientId,
        status: 'pending',
        requestedAt: new Date(),
      };
      careRelationships.push(relationship);
      return relationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['all-recipients'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (newUser: Omit<User, 'id'>) => {
      await delay(300);
      
      // Check if username already exists
      const existingUser = users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase());
      if (existingUser) {
        throw new Error('This username is already taken');
      }
      
      const user: User = {
        ...newUser,
        id: `${newUser.role}-${Date.now()}`,
      };
      users.push(user);
      return user;
    },
  });
};

export const usePendingRequests = (recipientId: string) => {
  return useQuery({
    queryKey: ['pending-requests', recipientId],
    queryFn: async () => {
      await delay(200);
      return getPendingRequestsForRecipient(recipientId);
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      await delay(300);
      const relationshipIndex = careRelationships.findIndex(r => r.id === requestId);
      if (relationshipIndex !== -1) {
        careRelationships[relationshipIndex].status = status;
        careRelationships[relationshipIndex].respondedAt = new Date();
        return careRelationships[relationshipIndex];
      }
      throw new Error('Request not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });
};

export const useCareRelationship = (caregiverId: string, recipientId: string) => {
  return useQuery({
    queryKey: ['care-relationship', caregiverId, recipientId],
    queryFn: async () => {
      await delay(200);
      return getCareRelationship(caregiverId, recipientId);
    },
  });
};

export const useCaregiversForRecipient = (recipientId: string) => {
  return useQuery({
    queryKey: ['caregivers', recipientId],
    queryFn: async () => {
      await delay(200);
      return getCaregiversForRecipient(recipientId);
    },
  });
};

// Todos
export const useTodos = (caregiverId: string) => {
  return useQuery({
    queryKey: ['todos', caregiverId],
    queryFn: async () => {
      await delay(300);
      return getTodosByCaregiver(caregiverId);
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (todoId: string) => {
      await delay(200);
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = !todo.completed;
      }
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useAddTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id'>) => {
      await delay(300);
      const todo: Todo = {
        ...newTodo,
        id: `todo-${Date.now()}`,
      };
      todos.push(todo);
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

// Journal Entries
export const useJournalEntries = (recipientId: string) => {
  return useQuery({
    queryKey: ['journal-entries', recipientId],
    queryFn: async () => {
      await delay(300);
      return getJournalsByRecipient(recipientId);
    },
  });
};

export const useAllJournalEntries = () => {
  return useQuery({
    queryKey: ['all-journal-entries'],
    queryFn: async () => {
      await delay(300);
      return journalEntries;
    },
  });
};

export const useAddJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newEntry: {
      recipientId: string;
      content: string;
      mood: MoodType;
      hasVoiceMessage?: boolean;
    }) => {
      await delay(300);
      const entry: JournalEntry = {
        id: `journal-${Date.now()}`,
        recipientId: newEntry.recipientId,
        content: newEntry.content,
        mood: newEntry.mood,
        createdAt: new Date(),
        hasVoiceMessage: newEntry.hasVoiceMessage || false,
      };
      journalEntries.unshift(entry);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['all-journal-entries'] });
    },
  });
};

// Comments
export const useComments = (journalEntryId: string) => {
  return useQuery({
    queryKey: ['comments', journalEntryId],
    queryFn: async () => {
      await delay(200);
      return getCommentsByJournalEntry(journalEntryId);
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newComment: {
      journalEntryId: string;
      content: string;
      caregiverId: string;
    }) => {
      await delay(300);
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        journalEntryId: newComment.journalEntryId,
        caregiverId: newComment.caregiverId,
        content: newComment.content,
        createdAt: new Date(),
      };
      comments.push(comment);
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.journalEntryId] });
    },
  });
};
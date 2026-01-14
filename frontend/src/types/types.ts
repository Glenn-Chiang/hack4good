import type { UserRole } from "./auth";

export interface Todo {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  recipientId: number;
  caregiverId: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export type MoodType = 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited';

export interface JournalEntry {
  id: string;
  recipientId: string;
  content: string;
  mood: MoodType;
  createdAt: Date;
  hasVoiceMessage: boolean;
  voiceMessageUrl?: string;
}

export interface Comment {
  id: string;
  journalEntryId: string;
  authorId: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
}
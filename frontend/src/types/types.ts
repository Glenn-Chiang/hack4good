import type { UserRole } from "./auth";
import type { Recipient } from "./users";

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  recipientId: string;
  caregiverId: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export type MoodType = 'happy' | 'sad' | 'neutral' | 'anxious' | 'excited';

export interface JournalEntry {
  id: string;
  recipientId: string;
  recipient: Recipient;
  content: string;
  mood: MoodType;
  createdAt: Date;
  hasVoiceMessage: boolean;
  voiceMessageUrl?: string;
}

export interface Comment {
  id: string;
  journalEntryId: number;
  authorId: number;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
}
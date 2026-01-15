// Mock data for the caregiver/recipient app

export type UserRole = 'caregiver' | 'recipient';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  avatar?: string;
  age?: number;
  condition?: string;
  likes?: string; 
  dislikes?: string;
  phobias?: string;
  petPeeves?: string;
  recipientId?: number;
  caregiverId?: number;
}

export type RelationshipStatus = 'pending' | 'accepted' | 'rejected';

export interface CareRelationship {
  id: string;
  caregiverId: string;
  recipientId: string;
  status: RelationshipStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

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
  recipientName: string;
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
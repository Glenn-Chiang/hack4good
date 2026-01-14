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
import type { User } from "./auth";

export interface Recipient {
  id: string;
  userId: string;
  user: User;
  name:string;
  age?: number;
  condition?: string;
  likes?: string;
  dislikes?: string;
  phobias?: string;
  petPeeves?: string;
}

export interface Caregiver {
  id: string;
  userId: string;
  user: User;
}

export type RelationshipStatus = "pending" | "accepted" | "rejected";

export interface CareRelationship {
  id: string;
  caregiverId: string;
  recipientId: string;
  status: RelationshipStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

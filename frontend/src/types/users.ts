import type { User } from "./auth";

export interface Recipient {
  id: string;
  userId: string;
  user: User;
  age?: number;
  condition?: string;
  likes?: string;
  dislikes?: string;
  phobias?: string;
  petPeeves?: string;

  requestStatus?: CareRequestStatus;
  requestId?: number;
}

export interface Caregiver {
  id: string;
  userId: string;
  user: User;
}

export type CareRequestStatus = "pending" | "accepted" | "rejected";

export interface CareRequest {
  id: string;
  caregiverId: string;
  recipientId: string;
  caregiver: Caregiver;
  recipient: Recipient;
  status: CareRequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
}

export type UserRole = "caregiver" | "recipient";

export type User = {
  id: string;
  username: string;
  name: string
  role: UserRole;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type LoginPostData = {
  username: string;
  password: string;
};

export interface SignUpPostData {
  username: string;
  password: string; 
  name: string;
  role: UserRole;

  caregiver?: {
  };

  recipient?: {
    age?: number;
    condition?: string;
    likes?: string;
    dislikes?: string;
    phobias?: string;
    petPeeves?: string;
  };
}

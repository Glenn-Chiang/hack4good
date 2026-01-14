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
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  recipientId: string;
  caregiverId: string;
  priority: 'low' | 'medium' | 'high';
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

// Mock care relationships
export const careRelationships: CareRelationship[] = [
  {
    id: 'rel-1',
    caregiverId: 'caregiver-1',
    recipientId: 'recipient-1',
    status: 'accepted',
    requestedAt: new Date(2026, 0, 1),
    respondedAt: new Date(2026, 0, 2),
  },
  {
    id: 'rel-2',
    caregiverId: 'caregiver-1',
    recipientId: 'recipient-2',
    status: 'accepted',
    requestedAt: new Date(2026, 0, 1),
    respondedAt: new Date(2026, 0, 2),
  },
  {
    id: 'rel-3',
    caregiverId: 'caregiver-1',
    recipientId: 'recipient-3',
    status: 'accepted',
    requestedAt: new Date(2026, 0, 1),
    respondedAt: new Date(2026, 0, 2),
  },
  {
    id: 'rel-4',
    caregiverId: 'caregiver-1',
    recipientId: 'recipient-4',
    status: 'pending',
    requestedAt: new Date(2026, 0, 12),
  },
];

// Mock users
export const users: User[] = [
  {
    id: 'caregiver-1',
    name: 'Sarah Johnson',
    username: 'sarahj',
    password: 'password123',
    role: 'caregiver',
  },
  {
    id: 'recipient-1',
    name: 'Robert Miller',
    username: 'robertm',
    password: 'password123',
    role: 'recipient',
    age: 78,
    condition: 'Alzheimer\'s Disease',
    likes: 'Classical music, walking in the park, spending time with grandchildren',
    dislikes: 'Loud noises, crowded places',
    phobias: 'Fear of the dark',
    petPeeves: 'People speaking too fast',
  },
  {
    id: 'recipient-2',
    name: 'Emily Davis',
    username: 'emilyd',
    password: 'password123',
    role: 'recipient',
    age: 65,
    condition: 'Parkinson\'s Disease',
    likes: 'Gardening, reading romance novels, bird watching',
    dislikes: 'Cold weather, spicy food',
    phobias: 'Fear of falling',
    petPeeves: 'Being rushed during meals',
  },
  {
    id: 'recipient-3',
    name: 'Michael Chen',
    username: 'michaelc',
    password: 'password123',
    role: 'recipient',
    age: 82,
    condition: 'Post-Stroke Care',
    likes: 'Chess, documentary films, tea',
    dislikes: 'Being interrupted, loud music',
    phobias: 'Fear of hospitals',
    petPeeves: 'Pity from others',
  },
  {
    id: 'recipient-4',
    name: 'Margaret Thompson',
    username: 'margaretth',
    password: 'password123',
    role: 'recipient',
    age: 71,
    condition: 'Diabetes Management',
    likes: 'Knitting, crossword puzzles, family photos',
    dislikes: 'Sweets (though tempted), rainy days',
    phobias: 'Fear of needles',
    petPeeves: 'Forgetting names',
  },
  {
    id: 'recipient-5',
    name: 'James Wilson',
    username: 'jamesw',
    password: 'password123',
    role: 'recipient',
    age: 76,
    condition: 'Heart Condition',
    likes: 'Fishing, old westerns, playing cards',
    dislikes: 'Technology, loud crowds',
    phobias: 'Fear of confined spaces',
    petPeeves: 'Being treated like a child',
  },
];

// Mock todos
export const todos: Todo[] = [
  {
    id: 'todo-1',
    title: 'Morning medication for Robert',
    description: 'Administer morning medications with breakfast',
    dueDate: new Date(2026, 0, 14, 8, 0),
    completed: false,
    recipientId: 'recipient-1',
    caregiverId: 'caregiver-1',
    priority: 'high',
  },
  {
    id: 'todo-2',
    title: 'Physical therapy session - Emily',
    description: 'Accompany Emily to physical therapy appointment',
    dueDate: new Date(2026, 0, 14, 14, 0),
    completed: false,
    recipientId: 'recipient-2',
    caregiverId: 'caregiver-1',
    priority: 'medium',
  },
  {
    id: 'todo-3',
    title: 'Grocery shopping for Michael',
    description: 'Pick up groceries and meal prep supplies',
    dueDate: new Date(2026, 0, 15, 10, 0),
    completed: false,
    recipientId: 'recipient-3',
    caregiverId: 'caregiver-1',
    priority: 'low',
  },
  {
    id: 'todo-4',
    title: 'Doctor appointment - Robert',
    description: 'Quarterly check-up with Dr. Anderson',
    dueDate: new Date(2026, 0, 16, 11, 0),
    completed: false,
    recipientId: 'recipient-1',
    caregiverId: 'caregiver-1',
    priority: 'high',
  },
  {
    id: 'todo-5',
    title: 'Evening medication for Emily',
    description: 'Administer evening medications before bedtime',
    dueDate: new Date(2026, 0, 13, 20, 0),
    completed: true,
    recipientId: 'recipient-2',
    caregiverId: 'caregiver-1',
    priority: 'high',
  },
  {
    id: 'todo-6',
    title: 'Social activity - Michael',
    description: 'Organize group activity at community center',
    dueDate: new Date(2026, 0, 17, 15, 0),
    completed: false,
    recipientId: 'recipient-3',
    caregiverId: 'caregiver-1',
    priority: 'medium',
  },
];

// Mock journal entries
export const journalEntries: JournalEntry[] = [
  {
    id: 'journal-1',
    recipientId: 'recipient-1',
    content: 'Today was a good day. I had a nice breakfast and remembered my grandson\'s name when he called. That made me happy.',
    mood: 'happy',
    createdAt: new Date(2026, 0, 13, 19, 30),
    hasVoiceMessage: false,
  },
  {
    id: 'journal-2',
    recipientId: 'recipient-2',
    content: 'Physical therapy was challenging today. My hands are shaking more than usual, which is frustrating.',
    mood: 'sad',
    createdAt: new Date(2026, 0, 13, 16, 45),
    hasVoiceMessage: true,
    voiceMessageUrl: '/mock-voice-message.mp3',
  },
  {
    id: 'journal-3',
    recipientId: 'recipient-3',
    content: 'Feeling okay today. Watched my favorite show and had a visitor.',
    mood: 'neutral',
    createdAt: new Date(2026, 0, 13, 14, 20),
    hasVoiceMessage: false,
  },
  {
    id: 'journal-4',
    recipientId: 'recipient-1',
    content: 'I couldn\'t remember where I put my glasses. It took me hours to find them. I feel confused and worried.',
    mood: 'anxious',
    createdAt: new Date(2026, 0, 12, 21, 10),
    hasVoiceMessage: false,
  },
  {
    id: 'journal-5',
    recipientId: 'recipient-2',
    content: 'My daughter is coming to visit this weekend! I\'m looking forward to seeing her and the grandkids.',
    mood: 'excited',
    createdAt: new Date(2026, 0, 12, 10, 15),
    hasVoiceMessage: false,
  },
];

// Mock comments
export const comments: Comment[] = [
  {
    id: 'comment-1',
    journalEntryId: 'journal-1',
    authorId: 'caregiver-1',
    authorRole: 'caregiver',
    content: 'That\'s wonderful to hear, Robert! Those moments of clarity are precious. Keep up the positive attitude!',
    createdAt: new Date(2026, 0, 13, 20, 0),
  },
  {
    id: 'comment-2',
    journalEntryId: 'journal-2',
    authorId: 'caregiver-1',
    authorRole: 'caregiver',
    content: 'I understand it\'s frustrating, Emily. Remember that progress isn\'t always linear. Let\'s talk to your PT about adjusting the exercises.',
    createdAt: new Date(2026, 0, 13, 17, 30),
  },
  {
    id: 'comment-3',
    journalEntryId: 'journal-4',
    authorId: 'caregiver-1',
    authorRole: 'caregiver',
    content: 'It\'s okay to feel worried, Robert. Let\'s set up a designated spot for your glasses. Maybe we can get a bright case to make them easier to find?',
    createdAt: new Date(2026, 0, 12, 21, 45),
  },
];

// Helper functions
export const getRecipientsByCaregiver = (caregiverId: string): User[] => {
  // Get accepted relationships for this caregiver
  const acceptedRelationships = careRelationships.filter(
    r => r.caregiverId === caregiverId && r.status === 'accepted'
  );
  const recipientIds = acceptedRelationships.map(r => r.recipientId);
  return users.filter(u => u.role === 'recipient' && recipientIds.includes(u.id));
};

export const getUnassignedRecipients = (): User[] => {
  return users.filter(u => u.role === 'recipient');
};

export const getAllRecipients = (): User[] => {
  return users.filter(u => u.role === 'recipient');
};

export const getCareRelationship = (caregiverId: string, recipientId: string): CareRelationship | undefined => {
  return careRelationships.find(
    r => r.caregiverId === caregiverId && r.recipientId === recipientId
  );
};

export const getPendingRequestsForRecipient = (recipientId: string): CareRelationship[] => {
  return careRelationships.filter(
    r => r.recipientId === recipientId && r.status === 'pending'
  );
};

export const getCaregiversForRecipient = (recipientId: string): User[] => {
  const acceptedRelationships = careRelationships.filter(
    r => r.recipientId === recipientId && r.status === 'accepted'
  );
  const caregiverIds = acceptedRelationships.map(r => r.caregiverId);
  return users.filter(u => u.role === 'caregiver' && caregiverIds.includes(u.id));
};

export const getTodosByCaregiver = (caregiverId: string): Todo[] => {
  return todos.filter(t => t.caregiverId === caregiverId);
};

export const getJournalsByRecipient = (recipientId: string): JournalEntry[] => {
  return journalEntries.filter(j => j.recipientId === recipientId);
};

export const getCommentsByJournalEntry = (journalEntryId: string): Comment[] => {
  return comments.filter(c => c.journalEntryId === journalEntryId);
};

export const getUserById = (userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};
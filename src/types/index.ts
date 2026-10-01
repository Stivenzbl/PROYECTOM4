export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // Formato ISO YYYY-MM-DD
  userId: string;
  createdAt: number; // Timestamp en milisegundos
  updatedAt?: number;
  order: number;
}

export type TaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
};

export type TaskFilter = 'all' | 'pending' | 'completed';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface EmailSummaryPayload {
  tasks: Task[];
  userEmail: string;
  userName?: string;
}

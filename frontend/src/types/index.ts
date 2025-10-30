// Auth Types
export interface User {
  userId: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Project Types
export interface Project {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
}

export interface UpdateProjectDTO {
  title: string;
  description?: string;
}

// Task Types
export interface Task {
  id: number;
  title: string;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  projectId: number;
}

export interface CreateTaskDTO {
  title: string;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title: string;
  dueDate?: string;
  isCompleted: boolean;
}

import axios from "axios";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
} from "../types";

// ✅ USE ACTUAL RENDER URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://task-manager-api-5p1n.onrender.com";

console.log("🔌 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post("/api/auth/register", credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post("/api/auth/login", credentials);
    return data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get("/api/projects");
    return data;
  },

  getById: async (id: number): Promise<Project> => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data;
  },

  create: async (project: CreateProjectDTO): Promise<Project> => {
    const { data } = await api.post("/api/projects", project);
    return data;
  },

  update: async (id: number, project: UpdateProjectDTO): Promise<Project> => {
    const { data } = await api.put(`/api/projects/${id}`, project);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (projectId: number): Promise<Task[]> => {
    const { data } = await api.get(`/api/projects/${projectId}/tasks`);
    return data;
  },

  create: async (projectId: number, task: CreateTaskDTO): Promise<Task> => {
    const { data } = await api.post(`/api/projects/${projectId}/tasks`, task);
    return data;
  },

  update: async (taskId: number, task: UpdateTaskDTO): Promise<Task> => {
    const { data } = await api.put(`/api/tasks/${taskId}`, task);
    return data;
  },

  toggle: async (taskId: number): Promise<Task> => {
    const { data } = await api.patch(`/api/tasks/${taskId}/toggle`);
    return data;
  },

  delete: async (taskId: number): Promise<void> => {
    await api.delete(`/api/tasks/${taskId}`);
  },
};

export default api;

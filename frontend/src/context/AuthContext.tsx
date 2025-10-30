import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../services/api";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user in localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response: AuthResponse = await authAPI.login(credentials);
    const userData: User = {
      userId: response.userId,
      username: response.username,
      email: response.email,
    };

    setToken(response.token);
    setUser(userData);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const register = async (credentials: RegisterCredentials) => {
    const response: AuthResponse = await authAPI.register(credentials);
    const userData: User = {
      userId: response.userId,
      username: response.username,
      email: response.email,
    };

    setToken(response.token);
    setUser(userData);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

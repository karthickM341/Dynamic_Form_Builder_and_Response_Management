import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { api } from "../api/client";

interface User {
  id?: number;
  username: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>({
    user: null,
    login: async () => {},
    logout: () => {},
  });

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const login = async (
    username: string,
    password: string
  ): Promise<void> => {
    const response = await api.post(
      "/auth/login",
      {
        username,
        password,
      }
    );

    const token =
      response.data.access_token;

    localStorage.setItem(
      "token",
      token
    );

    const meResponse =
      await api.get("/auth/me");

    setUser(meResponse.data);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const loadCurrentUser =
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const response =
            await api.get(
              "/auth/me"
            );

          setUser(response.data);
        } catch (error) {
          console.error(
            "Authentication check failed:",
            error
          );

          localStorage.removeItem(
            "token"
          );

          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    loadCurrentUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
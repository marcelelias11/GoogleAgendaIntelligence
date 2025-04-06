import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export interface User {
  id: number;
  username: string;
  email: string;
  picture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verificar estado de autenticação
  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/status", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.authenticated) {
        // Se autenticado, buscar informações do usuário
        const userRes = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userData,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível verificar seu status de autenticação.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Obter URL de login
  const getLoginUrl = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/url");
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Erro ao obter URL de login:", error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível obter o link de login.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Fazer logout
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout");
      if (res.ok) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
        // Limpar o cache do React Query
        queryClient.clear();
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao fazer logout",
          description: "Não foi possível desconectar sua conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    }
  };

  return {
    ...authState,
    checkAuthStatus,
    getLoginUrl,
    logout,
  };
}

import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Assistant from "@/pages/Assistant";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import OAuthModal from "@/components/Auth/OAuthModal";
import { useLocation } from "wouter";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    // Verificar autenticação ao carregar a aplicação
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          
          if (!data.authenticated) {
            setShowAuthModal(true);
          }
        } else {
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    };

    checkAuth();
  }, []);

  // Definir o título da página baseado na rota atual
  useEffect(() => {
    const pathSegments = location.split("/");
    let title = "AssistenteCalendário";
    
    if (pathSegments.length > 1 && pathSegments[1] !== "") {
      const pageName = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
      title += ` - ${pageName}`;
    }
    
    document.title = title;
  }, [location]);

  // Carregar os ícones do Material Design
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  if (isAuthenticated === null) {
    // Estado de carregamento
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex flex-1 overflow-hidden">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/assistant" component={Assistant} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
        {showAuthModal && (
          <OAuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
        )}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;

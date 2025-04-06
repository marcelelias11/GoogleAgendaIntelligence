import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header = ({ isAuthenticated }: HeaderProps) => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    // Fechar o menu móvel quando a rota mudar
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                id="sidebarToggle"
                className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 lg:hidden"
                onClick={handleMobileToggle}
              >
                <span className="material-icons">menu</span>
              </button>
              <Link href="/" className="flex items-center">
                <span className="material-icons text-primary mr-2">event</span>
                <span className="text-xl font-medium text-primary">AssistenteCalendário</span>
              </Link>
            </div>
            <nav className="hidden lg:ml-6 lg:flex lg:space-x-8">
              <Link
                href="/"
                className={`${
                  location === "/" 
                    ? "border-b-2 border-primary text-primary" 
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                } px-1 pt-1 pb-3 text-sm font-medium`}
              >
                Agenda
              </Link>
              <Link
                href="/assistant"
                className={`${
                  location === "/assistant" 
                    ? "border-b-2 border-primary text-primary" 
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                } px-1 pt-1 pb-3 text-sm font-medium`}
              >
                Assistente
              </Link>
              <Link
                href="/settings"
                className={`${
                  location === "/settings" 
                    ? "border-b-2 border-primary text-primary" 
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                } px-1 pt-1 pb-3 text-sm font-medium`}
              >
                Configurações
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <button 
              className="p-2 mr-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
              onClick={() => {
                toast({
                  title: "Ajuda",
                  description: "Você pode pedir ajuda ao assistente na página do Assistente.",
                })
              }}
            >
              <span className="material-icons">help_outline</span>
            </button>
            {isAuthenticated && user && (
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex text-sm rounded-full focus:outline-none">
                      {user.picture ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.picture}
                          alt="Foto do usuário"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-2 text-sm text-gray-500">
                      <p>{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`${
                location === "/" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              } block pl-3 pr-4 py-2 text-base font-medium`}
            >
              Agenda
            </Link>
            <Link
              href="/assistant"
              className={`${
                location === "/assistant" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              } block pl-3 pr-4 py-2 text-base font-medium`}
            >
              Assistente
            </Link>
            <Link
              href="/settings"
              className={`${
                location === "/settings" 
                  ? "bg-gray-100 text-primary" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              } block pl-3 pr-4 py-2 text-base font-medium`}
            >
              Configurações
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

/* src/components/ui/Navbar.jsx */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = ({ currentView, onViewChange, onAddTrilha }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Dados padrão para quando user for undefined
  const userData = user || {
    name: "Usuário",
    email: "email@example.com",
    discProfile: { predominant: "Conforme" },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleLogoClick = () => {
    onViewChange("dashboard");
  };

  const handleProfileClick = () => {
    onViewChange("profile");
  };

  const handleLogout = () => {
    logout();
  };

  // Protege o acesso ao campo predominant usando optional chaining
  const predominant = userData.discProfile?.predominant ?? "—";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <img
                src="/2.png"
                alt="Logo da empresa"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-semibold hidden sm:block">
              GSkills
            </span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar cursos, mentores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-white focus:ring-white"
              />
            </form>
          </div>

          {/* User Menu & Ações */}
          <div className="flex items-center space-x-4">
            {/* Botão Adicionar Trilhas */}
            {/*<Button*/}
            {/*  variant="secondary"*/}
            {/*  onClick={onAddTrilha}*/}
            {/*  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"*/}
            {/*>*/}
            {/*  Adicionar Trilhas*/}
            {/*</Button>*/}

            {/* DISC Profile Badge */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {predominant.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-300">{predominant}</span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder-avatar.jpg"
                      alt={userData.name}
                    />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userData.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                {/*<DropdownMenuItem>*/}
                {/*  <Settings className="mr-2 h-4 w-4" />*/}
                {/*  <span>Configurações</span>*/}
                {/*</DropdownMenuItem>*/}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

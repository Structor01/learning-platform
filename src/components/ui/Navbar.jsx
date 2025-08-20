/* src/components/ui/Navbar.jsx */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, LogOut, Settings, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// REMOVIDO: import MinhasCandidaturasPage - não estava sendo usado

const Navbar = ({ currentView, onViewChange, onAddTrilha, onSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Dados padrão para quando user for undefined
  const userData = user || {
    name: "Usuário Não Logado",
    email: "Faça Login corretamente",
    discProfile: { predominant: "Conforme" },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    console.log("Searching for:", searchQuery);
  };

  const handleLogoClick = () => (window.location.href = "/Dashboard");

  const handleCandidaturasClick = () => {
    console.log("Clicou em Candidaturas"); // DEBUG
    console.log("isAuthenticated:", isAuthenticated); // DEBUG
    console.log("user:", user); // DEBUG

    if (isAuthenticated && user) {
      console.log("Navegando para /minhas-candidaturas"); // DEBUG
      navigate("/minhas-candidaturas");
    } else {
      console.log("Usuário não autenticado, redirecionando para login"); // DEBUG
      navigate("/");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // Explicitamente navegar para login após logout
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
                placeholder="Buscar cursos, mentores... "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-white focus:ring-white"
              />
            </form>
          </div>

          {/* User Menu & Ações */}
          <div className="flex items-center space-x-4">
            {/* Links de Navegação */}
            <div className="md:flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </a>

              <a
                href="/Vagas"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Vagas
              </a>

              <a
                href="/meus-interesses"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Meus interesses
              </a>

              {/* Menu Administrador */}
              {userData.email === "artfbgyn@gmail.com" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-black transition-colors text-sm px-3 py-2"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Administrador
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="start">
                    <DropdownMenuItem asChild>
                      <a href="/crm" className="flex items-center w-full">
                        <span className="mr-2">📊</span>
                        CRM - Gestão de Leads
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href="/recrutamento"
                        className="flex items-center w-full"
                      >
                        <span className="mr-2">👥</span>
                        Recrutamento LinkedIn
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/candidaturas" className="flex items-center w-full">
                        <span className="mr-2">📚</span>
                        Candidaturas
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

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
                <DropdownMenuItem onClick={handleCandidaturasClick}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Candidaturas</span>
                </DropdownMenuItem>
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

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
import { Search, User, LogOut, Settings, Briefcase, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";

const Navbar = ({ currentView, onViewChange, onAddTrilha, onSearch }) => {
  const { user, logout, isAuthenticated, getUserType, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogoClick = () => navigate("/dashboard");

  const handleCandidaturasClick = () => {
    if (isAuthenticated && user) {
      navigate("/minhas-candidaturas");
    } else {
      navigate("/");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
              AgroSkills
            </span>
          </button>

          {/* Search Bar - Esconde em mobile muito pequeno */}
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
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

          {/* Navigation Links - Desktop */}
          <div className=" items-center space-x-6">
            <a
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/vagas"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Vagas
            </a>
            <a
              href="/meus-interesses"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Meus interesses
            </a>
            <a
              href="/entrevista-simulada"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Entrevistas
            </a>
            <a
              href="/trilha"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Trilhas
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
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

        {/* Menu Mobile - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-black">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/dashboard"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <a
                href="/vagas"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vagas
              </a>
              <a
                href="/meus-interesses"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Meus interesses
              </a>
              <a
                href="/entrevista-simulada"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrevistas
              </a>
              <a
                href="/trilha"
                className="text-gray-300 hover:text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trilhas
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
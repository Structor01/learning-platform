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
import { Search, User, LogOut, Settings, Building2, Users, FileText, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CompanyNavbar = ({ currentView, onViewChange, onSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const userData = user || {
    name: "Empresa Não Logada",
    email: "Faça Login corretamente",
    companyName: "Empresa"
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    console.log("Searching for:", searchQuery);
  };

  const handleLogoClick = () => navigate("/dashboard-empresa");

  const handleProfileClick = () => {
    navigate("/empresa/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
              AgroSkills Empresas
            </span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar candidatos, vagas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-white focus:ring-white"
              />
            </form>
          </div>

          {/* Company Navigation Menu */}
          <div className="flex items-center space-x-4">
            <div className="md:flex items-center space-x-4">
              <a
                href="/dashboard-empresa"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </a>

              <a
                href="/empresa/vagas"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Minhas Vagas
              </a>

              <a
                href="/empresa/candidaturas"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Candidaturas
              </a>

              <a
                href="/empresa/relatorios"
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Relatórios
              </a>

              {/* Company Management Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-black transition-colors text-sm px-3 py-2"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gestão
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="start">
                  <DropdownMenuItem asChild>
                    <a href="/empresa/perfil" className="flex items-center w-full">
                      <Building2 className="mr-2 h-4 w-4" />
                      Perfil da Empresa
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/empresa/equipe" className="flex items-center w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Equipe
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/empresa/configuracoes" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Company Badge */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-300">Empresa</span>
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
                      src="/placeholder-company.jpg"
                      alt={userData.companyName || userData.name}
                    />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {(userData.companyName || userData.name)
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
                    <p className="font-medium">{userData.companyName || userData.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userData.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Perfil da Empresa</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/empresa/configuracoes">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </a>
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

export default CompanyNavbar;
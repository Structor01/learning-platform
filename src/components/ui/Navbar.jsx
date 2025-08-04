/* src/components/ui/Navbar.jsx */
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADICIONADO
import { Button } from "@/components/ui/button";
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

const Navbar = ({ currentView, onViewChange, onAddTrilha, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ✅ ADICIONADO
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ FUNÇÃO PARA OBTER DADOS DO USUÁRIO (sessionStorage + AuthContext)
  // ✅ FUNÇÕES AUXILIARES PARA AMBOS OS SISTEMAS
  const isUserAuthenticated = () => {
    const sessionUser1 = sessionStorage.getItem('currentUser');
    const sessionLogin1 = sessionStorage.getItem('isUserLoggedIn');
    const sessionUser2 = sessionStorage.getItem('user');
    const accessToken = sessionStorage.getItem('accessToken');

    return (sessionUser1 && sessionLogin1 === 'true') || (sessionUser2 && accessToken);
  };

  const getCurrentUser = () => {
    // Tentar primeiro sistema (antigo)
    const user1 = sessionStorage.getItem('currentUser');
    if (user1) {
      try {
        return JSON.parse(user1);
      } catch (error) {
        console.error('Erro ao parsear currentUser:', error);
      }
    }

    // Tentar segundo sistema (novo)
    const user2 = sessionStorage.getItem('user');
    if (user2) {
      try {
        return JSON.parse(user2);
      } catch (error) {
        console.error('Erro ao parsear user:', error);
      }
    }

    // Fallback para AuthContext
    return user;
  };

  // ✅ USAR AS FUNÇÕES AUXILIARES
  const userData = getCurrentUser() || {
    name: "Usuário",
    email: "email@example.com",
    discProfile: { predominant: "Conforme" },
  };

  const isUserLoggedIn = isUserAuthenticated() || !!user;

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    console.log("Searching for:", searchQuery);
  };

  const handleLogoClick = () => {
    if (isUserLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    if (onViewChange) {
      onViewChange("profile");
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    console.log('🔄 Iniciando logout...');

    // ✅ LIMPAR AuthContext
    if (logout) {
      logout();
    }

    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isUserLoggedIn');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    // ✅ REDIRECIONAR PARA LOGIN
    setTimeout(() => {
      window.location.href = '/';
    }, 100);

    console.log('👋 Logout completo realizado');
  };

  const handleMinhasCandidaturas = () => {
    navigate('/minhas-candidaturas');
  };

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
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate('/vagas')}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Vagas
              </button>

              {/* Menu Administrador */}
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
                    <button
                      onClick={() => navigate('/crm')}
                      className="flex items-center w-full"
                    >
                      <span className="mr-2">📊</span>
                      CRM - Gestão de Leads
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => navigate('/recrutamento')}
                      className="flex items-center w-full"
                    >
                      <span className="mr-2">👥</span>
                      Recrutamento LinkedIn
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* DISC Profile Badge */}
            {isUserLoggedIn && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {predominant.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-300">{predominant}</span>
              </div>
            )}

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
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {isUserLoggedIn ? (
                  <>
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

                    <DropdownMenuItem onClick={handleMinhasCandidaturas}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Minhas Candidaturas</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Fazer Login</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
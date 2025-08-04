import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Play, Clock, Award, X } from "lucide-react";
import WelcomeAnimation from "./WelcomeAnimation";
import TrilhaRequirementModal from "./TrilhaRequirementModal";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@radix-ui/react-progress";

const Dashboard = ({ onCourseSelect = [] }) => {
  //console.log("🚀 Dashboard montado! trilhas =", trilhas);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showTrilhaModal, setShowTrilhaModal] = useState(false);
  const [selectedTrilha, setSelectedTrilha] = useState("");

  // Verificar se é a primeira vez do usuário
  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = sessionStorage.getItem(
        `welcome_seen_${user.email}`
      );
      if (!hasSeenWelcome) {
        setShowWelcomeAnimation(true);
      }
    }
  }, [user]);

  // Função para completar a animação de boas-vindas
  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
    if (user?.email) {
      sessionStorage.setItem(`welcome_seen_${user.email}`, "true");
    }
  };

  // Função para redirecionar para página do aplicativo
  const handleAppClick = (appName) => {
    const routes = {
      "Cartão Virtual": "/cartao-virtual",
      "Agenda de Eventos": "/agenda-eventos",
      "Entrevista Simulada": "/entrevista-simulada",
      "Video Pitch": "/video-pitch",
      "Meus Testes": "/meus-testes",
    };

    const route = routes[appName];
    if (route) {
      navigate(route);
    }
  };

  // Função para abrir modal de trilha
  const handleTrilhaClick = (trilhaName) => {
    setSelectedTrilha(trilhaName);
    setShowTrilhaModal(true);
  };

  // Mostrar loading enquanto carrega os dados do usuário
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Dados padrão caso user seja null
  const userData = user || {
    name: "Usuário",
    discProfile: { predominant: "Conforme" },
    progress: { currentProgress: 0 },
  };

  // Protegendo acesso aos campos de DISC e progresso
  const predominant = userData.discProfile?.predominant ?? "Conforme";
  const currentProgress = userData.progress?.currentProgress ?? 0;

  // Função para lidar com clique em curso
  const handleCourseClick = (course) => {
    onCourseSelect && onCourseSelect(course);
  };

  // Função para obter cor do perfil DISC
  const getDiscColor = (profile) => {
    const colors = {
      Dominante: "bg-red-500",
      Influente: "bg-green-500",
      Estável: "bg-blue-500",
      Conforme: "bg-orange-500",
    };
    return colors[profile] || "bg-gray-500";
  };

  return (
    <>
      {/* Animação de Boas-vindas */}
      {showWelcomeAnimation && (
        <WelcomeAnimation
          userName={userData.name.split(" ")[0]}
          onComplete={handleWelcomeComplete}
        />
      )}

      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex flex-col lg:!flex-row lg:!items-center lg:!justify-between gap-6 min-w-fit">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Olá, {userData.name.split(" ")[0]}!
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 ${getDiscColor(
                        predominant
                      )} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">
                        {predominant.charAt(0)}
                      </span>
                    </div>
                    <span className="text-gray-300">Perfil: {predominant}</span>
                  </div>
                </div>
              </div>

              {/* Card Gestão de Carreira - Acesso Gratuito */}
              <div className="lg:!w-80 flex-shrink-0">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-90 cursor-pointer shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          GRÁTIS
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      Gestão de Carreira
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      Estratégias avançadas para acelerar sua carreira no agro
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">17 módulos</span>
                      <Button
                        size="sm"
                        onClick={() => navigate("/trilha/2")}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Iniciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Biblioteca de Aplicativos - Movida para cima */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Biblioteca de Aplicativos
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todos <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="biblioteca-apps grid grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 xl:!grid-cols-5 gap-4">
              {/* Meu Cartão Virtual */}
              <Card
                onClick={() => handleAppClick("Cartão Virtual")}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Cartão Virtual
                  </h3>
                  <p className="text-xs text-gray-400">Cartão digital</p>
                </CardContent>
              </Card>

              {/* Agenda de Eventos */}
              <Card
                onClick={() => handleAppClick("Agenda de Eventos")}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Agenda
                  </h3>
                  <p className="text-xs text-gray-400">Eventos</p>
                </CardContent>
              </Card>

              {/* Entrevista Simulada */}
              <Card
                onClick={() => handleAppClick("Entrevista Simulada")}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Entrevista
                  </h3>
                  <p className="text-xs text-gray-400">Simulada</p>
                </CardContent>
              </Card>

              {/* Video Pitch */}
              <Card
                onClick={() => handleAppClick("Video Pitch")}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Video Pitch
                  </h3>
                  <p className="text-xs text-gray-400">Profissional</p>
                </CardContent>
              </Card>

              {/* Meus Testes */}
              <Card
                onClick={() => handleAppClick("Meus Testes")}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Testes
                  </h3>
                  <p className="text-xs text-gray-400">Avaliações</p>
                </CardContent>
              </Card>

              {/* Ver Vagas */}
              <Card
                onClick={() => navigate('/vagas')}
                className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2M4 7h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Ver Vagas
                  </h3>
                  <p className="text-xs text-gray-400">Avaliações</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Progresso Geral
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {currentProgress}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Progress value={currentProgress} className="mt-4" />
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Próximo Conteúdo
                    </p>
                    <p className="text-lg font-semibold text-white">
                      Autoconhecimento para Aceleração de Carreiras
                    </p>
                    <p className="text-sm text-gray-500">45 min</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleCourseClick()}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Meta Semanal
                    </p>
                    <p className="text-3xl font-bold text-white">4/5</p>
                    <p className="text-sm text-gray-500">dias de estudo</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trilhas para acelerar sua carreira */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Trilhas para acelerar sua carreira
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todas <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="grid grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 gap-6">
              {/* Trilha 1: Autoconhecimento para Aceleração de Carreiras */}
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Autoconhecimento para Aceleração de Carreiras
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Descubra seus pontos fortes e acelere sua carreira no
                    agronegócio
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">7 módulos</span>
                    <Button
                      size="sm"
                      onClick={() => navigate("/trilha/3")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trilha 2: Introdução a Finanças Pessoais */}
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Introdução a Finanças Pessoais
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Fundamentos para gerenciar suas finanças no agronegócio
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">5 módulos</span>
                    <Button
                      size="sm"
                      onClick={() => navigate("/trilha/4")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trilha 3: Auto análise e Foco em metas */}
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Auto análise e Foco em metas
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Defina objetivos claros e alcance suas metas profissionais
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">7 módulos</span>
                    <Button
                      size="sm"
                      onClick={() => navigate("/trilha/5")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trilha 4: Gestão de Carreira */}
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Gestão de Carreira
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Estratégias avançadas para acelerar sua carreira no agro
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">17 módulos</span>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => navigate("/trilha/2")}
                    >
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Última Aula - Nova Seção */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Última Aula</h2>
            </div>

            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
              <div className="flex md:flex-row">
                {/* Thumbnail estática */}
                <div className="md:w-1/3 relative">
                  <img
                    src="https://img.youtube.com/vi/DogH89e7Ib0/hqdefault.jpg"
                    alt="Thumbnail Aulão"
                    className="w-full aspect-video rounded-l-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-75" />
                  </div>
                </div>

                {/* Conteúdo da aula */}
                <div className="md:w-2/3 p-6">
                  <CardContent className="p-0">
                    <h3 className="text-xl font-bold text-white mb-3">
                      Aulão - Etapas de processo seletivo e sua carreira no Agro
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      Neste aulão ao vivo, você vai descobrir todas as etapas do
                      processo seletivo no agronegócio e como construir uma
                      carreira sólida no setor. Aprenda estratégias para se
                      destacar em entrevistas, desenvolver competências técnicas
                      e comportamentais essenciais para o sucesso no agro.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>45 min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Samantha Andrade</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>1.2k assistindo</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
                      onClick={() => setIsVideoOpen(true)}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Assistir Aula
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          </section>

          {/* Modal */}
          {isVideoOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden">
                <button
                  className="absolute top-2 right-2 text-white p-1 rounded-full hover:bg-white/20"
                  onClick={() => setIsVideoOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="relative pb-[56.25%]">
                  <iframe
                    src="https://www.youtube.com/embed/DogH89e7Ib0"
                    title="Aulão - Etapas de processo seletivo e sua carreira no Agro"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
                <div className="p-4 flex justify-end">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    onClick={() => setIsVideoOpen(false)}
                  >
                    Sair da aula
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <TrilhaRequirementModal
        isOpen={showTrilhaModal}
        onClose={() => setShowTrilhaModal(false)}
        trilhaName={selectedTrilha}
      />
    </>
  );
};

export default Dashboard;

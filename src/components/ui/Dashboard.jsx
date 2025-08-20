import { useState, useEffect } from "react";
import testService from "@/services/testService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Play, Clock, Award, X } from "lucide-react";
import WelcomeAnimation from "./WelcomeAnimation";
import TrilhaRequirementModal from "./TrilhaRequirementModal";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@radix-ui/react-progress";
import axios from "axios";
import { API_URL } from "@/components/utils/api"; // certifique-se de que este caminho está correto
import { MapPin, Briefcase, Building2 } from "lucide-react";

const Dashboard = ({ onCourseSelect = [] }) => {
  //console.log("🚀 Dashboard montado! trilhas =", trilhas);
  const { user, isLoading } = useAuth();
  const [discProfile, setDiscProfile] = useState(null);
  const navigate = useNavigate();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showTrilhaModal, setShowTrilhaModal] = useState(false);
  const [selectedTrilha, setSelectedTrilha] = useState("");
  const [vagasRecentes, setVagasRecentes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loadingVagas, setLoadingVagas] = useState(true);

  // Verificar se é a primeira vez do usuário
  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = sessionStorage.getItem(
        `welcome_seen_${user.email}`
      );
      if (!hasSeenWelcome) {
        setShowWelcomeAnimation(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchVagasRecentes = async () => {
      try {
        setLoadingVagas(true);

        // Buscar vagas
        const vagasResponse = await axios.get(
          `${API_URL}/api/recruitment/jobs`
        );
        const todasVagas = vagasResponse.data || [];

        // Pegar apenas as 5 últimas vagas (assumindo que as mais recentes estão no final)
        const ultimasVagas = todasVagas.slice(-5).reverse();
        setVagasRecentes(ultimasVagas);

        // Buscar empresas para pegar os nomes
        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        setEmpresas(empresasResponse.data || []);
      } catch (error) {
        console.error("Erro ao buscar vagas recentes:", error);
        setVagasRecentes([]);
      } finally {
        setLoadingVagas(false);
      }
    };

    fetchVagasRecentes();
  }, []);

  const getEmpresaNome = (empresaId) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    return empresa?.name || "Empresa";
  };

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
      "Meus Testes": "/teste-disc", // Redireciona direto para TesteDISCPage
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

      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex justify-between items-center">
              {/* Bloco de boas-vindas e perfil DISC */}
              <img className={"w-[110px] h-[110px] rounded-full border"} src={userData.userLegacy?.image ? userData.userLegacy?.image : ''}/>
              <div className={"flex flex-col"}>
                <h1 className="text-3xl text-black font-bold mb-2">
                  Olá, {userData.name.split(" ")[0]}!
                </h1>

                <div className={"grid grid-cols-2 gap-3"}>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_disc)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_disc.charAt(0)}</span>
                    </div>
                    <span className="text-gray-900 ml-3">{userData.userLegacy?.perfil_disc}</span>
                  </div>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_lideranca)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_lideranca.charAt(0)}</span>
                    </div>
                    <span className="text-gray-900 ml-3">{userData.userLegacy?.perfil_lideranca}</span>
                  </div>
                </div>


              </div>

              <div className="flex-shrink-0 lg:w-2/3">

                <div className="flex items-center m-3 space-x-4">
                  <div className="flex items-center space-x-2">

                    {/* Card Análise DISC ocupando 1/3 da tela */}
                  </div>
                </div>
                {discProfile && discProfile.overall_analysis && (
                    <div className="lg:w-1/3 w-full">
                      <Card className="bg-black/60 border border-gray-800 shadow-lg">
                        <CardContent className="p-3">
                          <h4 className="text-lg font-bold text-white mb-2">
                            Análise DISC
                          </h4>
                          <p className="text-gray-300 text-sm whitespace-pre-line">
                            {discProfile.overall_analysis}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                )}
              </div>


            </div>
          </div>

          {/* Últimas Vagas - Nova Seção */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Últimas Vagas
              </h2>
              <Button
                  variant="ghost"
                  className="text-gray-800 hover:text-white"
                  onClick={() => navigate("/vagas")}
              >
                Ver todas as vagas
              </Button>
            </div>

            {loadingVagas ? (
                <div className="grid grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                      <Card
                          key={index}
                          className="bg-white border-gray-200 animate-pulse"
                      >
                        <CardContent className="p-6">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-3"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            ) : vagasRecentes.length > 0 ? (
                <div className="grid grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-5 gap-4">
                  {vagasRecentes.map((vaga) => (
                      <Card
                          key={vaga.id}
                          onClick={() => navigate(`/vagas/${vaga.id}`)}
                          className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mb-4">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>

                          <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                            {vaga.title || vaga.nome}
                          </h3>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {getEmpresaNome(vaga.empresa_id)}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                            {vaga.location || `${vaga.cidade}, ${vaga.uf}`}
                          </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">
                            {vaga.job_type || vaga.modalidade}
                          </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhuma vaga disponível no momento
                  </p>
                  <Button
                      size="sm"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate("/vagas")}
                  >
                    Explorar Vagas
                  </Button>
                </div>
            )}
          </section>

          {/* Biblioteca de Aplicativos - Movida para cima */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Biblioteca de Aplicativos
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todos <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="biblioteca-apps grid grid-cols-2 sm:!grid-cols-4 gap-4">
              {/* Meu Cartão Virtual */}
              <Card
                onClick={() => handleAppClick("Cartão Virtual")}
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                  <h3 className="font-semibold text-black text-sm mb-1">
                    Cartão Virtual
                  </h3>
                  <p className="text-xs text-gray-600">Cartão digital</p>
                </CardContent>
              </Card>

              {/* Agenda de Eventos */}
              <Card
                onClick={() => handleAppClick("Agenda de Eventos")}
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                  <h3 className="font-semibold text-black text-sm mb-1">
                    Agenda
                  </h3>
                  <p className="text-xs text-gray-600">Eventos</p>
                </CardContent>
              </Card>

              {/* Meus Testes */}
              <Card
                onClick={() => handleAppClick("Meus Testes")}
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                  <h3 className="font-semibold text-black text-sm mb-1">
                    Testes
                  </h3>
                  <p className="text-xs text-gray-600">Avaliações</p>
                </CardContent>
              </Card>

              {/* Ver Vagas */}
              <Card
                onClick={() => navigate("/vagas")}
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                  <h3 className="font-semibold text-black text-sm mb-1">
                    Ver Vagas
                  </h3>
                  <p className="text-xs text-gray-600">Avaliações</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Trilhas para acelerar sua carreira */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Trilhas para acelerar sua carreira
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todas <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="grid grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 gap-6">
              {/* Trilha 1: Autoconhecimento para Aceleração de Carreiras */}
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
                  <h3 className="text-lg font-semibold text-black mb-2">
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
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Introdução a Finanças Pessoais
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
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
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Auto análise e Foco em metas
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
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
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Gestão de Carreira
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
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

              {/* Trilha 5: Mentoria de Empregabilidade */}
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-lg mb-4">
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
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Mentoria de Empregabilidade
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Acelere sua carreira no agro com nossa mentoria
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">10 módulos</span>
                    <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => navigate("/trilha/6")}
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

      {showTrilhaModal && (
        <TrilhaRequirementModal
          trilhaName={selectedTrilha}
          onClose={() => setShowTrilhaModal(false)}
        />
      )}
    </>
  );
};

export default Dashboard;



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
                <h1 className="text-3xl font-bold text-white mb-2">
                  Olá, {userData.name.split(" ")[0]}!
                </h1>

                <div className={"grid grid-cols-2 gap-3"}>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_disc)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_disc.charAt(0)}</span>
                    </div>
                    <span className="text-gray-300 ml-3">{userData.userLegacy?.perfil_disc}</span>
                  </div>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_lideranca)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_lideranca.charAt(0)}</span>
                    </div>
                    <span className="text-gray-300 ml-3">{userData.userLegacy?.perfil_lideranca}</span>
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
                  className="text-gray-300 hover:text-white"
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

          <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Progresso Geral
                    </p>
                    <p className="text-3xl font-bold text-black">
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

            <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Próximo Conteúdo
                    </p>
                    <p className="text-lg font-semibold text-black">
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

            <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Meta Semanal
                    </p>
                    <p className="text-3xl font-bold text-black">4/5</p>
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
              <h2 className="text-2xl font-bold text-black">
                Trilhas para acelerar sua carreira
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todos <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 gap-6">
              {/* Trilha 1 */}
              <Card
                className="bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-700 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-90 cursor-pointer shadow-xl"
                onClick={() => handleTrilhaClick("Trilha 1")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-800 rounded-xl flex items-center justify-center">
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
                    <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      NOVO
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Trilha de Desenvolvimento Pessoal
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    Desenvolva habilidades essenciais para o sucesso
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">10 módulos</span>
                    <Button
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Explorar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trilha 2 */}
              <Card
                className="bg-gradient-to-br from-teal-600 to-cyan-700 border-teal-700 hover:from-teal-700 hover:to-cyan-800 transition-all duration-300 transform hover:scale-90 cursor-pointer shadow-xl"
                onClick={() => handleTrilhaClick("Trilha 2")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-800 rounded-xl flex items-center justify-center">
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.208 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.792 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.792 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.208 18 16.5 18s-3.332-.477-4.5-1.253"
                        />
                      </svg>
                    </div>
                    <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      POPULAR
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Trilha de Liderança e Gestão
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    Desenvolva suas habilidades de liderança e gestão de equipes
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">15 módulos</span>
                    <Button
                      size="sm"
                      className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Explorar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trilha 3 */}
              <Card
                className="bg-gradient-to-br from-red-600 to-pink-700 border-red-700 hover:from-red-700 hover:to-pink-800 transition-all duration-300 transform hover:scale-90 cursor-pointer shadow-xl"
                onClick={() => handleTrilhaClick("Trilha 3")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-800 rounded-xl flex items-center justify-center">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-9a2 2 0 00-2-2H9a2 2 0 00-2 2v9M4 10V7a3 3 0 013-3h10a3 3 0 013 3v3"
                        />
                      </svg>
                    </div>
                    <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      EM BREVE
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Trilha de Inovação e Tecnologia
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    Explore as últimas tendências em inovação e tecnologia
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">12 módulos</span>
                    <Button
                      size="sm"
                      className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Explorar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cursos em Destaque */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Cursos em Destaque
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todos <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 gap-6">
              {/* Curso 1 */}
              <Card
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleCourseClick("Curso 1")}
              >
                <CardContent className="p-6">
                  <img
                    src="https://via.placeholder.com/400x200"
                    alt="Capa do Curso"
                    className="rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Introdução à Inteligência Artificial
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Aprenda os fundamentos da IA e como aplicá-los em projetos
                    práticos.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" /> 8 horas
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Ver Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Curso 2 */}
              <Card
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleCourseClick("Curso 2")}
              >
                <CardContent className="p-6">
                  <img
                    src="https://via.placeholder.com/400x200"
                    alt="Capa do Curso"
                    className="rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Marketing Digital para Iniciantes
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Domine as estratégias essenciais de marketing digital para
                    alavancar seu negócio.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" /> 12 horas
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Ver Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Curso 3 */}
              <Card
                className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleCourseClick("Curso 3")}
              >
                <CardContent className="p-6">
                  <img
                    src="https://via.placeholder.com/400x200"
                    alt="Capa do Curso"
                    className="rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Finanças Pessoais: Guia Completo
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    Aprenda a organizar suas finanças, investir e alcançar a
                    liberdade financeira.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" /> 6 horas
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Ver Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
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



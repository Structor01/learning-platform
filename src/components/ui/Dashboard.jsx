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
import api from "@/services/api.js";
// import DiscDetailsModal from "@/components/ui/DiscDetailsModal.jsx";
// import testService from "@/services/testService";

const Dashboard = ({ onCourseSelect = [] }) => {
  //console.log("🚀 Dashboard montado! trilhas =", trilhas);
  const { user, accessToken, isLoading } = useAuth();
  const [disc, setDiscProfile] = useState(null);
  const [showDiscDetails, setShowDiscDetails] = useState(false);
  const navigate = useNavigate();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showTrilhaModal, setShowTrilhaModal] = useState(false);
  const [selectedTrilha, setSelectedTrilha] = useState("");
  const [vagasRecentes, setVagasRecentes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const bgCollor = {
    0: "#4285F4",
    1: "#EA4335",
    2: "#FBBC04",
    3: "#34A853",
  };
  // Verificar se é a primeira vez do usuário
  useEffect(() => {
    if (user?.email) {
      const hasSeenWelcome = localStorage.getItem(
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
        setVagasRecentes([]); // Reset data
        setEmpresas([]);

        // Tentar diferentes endpoints
        let vagasData = [];
        let empresasData = [];

        // Primeira tentativa: API principal
        try {
          const response = await fetch(`${API_URL}/api/recruitment/jobs`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
            },
            timeout: 10000 // 10 segundos timeout
          });

          if (response.ok) {
            vagasData = await response.json();
          }
        } catch (apiError) {
          console.warn('API principal falhou, tentando alternativa:', apiError.message);
        }

        // Se não conseguiu dados, usar dados mock
        if (!vagasData || vagasData.length === 0) {
          vagasData = [
            {
              id: 1,
              title: "Desenvolvedor Frontend React",
              company: "TechCorp",
              location: "São Paulo, SP",
              type: "CLT",
              salary: "R$ 8.000 - R$ 12.000",
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              title: "Analista de Dados Sênior",
              company: "DataAnalytics",
              location: "Rio de Janeiro, RJ",
              type: "PJ",
              salary: "R$ 10.000 - R$ 15.000",
              createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
              id: 3,
              title: "Product Manager",
              company: "StartupXYZ",
              location: "Remoto",
              type: "CLT",
              salary: "R$ 12.000 - R$ 18.000",
              createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ];
        }

        // Pegar apenas as 5 últimas vagas
        const ultimasVagas = Array.isArray(vagasData)
          ? vagasData.slice(-5).reverse()
          : [];

        setVagasRecentes(ultimasVagas);

        // Tentar buscar empresas
        try {
          const empresasResponse = await fetch(`${API_URL}/api/companies`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          });

          if (empresasResponse.ok) {
            empresasData = await empresasResponse.json();
            setEmpresas(Array.isArray(empresasData) ? empresasData : []);
          }
        } catch (empresasError) {
          console.warn('Erro ao buscar empresas:', empresasError.message);
          setEmpresas([]);
        }

      } catch (error) {
        console.error("Erro geral ao buscar vagas:", error);
        setVagasRecentes([]);
        setEmpresas([]);
      } finally {
        setLoadingVagas(false);
      }
    };

    // Delay para evitar chamadas simultâneas
    const timeoutId = setTimeout(fetchVagasRecentes, 100);
    return () => clearTimeout(timeoutId);
  }, [accessToken]);

  useEffect(() => {
    const fetchDiscProfile = async () => {
      try {
        // Tentar buscar perfil DISC da API
        const response = await fetch(`${API_URL}/api/user/disc`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
          }
        });

        if (response.ok) {
          const discData = await response.json();
          setDiscProfile(discData);
        } else {
          // Se não conseguir da API, usar dados mock para demonstração
          setDiscProfile({
            type: 'D',
            name: 'Dominante',
            description: 'Pessoa orientada para resultados, direta e determinada.',
            percentage: 78,
            characteristics: [
              'Orientado para resultados',
              'Direto na comunicação',
              'Gosta de desafios',
              'Toma decisões rapidamente'
            ],
            strengths: [
              'Liderança natural',
              'Iniciativa própria',
              'Foco em objetivos',
              'Resolução rápida de problemas'
            ],
            improvements: [
              'Desenvolver paciência',
              'Ouvir mais os outros',
              'Considerar detalhes importantes',
              'Trabalhar melhor em equipe'
            ]
          });
        }
      } catch (error) {
        console.warn('Erro ao buscar perfil DISC, usando dados de exemplo:', error.message);
        // Dados de exemplo caso API falhe
        setDiscProfile({
          type: 'I',
          name: 'Influente',
          description: 'Pessoa comunicativa, otimista e focada em relacionamentos.',
          percentage: 65,
          characteristics: [
            'Comunicativo e expressivo',
            'Otimista e entusiasmado',
            'Foca em relacionamentos',
            'Inspirador e motivador'
          ],
          strengths: [
            'Excelente comunicação',
            'Trabalho em equipe',
            'Criatividade e inovação',
            'Motivação dos outros'
          ],
          improvements: [
            'Foco em detalhes',
            'Organização pessoal',
            'Controle de tempo',
            'Seguir processos estruturados'
          ]
        });
      }
    };

    if (accessToken) {
      fetchDiscProfile();
    }
  }, [accessToken]);

  const getEmpresaNome = (empresaId) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    return empresa?.name || "Empresa";
  };

  // Função para completar a animação de boas-vindas
  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
    if (user?.email) {
      localStorage.setItem(`welcome_seen_${user.email}`, "true");
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
              <img className={"w-[110px] h-[110px] rounded-full border"} src={userData.userLegacy?.image || null} alt="User Profile" />
              <div className={"flex flex-col flex-shrink-0 lg:w-2/5"}>
                <h1 className="text-3xl text-black font-bold mb-2">
                  Olá, {userData?.name?.split(" ")[0]}!
                </h1>

                <div className={"grid grid-cols-2 gap-3"}>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_disc)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_disc?.charAt(0)}</span>
                    </div>
                    <div className={"flex flex-col items-start justify-start"}>
                      <span className="text-gray-900 ml-3">{userData.userLegacy?.perfil_disc}</span>
                      <span className="text-gray-900 ml-3 font-bold text-xs">Perfil Comportamental</span>
                    </div>
                  </div>
                  <div className={"flex items-center justify-start"}>
                    <div className={`w-6 h-6 ${getDiscColor(userData.userLegacy?.perfil_lideranca)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{userData.userLegacy?.perfil_lideranca?.charAt(0)}</span>
                    </div>
                    <div className={"flex flex-col items-start justify-start"}>
                      <span className="text-gray-900 ml-3">{userData.userLegacy?.perfil_lideranca}</span>
                      <span className="text-gray-900 ml-3 font-bold text-xs">Estilo de liderança</span>
                    </div>

                  </div>
                </div>


              </div>

              <div className="flex-shrink-0 lg:w-2/5">

                <div className="flex items-center m-3 space-x-4">
                  <div className="flex items-center space-x-2">

                    {/* Card Análise DISC ocupando 1/3 da tela */}
                  </div>
                </div>
                {/* Seção DISC Melhorada */}
                <div className="w-full mt-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    {disc ? (
                      <>
                        {/* Header da seção */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[#263465] font-semibold text-sm">Perfil Comportamental DISC</h3>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                            style={{
                              backgroundColor: disc.type === 'D' ? '#EF4444' :
                                disc.type === 'I' ? '#10B981' :
                                  disc.type === 'S' ? '#3B82F6' : '#F59E0B',
                            }}
                          >
                            {disc.type}
                          </div>
                        </div>

                        {/* Barra de progresso melhorada */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[#263465] font-medium text-sm">{disc.name}</span>
                            <span className="text-[#263465] font-bold text-sm">{disc.percentage || 75}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${disc.percentage || 75}%`,
                                backgroundColor: disc.type === 'D' ? '#EF4444' :
                                  disc.type === 'I' ? '#10B981' :
                                    disc.type === 'S' ? '#3B82F6' : '#F59E0B',
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Descrição */}
                        <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                          {disc.description}
                        </p>

                        {/* Características principais */}
                        {disc.characteristics && disc.characteristics.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {disc.characteristics.slice(0, 3).map((char, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {char}
                                </span>
                              ))}
                              {disc.characteristics.length > 3 && (
                                <span className="inline-block bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                                  +{disc.characteristics.length - 3} mais
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Botão de detalhes */}
                        <button
                          onClick={() => setShowDiscDetails(true)}
                          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-[#263465] py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-100 hover:border-blue-200"
                        >
                          Ver análise completa →
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Estado sem DISC */}
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-[#263465] font-semibold text-sm mb-1">Perfil DISC</h3>
                          <p className="text-gray-500 text-xs mb-3">Descubra seu perfil comportamental</p>
                          <button
                            onClick={() => navigate('/teste-disc')}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                          >
                            Fazer teste DISC
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal de Detalhes DISC - Layout melhorado seguindo design do teste */}
                {showDiscDetails && disc && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      {/* Header */}
                      <div className="relative p-6 border-b border-gray-800">
                        <button
                          onClick={() => setShowDiscDetails(false)}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                        >
                          <X className="h-6 w-6" />
                        </button>

                        <div className="text-center">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl"
                            style={{
                              backgroundColor: disc.type === 'D' ? '#EF4444' :
                                disc.type === 'I' ? '#10B981' :
                                  disc.type === 'S' ? '#3B82F6' : '#F59E0B'
                            }}
                          >
                            {disc.type}
                          </div>
                          <h2 className="text-3xl font-bold mb-2">
                            Perfil {disc.name}
                          </h2>
                          <p className="text-gray-400 text-lg">
                            {disc.description}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Barra de Progresso Visual */}
                        <div className="mb-8">
                          <h3 className="text-xl font-semibold text-white mb-4 text-center">
                            Intensidade do Perfil
                          </h3>
                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center mb-4">
                              <div
                                className="h-8 rounded-l flex items-center justify-center text-white font-bold text-sm"
                                style={{
                                  width: `${disc.percentage || 75}%`,
                                  minWidth: '80px',
                                  backgroundColor: disc.type === 'D' ? '#EF4444' :
                                    disc.type === 'I' ? '#10B981' :
                                      disc.type === 'S' ? '#3B82F6' : '#F59E0B'
                                }}
                              >
                                {disc.type} - {disc.percentage || 75}%
                              </div>
                              <div
                                className="h-8 bg-gray-700 flex-1 rounded-r"
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Seções de Informações */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Características */}
                          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h4 className="font-semibold text-white mb-4 text-lg flex items-center">
                              <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                              Características Principais
                            </h4>
                            <ul className="space-y-3">
                              {(disc.characteristics || [
                                "Orientado para resultados",
                                "Toma decisões rapidamente",
                                "Gosta de desafios",
                                "Prefere liderar",
                                "Direto na comunicação"
                              ]).map((char, index) => (
                                <li key={index} className="text-gray-300 flex items-start">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2"></div>
                                  {char}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Pontos Fortes */}
                          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h4 className="font-semibold text-white mb-4 text-lg flex items-center">
                              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                              Pontos Fortes
                            </h4>
                            <ul className="space-y-3">
                              {(disc.strengths || [
                                "Liderança natural",
                                "Foco em resultados",
                                "Tomada de decisão rápida",
                                "Capacidade de superar obstáculos",
                                "Motivação por desafios"
                              ]).map((strength, index) => (
                                <li key={index} className="text-gray-300 flex items-start">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2"></div>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Áreas de Desenvolvimento */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                          <h4 className="font-semibold text-white mb-4 text-lg flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                            Áreas de Desenvolvimento
                          </h4>
                          <ul className="space-y-3">
                            {(disc.improvements || [
                              "Desenvolvimento da paciência",
                              "Melhora na escuta ativa",
                              "Consideração de outras perspectivas",
                              "Trabalho em equipe colaborativo"
                            ]).map((improvement, index) => (
                              <li key={index} className="text-gray-300 flex items-start">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 mt-2"></div>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Dicas de Carreira */}
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                          <h4 className="font-semibold text-white mb-4 text-lg flex items-center">
                            <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                            Dicas para o Ambiente de Trabalho
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-white mb-2">Funciona Bem Com:</h5>
                              <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• Metas claras e desafiadoras</li>
                                <li>• Autonomia para tomar decisões</li>
                                <li>• Feedback direto e honesto</li>
                                <li>• Projetos com impacto visível</li>
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-2">Pode Ter Dificuldade Com:</h5>
                              <ul className="space-y-2 text-gray-300 text-sm">
                                <li>• Processos muito burocráticos</li>
                                <li>• Tarefas repetitivas</li>
                                <li>• Microgerenciamento</li>
                                <li>• Decisões por comitê</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={() => {
                              setShowDiscDetails(false);
                              navigate('/teste-disc');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                          >
                            Refazer Teste DISC
                          </button>
                          <button
                            onClick={() => setShowDiscDetails(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    </div>
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

              {/* Trilha 6: Podcast */}
              <Card className="bg-white border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-500 rounded-lg mb-4">
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
                    PODCAST
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Podcast da empresa Agroskills
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">11 módulos</span>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => navigate("/trilha/7")}
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Última Aula</h2>
            </div>

            <Card className="bg-white transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col lg:flex-row min-h-[800px]">
                <div className="w-full lg:w-1/2 relative">
                  <iframe
                    src="https://www.youtube.com/embed/JIEDBoWU5fE"
                    title="Aulão"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-96 sm:h-[400px] md:h-[500px] lg:h-[600px] lg:rounded-l-lg object-cover"
                    style={{ aspectRatio: '16/9' }}
                  />
                </div>

                {/* Conteúdo da aula */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                  <CardContent className="p-0 space-y-6">
                    <h3 className="text-2xl lg:text-3xl font-bold text-black leading-tight">
                      Aulão - O que o mercado busca nos profissionais do Agro
                    </h3>

                    <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                      Nesse episódio do Podcast AgroSkills, recebemos Danilo Macarini e Jaqueline Dias, Diretor de Processos e RH e Coordenadora de RH na Seedcorp HO, para falar sobre como construir times de alta performance, a importância da cultura organizacional e o que o mercado busca nos profissionais do agro!
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">45 min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-medium">1.2k assistindo</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* seus botões aqui */}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
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



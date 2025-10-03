import { useState, useEffect } from "react";
import testService from "@/services/testService";
import discApiService from "@/services/discApi";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Play, Clock, Award, X, Sun, Moon, HelpCircle } from "lucide-react";
import { useTour } from '@reactour/tour';
import WelcomeAnimation from "./WelcomeAnimation";
import TrilhaRequirementModal from "./TrilhaRequirementModal";
import { HeroVideoDialog } from "./hero-video-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@radix-ui/react-progress";
import axios from "axios";
import { API_URL } from "@/components/utils/api"; // certifique-se de que este caminho está correto
import { MapPin, Briefcase, Building2 } from "lucide-react";
import api from "@/services/api.js";
import InterviewPromptModal from "@/components/ui/InterviewPromptModal.jsx";
// testService já está sendo importado na linha 2

const Dashboard = ({ onCourseSelect = [] }) => {
  const { user, accessToken, isLoading, showWelcomeVideo, closeWelcomeVideo } = useAuth();
  const { setIsOpen, isOpen } = useTour();
  const [disc, setDiscProfile] = useState(null);
  const [showDiscDetails, setShowDiscDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [showTrilhaModal, setShowTrilhaModal] = useState(false);
  const [selectedTrilha, setSelectedTrilha] = useState("");
  const [vagasRecentes, setVagasRecentes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loadingVagas, setLoadingVagas] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showInterviewPrompt, setShowInterviewPrompt] = useState(false);
  const [hasCompletedInterview, setHasCompletedInterview] = useState(false);

  // Estado para controlar se vídeo já foi mostrado
  const [videoWasShown, setVideoWasShown] = useState(false);

  // Controlar vídeo
  useEffect(() => {
    if (showWelcomeVideo) {
      setIsOpen(false);
      setVideoWasShown(true);
      const timer = setTimeout(() => {
        handleCloseVideoAndStartTour();
      }, 180000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeVideo, closeWelcomeVideo, setIsOpen]);

  // TOUR DESATIVADO COMPLETAMENTE
  const [showTourPopup, setShowTourPopup] = useState(false);
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
      const hasSeenTour = localStorage.getItem(
        `tour_seen_${user.email}`
      );

      if (!hasSeenWelcome) {
        setShowWelcomeAnimation(false);
      }

      if (!hasSeenTour) {
        // Mostrar popup do tour após um pequeno delay
        setTimeout(() => {
          setShowTourPopup(true);
        }, 2000);
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
      if (!user?.id || !accessToken) return;

      try {


        // Primeiro tentar buscar usando a nova API DISC
        try {
          const discProfile = await discApiService.getUserDiscProfile(user.id);
          if (discProfile) {
            const convertedProfile = discApiService.convertApiDataToProfile(discProfile);
            console.log("🔍 Dashboard - Perfil DISC encontrado na nova API:", convertedProfile);
            setDiscProfile(convertedProfile);
            return;
          }
        } catch (apiError) {
          console.warn("⚠️ Dashboard - Nova API não disponível, tentando API antiga:", apiError);
        }

        // Fallback: Tentar buscar testes psicológicos do usuário (API antiga)
        const userTests = await testService.getUserPsychologicalTests(user.id, 'completed', 50);
        console.log("🔍 Dashboard - Testes encontrados (API antiga):", userTests);

        if (userTests && userTests.length > 0) {
          // Encontrar o teste DISC/unified mais recente
          const discTest = userTests
            .filter(test => {
              const testType = test.test_type?.toLowerCase();
              return (testType === 'disc' || testType === 'unified') && test.status === 'completed';
            })
            .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];



          if (discTest) {
            console.log("🔍 Dashboard - Teste DISC encontrado:", discTest);

            // Tentar extrair dados DISC de diferentes fontes
            let discType = null;
            let discCounts = null;

            // 1. Verificar se tem disc_scores
            if (discTest.disc_scores) {
              let discScores;
              try {
                discScores = typeof discTest.disc_scores === 'string'
                  ? JSON.parse(discTest.disc_scores)
                  : discTest.disc_scores;
              } catch (parseError) {
                console.warn("🔍 Dashboard - Erro ao parsear disc_scores:", parseError);
                discScores = discTest.disc_scores;
              }

              if (discScores && discScores.type) {
                discType = discScores.type;
                discCounts = discScores.counts || { D: 0, I: 0, S: 0, C: 0 };
              }
            }

            // 2. Verificar se tem result.disc
            if (!discType && discTest.result?.disc) {
              const discResult = discTest.result.disc;
              if (discResult.perfil) {
                // Extrair tipo do perfil textual
                const perfilLower = discResult.perfil.toLowerCase();
                if (perfilLower.includes('dominante')) discType = 'D';
                else if (perfilLower.includes('influente')) discType = 'I';
                else if (perfilLower.includes('estável') || perfilLower.includes('estavel')) discType = 'S';
                else if (perfilLower.includes('conforme') || perfilLower.includes('consciencioso')) discType = 'C';
              }
              discCounts = discResult.counts || { D: 0, I: 0, S: 0, C: 0 };
            }

            // 3. Verificar se tem perfil_disc direto
            if (!discType && discTest.perfil_disc) {
              const perfilLower = discTest.perfil_disc.toLowerCase();
              if (perfilLower.includes('dominante')) discType = 'D';
              else if (perfilLower.includes('influente')) discType = 'I';
              else if (perfilLower.includes('estável') || perfilLower.includes('estavel')) discType = 'S';
              else if (perfilLower.includes('conforme') || perfilLower.includes('consciencioso')) discType = 'C';
            }

            if (discType) {
              // Calcular porcentagem baseada nos counts se disponível
              let percentage = 75;
              if (discCounts) {
                const total = Object.values(discCounts).reduce((sum, val) => sum + val, 0);
                if (total > 0) {
                  percentage = Math.round((discCounts[discType] / total) * 100);
                }
              }

              const discProfile = {
                type: discType,
                name: getDiscName(discType),
                description: getDiscDescription(discType),
                percentage: percentage,
                characteristics: getDiscCharacteristics(discType),
                strengths: getDiscStrengths(discType),
                improvements: getDiscImprovements(discType),
                counts: discCounts
              };

              console.log("🔍 Dashboard - Perfil DISC montado a partir de dados reais:", discProfile);
              setDiscProfile(discProfile);
              return;
            }
          }
        }

        // Se não encontrou nos dados da API, verificar cache local
        const cacheKey = `disc_completed_${user.id}`;
        const profileCacheKey = `disc_profile_${user.id}`;
        const hasCompletedCache = localStorage.getItem(cacheKey) === 'true';

        if (hasCompletedCache) {
          // Tentar recuperar perfil salvo no localStorage
          const savedProfile = localStorage.getItem(profileCacheKey);

          if (savedProfile) {
            try {
              const discProfile = JSON.parse(savedProfile);
              setDiscProfile(discProfile);
              return;
            } catch (parseError) {

            }
          }

          // Usar hash do ID do usuário para garantir consistência
          const userId = user.id;
          const userHash = userId.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);

          const exampleTypes = ['D', 'I', 'S', 'C'];
          const consistentType = exampleTypes[Math.abs(userHash) % exampleTypes.length];
          const consistentPercentage = 70 + (Math.abs(userHash) % 20);

          const generatedProfile = {
            type: consistentType,
            name: getDiscName(consistentType),
            description: getDiscDescription(consistentType),
            percentage: consistentPercentage,
            characteristics: getDiscCharacteristics(consistentType),
            strengths: getDiscStrengths(consistentType),
            improvements: getDiscImprovements(consistentType)
          };

          // Salvar o perfil gerado no cache para próximas sessões
          localStorage.setItem(profileCacheKey, JSON.stringify(generatedProfile));
          setDiscProfile(generatedProfile);
        } else {
          setDiscProfile(null);
        }

      } catch (error) {
        console.error('🔍 Dashboard - Erro ao buscar perfil DISC:', error);
        setDiscProfile(null);
      }
    };

    if (user?.id && accessToken) {
      fetchDiscProfile();
    }
  }, [user, accessToken]);

  // Escutar mudanças no localStorage e eventos customizados (quando o teste for completado)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('disc_completed_') && e.newValue === 'true') {
        reloadDiscProfile();
      }
    };

    const handleDiscTestCompleted = (e) => {
      if (e.detail && e.detail.userId === user?.id) {
        // Limpar cache antigo
        const cacheKey = `disc_completed_${user.id}`;
        const profileCacheKey = `disc_profile_${user.id}`;
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(profileCacheKey);

        console.log("🔍 Dashboard - Cache limpo, recarregando perfil com dados frescos");

        // Forçar recarregamento com dados frescos da API
        setTimeout(() => {
          reloadDiscProfile();
        }, 1000); // Aguardar 1 segundo para garantir que o backend processou
      }
    };

    const reloadDiscProfile = () => {
      if (user?.id && accessToken) {
        setTimeout(() => {
          const fetchDiscProfile = async () => {
            try {
              // Tentar nova API primeiro
              const discProfile = await discApiService.getUserDiscProfile(user.id);
              if (discProfile) {
                const convertedProfile = discApiService.convertApiDataToProfile(discProfile);
                console.log("🔍 Dashboard - Recarregamento: Perfil DISC da nova API:", convertedProfile);
                setDiscProfile(convertedProfile);
                return;
              }

              // Fallback para API antiga - buscar testes psicológicos mais recentes
              const userTests = await testService.getUserPsychologicalTests(user.id, 'completed', 10);
              console.log("🔍 Dashboard - Recarregamento: Testes encontrados:", userTests);

              if (userTests && userTests.length > 0) {
                // Encontrar o teste DISC mais recente
                const discTest = userTests
                  .filter(test => {
                    const testType = test.test_type?.toLowerCase();
                    return (testType === 'disc' || testType === 'unified') && test.status === 'completed';
                  })
                  .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];

                if (discTest) {
                  // Usar a mesma lógica de extração que usamos acima
                  let discType = null;
                  let discCounts = null;

                  // Verificar disc_scores
                  if (discTest.disc_scores) {
                    let discScores;
                    try {
                      discScores = typeof discTest.disc_scores === 'string'
                        ? JSON.parse(discTest.disc_scores)
                        : discTest.disc_scores;
                    } catch (parseError) {
                      discScores = discTest.disc_scores;
                    }

                    if (discScores && discScores.type) {
                      discType = discScores.type;
                      discCounts = discScores.counts || { D: 0, I: 0, S: 0, C: 0 };
                    }
                  }

                  // Verificar result.disc
                  if (!discType && discTest.result?.disc) {
                    const discResult = discTest.result.disc;
                    if (discResult.perfil) {
                      const perfilLower = discResult.perfil.toLowerCase();
                      if (perfilLower.includes('dominante')) discType = 'D';
                      else if (perfilLower.includes('influente')) discType = 'I';
                      else if (perfilLower.includes('estável') || perfilLower.includes('estavel')) discType = 'S';
                      else if (perfilLower.includes('conforme') || perfilLower.includes('consciencioso')) discType = 'C';
                    }
                    discCounts = discResult.counts || { D: 0, I: 0, S: 0, C: 0 };
                  }

                  if (discType) {
                    let percentage = 75;
                    if (discCounts) {
                      const total = Object.values(discCounts).reduce((sum, val) => sum + val, 0);
                      if (total > 0) {
                        percentage = Math.round((discCounts[discType] / total) * 100);
                      }
                    }

                    const discProfile = {
                      type: discType,
                      name: getDiscName(discType),
                      description: getDiscDescription(discType),
                      percentage: percentage,
                      characteristics: getDiscCharacteristics(discType),
                      strengths: getDiscStrengths(discType),
                      improvements: getDiscImprovements(discType),
                      counts: discCounts
                    };

                    console.log("🔍 Dashboard - Perfil DISC recarregado com dados reais:", discProfile);
                    setDiscProfile(discProfile);
                  }
                }
              }
            } catch (error) {
              console.error('🔍 Dashboard - Erro ao recarregar perfil DISC:', error);
            }
          };
          fetchDiscProfile();
        }, 1000); // Aguarda 1 segundo para garantir que os dados foram salvos
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('discTestCompleted', handleDiscTestCompleted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('discTestCompleted', handleDiscTestCompleted);
    };
  }, [user, accessToken]);

  // Verificar se deve mostrar o modal da entrevista simulada
  useEffect(() => {
    const checkInterviewStatus = async () => {
      if (!user?.id || !accessToken) return;

      try {
        // Verificar no localStorage se o usuário já dispensou o modal
        const dismissedPrompt = localStorage.getItem(`interview_prompt_dismissed_${user.id}`);
        if (dismissedPrompt === 'true') {
          return;
        }

        // Verificar se já completou entrevista simulada via API
        try {
          const response = await fetch(`${API_URL}/api/interviews/user/${user.id}/status`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Se tem entrevistas completadas, não mostrar o modal
            if (data.hasCompletedInterviews || data.totalInterviews > 0) {
              setHasCompletedInterview(true);
              localStorage.setItem(`interview_completed_${user.id}`, 'true');
              return;
            }
          }
        } catch (apiError) {
          // Se a API falhar, verificar localStorage como fallback
          const completedInterview = localStorage.getItem(`interview_completed_${user.id}`);
          if (completedInterview === 'true') {
            setHasCompletedInterview(true);
            return;
          }
        }

        // Se passou por todas as verificações, mostrar o modal após um delay
        const timer = setTimeout(() => {
          setShowInterviewPrompt(true);
        }, 5000); // Aguarda 5 segundos após carregar o dashboard

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Erro ao verificar status da entrevista:', error);
      }
    };

    checkInterviewStatus();
  }, [user, accessToken]);

  const getEmpresaNome = (empresaId) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    return empresa?.name || "Empresa";
  };

  // Funções de controle do modal da entrevista simulada
  const handleStartInterview = () => {
    // Marcar que completou a entrevista para não mostrar o modal novamente
    localStorage.setItem(`interview_completed_${user.id}`, 'true');
    setHasCompletedInterview(true);
    setShowInterviewPrompt(false);

    // Redirecionar para a página da entrevista simulada
    navigate('/entrevista-simulada');
  };

  const handleDismissInterviewPrompt = () => {
    setShowInterviewPrompt(false);
  };

  const handleDismissInterviewPermanently = () => {
    // Salvar no localStorage que o usuário não quer ver mais
    localStorage.setItem(`interview_prompt_dismissed_${user.id}`, 'true');
    setShowInterviewPrompt(false);
  };

  // Função para completar a animação de boas-vindas
  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
    if (user?.email) {
      localStorage.setItem(`welcome_seen_${user.email}`, "true");
    }
  };

  // Funções para controlar o popup do tour - DESATIVADO
  const handleStartTour = () => {
    setShowTourPopup(false);
    // setIsOpen(true); // TOUR DESATIVADO
    if (user?.email) {
      localStorage.setItem(`tour_seen_${user.email}`, "true");
    }
  };

  const handleDismissTour = () => {
    setShowTourPopup(false);
    if (user?.email) {
      localStorage.setItem(`tour_seen_${user.email}`, "true");
    }
  };

  // Função para fechar o vídeo e iniciar o tour
  const handleCloseVideoAndStartTour = () => {
    closeWelcomeVideo();
    setTimeout(() => {
      setIsOpen(true);
    }, 500);
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

  // Funções auxiliares para DISC
  const getDiscName = (type) => {
    const names = {
      D: "Dominância",
      I: "Influência",
      S: "Estabilidade",
      C: "Conformidade"
    };
    return names[type] || "Dominância";
  };

  const getDiscDescription = (type) => {
    const descriptions = {
      D: "Focado em resultados, direto e decidido",
      I: "Comunicativo, otimista e persuasivo",
      S: "Leal, paciente e cooperativo",
      C: "Analítico, preciso e organizado"
    };
    return descriptions[type] || "Focado em resultados, direto e decidido";
  };

  const getDiscCharacteristics = (type) => {
    const characteristics = {
      D: ['Orientado para resultados', 'Direto na comunicação', 'Gosta de desafios', 'Toma decisões rapidamente'],
      I: ['Comunicativo e expressivo', 'Otimista e entusiasmado', 'Foca em relacionamentos', 'Inspirador e motivador'],
      S: ['Leal e paciente', 'Cooperativo', 'Busca estabilidade', 'Evita conflitos'],
      C: ['Analítico e preciso', 'Organizado', 'Segue regras', 'Perfeccionista']
    };
    return characteristics[type] || characteristics.D;
  };

  const getDiscStrengths = (type) => {
    const strengths = {
      D: ['Liderança natural', 'Iniciativa própria', 'Foco em objetivos', 'Resolução rápida de problemas'],
      I: ['Excelente comunicação', 'Trabalho em equipe', 'Criatividade e inovação', 'Motivação dos outros'],
      S: ['Trabalho em equipe estável', 'Lealdade', 'Paciência', 'Capacidade de ouvir'],
      C: ['Análise detalhada', 'Organização', 'Precisão', 'Planejamento estratégico']
    };
    return strengths[type] || strengths.D;
  };

  const getDiscImprovements = (type) => {
    const improvements = {
      D: ['Desenvolver paciência', 'Ouvir mais os outros', 'Considerar detalhes importantes', 'Trabalhar melhor em equipe'],
      I: ['Foco em detalhes', 'Organização pessoal', 'Controle de tempo', 'Seguir processos estruturados'],
      S: ['Assertividade', 'Iniciativa própria', 'Lidar com mudanças', 'Tomar decisões mais rápidas'],
      C: ['Flexibilidade', 'Networking', 'Comunicação interpessoal', 'Tolerância a erros']
    };
    return improvements[type] || improvements.D;
  };

  // Função para gerar relatório detalhado baseado nas respostas
  const generateDiscReport = (discProfile, responses = null) => {
    if (!discProfile) return null;

    const type = discProfile.type;

    return {
      overview: {
        title: `Relatório Completo - Perfil ${discProfile.name}`,
        summary: `Você apresenta características predominantes do perfil ${discProfile.name} (${type}), com ${discProfile.percentage || 75}% de intensidade. Este relatório analisa seu comportamento profissional e oferece insights personalizados.`,
        dominantType: type,
        percentage: discProfile.percentage || 75
      },

      behaviorAnalysis: {
        strengths: getDiscStrengths(type),
        challenges: getDiscImprovements(type),
        workStyle: getWorkStyleAnalysis(type),
        communicationStyle: getCommunicationAnalysis(type),
        leadershipPotential: getLeadershipAnalysis(type)
      },

      careerInsights: {
        idealRoles: getIdealRoles(type),
        workEnvironment: getIdealWorkEnvironment(type),
        teamDynamics: getTeamDynamics(type),
        stressFactors: getStressFactors(type)
      },

      developmentPlan: {
        immediateActions: getImmediateActions(type),
        longTermGoals: getLongTermGoals(type),
        skillsToImprove: getSkillsToImprove(type),
        recommendedTraining: getRecommendedTraining(type)
      },

      agribusinessSpecific: {
        sectorFit: getAgribusinessFit(type),
        networkingAdvice: getNetworkingAdvice(type),
        leadershipInAgro: getAgroLeadershipAdvice(type)
      }
    };
  };

  // Funções auxiliares para análises específicas
  const getWorkStyleAnalysis = (type) => {
    const analyses = {
      D: {
        description: "Estilo direto e orientado para resultados",
        preferences: ["Autonomia na tomada de decisões", "Metas claras e desafiadoras", "Feedback direto", "Ambiente competitivo"],
        approach: "Prefere liderar projetos e tomar decisões rapidamente, focando sempre nos resultados finais."
      },
      I: {
        description: "Estilo colaborativo e comunicativo",
        preferences: ["Interação social", "Trabalho em equipe", "Ambiente positivo", "Reconhecimento público"],
        approach: "Trabalha melhor em ambientes colaborativos onde pode influenciar e motivar outros."
      },
      S: {
        description: "Estilo estável e cooperativo",
        preferences: ["Processos estruturados", "Ambiente harmônico", "Segurança no trabalho", "Relacionamentos duradouros"],
        approach: "Valoriza estabilidade e prefere mudanças graduais com tempo para adaptação."
      },
      C: {
        description: "Estilo analítico e meticuloso",
        preferences: ["Informações detalhadas", "Processos estruturados", "Qualidade sobre quantidade", "Ambiente organizado"],
        approach: "Prefere analisar dados cuidadosamente antes de tomar decisões importantes."
      }
    };
    return analyses[type] || analyses.D;
  };

  const getCommunicationAnalysis = (type) => {
    const styles = {
      D: {
        style: "Direto e assertivo",
        tips: ["Seja conciso e objetivo", "Foque nos resultados", "Use dados para sustentar argumentos", "Evite detalhes desnecessários"]
      },
      I: {
        style: "Entusiástico e persuasivo",
        tips: ["Use histórias e exemplos", "Mantenha o tom positivo", "Permita interações sociais", "Reconheça contribuições"]
      },
      S: {
        style: "Calmo e empático",
        tips: ["Dê tempo para processar informações", "Seja paciente e compreensivo", "Evite pressão excessiva", "Valorize a harmonia"]
      },
      C: {
        style: "Preciso e factual",
        tips: ["Forneça dados e evidências", "Seja específico e detalhado", "Permita tempo para análise", "Evite pressão por decisões rápidas"]
      }
    };
    return styles[type] || styles.D;
  };

  const getLeadershipAnalysis = (type) => {
    const leadership = {
      D: {
        style: "Liderança Diretiva",
        strengths: ["Tomada de decisão rápida", "Orientação para resultados", "Capacidade de assumir riscos"],
        development: ["Desenvolver paciência", "Melhorar escuta ativa", "Delegar mais efetivamente"]
      },
      I: {
        style: "Liderança Inspiradora",
        strengths: ["Motivação de equipes", "Comunicação eficaz", "Criação de visão compartilhada"],
        development: ["Foco em detalhes", "Acompanhamento de tarefas", "Tomada de decisões difíceis"]
      },
      S: {
        style: "Liderança Servidora",
        strengths: ["Apoio à equipe", "Construção de consenso", "Estabilidade organizacional"],
        development: ["Assertividade", "Gestão de conflitos", "Promoção de mudanças necessárias"]
      },
      C: {
        style: "Liderança Analítica",
        strengths: ["Planejamento estratégico", "Qualidade e precisão", "Análise de riscos"],
        development: ["Agilidade na tomada de decisão", "Comunicação interpessoal", "Flexibilidade"]
      }
    };
    return leadership[type] || leadership.D;
  };

  const getIdealRoles = (type) => {
    const roles = {
      D: [
        "Gerente Geral de Fazenda",
        "Diretor de Operações Agrícolas",
        "Coordenador de Projetos",
        "Gestor de Vendas do Agronegócio",
        "Empreendedor Rural"
      ],
      I: [
        "Representante Comercial",
        "Coordenador de Marketing Rural",
        "Consultor Técnico",
        "Gestor de Relacionamento com Produtores",
        "Especialista em Treinamento"
      ],
      S: [
        "Analista de Sustentabilidade",
        "Coordenador de Qualidade",
        "Gestor de Pessoas no Campo",
        "Especialista em Compliance",
        "Coordenador de Bem-Estar Animal"
      ],
      C: [
        "Analista de Dados Agrícolas",
        "Especialista em Certificação",
        "Auditor de Processos",
        "Pesquisador Agropecuário",
        "Analista Financeiro Rural"
      ]
    };
    return roles[type] || roles.D;
  };

  const getIdealWorkEnvironment = (type) => {
    const environments = {
      D: {
        description: "Ambiente dinâmico com autonomia para decisões",
        characteristics: ["Alta autonomia", "Metas desafiadoras", "Resultados mensuráveis", "Ritmo acelerado"]
      },
      I: {
        description: "Ambiente colaborativo com interação social",
        characteristics: ["Trabalho em equipe", "Comunicação frequente", "Ambiente positivo", "Reconhecimento público"]
      },
      S: {
        description: "Ambiente estável com processos bem definidos",
        characteristics: ["Processos estruturados", "Mudanças graduais", "Segurança no emprego", "Harmonia na equipe"]
      },
      C: {
        description: "Ambiente organizado com foco na qualidade",
        characteristics: ["Processos detalhados", "Qualidade rigorosa", "Ambiente organizado", "Tempo para análise"]
      }
    };
    return environments[type] || environments.D;
  };

  const getAgribusinessFit = (type) => {
    const fits = {
      D: {
        suitability: "Excelente",
        reasoning: "O agronegócio valoriza lideranças que tomam decisões rápidas e focam em resultados, características naturais do perfil Dominante.",
        opportunities: ["Gestão de grandes propriedades", "Liderança em cooperativas", "Empreendedorismo rural", "Gestão de crise em safras"]
      },
      I: {
        suitability: "Muito Boa",
        reasoning: "A capacidade de comunicação e relacionamento é essencial no agronegócio para negociações e parcerias.",
        opportunities: ["Vendas de insumos", "Relacionamento com produtores", "Marketing de produtos rurais", "Representação comercial"]
      },
      S: {
        suitability: "Boa",
        reasoning: "A estabilidade e cooperação são valorizadas em ambientes que requerem processos consistentes e trabalho em equipe.",
        opportunities: ["Gestão de qualidade", "Coordenação de equipes rurais", "Sustentabilidade agrícola", "Processos de certificação"]
      },
      C: {
        suitability: "Muito Boa",
        reasoning: "A precisão e análise são cruciais no agronegócio moderno, especialmente com tecnologias avançadas e compliance.",
        opportunities: ["Agricultura de precisão", "Análise de dados agrícolas", "Pesquisa e desenvolvimento", "Auditoria e compliance"]
      }
    };
    return fits[type] || fits.D;
  };

  const getImmediateActions = (type) => {
    const actions = {
      D: [
        "Pratique a escuta ativa em reuniões desta semana",
        "Delegue uma tarefa importante para um membro da equipe",
        "Peça feedback sobre seu estilo de comunicação"
      ],
      I: [
        "Crie um sistema de acompanhamento para seus projetos",
        "Reserve tempo para trabalho focado sem interrupções",
        "Pratique dar feedback construtivo difícil"
      ],
      S: [
        "Identifique uma situação onde você pode ser mais assertivo",
        "Proponha uma pequena melhoria em um processo",
        "Pratique expressar sua opinião em reuniões"
      ],
      C: [
        "Defina um prazo para uma decisão que você está analisando",
        "Pratique comunicação mais direta com colegas",
        "Participe ativamente de uma discussão em equipe"
      ]
    };
    return actions[type] || actions.D;
  };

  const getLongTermGoals = (type) => {
    const goals = {
      D: [
        "Desenvolver habilidades de coaching e mentoria",
        "Aprimorar a inteligência emocional",
        "Criar estratégias de liderança mais inclusivas"
      ],
      I: [
        "Desenvolver habilidades de gestão de projetos",
        "Melhorar a capacidade de análise de dados",
        "Fortalecer a disciplina para tarefas de longo prazo"
      ],
      S: [
        "Desenvolver maior confiança para liderar mudanças",
        "Aprimorar habilidades de negociação",
        "Construir rede de contatos profissionais mais ampla"
      ],
      C: [
        "Melhorar habilidades de comunicação interpessoal",
        "Desenvolver agilidade na tomada de decisão",
        "Aprender a trabalhar melhor sob pressão de tempo"
      ]
    };
    return goals[type] || goals.D;
  };

  const getNetworkingAdvice = (type) => {
    const advice = {
      D: "Participe de eventos onde possa assumir papéis de liderança, como fóruns de presidentes de cooperativas ou conselhos setoriais.",
      I: "Aproveite sua naturalidade social em feiras agropecuárias, eventos de networking e associações de produtores.",
      S: "Construa relacionamentos duradouros em grupos menores, como câmaras técnicas e comitês especializados.",
      C: "Participe de congressos técnicos, seminários de pesquisa e grupos de estudo específicos da sua área."
    };
    return advice[type] || advice.D;
  };

  const getAgroLeadershipAdvice = (type) => {
    const advice = {
      D: "Use sua capacidade de tomada de decisão para liderar inovações no campo, mas lembre-se de envolver a equipe no processo.",
      I: "Sua habilidade de comunicação é valiosa para motivar trabalhadores rurais e construir parcerias com fornecedores.",
      S: "Sua estabilidade é essencial para gerenciar equipes rurais e manter a consistência nos processos produtivos.",
      C: "Sua precisão é crucial para implementar tecnologias agrícolas e garantir conformidade com regulamentações."
    };
    return advice[type] || advice.D;
  };

  const getSkillsToImprove = (type) => {
    const skills = {
      D: ["Paciência", "Escuta ativa", "Trabalho em equipe", "Delegação eficaz"],
      I: ["Foco e concentração", "Análise de dados", "Planejamento detalhado", "Acompanhamento de tarefas"],
      S: ["Assertividade", "Liderança de mudanças", "Negociação", "Tomada de riscos calculados"],
      C: ["Comunicação interpessoal", "Tomada de decisão ágil", "Flexibilidade", "Liderança de equipes"]
    };
    return skills[type] || skills.D;
  };

  const getRecommendedTraining = (type) => {
    const training = {
      D: [
        "Curso de Liderança Colaborativa",
        "Workshop de Inteligência Emocional",
        "Treinamento em Feedback e Coaching",
        "Seminário de Gestão de Equipes"
      ],
      I: [
        "Curso de Gestão de Projetos",
        "Treinamento em Análise de Dados",
        "Workshop de Produtividade e Foco",
        "Curso de Planejamento Estratégico"
      ],
      S: [
        "Treinamento em Assertividade",
        "Curso de Liderança de Mudanças",
        "Workshop de Negociação",
        "Seminário de Gestão de Conflitos"
      ],
      C: [
        "Curso de Comunicação Eficaz",
        "Treinamento em Tomada de Decisão",
        "Workshop de Liderança Situacional",
        "Seminário de Gestão do Tempo"
      ]
    };
    return training[type] || training.D;
  };

  const getTeamDynamics = (type) => {
    const dynamics = {
      D: {
        role: "Líder Natural",
        contribution: "Direciona a equipe para resultados e assume responsabilidades importantes",
        teamNeeds: "Beneficia-se de membros que complementem com atenção aos detalhes e processo"
      },
      I: {
        role: "Motivador da Equipe",
        contribution: "Mantém o moral alto e facilita a comunicação entre membros",
        teamNeeds: "Funciona bem com pessoas que ajudem no foco e no acompanhamento de tarefas"
      },
      S: {
        role: "Estabilizador da Equipe",
        contribution: "Garante harmonia e apoia colegas durante mudanças e desafios",
        teamNeeds: "Beneficia-se de líderes que proporcionem direção clara e segurança"
      },
      C: {
        role: "Especialista Técnico",
        contribution: "Garante qualidade e precisão nos resultados da equipe",
        teamNeeds: "Funciona melhor com pessoas que facilitem comunicação e tomada de decisão"
      }
    };
    return dynamics[type] || dynamics.D;
  };

  const getStressFactors = (type) => {
    const stressors = {
      D: {
        factors: ["Microgerenciamento", "Processos burocráticos lentos", "Falta de autonomia", "Indecisão da equipe"],
        management: "Busque ambientes com autonomia e comunique claramente suas necessidades de independência"
      },
      I: {
        factors: ["Trabalho isolado", "Críticas públicas", "Ambiente negativo", "Tarefas repetitivas"],
        management: "Cultive relacionamentos positivos e busque variedade nas atividades diárias"
      },
      S: {
        factors: ["Mudanças súbitas", "Conflitos na equipe", "Pressão por decisões rápidas", "Ambiente instável"],
        management: "Antecipe mudanças quando possível e desenvolva estratégias de adaptação gradual"
      },
      C: {
        factors: ["Pressão de tempo", "Informações incompletas", "Decisões baseadas apenas em intuição", "Ambiente desorganizado"],
        management: "Organize seu espaço de trabalho e estabeleça processos que garantam informações adequadas"
      }
    };
    return stressors[type] || stressors.D;
  };

  // Função para renderizar conteúdo das abas
  const getTabContent = (activeTab, report, disc) => {
    if (!report) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Resumo do Seu Perfil</h3>
              <p className="text-gray-700 leading-relaxed">{report.overview.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">✨</span>
                  Seus Principais Pontos Fortes
                </h4>
                <ul className="space-y-2">
                  {report.behaviorAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🎯</span>
                  Características Principais
                </h4>
                <ul className="space-y-2">
                  {disc.characteristics.slice(0, 4).map((char, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-purple-600 mr-2">💼</span>
                  Estilo de Trabalho
                </h4>
                <p className="text-gray-600 mb-3">{report.behaviorAnalysis.workStyle.description}</p>
                <div className="text-sm">
                  <p className="font-medium text-gray-700 mb-2">Abordagem:</p>
                  <p className="text-gray-600">{report.behaviorAnalysis.workStyle.approach}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">💬</span>
                  Estilo de Comunicação
                </h4>
                <p className="text-gray-600 mb-3">{report.behaviorAnalysis.communicationStyle.style}</p>
                <div className="text-sm">
                  <p className="font-medium text-gray-700 mb-2">Dicas para se comunicar com você:</p>
                  <ul className="space-y-1">
                    {report.behaviorAnalysis.communicationStyle.tips.slice(0, 3).map((tip, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-amber-600 mr-2">👑</span>
                  Potencial de Liderança
                </h4>
                <p className="text-gray-600 mb-3 font-medium">{report.behaviorAnalysis.leadershipPotential.style}</p>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="font-medium text-gray-700">Pontos fortes:</p>
                    <p className="text-gray-600">{report.behaviorAnalysis.leadershipPotential.strengths.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  Gestão de Estresse
                </h4>
                <div className="text-sm space-y-3">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Fatores estressantes:</p>
                    <ul className="space-y-1">
                      {report.careerInsights.stressFactors.factors.slice(0, 3).map((factor, index) => (
                        <li key={index} className="text-gray-600 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Como gerenciar:</p>
                    <p className="text-gray-600 text-xs">{report.careerInsights.stressFactors.management}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="text-green-600 mr-2">🌾</span>
                Adequação ao Agronegócio
              </h3>
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {report.agribusinessSpecific.sectorFit.suitability}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{report.agribusinessSpecific.sectorFit.reasoning}</p>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Oportunidades no setor:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.agribusinessSpecific.sectorFit.opportunities.map((opp, index) => (
                    <span key={index} className="text-sm bg-white px-3 py-2 rounded-lg border border-green-200 text-gray-700">
                      {opp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">💼</span>
                  Cargos Ideais para Você
                </h4>
                <ul className="space-y-2">
                  {report.careerInsights.idealRoles.map((role, index) => (
                    <li key={index} className="text-gray-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                      {role}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-purple-600 mr-2">🏢</span>
                  Ambiente de Trabalho Ideal
                </h4>
                <p className="text-gray-600 mb-3">{report.careerInsights.workEnvironment.description}</p>
                <ul className="space-y-1">
                  {report.careerInsights.workEnvironment.characteristics.map((char, index) => (
                    <li key={index} className="text-gray-600 flex items-start text-sm">
                      <span className="text-purple-500 mr-2">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-orange-600 mr-2">🤝</span>
                Networking no Agronegócio
              </h4>
              <p className="text-gray-700">{report.agribusinessSpecific.networkingAdvice}</p>
            </div>
          </div>
        );

      case 'development':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-amber-600 mr-2">⚡</span>
                  Ações Imediatas (Esta Semana)
                </h4>
                <ul className="space-y-3">
                  {report.developmentPlan.immediateActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-3 text-amber-600 rounded" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">🎯</span>
                  Metas de Longo Prazo
                </h4>
                <ul className="space-y-2">
                  {report.developmentPlan.longTermGoals.map((goal, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">📚</span>
                  Habilidades a Desenvolver
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.developmentPlan.skillsToImprove.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-purple-600 mr-2">🎓</span>
                  Treinamentos Recomendados
                </h4>
                <ul className="space-y-2">
                  {report.developmentPlan.recommendedTraining.map((training, index) => (
                    <li key={index} className="text-gray-700 bg-purple-50 px-3 py-2 rounded-lg text-sm border border-purple-100">
                      {training}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-white">
              <h4 className="font-semibold mb-3 flex items-center">
                <span className="mr-2">🌱</span>
                Liderança no Agronegócio
              </h4>
              <p className="text-indigo-100">{report.agribusinessSpecific.leadershipInAgro}</p>
            </div>
          </div>
        );

      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  // Função para obter cor do perfil DISC
  const getDiscColor = (profile) => {
    const colors = {
      Dominante: "bg-red-500",
      Dominância: "bg-red-500",
      Influente: "bg-green-500",
      Influência: "bg-green-500",
      Estável: "bg-blue-500",
      Estabilidade: "bg-blue-500",
      Conforme: "bg-orange-500",
      Conformidade: "bg-orange-500",
      D: "bg-red-500",
      I: "bg-green-500",
      S: "bg-blue-500",
      C: "bg-orange-500",
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
          <div className="mb-8">

            <div className="lg:flex flex-row px-6 pt-5 items-center gap-6  lg:items-start lg:justify-between">

              {/* Imagem e nome lado a lado em mobile */}
              <div className="flex flex- items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
                {(userData.profile_image || userData.userLegacy?.image) ? (
                  <img className=
                    {"w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] lg:w-[110px] lg:h-[110px] rounded-full border bg-gray-200 flex items-center justify-center"}
                    src={userData.profile_image || userData.userLegacy?.image}
                    alt="User Profile" />
                ) : (
                  <div className="w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] lg:w-[110px] lg:h-[110px] rounded-full border bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg sm:text-xl lg:text-2xl font-semibold">
                      {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl lg:text-2xl xl:text-3xl text-black font-bold">
                    Olá, {userData?.name?.split(" ")[0]}!
                  </h1>
                  <button
                    onClick={() => {/* setIsOpen(true); // TOUR DESATIVADO */ }}
                    className="first-step flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Iniciar Tour Guiado
                  </button>
                  <button
                    className="chat-bot-button bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                    onClick={() => navigate("/chat")}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                    </svg>
                    Falar com IZA
                  </button>
                </div>
              </div>



              {/* Card do Perfil DISC */}
              <div className="lg:w-96 pt-5">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                  {/* Informações do Perfil */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${getDiscColor(disc?.type || disc?.name)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-white text-sm sm:text-lg lg:text-xl font-bold">{disc?.type?.charAt(0) || 'D'}</span>
                    </div>
                    <div className="min-w-0 flex-1 pt-5">
                      <h3 className="text-gray-900 text-sm sm:text-base lg:text-lg font-semibold truncate">
                        {disc?.name || 'Perfil não definido'}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium">Perfil Comportamental DISC</p>
                      {disc?.percentage && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${disc.percentage}%`,
                                background: disc.type === 'D' ? 'linear-gradient(90deg, #EF4444, #DC2626)' :
                                  disc.type === 'I' ? 'linear-gradient(90deg, #10B981, #059669)' :
                                    disc.type === 'S' ? 'linear-gradient(90deg, #3B82F6, #2563EB)' : 'linear-gradient(90deg, #F59E0B, #D97706)',
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{disc.percentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0 pt-5">
                    <button
                      onClick={() => navigate("/disc-profile")}
                      className={`w-full md:w-auto px-6 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition ${disc
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        }`}
                    >
                      {disc ? "Ver Relatório" : "Fazer Teste DISC"}
                    </button>

                    {disc && (
                      <button
                        onClick={() => navigate("/teste-disc")}
                        className="px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 whitespace-nowrap"
                      >
                        Refazer Teste
                      </button>
                    )}
                  </div>
                </div>
              </div>








              {/* Modal DISC Simples */}
              {false && showDiscDetails && disc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
                      <button
                        onClick={() => setShowDiscDetails(false)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
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


          {/* Últimas Vagas - Nova Seção */}
          <section className="mb-12 vagas-section">
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

            <button

            >

            </button>
          </section>

          {/* Biblioteca de Aplicativos - Movida para cima */}
          <section className="mb-12 biblioteca-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Biblioteca de Aplicativos
              </h2>
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
          <section className="mb-12 trilhas-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
                Trilhas para acelerar sua carreira
              </h2>
              {/*<Button variant="ghost" className="text-gray-300 hover:text-white">*/}
              {/*  Ver todas <ChevronRight className="w-4 h-4 ml-1" />*/}
              {/*</Button>*/}
            </div>

            {/* Carrossel Destaque - Mentoria de Empregabilidade */}

            {/* <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Em Destaque</h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 pb-4">
                  {/* Card Principal - Mentoria de Empregabilidade 
                  <div
                    className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden cursor-pointer group relative"
                    onClick={() => navigate("/trilha/6")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-yellow-400 to-orange-500">
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-between p-8">
                      <div>
                        <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold mb-3">
                          ⭐ DESTAQUE
                        </span>
                        <div className="text-white/80 text-sm mb-2">MÓDULO ESPECIAL</div>
                      </div>

                      <div>
                        <h4 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                          MENTORIA DE<br />EMPREGABILIDADE
                        </h4>
                        <p className="text-white/90 text-sm mb-4">
                          Acelere sua carreira no agronegócio
                        </p>
                        <div className="flex items-center gap-4 text-white/80 text-xs">
                          <span>10 módulos</span>
                          <span>•</span>
                          <span>5h de conteúdo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden cursor-pointer group relative"
                    onClick={() => navigate("/trilha/2")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-between p-8">
                      <div>
                        <div className="text-white/80 text-sm mb-2">MÓDULO 4</div>
                      </div>

                      <div>
                        <h4 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                          GESTÃO DE<br />CARREIRA
                        </h4>
                        <p className="text-white/90 text-sm mb-4">
                          Estratégias avançadas para acelerar sua carreira
                        </p>
                        <div className="flex items-center gap-4 text-white/80 text-xs">
                          <span>17 módulos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <div
                    className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden cursor-pointer group relative"
                    onClick={() => navigate("/trilha/1")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500">
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-between p-8">
                      <div>
                        <div className="text-white/80 text-sm mb-2">MÓDULO 1</div>
                      </div>

                      <div>
                        <h4 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                          AUTOCONHECIMENTO
                        </h4>
                        <p className="text-white/90 text-sm mb-4">
                          Descubra seu potencial e perfil profissional
                        </p>
                        <div className="flex items-center gap-4 text-white/80 text-xs">
                          <span>8 módulos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

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
                    Auto Análise e Foco em Metas
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
                      O que o mercado busca nos profissionais do Agro ?
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

      {/* Modal de Promoção da Entrevista Simulada */}
      {/* <InterviewPromptModal
        isOpen={showInterviewPrompt}
        onClose={handleDismissInterviewPrompt}
        onStartInterview={handleStartInterview}
        onDismissPermanently={handleDismissInterviewPermanently}
      /> */}

      {/* Modal de Tour Popup 
      {showTourPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
             Header 
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo à AgroSkills! 🚀
              </h2>
              <p className="text-gray-600">
                Que tal fazer um tour rápido pela plataforma? Vamos te mostrar as principais funcionalidades em poucos minutos!
              </p>
            </div>

      <div className="flex gap-3">
        <button
          onClick={handleDismissTour}
          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Pular por agora
        </button>
        <button
          onClick={handleStartTour}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
        >
          Começar Tour
        </button>
      </div>
    </div >
        </div >
      )} */}

      {/* Modal de Vídeo de Boas-vindas */}
      {showWelcomeVideo && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: '999999 !important', position: 'fixed !important' }}>
          <div className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0">
            <button
              onClick={handleCloseVideoAndStartTour}
              className="absolute -top-16 right-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Pular vídeo
            </button>
            <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white shadow-2xl">
              <iframe
                src="https://iframe.mediadelivery.net/embed/480681/932d82ca-1a19-4431-888a-3bd610a17180?autoplay=true&loop=false&muted=false&preload=true&responsive=true"
                title="Vídeo de Boas-vindas"
                className="size-full rounded-2xl"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </div>
      )
      }
    </>
  );
};

export default Dashboard;



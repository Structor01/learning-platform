import { useState } from 'react';
import TrilhasForm from "@/components/ui/TrilhasForm";
import WelcomeAnimation from "@/components/ui/WelcomeAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  Video,
  Upload,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = ({ onCourseSelect, trilhas = [] }) => {
  //console.log("🚀 Dashboard montado! trilhas =", trilhas);
  const { user, isLoading } = useAuth();
  const [setHoveredCourse] = useState(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

  // --- Estado para trilhas do usuário ---
  //const [trilhas, setTrilhas] = useState([]);
  //const [isTrilhaFormOpen, setIsTrilhaFormOpen] = useState(false);

  // Função para completar a animação de boas-vindas
  const handleWelcomeComplete = () => {
    setShowWelcomeAnimation(false);
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

  const recommendedCourses = [
    {
      id: 1,
      title: "Autoconhecimento para Carreiras",
      instructor: "Samantha Andrade",
      duration: "2h 30min",
      thumbnail: "/api/placeholder/300/200",
      category: "Desenvolvimento Pessoal",
      level: "Iniciante",
      description:
        "Descubra seus pontos fortes e desenvolva uma carreira alinhada com seu perfil no agronegócio.",
      rating: "4.9",
    },
    {
      id: 2,
      title: "Finanças Pessoais no Agronegócio",
      instructor: "Carlos Silva",
      duration: "3h 15min",
      thumbnail: "/api/placeholder/300/200",
      category: "Finanças",
      level: "Intermediário",
      description:
        "Aprenda a gerenciar suas finanças pessoais e investimentos no setor agrícola.",
      rating: "4.8",
    },
    {
      id: 3,
      title: "Metas & Objetivos Profissionais",
      instructor: "Ana Costa",
      duration: "1h 45min",
      thumbnail: "/api/placeholder/300/200",
      category: "Planejamento",
      level: "Iniciante",
      description:
        "Defina metas claras e alcance seus objetivos profissionais no agronegócio.",
      rating: "4.7",
    },
    {
      id: 4,
      title: "Gestão de Carreira no Agro",
      instructor: "Bruno Nardon",
      duration: "4h 20min",
      thumbnail: "/api/placeholder/300/200",
      category: "Carreira",
      level: "Avançado",
      description:
        "Estratégias avançadas para acelerar sua carreira no setor do agronegócio.",
      rating: "4.9",
    },
    {
      id: 5,
      title: "Preparação para Processos Seletivos",
      instructor: "Samantha Andrade",
      duration: "2h 50min",
      thumbnail: "/api/placeholder/300/200",
      category: "Empregabilidade",
      level: "Intermediário",
      description:
        "Domine todas as etapas dos processos seletivos no agronegócio.",
      rating: "4.8",
    },
    {
      id: 6,
      title: "LinkedIn para Profissionais do Agro",
      instructor: "Maria Santos",
      duration: "1h 30min",
      thumbnail: "/api/placeholder/300/200",
      category: "Networking",
      level: "Iniciante",
      description:
        "Otimize seu perfil no LinkedIn e expanda sua rede de contatos no agronegócio.",
      rating: "4.6",
    },
  ];

  // Cursos para "Continue assistindo" baseados na AgroSkills
  const continueWatching = [
    {
      id: 1,
      title: "Autoconhecimento para Carreiras",
      instructor: "Samantha Andrade",
      progress: 65,
      timeLeft: "35 min restantes",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: 2,
      title: "Finanças Pessoais no Agronegócio",
      instructor: "Carlos Silva",
      progress: 30,
      timeLeft: "2h 15min restantes",
      thumbnail: "/api/placeholder/300/200",
    },
    {
      id: 3,
      title: "Preparação para Processos Seletivos",
      instructor: "Samantha Andrade",
      progress: 80,
      timeLeft: "25 min restantes",
      thumbnail: "/api/placeholder/300/200",
    },
  ];

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

  const handleCourseClick = (course) => {
    onCourseSelect?.(course);
  };

  // Abre o form de nova trilha
  //const handleAddTrilha = () => {
  //setIsTrilhaFormOpen(true);
  //};

  // Fecha sem salvar
  //const handleTrilhaClose = () => {
  //setIsTrilhaFormOpen(false);
  //};

  // Recebe os dados do form e adiciona ao array de trilhas
  //const handleTrilhaSubmit = (novaTrilha) => {
  //setTrilhas((old) => [
  //...old,
  //{
  //id: Date.now().toString(),
  //title: novaTrilha.title,
  //instructor: novaTrilha.instructor || "Comunidade",
  //duration: "—",
  //level: "Básico",
  //category: "Trilha",
  //coverHorizontal: novaTrilha.coverHorizontal,
  //videoUrl: novaTrilha.videoUrl,
  //},
  //]);
  //setIsTrilhaFormOpen(false);
  //};

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
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
          </div>
        </div>

        {/* Biblioteca de Aplicativos - Movida para cima */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Biblioteca de Aplicativos
            </h2>
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-4">
            {/* Meu Cartão Virtual */}
            <Card className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Cartão Virtual</h3>
                <p className="text-xs text-gray-400">Cartão digital</p>
              </CardContent>
            </Card>

            {/* Agenda de Eventos */}
            <Card className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Agenda</h3>
                <p className="text-xs text-gray-400">Eventos</p>
              </CardContent>
            </Card>

            {/* Entrevista Simulada */}
            <Card className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Entrevista</h3>
                <p className="text-xs text-gray-400">Simulada</p>
              </CardContent>
            </Card>

            {/* Video Pitch */}
            <Card className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Video Pitch</h3>
                <p className="text-xs text-gray-400">Profissional</p>
              </CardContent>
            </Card>

            {/* Meus Testes */}
            <Card className="bg-transparent border-gray-800 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Testes</h3>
                <p className="text-xs text-gray-400">Avaliações</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-8">
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
                    Liderança Estratégica
                  </p>
                  <p className="text-sm text-gray-500">45 min</p>
                </div>
                <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleCourseClick(recommendedCourses[0])}
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

        {/* Última Aula - Nova Seção */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Última Aula
            </h2>
          </div>
          
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail do vídeo */}
              <div className="md:w-1/3 relative">
                <div className="aspect-video bg-gray-800 rounded-l-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-2 opacity-60" />
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      🔴 AO VIVO
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Conteúdo da aula */}
              <div className="md:w-2/3 p-6">
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Aulão - Etapas de processo seletivo e sua carreira no Agro
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Neste aulão ao vivo, você vai descobrir todas as etapas do processo seletivo no agronegócio e como 
                    construir uma carreira sólida no setor. Aprenda estratégias para se destacar em entrevistas, 
                    desenvolver competências técnicas e comportamentais essenciais para o sucesso no agro.
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>45 min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Samantha Andrade</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>1.2k assistindo</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
                    onClick={() => onSmartPlayerOpen && onSmartPlayerOpen('https://youtube.com/live/DogH89e7Ib0?feature=share')}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Assistir Aula
                  </Button>
                </CardContent>
              </div>
            </div>
          </Card>
        </section>

        {/* Stats Cards */}

        {/* Recommended Courses */}
        {/* Suas Trilhas Cadastradas */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Suas Trilhas</h2>
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4">
            {trilhas.length > 0 ? (
              trilhas.map((t) => (
                <div
                  key={t.id}
                  className="flex-none w-72 group cursor-pointer"
                  onMouseEnter={() => setHoveredCourse(t.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                  onClick={() => onCourseSelect(t)}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div
                      className="w-full h-40 bg-cover rounded-t-lg"
                      style={{
                        backgroundImage: t.coverHorizontalUrl
                          ? `url(http://localhost:3001${t.coverHorizontalUrl})`
                          : `url(/api/placeholder/300/200)`, // fallback para placeholder
                      }}
                    />

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Por {t.instructor}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {t.duration}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {t.level}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Você ainda não adicionou nenhuma trilha.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default Dashboard;

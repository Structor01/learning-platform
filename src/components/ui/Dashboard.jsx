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

const Dashboard = ({ onCourseSelect, onSmartPlayerOpen, trilhas = [] }) => {
  //console.log("🚀 Dashboard montado! trilhas =", trilhas);
  const { user, isLoading } = useAuth();
  const [hoveredCourse, setHoveredCourse] = useState(null);
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
      title: "Liderança Estratégica",
      instructor: "Bruno Nardon",
      duration: "45 min",
      thumbnail: "/api/placeholder/300/200",
      category: "Liderança",
      level: "Avançado",
      description:
        "Desenvolva habilidades de liderança estratégica para impulsionar sua carreira e equipe.",
      rating: "4.8",
    },
    {
      id: 2,
      title: "Gestão de Pessoas",
      instructor: "Sofia Esteves",
      duration: "32 min",
      thumbnail: "/api/placeholder/300/200",
      category: "Gestão",
      level: "Intermediário",
      description:
        "Aprenda técnicas eficazes para gerenciar equipes e maximizar a produtividade.",
      rating: "4.7",
    },
    {
      id: 3,
      title: "Análise de Dados",
      instructor: "Carlos Silva",
      duration: "28 min",
      thumbnail: "/api/placeholder/300/200",
      category: "Tecnologia",
      level: "Básico",
      description:
        "Fundamentos de análise de dados para tomada de decisões estratégicas.",
      rating: "4.6",
    },
    {
      id: 4,
      title: "Negociação Avançada",
      instructor: "Ana Costa",
      duration: "38 min",
      thumbnail: "/api/placeholder/300/200",
      category: "Vendas",
      level: "Avançado",
      description:
        "Técnicas avançadas de negociação para fechar melhores acordos.",
      rating: "4.9",
    },
    {
      id: 5,
      title: "Marketing Digital",
      instructor: "Pedro Santos",
      duration: "42 min",
      thumbnail: "/api/placeholder/300/200",
      category: "Marketing",
      level: "Intermediário",
      description:
        "Estratégias modernas de marketing digital para aumentar sua presença online.",
      rating: "4.5",
    },
  ];

  const continueWatching = [
    {
      id: 6,
      title: "Planejamento Estratégico",
      instructor: "Tallis Gomes",
      progress: 65,
      thumbnail: "/api/placeholder/300/200",
      timeLeft: "15 min restantes",
      description:
        "Metodologias de planejamento estratégico para organizações.",
      rating: "4.8",
    },
    {
      id: 7,
      title: "Comunicação Eficaz",
      instructor: "Maria Silva",
      progress: 30,
      thumbnail: "/api/placeholder/300/200",
      timeLeft: "25 min restantes",
      description:
        "Desenvolva habilidades de comunicação para liderar com eficácia.",
      rating: "4.7",
    },
    {
      id: 8,
      title: "Inovação Empresarial",
      instructor: "João Oliveira",
      progress: 85,
      thumbnail: "/api/placeholder/300/200",
      timeLeft: "8 min restantes",
      description: "Como implementar inovação em ambientes corporativos.",
      rating: "4.6",
    },
  ];

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
      
      <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
                  <span className="text-gray-600">Perfil: {predominant}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Progresso Geral
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentProgress}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <Progress value={currentProgress} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Próximo Conteúdo
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Liderança Estratégica
                  </p>
                  <p className="text-sm text-gray-500">45 min</p>
                </div>
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800"
                  onClick={() => handleCourseClick(recommendedCourses[0])}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Meta Semanal
                  </p>
                  <p className="text-3xl font-bold text-gray-900">4/5</p>
                  <p className="text-sm text-gray-500">dias de estudo</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Player Section */}
        <section className="mb-8">
          <Card className="border-2 border-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Smart Player
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Faça upload e reproduza seus próprios vídeos educacionais
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload seguro
                      </span>
                      <span className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        Player protegido
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Anti-pirataria
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={onSmartPlayerOpen}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Abrir Smart Player
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vídeo Externo (tamanho aumentado) */}
        <section className="mb-12">
          <div className="w-full max-w-5xl mx-auto">
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/HJtbkEWrKp8?si=t4vSbpwyGHjuWQlJ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Recommended Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recomendado para você
            </h2>
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => handleCourseClick(course)}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <div className="w-full h-40 bg-gray-900 rounded-t-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-60" />
                        <p className="text-sm opacity-80">{course.category}</p>
                      </div>
                    </div>
                    {hoveredCourse === course.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                        <Button
                          size="lg"
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course);
                          }}
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Assistir
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Por {course.instructor}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {course.duration}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

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

        {/* Biblioteca de Aplicativos */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Biblioteca de Aplicativos
            </h2>
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Meu Cartão Virtual */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Meu Cartão Virtual</h3>
                <p className="text-sm text-gray-600">Crie e compartilhe seu cartão de visita digital</p>
              </CardContent>
            </Card>

            {/* Agenda de Eventos */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Agenda de Eventos</h3>
                <p className="text-sm text-gray-600">Gerencie seus eventos e compromissos</p>
              </CardContent>
            </Card>

            {/* Entrevista Simulada */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Entrevista Simulada</h3>
                <p className="text-sm text-gray-600">Pratique suas habilidades de entrevista</p>
              </CardContent>
            </Card>

            {/* Video Pitch */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Video Pitch</h3>
                <p className="text-sm text-gray-600">Grave e compartilhe seu pitch profissional</p>
              </CardContent>
            </Card>

            {/* Meus Testes */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Meus Testes</h3>
                <p className="text-sm text-gray-600">Acesse seus testes e avaliações</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Continue Watching */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Continue assistindo
            </h2>
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueWatching.map((course) => (
              <Card
                key={course.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => handleCourseClick(course)}
              >
                <div className="relative">
                  <div className="w-full h-32 bg-gray-800 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-8 h-8 mx-auto mb-1 opacity-60" />
                      <p className="text-xs opacity-80">
                        {course.progress}% concluído
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress
                      value={course.progress}
                      className="h-1 rounded-none"
                    />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Por {course.instructor}
                  </p>
                  <p className="text-xs text-gray-500">{course.timeLeft}</p>
                  <Button
                    className="w-full mt-3 bg-black hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course);
                    }}
                  >
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default Dashboard;

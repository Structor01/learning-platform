import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, BookOpen, Award, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const recommendedCourses = [
    {
      id: 1,
      title: 'Liderança Estratégica',
      instructor: 'Bruno Nardon',
      duration: '45 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Liderança',
      level: 'Avançado',
      description: 'Desenvolva habilidades de liderança estratégica para impulsionar sua carreira e equipe.',
      rating: '4.8'
    },
    {
      id: 2,
      title: 'Gestão de Pessoas',
      instructor: 'Sofia Esteves',
      duration: '32 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Gestão',
      level: 'Intermediário',
      description: 'Aprenda técnicas eficazes para gerenciar equipes e maximizar a produtividade.',
      rating: '4.7'
    },
    {
      id: 3,
      title: 'Análise de Dados',
      instructor: 'Carlos Silva',
      duration: '28 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Tecnologia',
      level: 'Básico',
      description: 'Fundamentos de análise de dados para tomada de decisões estratégicas.',
      rating: '4.6'
    },
    {
      id: 4,
      title: 'Negociação Avançada',
      instructor: 'Ana Costa',
      duration: '38 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Vendas',
      level: 'Avançado',
      description: 'Técnicas avançadas de negociação para fechar melhores acordos.',
      rating: '4.9'
    },
    {
      id: 5,
      title: 'Marketing Digital',
      instructor: 'Pedro Santos',
      duration: '42 min',
      thumbnail: '/api/placeholder/300/200',
      category: 'Marketing',
      level: 'Intermediário',
      description: 'Estratégias modernas de marketing digital para aumentar sua presença online.',
      rating: '4.5'
    }
  ];

  const continueWatching = [
    {
      id: 6,
      title: 'Planejamento Estratégico',
      instructor: 'Tallis Gomes',
      progress: 65,
      thumbnail: '/api/placeholder/300/200',
      timeLeft: '15 min restantes',
      description: 'Metodologias de planejamento estratégico para organizações.',
      rating: '4.8'
    },
    {
      id: 7,
      title: 'Comunicação Eficaz',
      instructor: 'Maria Silva',
      progress: 30,
      thumbnail: '/api/placeholder/300/200',
      timeLeft: '25 min restantes',
      description: 'Desenvolva habilidades de comunicação para liderar com eficácia.',
      rating: '4.7'
    },
    {
      id: 8,
      title: 'Inovação Empresarial',
      instructor: 'João Oliveira',
      progress: 85,
      thumbnail: '/api/placeholder/300/200',
      timeLeft: '8 min restantes',
      description: 'Como implementar inovação em ambientes corporativos.',
      rating: '4.6'
    }
  ];

  const getDiscColor = (profile) => {
    const colors = {
      'Dominante': 'bg-red-500',
      'Influente': 'bg-green-500',
      'Estável': 'bg-blue-500',
      'Conforme': 'bg-orange-500'
    };
    return colors[profile] || 'bg-gray-500';
  };

  const handleCourseClick = (course) => {
    onCourseSelect?.(course);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 ${getDiscColor(user?.discProfile?.predominant)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {user?.discProfile?.predominant?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-600">Perfil: {user?.discProfile?.predominant || 'Conforme'}</span>
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
                  <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                  <p className="text-3xl font-bold text-gray-900">{user?.progress?.currentProgress || 51}%</p>
                </div>
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <Progress value={user?.progress?.currentProgress || 51} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximo Conteúdo</p>
                  <p className="text-lg font-semibold text-gray-900">Liderança Estratégica</p>
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
                  <p className="text-sm font-medium text-gray-600">Meta Semanal</p>
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

        {/* Recommended Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recomendado para você</h2>
            <Button variant="ghost" className="text-gray-600 hover:text-black">
              Ver todos <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="flex-none w-72 group cursor-pointer"
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
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Por {course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{course.duration}</span>
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

        {/* Continue Watching */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Continue assistindo</h2>
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
                      <p className="text-xs opacity-80">{course.progress}% concluído</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={course.progress} className="h-1 rounded-none" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Por {course.instructor}</p>
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
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from './Navbar';
import {
  Brain,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Award,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

const TesteDISCPage = () => {
  const [currentPhase, setCurrentPhase] = useState('intro'); // intro, test, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Perguntas do teste DISC
  const discQuestions = [
    {
      id: 1,
      question: "Em situações de trabalho em equipe, você tende a:",
      options: [
        { text: "Assumir a liderança e tomar decisões rapidamente", type: "D" },
        { text: "Motivar e inspirar os colegas com entusiasmo", type: "I" },
        { text: "Apoiar e colaborar harmoniosamente", type: "S" },
        { text: "Analisar detalhadamente antes de agir", type: "C" }
      ]
    },
    {
      id: 2,
      question: "Quando enfrenta um problema complexo, sua primeira reação é:",
      options: [
        { text: "Buscar uma solução rápida e eficaz", type: "D" },
        { text: "Discutir com outros para gerar ideias", type: "I" },
        { text: "Considerar como isso afeta as pessoas", type: "S" },
        { text: "Pesquisar e analisar todas as variáveis", type: "C" }
      ]
    },
    {
      id: 3,
      question: "Em reuniões de trabalho, você geralmente:",
      options: [
        { text: "Dirige a discussão para resultados", type: "D" },
        { text: "Contribui com ideias criativas e energia", type: "I" },
        { text: "Escuta atentamente e busca consenso", type: "S" },
        { text: "Apresenta dados e fatos relevantes", type: "C" }
      ]
    },
    {
      id: 4,
      question: "Seu estilo de comunicação é mais:",
      options: [
        { text: "Direto e objetivo", type: "D" },
        { text: "Expressivo e entusiástico", type: "I" },
        { text: "Calmo e diplomático", type: "S" },
        { text: "Preciso e detalhado", type: "C" }
      ]
    },
    {
      id: 5,
      question: "Ao tomar decisões importantes, você:",
      options: [
        { text: "Decide rapidamente baseado na intuição", type: "D" },
        { text: "Consulta pessoas de confiança", type: "I" },
        { text: "Pondera cuidadosamente os impactos", type: "S" },
        { text: "Analisa todos os dados disponíveis", type: "C" }
      ]
    },
    {
      id: 6,
      question: "Em situações de pressão, você:",
      options: [
        { text: "Mantém o foco nos objetivos", type: "D" },
        { text: "Busca apoio e motivação dos outros", type: "I" },
        { text: "Procura manter a calma e estabilidade", type: "S" },
        { text: "Organiza e planeja sistematicamente", type: "C" }
      ]
    },
    {
      id: 7,
      question: "Seu ambiente de trabalho ideal é:",
      options: [
        { text: "Dinâmico com desafios constantes", type: "D" },
        { text: "Colaborativo e socialmente ativo", type: "I" },
        { text: "Estável e harmonioso", type: "S" },
        { text: "Organizado e estruturado", type: "C" }
      ]
    },
    {
      id: 8,
      question: "Quando apresenta um projeto, você enfatiza:",
      options: [
        { text: "Os resultados e benefícios práticos", type: "D" },
        { text: "A visão inspiradora e possibilidades", type: "I" },
        { text: "O impacto positivo nas pessoas", type: "S" },
        { text: "Os dados, métodos e precisão", type: "C" }
      ]
    },
    {
      id: 9,
      question: "Sua maior motivação no trabalho é:",
      options: [
        { text: "Alcançar metas e superar desafios", type: "D" },
        { text: "Reconhecimento e interação social", type: "I" },
        { text: "Contribuir para o bem-estar da equipe", type: "S" },
        { text: "Fazer um trabalho de alta qualidade", type: "C" }
      ]
    },
    {
      id: 10,
      question: "Ao receber feedback, você prefere que seja:",
      options: [
        { text: "Direto e focado em resultados", type: "D" },
        { text: "Positivo e encorajador", type: "I" },
        { text: "Construtivo e respeitoso", type: "S" },
        { text: "Específico e baseado em fatos", type: "C" }
      ]
    },
    {
      id: 11,
      question: "Em projetos de equipe, você naturalmente:",
      options: [
        { text: "Assume responsabilidades e lidera", type: "D" },
        { text: "Gera entusiasmo e engajamento", type: "I" },
        { text: "Facilita a colaboração entre membros", type: "S" },
        { text: "Garante qualidade e precisão", type: "C" }
      ]
    },
    {
      id: 12,
      question: "Sua abordagem para mudanças é:",
      options: [
        { text: "Abraçar rapidamente novas oportunidades", type: "D" },
        { text: "Ver o lado positivo e inspirar outros", type: "I" },
        { text: "Adaptar-se gradualmente mantendo estabilidade", type: "S" },
        { text: "Analisar riscos e planejar cuidadosamente", type: "C" }
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (currentPhase === 'test' && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPhase, startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setCurrentPhase('test');
    setStartTime(new Date());
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < discQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finishTest = async () => {
    // Calcular resultados DISC
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    
    Object.values(answers).forEach(answer => {
      scores[answer.type]++;
    });

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100)
    };

    // Determinar perfil dominante
    const dominantType = Object.keys(percentages).reduce((a, b) => 
      percentages[a] > percentages[b] ? a : b
    );

    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);

    // Preparar dados para salvar no backend
    const testResultData = {
      userId: 1, // TODO: Pegar do contexto de autenticação
      testTypeId: 7, // ID do teste DISC na tabela test_types
      testName: "Teste DISC - Perfil Comportamental",
      testCategory: "Comportamental",
      startedAt: startTime.toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: durationSeconds,
      totalQuestions: discQuestions.length,
      discDPercentage: percentages.D,
      discIPercentage: percentages.I,
      discSPercentage: percentages.S,
      discCPercentage: percentages.C,
      dominantProfile: dominantType,
      rawAnswers: answers,
      detailedResults: {
        scores,
        percentages,
        dominantType,
        completionTime: durationSeconds
      },
      testAnswers: discQuestions.map((question, index) => ({
        questionId: question.id,
        questionText: question.question,
        selectedOption: answers[index] ? question.options.findIndex(opt => opt.text === answers[index].text) : null,
        selectedText: answers[index] ? answers[index].text : null,
        answerTimeSeconds: Math.floor(Math.random() * 30) + 10 // Tempo simulado por pergunta
      }))
    };

    try {
      // Salvar resultado no backend
      const response = await fetch('https://3001-ikjlsjh5wfosw5vrl3xjt-f4ac7591.manusvm.computer/api/api/tests/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResultData)
      });

      if (response.ok) {
        const savedResult = await response.json();
        console.log('Resultado salvo com sucesso:', savedResult);
      } else {
        console.error('Erro ao salvar resultado:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao conectar com o backend:', error);
    }

    const profiles = {
      D: {
        name: "Dominância",
        description: "Orientado para resultados, direto e determinado",
        characteristics: [
          "Foco em resultados e metas",
          "Tomada de decisão rápida",
          "Liderança natural",
          "Gosta de desafios",
          "Comunicação direta"
        ],
        strengths: [
          "Liderança eficaz",
          "Orientação para resultados",
          "Decisões rápidas",
          "Aceita desafios"
        ],
        developmentAreas: [
          "Paciência com detalhes",
          "Consideração pelos outros",
          "Flexibilidade",
          "Escuta ativa"
        ],
        color: "from-red-500 to-red-600",
        icon: Target
      },
      I: {
        name: "Influência",
        description: "Sociável, otimista e persuasivo",
        characteristics: [
          "Comunicação expressiva",
          "Entusiasmo contagiante",
          "Orientação para pessoas",
          "Criatividade e inovação",
          "Networking natural"
        ],
        strengths: [
          "Comunicação persuasiva",
          "Motivação de equipes",
          "Criatividade",
          "Relacionamento interpessoal"
        ],
        developmentAreas: [
          "Foco em detalhes",
          "Organização",
          "Seguimento de processos",
          "Análise crítica"
        ],
        color: "from-yellow-500 to-yellow-600",
        icon: Users
      },
      S: {
        name: "Estabilidade",
        description: "Cooperativo, confiável e paciente",
        characteristics: [
          "Trabalho em equipe",
          "Lealdade e confiabilidade",
          "Paciência e persistência",
          "Busca por harmonia",
          "Apoio aos colegas"
        ],
        strengths: [
          "Colaboração eficaz",
          "Confiabilidade",
          "Paciência",
          "Mediação de conflitos"
        ],
        developmentAreas: [
          "Assertividade",
          "Adaptação a mudanças",
          "Tomada de iniciativa",
          "Autoconfiança"
        ],
        color: "from-green-500 to-green-600",
        icon: Users
      },
      C: {
        name: "Conformidade",
        description: "Analítico, preciso e sistemático",
        characteristics: [
          "Atenção aos detalhes",
          "Análise sistemática",
          "Busca por precisão",
          "Planejamento cuidadoso",
          "Qualidade no trabalho"
        ],
        strengths: [
          "Análise detalhada",
          "Qualidade e precisão",
          "Planejamento sistemático",
          "Pensamento crítico"
        ],
        developmentAreas: [
          "Flexibilidade",
          "Tomada de decisão rápida",
          "Comunicação interpessoal",
          "Tolerância a riscos"
        ],
        color: "from-blue-500 to-blue-600",
        icon: BarChart3
      }
    };

    setTestResults({
      scores,
      percentages,
      dominantType,
      profile: profiles[dominantType],
      completionTime: durationSeconds,
      completedAt: completedAt.toISOString()
    });

    setCurrentPhase('results');
  };

  const restartTest = () => {
    setCurrentPhase('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setTestResults(null);
    setTimeElapsed(0);
    setStartTime(null);
  };

  const renderIntro = () => (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-6">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Teste DISC</h1>
        <p className="text-xl text-gray-300 mb-8">
          Descubra seu perfil comportamental e potencialize seu desenvolvimento profissional
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-400" />
              O que é o DISC?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              O DISC é uma ferramenta de avaliação comportamental que identifica quatro estilos principais:
              <strong> Dominância, Influência, Estabilidade e Conformidade</strong>. 
              Compreender seu perfil ajuda no autoconhecimento e melhora suas relações profissionais.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-400" />
              Informações do Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <ul className="space-y-2">
              <li>• <strong>12 perguntas</strong> cuidadosamente elaboradas</li>
              <li>• <strong>5-8 minutos</strong> de duração estimada</li>
              <li>• <strong>Resultado imediato</strong> com análise detalhada</li>
              <li>• <strong>Relatório completo</strong> para download</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { type: 'D', name: 'Dominância', color: 'from-red-500 to-red-600', icon: Target },
          { type: 'I', name: 'Influência', color: 'from-yellow-500 to-yellow-600', icon: Users },
          { type: 'S', name: 'Estabilidade', color: 'from-green-500 to-green-600', icon: Users },
          { type: 'C', name: 'Conformidade', color: 'from-blue-500 to-blue-600', icon: BarChart3 }
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.type} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${item.color} rounded-full mb-3`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.type}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={startTest}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3"
        >
          <Brain className="h-5 w-5 mr-2" />
          Iniciar Teste DISC
        </Button>
      </div>
    </div>
  );

  const renderTest = () => {
    const question = discQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / discQuestions.length) * 100;
    const currentAnswer = answers[question.id];

    return (
      <div className="max-w-3xl mx-auto p-6">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-400">
              Pergunta {currentQuestion + 1} de {discQuestions.length}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeElapsed)}
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Pergunta */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      currentAnswer?.text === option.text
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        currentAnswer?.text === option.text
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500'
                      }`}>
                        {currentAnswer?.text === option.text && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      {option.text}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navegação */}
        <div className="flex justify-between">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            {currentQuestion === discQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const { percentages, profile, completionTime } = testResults;
    const ProfileIcon = profile.icon;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${profile.color} rounded-full mb-6`}>
            <ProfileIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Seu Perfil DISC</h1>
          <h2 className="text-2xl text-purple-400 mb-4">{profile.name}</h2>
          <p className="text-xl text-gray-300 mb-6">{profile.description}</p>
          
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Tempo: {formatTime(completionTime)}
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1" />
              Teste Concluído
            </div>
          </div>
        </motion.div>

        {/* Gráfico de Resultados */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Distribuição do Seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(percentages).map(([type, percentage]) => {
                const colors = {
                  D: 'bg-red-500',
                  I: 'bg-yellow-500',
                  S: 'bg-green-500',
                  C: 'bg-blue-500'
                };
                const names = {
                  D: 'Dominância',
                  I: 'Influência',
                  S: 'Estabilidade',
                  C: 'Conformidade'
                };
                
                return (
                  <div key={type} className="flex items-center">
                    <div className="w-24 text-sm text-gray-300">{names[type]}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-4 mx-4">
                      <div
                        className={`h-4 rounded-full ${colors[type]} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-white font-semibold">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                {profile.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-400" />
                Áreas de Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                {profile.developmentAreas.map((area, index) => (
                  <li key={index} className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-400" />
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Características Principais */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Características Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.characteristics.map((characteristic, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <div className={`w-2 h-2 rounded-full ${profile.color.includes('red') ? 'bg-red-500' : profile.color.includes('yellow') ? 'bg-yellow-500' : profile.color.includes('green') ? 'bg-green-500' : 'bg-blue-500'} mr-3`} />
                  {characteristic}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={restartTest}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refazer Teste
          </Button>
          
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
          
          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Meu Resultado do Teste DISC',
                  text: `Descobri que meu perfil DISC é ${profile.name}! Faça você também o teste.`,
                  url: window.location.href
                });
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        <AnimatePresence mode="wait">
          {currentPhase === 'intro' && renderIntro()}
          {currentPhase === 'test' && renderTest()}
          {currentPhase === 'results' && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TesteDISCPage;


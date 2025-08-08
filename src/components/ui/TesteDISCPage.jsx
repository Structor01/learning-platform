import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navbar from './Navbar';
import testService from '../../services/testService';
import { useAuth } from '@/contexts/AuthContext';
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
  Share2,
  AlertCircle
} from 'lucide-react';

const TesteDISCPage = () => {
  const [currentPhase, setCurrentPhase] = useState('intro'); // intro, test, results, loading
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obter dados do usuário autenticado
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id || user?.user_id || 1; // Fallback para 1 se não houver usuário

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

  const startTest = async () => {
    try {
      setLoading(true);
      setError(null);

      // Criar novo teste psicológico unificado
      const newTest = await testService.createPsychologicalTest(userId, 'unified');
      setTestId(newTest.id);

      // Obter perguntas do teste
      const testQuestions = await testService.getPsychologicalTestQuestions(newTest.id);
      setQuestions(testQuestions.questions);

      setCurrentPhase('test');
      setStartTime(new Date());
      setCurrentQuestion(0);
      setAnswers({});
      setLoading(false);
    } catch (error) {
      console.error('Erro ao iniciar teste:', error);
      setError('Erro ao iniciar o teste. Tente novamente.');
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId, selectedOption, questionNumber) => {
    try {
      // Salvar resposta localmente
      setAnswers(prev => ({
        ...prev,
        [questionNumber]: {
          questionId,
          selectedOption,
          questionNumber
        }
      }));

      // Submeter resposta para o backend
      await testService.submitPsychologicalTestResponse(testId, {
        question_id: questionId,
        question_number: questionNumber,
        selected_option: selectedOption
      });

    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      setError('Erro ao salvar resposta. Continuando...');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
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
    try {
      setLoading(true);
      setCurrentPhase('loading');

      // Finalizar teste no backend
      const completedTest = await testService.completePsychologicalTest(testId);

      // Obter relatório detalhado
      const report = await testService.getPsychologicalTestReport(testId);

      setTestResults({
        test: completedTest.test,
        scores: completedTest.scores,
        analysis: completedTest.analysis,
        report: report
      });

      setCurrentPhase('results');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      setError('Erro ao finalizar o teste. Tente novamente.');
      setLoading(false);
    }
  };

  const restartTest = () => {
    setCurrentPhase('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setTestResults(null);
    setTimeElapsed(0);
    setStartTime(null);
    setTestId(null);
    setQuestions([]);
    setError(null);
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
        <h1 className="text-4xl font-bold text-white mb-4">Teste Psicológico Unificado</h1>
        <p className="text-xl text-gray-300 mb-4">
          Descubra seu perfil DISC, Big Five e Estilo de Liderança em um único teste
        </p>
        {user && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 inline-block">
            <p className="text-gray-300">
              <span className="text-purple-400">Usuário:</span> {user.name || user.email || 'Usuário'}
            </p>
            <p className="text-sm text-gray-400">
              ID: {userId} • Este teste será associado ao seu perfil
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-400" />
              DISC
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              Avalia seu <strong>estilo comportamental</strong> em quatro dimensões:
              Dominância, Influência, Estabilidade e Conformidade.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-400" />
              Big Five
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              Mede os <strong>cinco grandes fatores</strong> da personalidade:
              Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-400" />
              Liderança
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              Identifica seu <strong>estilo de liderança</strong>:
              Autocrático, Democrático, Transformacional, Transacional e Servidor.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-400" />
            Informações do Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li>• <strong>25 perguntas</strong> cuidadosamente elaboradas</li>
              <li>• <strong>10-15 minutos</strong> de duração estimada</li>
              <li>• <strong>Resultado imediato</strong> com análise detalhada</li>
            </ul>
            <ul className="space-y-2">
              <li>• <strong>Relatório completo</strong> dos três perfis</li>
              <li>• <strong>Recomendações personalizadas</strong> de desenvolvimento</li>
              <li>• <strong>Análise integrada</strong> dos resultados</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900 border-red-700 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center text-red-200">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button
          onClick={startTest}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Preparando Teste...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Iniciar Teste Unificado
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderTest = () => {
    if (questions.length === 0) {
      return (
        <div className="max-w-2xl mx-auto p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-white">Carregando perguntas...</p>
        </div>
      );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentAnswer = answers[currentQuestion + 1];

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm text-gray-400">
              {formatTime(timeElapsed)}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% concluído</span>
            <span className="capitalize">{question.question_type}</span>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {question.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const optionLetter = ['A', 'B', 'C', 'D'][index];
                const isSelected = currentAnswer?.selectedOption === optionLetter;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(question.id, optionLetter, currentQuestion + 1)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3 mt-0.5 ${
                        isSelected ? 'bg-white text-purple-600' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-900 border-red-700 mb-4">
            <CardContent className="p-3">
              <div className="flex items-center text-red-200 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

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
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                Finalizar Teste
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-6">
          <RefreshCw className="h-10 w-10 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white">Processando Resultados</h2>
        <p className="text-gray-300">
          Analisando suas respostas e gerando seu perfil personalizado...
        </p>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Calculando scores DISC...</div>
          <div className="text-sm text-gray-400">Analisando Big Five...</div>
          <div className="text-sm text-gray-400">Identificando estilo de liderança...</div>
        </div>
      </motion.div>
    </div>
  );

  const renderResults = () => {
    if (!testResults) return null;

    const { scores, analysis, report } = testResults;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Resultados do Teste</h1>
          <p className="text-xl text-gray-300">
            Seu perfil psicológico completo foi gerado com sucesso
          </p>
        </motion.div>

        {/* Scores DISC */}
        {scores.disc && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-red-400" />
                Perfil DISC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scores.disc).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-white">{value.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scores Big Five */}
        {scores.bigFive && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                Big Five
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(scores.bigFive).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8">{value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scores Liderança */}
        {scores.leadership && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                Estilo de Liderança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(scores.leadership).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8">{value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise */}
        {analysis.overall && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-400" />
                Análise Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{analysis.overall}</p>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        {analysis.recommendations && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{analysis.recommendations}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={restartTest}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Fazer Novo Teste
          </Button>
          
          <Button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>
      </div>
    );
  };

  // Mostrar loading enquanto carrega autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-white">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <AnimatePresence mode="wait">
          {currentPhase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderIntro()}
            </motion.div>
          )}
          
          {currentPhase === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderTest()}
            </motion.div>
          )}
          
          {currentPhase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderLoading()}
            </motion.div>
          )}
          
          {currentPhase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TesteDISCPage;


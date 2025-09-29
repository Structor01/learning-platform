import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { useDiscTest } from "@/hooks/useDiscTest";

const TesteDISCPage = () => {
  const navigate = useNavigate();
  const { getQuestions, submitTest, loading } = useDiscTest();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  // Carregar perguntas da API
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('🔍 Carregando perguntas do DISC...');
        console.log('🔍 API_URL sendo usada:', import.meta.env.VITE_API_URL);
        const apiQuestions = await getQuestions();
        console.log('✅ Perguntas carregadas:', apiQuestions);
        console.log('✅ Número de perguntas:', apiQuestions?.length);

        // Debug detalhado da estrutura das perguntas
        apiQuestions.forEach((question, index) => {
          console.log(`Pergunta ${index}:`, {
            id: question.id,
            text: question.text,
            options: question.options,
            optionsCount: question.options?.length
          });

          if (question.options) {
            question.options.forEach((option, optIndex) => {
              console.log(`  Opção ${optIndex}:`, {
                id: option.id,
                text: option.text,
                idType: typeof option.id
              });
            });
          }
        });

        setQuestions(apiQuestions);
        setQuestionsLoaded(true);
      } catch (err) {
        console.error('❌ Erro ao carregar perguntas:', err);
        // Fallback para perguntas locais se a API falhar
        setQuestions(getFallbackQuestions());
        setQuestionsLoaded(true);
      }
    };

    loadQuestions();
  }, [getQuestions]);

  // Perguntas de fallback caso a API não funcione
  const getFallbackQuestions = () => [
    {
      id: 1,
      text: "Em situações de pressão, eu prefiro:",
      options: [
        { id: "a", text: "Tomar decisões rápidas e assumir o controle" },
        { id: "b", text: "Buscar consenso com a equipe" },
        { id: "c", text: "Analisar todas as opções cuidadosamente" },
        { id: "d", text: "Manter a estabilidade e evitar conflitos" }
      ]
    },
    {
      id: 2,
      text: "Quando lidero um projeto, minha abordagem é:",
      options: [
        { id: "a", text: "Definir metas claras e cobrar resultados" },
        { id: "b", text: "Motivar a equipe e criar um ambiente positivo" },
        { id: "c", text: "Estabelecer processos detalhados e padrões" },
        { id: "d", text: "Garantir que todos se sintam confortáveis" }
      ]
    }
  ];

  const handleAnswer = (selectedOption) => {
    const newResponses = {
      ...responses,
      [currentQuestion]: selectedOption
    };
    setResponses(newResponses);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAnswers(newResponses);
    }
  };
  const submitAnswers = async (finalResponses) => {
    try {
      console.log('🔍 TesteDISC - Enviando respostas...');
      console.log('🔍 TesteDISC - Respostas finais:', finalResponses);

      // Converter respostas para o formato da nova API
      const answers = Object.entries(finalResponses).map(([questionIndex, selectedOptionId]) => {
        const question = questions[parseInt(questionIndex)];
        return {
          questionId: question.id,
          optionId: selectedOptionId
        };
      });

      console.log('🔍 TesteDISC - Respostas formatadas para nova API:', answers);

      // Enviar para a nova API DISC
      const result = await submitTest(answers);
      console.log('✅ TesteDISC - Resultado recebido:', result);

      // Usar o resultado da API
      setTestResult(result);
      setShowResult(true);

    } catch (error) {
      console.error('❌ TesteDISC - Erro ao enviar teste:', error);
      alert('Erro ao enviar teste. Tente novamente.');
    }
  };
  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  // Funções auxiliares para interpretar o perfil DISC
  const getDiscProfileName = (type) => {
    const names = {
      'D': 'Dominante',
      'I': 'Influente',
      'S': 'Estável',
      'C': 'Consciencioso'
    };
    return names[type] || 'Desconhecido';
  };

  const getDiscProfileDescription = (type) => {
    const descriptions = {
      'D': 'Focado em resultados, direto e decidido. Gosta de assumir controle e tomar decisões rápidas.',
      'I': 'Comunicativo, otimista e persuasivo. Gosta de trabalhar com pessoas e criar relacionamentos.',
      'S': 'Leal, paciente e cooperativo. Valoriza estabilidade e trabalho em equipe.',
      'C': 'Analítico, preciso e organizado. Preza pela qualidade e atenção aos detalhes.'
    };
    return descriptions[type] || 'Perfil ainda em análise.';
  };

  const getDiscStrengths = (type) => {
    const strengths = {
      'D': ['Liderança natural', 'Tomada de decisão rápida', 'Orientação para resultados', 'Iniciativa', 'Competitividade saudável'],
      'I': ['Comunicação eficaz', 'Motivação de equipes', 'Networking', 'Criatividade', 'Otimismo contagiante'],
      'S': ['Trabalho em equipe', 'Estabilidade emocional', 'Lealdade', 'Paciência', 'Resolução de conflitos'],
      'C': ['Análise detalhada', 'Qualidade no trabalho', 'Organização', 'Planejamento', 'Precisão técnica']
    };
    return strengths[type] || ['Características em análise'];
  };

  const getDiscImprovements = (type) => {
    const improvements = {
      'D': ['Desenvolver paciência', 'Melhorar escuta ativa', 'Considerar opinião da equipe', 'Controlar impulsividade'],
      'I': ['Focar nos detalhes', 'Melhorar organização', 'Cumprir prazos', 'Ser mais analítico'],
      'S': ['Tomar iniciativa', 'Aceitar mudanças', 'Expressar opiniões', 'Ser mais assertivo'],
      'C': ['Ser mais flexível', 'Melhorar relacionamento interpessoal', 'Aceitar riscos calculados', 'Comunicar-se mais']
    };
    return improvements[type] || ['Áreas de desenvolvimento em análise'];
  };

  // Loading state
  if (loading || !questionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  if (showResult && testResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white flex items-center space-x-2 hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-white text-xl font-bold ml-6">Resultado do Teste DISC</h1>
        </div>

        {/* Results Content */}
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Teste Concluído!</h2>
            <p className="text-gray-300">Aqui está o resultado do seu teste DISC</p>
          </div>

          {/* DISC Results Display */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Seu Perfil DISC</h3>

            {testResult?.result?.disc ? (
              <div className="space-y-6">
                {/* Perfil Principal */}
                <div className="text-center bg-gray-700 rounded-lg p-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                    {testResult.result.disc.perfil}
                  </div>
                  <h4 className="text-2xl font-bold mb-2">
                    Perfil {getDiscProfileName(testResult.result.disc.perfil)}
                  </h4>
                  <p className="text-gray-300">
                    {getDiscProfileDescription(testResult.result.disc.perfil)}
                  </p>
                </div>

                {/* Pontuações */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h5 className="text-lg font-semibold mb-4">Distribuição DISC:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(testResult.result.disc.counts).map(([type, count]) => (
                      <div key={type} className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{count}</div>
                        <div className="text-sm text-gray-300">{type} - {getDiscProfileName(type)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Características do Perfil */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h5 className="text-lg font-semibold mb-4">Características do seu perfil:</h5>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h6 className="font-semibold mb-2 text-green-400">Pontos Fortes:</h6>
                      <ul className="space-y-1 text-sm">
                        {getDiscStrengths(testResult.result.disc.perfil).map((strength, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-semibold mb-2 text-yellow-400">Áreas de Desenvolvimento:</h6>
                      <ul className="space-y-1 text-sm">
                        {getDiscImprovements(testResult.result.disc.perfil).map((improvement, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-300">Processando resultado...</p>
                <p className="text-sm text-gray-400 mt-2">Dados brutos: {JSON.stringify(testResult)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white flex items-center space-x-2 hover:text-gray-300 mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <Brain className="w-6 h-6 mr-2" />
          <h1 className="text-xl font-bold">Teste Psicológico Unificado</h1>
        </div>
        <div className="text-sm">
          {currentQuestion + 1} de {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-700 h-2">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Section Badge - Removed since API questions may not have sections */}

          {/* Question */}
          <div className="bg-gray-800 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {questions[currentQuestion]?.text || 'Carregando pergunta...'}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {questions[currentQuestion]?.options?.map((option, index) => (
                <button
                  key={option.id || index}
                  onClick={() => handleAnswer(option.id || index)}
                  className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 border-2 border-gray-400 rounded mr-4 flex items-center justify-center text-sm font-bold">
                      {option.id ? option.id.toString().toUpperCase() : String.fromCharCode(65 + index)}
                    </div>
                    <span>{option.text || 'Opção sem texto'}</span>
                  </div>
                </button>
              )) || (
                <div className="text-center text-gray-400">
                  <p>Carregando opções...</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-400 text-sm">
            <p>Escolha a opção que melhor descreve você na maioria das situações</p>
            <p className="mt-2">Tempo estimado restante: {Math.ceil((questions.length - currentQuestion - 1) * 0.3)} minutos</p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Enviando suas respostas...</p>
            <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TesteDISCPage;
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { useDiscTest } from "@/hooks/useDiscTest";
import { useAuth } from "@/contexts/AuthContext";

const TesteDISCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getQuestions, saveTestAnswers, loading } = useDiscTest();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);

  // Carregar perguntas da API
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('🔍 Carregando perguntas do DISC...');
        console.log('🔍 API_URL sendo usada:', import.meta.env.VITE_API_URL);
        const apiQuestions = await getQuestions();
        
        console.log('✅ Perguntas carregadas:', apiQuestions);
        console.log('📊 Total de perguntas carregadas:', apiQuestions?.length || 0);

        setQuestions(apiQuestions);
        setQuestionsLoaded(true);
        setTestStartTime(new Date()); // Marcar início do teste
      } catch (err) {
        console.error('❌ Erro ao carregar perguntas:', err);
        setQuestionsLoaded(true);
      }
    };

    loadQuestions();
  }, [getQuestions]);


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
  const calculateResults = (finalResponses) => {
    console.log('🔍 Calculando resultados do teste...');
    
    const discCounts = { D: 0, I: 0, S: 0, C: 0 };
    const bigFiveScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const ieScores = { autoconsciencia: 0, autorregulacao: 0, automotivacao: 0, empatia: 0, habilidade_social: 0 };
    
    // Contadores para cada tipo de teste
    const discQuestionCount = { D: 0, I: 0, S: 0, C: 0 };
    const bigFiveQuestionCount = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const ieQuestionCount = { autoconsciencia: 0, autorregulacao: 0, automotivacao: 0, empatia: 0, habilidade_social: 0 };

    // Processar cada resposta
    Object.entries(finalResponses).forEach(([questionIndex, selectedOptionId]) => {
      const question = questions[parseInt(questionIndex)];
      
      if (question.question_type === 'disc') {
        // Para DISC, usar scoring_weights
        const weights = question.scoring_weights[selectedOptionId];
        if (weights) {
          Object.entries(weights).forEach(([dimension, weight]) => {
            discCounts[dimension] += weight;
          });
        }
        discQuestionCount[question.dimension]++;
        
      } else if (question.question_type === 'big_five') {
        // Para Big Five, usar scoring_weights direto
        const score = question.scoring_weights[selectedOptionId];
        if (typeof score === 'number') {
          bigFiveScores[question.dimension] += score;
          bigFiveQuestionCount[question.dimension]++;
        }
        
      } else if (question.question_type === 'ie') {
        // Para IE, usar scoring_weights direto
        const score = question.scoring_weights[selectedOptionId];
        if (typeof score === 'number') {
          ieScores[question.dimension] += score;
          ieQuestionCount[question.dimension]++;
        }
      }
    });

    // Calcular percentuais DISC
    const totalDiscResponses = Object.values(discCounts).reduce((a, b) => a + b, 0);
    const discPercentages = {};
    Object.entries(discCounts).forEach(([type, count]) => {
      discPercentages[type] = totalDiscResponses > 0 ? Math.round((count / totalDiscResponses) * 100) : 0;
    });

    // Determinar perfil DISC dominante
    const dominantDisc = Object.entries(discCounts).reduce((a, b) => 
      discCounts[a[0]] > discCounts[b[0]] ? a : b
    )[0];

    // Calcular percentuais Big Five (escala 1-5 para 0-100%)
    const bigFivePercentages = {};
    Object.entries(bigFiveScores).forEach(([trait, score]) => {
      const maxPossible = bigFiveQuestionCount[trait] * 5; // máximo 5 por pergunta
      bigFivePercentages[trait] = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
    });

    // Calcular percentuais IE (escala 1-5 para 0-100%)
    const iePercentages = {};
    Object.entries(ieScores).forEach(([dimension, score]) => {
      const maxPossible = ieQuestionCount[dimension] * 5; // máximo 5 por pergunta
      iePercentages[dimension] = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
    });

    const results = {
      disc: {
        counts: discCounts,
        percentages: discPercentages,
        perfil: dominantDisc,
        profileBreakdown: {
          primary: {
            type: dominantDisc,
            percentage: discPercentages[dominantDisc]
          },
          all: Object.entries(discPercentages).map(([type, percentage]) => ({
            type,
            percentage
          })).sort((a, b) => b.percentage - a.percentage)
        }
      },
      bigFive: {
        scores: bigFivePercentages,
        traits: Object.entries(bigFivePercentages).map(([trait, score]) => ({
          trait,
          score,
          level: score >= 70 ? 'Alto' : score >= 40 ? 'Médio' : 'Baixo'
        }))
      },
      ie: {
        scores: iePercentages,
        dimensions: Object.entries(iePercentages).map(([dimension, score]) => ({
          dimension,
          score,
          level: score >= 70 ? 'Alto' : score >= 40 ? 'Médio' : 'Baixo'
        })),
        overall: Math.round(Object.values(iePercentages).reduce((a, b) => a + b, 0) / Object.values(iePercentages).length)
      }
    };

    console.log('✅ Resultados calculados:', results);
    return results;
  };

  const submitAnswers = async (finalResponses) => {
    try {
      console.log('🔍 TesteDISC - Processando respostas...');
      console.log('🔍 TesteDISC - Respostas finais:', finalResponses);

      // Calcular resultados no frontend
      const calculatedResults = calculateResults(finalResponses);

      // Preparar dados no formato esperado pelo backend
      const completedAt = new Date();
      const startedAt = testStartTime || completedAt;
      const durationSeconds = Math.floor((completedAt - startedAt) / 1000);
      
      const testResultData = {
        // Campos obrigatórios da API
        userId: user?.id || 1917, // ID do usuário do contexto de autenticação
        testTypeId: 1, // ID do tipo de teste DISC
        testName: "Teste Psicológico Unificado", 
        startedAt: startedAt.toISOString(), // Data real de início
        completedAt: completedAt.toISOString(), // Data de conclusão
        durationSeconds: durationSeconds, // Duração real em segundos
        totalQuestions: questions.length,
        
        // Campos do formato original
        testCategory: "DISC_UNIFIED",
        score: calculatedResults.disc.counts[calculatedResults.disc.perfil], 
        percentage: calculatedResults.disc.percentages[calculatedResults.disc.perfil], 
        status: "completed", 
        
        // Campos específicos para teste DISC:
        discDPercentage: calculatedResults.disc.percentages.D,
        discIPercentage: calculatedResults.disc.percentages.I,
        discSPercentage: calculatedResults.disc.percentages.S,
        discCPercentage: calculatedResults.disc.percentages.C,
        dominantProfile: calculatedResults.disc.perfil,
        
        // Dados adicionais:
        rawAnswers: finalResponses,
        detailedResults: calculatedResults,
        testAnswers: Object.entries(finalResponses).map(([questionIndex, selectedOptionId]) => {
          const question = questions[parseInt(questionIndex)];
          const selectedText = question.options[selectedOptionId];
          
          return {
            questionId: question.id,
            questionText: question.question_text,
            selectedOption: selectedOptionId,
            selectedText: selectedText,
            correctOption: null,
            isCorrect: null,
            answerTimeSeconds: null
          };
        })
      };

      console.log('🔍 Dados formatados para salvar:', testResultData);

      // Formato para exibição na tela
      const result = {
        testId: Date.now(),
        result: calculatedResults,
        message: 'Teste calculado com sucesso'
      };

      setTestResult(result);
      setShowResult(true);

      // Salvar no backend usando o hook
      try {
        await saveTestAnswers(testResultData);
        console.log('✅ Resultados salvos no backend com sucesso');
      } catch (saveError) {
        console.error('⚠️ Erro ao salvar no backend (continuando mesmo assim):', saveError);
        
        // Tentar salvar via testService como fallback
        try {
          const { default: testService } = await import('@/services/testService');
          await testService.saveTestResult(testResultData);
          console.log('✅ Dados salvos via testService (fallback)');
        } catch (fallbackError) {
          console.error('❌ Falha também no testService:', fallbackError);
        }
      }

    } catch (error) {
      console.error('❌ TesteDISC - Erro ao processar teste:', error);
      alert('Erro ao processar teste. Tente novamente.');
    }
  };
  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
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
          <h1 className="text-white text-xl font-bold ml-6">Resultado do Teste Psicológico</h1>
        </div>

        {/* Results Content */}
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Teste Concluído!</h2>
            <p className="text-gray-300">Seus resultados do teste psicológico unificado</p>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            {/* DISC Results */}
            {testResult?.result?.disc && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Perfil DISC</h3>
                <div className="text-center bg-gray-700 rounded-lg p-6 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                    {testResult.result.disc.perfil}
                  </div>
                  <h4 className="text-xl font-bold mb-2">
                    Perfil {testResult.result.disc.perfil} - {
                      {
                        'D': 'Dominante',
                        'I': 'Influente', 
                        'S': 'Estável',
                        'C': 'Consciencioso'
                      }[testResult.result.disc.perfil] || 'Desconhecido'
                    }
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {testResult.result.disc.percentages && Object.entries(testResult.result.disc.percentages).map(([type, percentage]) => {
                      const typeNames = {
                        'D': 'Dominante',
                        'I': 'Influente',
                        'S': 'Estável', 
                        'C': 'Consciencioso'
                      };
                      return (
                        <div key={type} className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
                          <div className="text-sm text-gray-300">{type} - {typeNames[type]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Big Five Results */}
            {testResult?.result?.bigFive && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-green-400">Perfil Big Five</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {testResult.result.bigFive.scores && Object.entries(testResult.result.bigFive.scores).map(([trait, score]) => {
                    const traitNames = {
                      'O': 'Abertura à Experiência',
                      'C': 'Conscienciosidade', 
                      'E': 'Extroversão',
                      'A': 'Amabilidade',
                      'N': 'Neuroticismo'
                    };
                    return (
                      <div key={trait} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{traitNames[trait] || trait}</span>
                          <span className="text-green-400">{score}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inteligência Emocional Results */}
            {testResult?.result?.ie && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-purple-400">Inteligência Emocional</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-purple-400">{testResult.result.ie.overall}%</div>
                  <div className="text-gray-300">Pontuação Geral</div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {testResult.result.ie.scores && Object.entries(testResult.result.ie.scores).map(([dimension, score]) => {
                    const dimensionNames = {
                      'autoconsciencia': 'Autoconsciência',
                      'autorregulacao': 'Autorregulação',
                      'automotivacao': 'Automotivação',
                      'empatia': 'Empatia',
                      'habilidade_social': 'Habilidade Social'
                    };
                    return (
                      <div key={dimension} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{dimensionNames[dimension] || dimension.replace('_', ' ')}</span>
                          <span className="text-purple-400">{score}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raw Data for Debugging */}
            {(!testResult?.result?.disc && !testResult?.result?.bigFive && !testResult?.result?.ie) && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Resultado Bruto (Debug)</h3>
                <pre className="text-sm text-gray-300 overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="text-center mt-8">
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
      {questions && questions.length > 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            {/* Question */}
            <div className="bg-gray-800 rounded-lg p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {questions[currentQuestion]?.question_text || 'Carregando pergunta...'}
              </h2>

              {/* Options */}
              <div className="space-y-4">
                {questions[currentQuestion]?.options ? 
                  Object.entries(questions[currentQuestion].options).map(([optionId, optionText]) => (
                    <button
                      key={optionId}
                      onClick={() => handleAnswer(optionId)}
                      className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600 hover:border-gray-500"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 border-2 border-gray-400 rounded mr-4 flex items-center justify-center text-sm font-bold">
                          {optionId}
                        </div>
                        <span>{optionText}</span>
                      </div>
                    </button>
                  )) : (
                    <div className="text-center text-gray-400">
                      <p>Carregando opções...</p>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center text-gray-400 text-sm">
              <p>Escolha a opção que melhor descreve você na maioria das situações</p>
              <p className="mt-2">Tempo estimado restante: {Math.ceil((questions.length - currentQuestion - 1) * 0.3)} minutos</p>
            </div>
          </div>
        </div>
      )}
      

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
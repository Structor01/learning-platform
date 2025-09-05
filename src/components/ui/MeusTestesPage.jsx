import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const MeusTestesPage = () => {
  const [activeTab, setActiveTab] = useState('available'); // available, completed, results
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testInProgress, setTestInProgress] = useState(false);

  const availableTests = [
    {
      id: 1,
      title: 'Conhecimentos em Agronomia',
      description: 'Teste seus conhecimentos técnicos em agronomia e manejo de culturas',
      questions: 25,
      duration: '30 min',
      difficulty: 'Intermediário',
      category: 'Técnico',
      icon: '🌱',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 2,
      title: 'Gestão Rural e Agronegócio',
      description: 'Avalie suas competências em gestão e administração rural',
      questions: 20,
      duration: '25 min',
      difficulty: 'Avançado',
      category: 'Gestão',
      icon: '📊',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      title: 'Sustentabilidade e ESG',
      description: 'Teste seus conhecimentos sobre práticas sustentáveis no agro',
      questions: 15,
      duration: '20 min',
      difficulty: 'Básico',
      category: 'Sustentabilidade',
      icon: '🌍',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 4,
      title: 'Tecnologia Agrícola',
      description: 'Avalie seu conhecimento sobre inovações tecnológicas no campo',
      questions: 30,
      duration: '40 min',
      difficulty: 'Avançado',
      category: 'Tecnologia',
      icon: '🚜',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 5,
      title: 'Mercado e Commodities',
      description: 'Teste seus conhecimentos sobre mercado agrícola e commodities',
      questions: 18,
      duration: '22 min',
      difficulty: 'Intermediário',
      category: 'Mercado',
      icon: '📈',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 6,
      title: 'Segurança no Trabalho Rural',
      description: 'Avalie seus conhecimentos sobre segurança e normas rurais',
      questions: 12,
      duration: '15 min',
      difficulty: 'Básico',
      category: 'Segurança',
      icon: '🦺',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 7,
      title: 'Teste DISC - Perfil Comportamental',
      description: 'Descubra seu perfil comportamental e potencialize seu desenvolvimento profissional',
      questions: 12,
      duration: '8 min',
      difficulty: 'Autoavaliação',
      category: 'Comportamental',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      route: '/teste-disc'
    }
  ];

  const completedTests = [
    {
      id: 1,
      title: 'Conhecimentos em Agronomia',
      score: 85,
      date: '2025-07-15',
      status: 'Aprovado',
      certificate: true
    },
    {
      id: 3,
      title: 'Sustentabilidade e ESG',
      score: 92,
      date: '2025-07-10',
      status: 'Excelente',
      certificate: true
    }
  ];

  const sampleQuestions = [
    {
      id: 1,
      question: "Qual é o principal objetivo da rotação de culturas?",
      options: [
        "Aumentar a produtividade imediatamente",
        "Melhorar a fertilidade do solo e quebrar ciclos de pragas",
        "Reduzir custos de produção",
        "Facilitar o manejo mecanizado"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "O que significa o termo 'agricultura de precisão'?",
      options: [
        "Agricultura com alta precisão manual",
        "Uso de tecnologia para otimizar produção com base em variabilidade espacial",
        "Agricultura orgânica certificada",
        "Produção em pequenas áreas"
      ],
      correct: 1
    }
  ];

  const startTest = (test) => {
    // Se o teste tem uma rota específica (como o DISC), navegar para ela
    if (test.route) {
      window.location.href = test.route;
      return;
    }
    
    // Para outros testes, usar o sistema atual
    setSelectedTest(test);
    setTestInProgress(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const selectAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTestInProgress(false);
    setActiveTab('results');
    // Aqui seria calculado o resultado real
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Básico': 'text-green-400 bg-green-400/10',
      'Intermediário': 'text-yellow-400 bg-yellow-400/10',
      'Avançado': 'text-red-400 bg-red-400/10'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-400/10';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Aprovado': 'text-green-400',
      'Excelente': 'text-blue-400',
      'Reprovado': 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  if (testInProgress && selectedTest) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Test Header */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{selectedTest.title}</h1>
                <div className="text-sm text-gray-400">
                  Pergunta {currentQuestion + 1} de {sampleQuestions.length}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-8">
                {sampleQuestions[currentQuestion]?.question}
              </h2>

              <div className="space-y-4 mb-8">
                {sampleQuestions[currentQuestion]?.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectAnswer(sampleQuestions[currentQuestion].id, index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                      answers[sampleQuestions[currentQuestion].id] === index
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setTestInProgress(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
                >
                  ❌ Cancelar Teste
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={answers[sampleQuestions[currentQuestion].id] === undefined}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                    answers[sampleQuestions[currentQuestion].id] !== undefined
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {currentQuestion < sampleQuestions.length - 1 ? 'Próxima →' : 'Finalizar ✓'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Meus Testes</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Avalie seus conhecimentos e obtenha certificações
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900 rounded-lg p-1 flex">
              {[
                { id: 'available', name: 'Disponíveis', icon: '📋' },
                { id: 'completed', name: 'Concluídos', icon: '✅' },
                { id: 'results', name: 'Resultados', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Available Tests */}
          {activeTab === 'available' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {availableTests.map((test) => (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${test.color} rounded-xl flex items-center justify-center mb-4`}>
                    <span className="text-2xl">{test.icon}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{test.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Questões:</span>
                      <span className="text-white">{test.questions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duração:</span>
                      <span className="text-white">{test.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Categoria:</span>
                      <span className="text-white">{test.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => startTest(test)}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    🚀 Iniciar Teste
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Completed Tests */}
          {activeTab === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {completedTests.length > 0 ? (
                <div className="space-y-4">
                  {completedTests.map((test) => (
                    <div key={test.id} className="bg-gray-900 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span>Concluído em {new Date(test.date).toLocaleDateString('pt-BR')}</span>
                            <span className={`font-semibold ${getStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-400 mb-1">
                            {test.score}%
                          </div>
                          {test.certificate && (
                            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors duration-300">
                              📜 Certificado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">Nenhum teste concluído ainda</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📋 Ver Testes Disponíveis
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Results */}
          {activeTab === 'results' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Teste Concluído!</h2>
                  <p className="text-gray-400">
                    Parabéns! Você completou o teste de {selectedTest?.title}
                  </p>
                </div>

                {/* Score */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-orange-400 mb-2">85%</div>
                  <div className="text-xl text-green-400 font-semibold">Aprovado</div>
                </div>

                {/* Detailed Results */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Estatísticas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Questões corretas:</span>
                        <span className="text-green-400 font-semibold">17/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tempo gasto:</span>
                        <span className="text-white">18 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Percentil:</span>
                        <span className="text-blue-400 font-semibold">Top 15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">🎯 Desempenho por Área</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Conhecimento Técnico</span>
                          <span className="text-white">90%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Aplicação Prática</span>
                          <span className="text-white">80%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '80%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('available')}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📋 Fazer Outro Teste
                  </button>
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📜 Baixar Certificado
                  </button>
                  <button
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📤 Compartilhar Resultado
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default MeusTestesPage;


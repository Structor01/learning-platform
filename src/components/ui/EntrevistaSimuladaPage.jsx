import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const EntrevistaSimuladaPage = () => {
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, feedback
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const areas = [
    { id: 'agronomia', name: 'Agronomia', icon: '🌱' },
    { id: 'veterinaria', name: 'Medicina Veterinária', icon: '🐄' },
    { id: 'gestao', name: 'Gestão Rural', icon: '📊' },
    { id: 'tecnologia', name: 'Tecnologia Agrícola', icon: '🚜' },
    { id: 'comercial', name: 'Comercial/Vendas', icon: '💼' },
    { id: 'financeiro', name: 'Financeiro', icon: '💰' }
  ];

  const levels = [
    { id: 'junior', name: 'Júnior', description: 'Até 2 anos de experiência' },
    { id: 'pleno', name: 'Pleno', description: '2-5 anos de experiência' },
    { id: 'senior', name: 'Sênior', description: '5+ anos de experiência' },
    { id: 'gerencial', name: 'Gerencial', description: 'Posições de liderança' }
  ];

  const questions = {
    agronomia: {
      junior: [
        "Fale sobre sua formação em Agronomia e o que te motivou a escolher esta área.",
        "Como você aplicaria os conhecimentos de manejo de solo em uma propriedade rural?",
        "Descreva uma situação onde você teve que resolver um problema relacionado a pragas ou doenças.",
        "Quais são as principais tendências em agricultura sustentável que você conhece?"
      ],
      pleno: [
        "Como você conduziria um projeto de implementação de agricultura de precisão?",
        "Descreva sua experiência com análise de dados agronômicos e tomada de decisão.",
        "Como você lidaria com um produtor resistente a mudanças tecnológicas?",
        "Explique como você desenvolveria um plano de manejo integrado de pragas."
      ]
    },
    gestao: {
      junior: [
        "Como você organizaria as atividades diárias de uma propriedade rural?",
        "Quais indicadores você usaria para medir a eficiência de uma operação agrícola?",
        "Como você lidaria com conflitos entre funcionários rurais?",
        "Descreva como você faria o controle de custos em uma fazenda."
      ]
    }
  };

  const startInterview = () => {
    if (selectedArea && selectedLevel) {
      setCurrentStep('interview');
      setCurrentQuestion(0);
      setAnswers([]);
    }
  };

  const nextQuestion = () => {
    const currentQuestions = questions[selectedArea]?.[selectedLevel] || [];
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('feedback');
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Aqui seria implementada a lógica de gravação
  };

  const saveAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const restartInterview = () => {
    setCurrentStep('setup');
    setSelectedArea('');
    setSelectedLevel('');
    setCurrentQuestion(0);
    setAnswers([]);
    setIsRecording(false);
  };

  const currentQuestions = questions[selectedArea]?.[selectedLevel] || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Entrevista Simulada</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Pratique suas habilidades de entrevista para o agronegócio
            </p>
          </motion.div>

          {/* Setup */}
          {currentStep === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-8 text-center">Configure sua Entrevista</h2>
                
                {/* Seleção de Área */}
                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-4">Escolha a Área de Atuação</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {areas.map((area) => (
                      <motion.button
                        key={area.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedArea(area.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedArea === area.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-3">{area.icon}</div>
                        <h4 className="font-semibold text-lg">{area.name}</h4>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Seleção de Nível */}
                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-4">Escolha o Nível da Posição</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {levels.map((level) => (
                      <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedLevel === level.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <h4 className="font-semibold text-lg mb-2">{level.name}</h4>
                        <p className="text-gray-400">{level.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Botão Iniciar */}
                <div className="text-center">
                  <button
                    onClick={startInterview}
                    disabled={!selectedArea || !selectedLevel}
                    className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                      selectedArea && selectedLevel
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transform hover:scale-105'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    🎯 Iniciar Entrevista
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Interview */}
          {currentStep === 'interview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400">
                      Pergunta {currentQuestion + 1} de {currentQuestions.length}
                    </span>
                    <span className="text-sm text-gray-400">
                      {areas.find(a => a.id === selectedArea)?.name} - {levels.find(l => l.id === selectedLevel)?.name}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-6">
                    {currentQuestions[currentQuestion]}
                  </h3>
                  
                  {/* Recording Controls */}
                  <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <button
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                      >
                        {isRecording ? (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-center text-gray-400">
                      {isRecording ? 'Gravando sua resposta...' : 'Clique para começar a gravar'}
                    </p>
                    {isRecording && (
                      <div className="mt-4 text-center">
                        <span className="text-red-400 font-mono text-lg">
                          ⏺ 00:45
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text Answer */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ou digite sua resposta:
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
                      placeholder="Digite sua resposta aqui..."
                      onChange={(e) => saveAnswer(e.target.value)}
                      value={answers[currentQuestion] || ''}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={restartInterview}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    🔄 Recomeçar
                  </button>
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    {currentQuestion < currentQuestions.length - 1 ? 'Próxima Pergunta' : 'Finalizar'} →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback */}
          {currentStep === 'feedback' && (
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
                  <h2 className="text-3xl font-bold mb-4">Entrevista Concluída!</h2>
                  <p className="text-gray-400">
                    Parabéns! Você completou a simulação de entrevista para {areas.find(a => a.id === selectedArea)?.name}
                  </p>
                </div>

                {/* Feedback Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-green-400">✅ Pontos Fortes</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Demonstrou conhecimento técnico sólido</li>
                      <li>• Comunicação clara e objetiva</li>
                      <li>• Exemplos práticos relevantes</li>
                      <li>• Postura profissional adequada</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-orange-400">🎯 Áreas de Melhoria</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Desenvolver mais exemplos quantitativos</li>
                      <li>• Praticar storytelling estruturado</li>
                      <li>• Melhorar gestão do tempo de resposta</li>
                      <li>• Demonstrar mais proatividade</li>
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">📚 Recomendações de Estudo</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Trilhas Sugeridas:</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Comunicação Eficaz</li>
                        <li>• Liderança no Agronegócio</li>
                        <li>• Gestão de Projetos Rurais</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Próximos Passos:</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Praticar com outras áreas</li>
                        <li>• Gravar vídeo pitch</li>
                        <li>• Buscar mentoria especializada</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={restartInterview}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    🔄 Nova Entrevista
                  </button>
                  <button
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📊 Ver Relatório Completo
                  </button>
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300"
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

export default EntrevistaSimuladaPage;


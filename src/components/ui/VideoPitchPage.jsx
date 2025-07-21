import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const VideoPitchPage = () => {
  const [currentStep, setCurrentStep] = useState('templates'); // templates, recording, preview, library
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([
    {
      id: 1,
      title: 'Apresentação Pessoal - Agronomia',
      duration: '2:45',
      date: '2025-07-15',
      thumbnail: '/api/placeholder/300/200',
      template: 'Apresentação Pessoal'
    },
    {
      id: 2,
      title: 'Pitch de Projeto - Sustentabilidade',
      duration: '3:20',
      date: '2025-07-10',
      thumbnail: '/api/placeholder/300/200',
      template: 'Pitch de Projeto'
    }
  ]);
  const videoRef = useRef(null);

  const templates = [
    {
      id: 'apresentacao',
      name: 'Apresentação Pessoal',
      description: 'Apresente-se de forma profissional para recrutadores',
      duration: '2-3 min',
      icon: '👤',
      color: 'from-blue-500 to-blue-600',
      questions: [
        'Qual é seu nome e formação?',
        'Qual sua experiência no agronegócio?',
        'Quais são seus principais diferenciais?',
        'Por que você se interessa por esta vaga?'
      ]
    },
    {
      id: 'projeto',
      name: 'Pitch de Projeto',
      description: 'Apresente uma ideia ou projeto inovador',
      duration: '3-5 min',
      icon: '💡',
      color: 'from-green-500 to-green-600',
      questions: [
        'Qual problema seu projeto resolve?',
        'Qual é sua solução proposta?',
        'Quais são os benefícios esperados?',
        'Como você implementaria este projeto?'
      ]
    },
    {
      id: 'produto',
      name: 'Apresentação de Produto',
      description: 'Demonstre um produto ou serviço agrícola',
      duration: '2-4 min',
      icon: '📦',
      color: 'from-purple-500 to-purple-600',
      questions: [
        'Qual produto você está apresentando?',
        'Quais problemas ele resolve?',
        'Quais são seus diferenciais?',
        'Como o cliente pode adquiri-lo?'
      ]
    },
    {
      id: 'lideranca',
      name: 'Liderança e Gestão',
      description: 'Demonstre suas habilidades de liderança',
      duration: '3-4 min',
      icon: '👑',
      color: 'from-orange-500 to-orange-600',
      questions: [
        'Descreva sua experiência em liderança',
        'Como você motiva sua equipe?',
        'Conte sobre um desafio que superou',
        'Qual é sua visão de gestão?'
      ]
    },
    {
      id: 'inovacao',
      name: 'Inovação Tecnológica',
      description: 'Apresente soluções tecnológicas para o agro',
      duration: '3-5 min',
      icon: '🚀',
      color: 'from-red-500 to-red-600',
      questions: [
        'Qual tecnologia você está propondo?',
        'Como ela impacta o agronegócio?',
        'Quais são os resultados esperados?',
        'Qual é o potencial de escalabilidade?'
      ]
    },
    {
      id: 'sustentabilidade',
      name: 'Sustentabilidade',
      description: 'Foque em práticas sustentáveis e ESG',
      duration: '2-4 min',
      icon: '🌱',
      color: 'from-teal-500 to-teal-600',
      questions: [
        'Qual é sua proposta sustentável?',
        'Como ela beneficia o meio ambiente?',
        'Quais são os impactos econômicos?',
        'Como medir os resultados?'
      ]
    }
  ];

  const startRecording = () => {
    setCurrentStep('recording');
    setIsRecording(true);
    // Aqui seria implementada a lógica de gravação
  };

  const stopRecording = () => {
    setIsRecording(false);
    setCurrentStep('preview');
  };

  const saveVideo = (title) => {
    const newVideo = {
      id: Date.now(),
      title: title,
      duration: '2:30', // Seria calculado dinamicamente
      date: new Date().toISOString().split('T')[0],
      thumbnail: '/api/placeholder/300/200',
      template: selectedTemplate.name
    };
    setRecordedVideos([newVideo, ...recordedVideos]);
    setCurrentStep('library');
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
  };

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
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Video Pitch</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Crie vídeos profissionais para apresentações e candidaturas
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900 rounded-lg p-1 flex">
              {[
                { id: 'templates', name: 'Templates', icon: '📋' },
                { id: 'recording', name: 'Gravação', icon: '🎥' },
                { id: 'library', name: 'Biblioteca', icon: '📚' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentStep(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    currentStep === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          {currentStep === 'templates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-semibold mb-8 text-center">Escolha um Template</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-gray-900 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-red-500 bg-red-500/10'
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => selectTemplate(template)}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-xl flex items-center justify-center mb-4`}>
                      <span className="text-2xl">{template.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-400 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">Duração: {template.duration}</span>
                      <span className="text-sm text-gray-500">{template.questions.length} perguntas</span>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-gray-700 pt-4 mt-4"
                      >
                        <h4 className="font-medium mb-2">Perguntas do roteiro:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {template.questions.map((question, index) => (
                            <li key={index}>• {question}</li>
                          ))}
                        </ul>
                        <button
                          onClick={startRecording}
                          className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                        >
                          🎬 Começar Gravação
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recording */}
          {currentStep === 'recording' && selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-2">{selectedTemplate.name}</h2>
                  <p className="text-gray-400">{selectedTemplate.description}</p>
                </div>

                {/* Video Preview */}
                <div className="bg-gray-800 rounded-xl mb-6 aspect-video flex items-center justify-center relative overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  {!isRecording && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400">Câmera será ativada ao iniciar gravação</p>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      ⏺ REC 02:15
                    </div>
                  )}
                </div>

                {/* Questions Guide */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Roteiro de Perguntas</h3>
                  <div className="space-y-3">
                    {selectedTemplate.questions.map((question, index) => (
                      <div key={index} className="flex items-start">
                        <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-gray-300">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={() => setIsRecording(true)}
                      className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Iniciar Gravação
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsRecording(false)}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-300"
                      >
                        ⏸ Pausar
                      </button>
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300"
                      >
                        ⏹ Finalizar
                      </button>
                    </>
                  )}
                </div>

                {/* Tips */}
                <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">💡 Dicas para uma boa gravação:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Mantenha contato visual com a câmera</li>
                    <li>• Fale de forma clara e pausada</li>
                    <li>• Use gestos naturais para enfatizar pontos importantes</li>
                    <li>• Mantenha uma postura profissional e confiante</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preview */}
          {currentStep === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">Prévia do Vídeo</h2>
                
                {/* Video Preview */}
                <div className="bg-gray-800 rounded-xl mb-6 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-2">Gravação concluída com sucesso!</p>
                    <p className="text-gray-400 text-sm">Duração: 2:30</p>
                  </div>
                </div>

                {/* Save Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título do vídeo:
                  </label>
                  <input
                    type="text"
                    defaultValue={`${selectedTemplate?.name} - ${new Date().toLocaleDateString('pt-BR')}`}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                    placeholder="Digite um título para seu vídeo"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setCurrentStep('recording')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    🔄 Gravar Novamente
                  </button>
                  <button
                    onClick={() => saveVideo(`${selectedTemplate?.name} - ${new Date().toLocaleDateString('pt-BR')}`)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    💾 Salvar Vídeo
                  </button>
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📤 Compartilhar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Library */}
          {currentStep === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold">Minha Biblioteca</h2>
                <button
                  onClick={() => setCurrentStep('templates')}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300"
                >
                  ➕ Novo Vídeo
                </button>
              </div>

              {recordedVideos.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recordedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-800 transition-colors duration-300"
                    >
                      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{video.template}</p>
                        <p className="text-xs text-gray-500 mb-4">
                          Criado em {new Date(video.date).toLocaleDateString('pt-BR')}
                        </p>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                            ▶️ Reproduzir
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                            📤
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">Nenhum vídeo gravado ainda</p>
                  <button
                    onClick={() => setCurrentStep('templates')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    🎬 Gravar Primeiro Vídeo
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoPitchPage;


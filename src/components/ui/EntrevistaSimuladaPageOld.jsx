import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Square,
  Download,
  Camera,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';
import Navbar from './Navbar';

const EntrevistaSimuladaPage = () => {
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, feedback
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // Estados para gravação de vídeo
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPreparingCamera, setIsPreparingCamera] = useState(false);

  const videoRef = useRef(null);
  const recordingInterval = useRef(null);

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
      ],
      senior: [
        "Como você estruturaria uma estratégia de sustentabilidade para uma grande propriedade?",
        "Descreva como você lideraria uma equipe multidisciplinar em projetos agrícolas.",
        "Como você avaliaria e implementaria novas tecnologias em uma operação rural?",
        "Explique sua abordagem para otimização de recursos em sistemas produtivos."
      ]
    },
    gestao: {
      junior: [
        "Como você organizaria as atividades diárias de uma propriedade rural?",
        "Quais indicadores você usaria para medir a eficiência de uma operação agrícola?",
        "Como você lidaria com conflitos entre funcionários rurais?",
        "Descreva como você faria o controle de custos em uma fazenda."
      ],
      pleno: [
        "Como você desenvolveria um plano estratégico para uma propriedade rural?",
        "Descreva sua experiência com gestão de equipes no agronegócio.",
        "Como você implementaria melhorias de processo em operações rurais?",
        "Explique como você conduziria análises de viabilidade econômica."
      ]
    }
  };

  // Função para inicializar a câmera
  const initializeCamera = async () => {
    setIsPreparingCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: micEnabled
      });

      setStream(mediaStream);
      setCameraEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões do navegador.');
    } finally {
      setIsPreparingCamera(false);
    }
  };

  // Função para parar a câmera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraEnabled(false);
    }
  };

  // Função para alternar microfone
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    }
  };

  // Função para iniciar gravação
  const startRecording = () => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setRecordedChunks(chunks);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);

    // Iniciar contador de tempo
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  // Função para baixar vídeo gravado
  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `entrevista-${selectedArea}-${selectedLevel}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Formatar tempo de gravação
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // Inicializar câmera quando entrar na entrevista
  useEffect(() => {
    if (currentStep === 'interview' && !cameraEnabled) {
      initializeCamera();
    }
  }, [currentStep]);

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
      // Reset recording state for next question
      setVideoUrl(null);
      setRecordedChunks([]);
      setRecordingTime(0);
    } else {
      setCurrentStep('feedback');
    }
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
    stopCamera();
  };

  const currentQuestions = questions[selectedArea]?.[selectedLevel] || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Entrevista Simulada</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Pratique suas habilidades de entrevista com gravação de vídeo
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
                <h2 className="text-2xl font-bold mb-8 text-center">Configure sua Entrevista</h2>

                {/* Area Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Escolha a Área:</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {areas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => setSelectedArea(area.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedArea === area.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 hover:border-gray-600'
                          }`}
                      >
                        <div className="text-3xl mb-2">{area.icon}</div>
                        <div className="font-semibold">{area.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Escolha o Nível:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${selectedLevel === level.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 hover:border-gray-600'
                          }`}
                      >
                        <div className="font-semibold mb-1">{level.name}</div>
                        <div className="text-sm text-gray-400">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <button
                    onClick={startInterview}
                    disabled={!selectedArea || !selectedLevel}
                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${selectedArea && selectedLevel
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    🎬 Iniciar Entrevista
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
              className="max-w-6xl mx-auto"
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

                  {/* Video Recording Section */}
                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Camera Preview */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                        {isPreparingCamera ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-pulse" />
                              <p className="text-gray-400">Preparando câmera...</p>
                            </div>
                          </div>
                        ) : cameraEnabled ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <VideoOff className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-400">Câmera desligada</p>
                              <button
                                onClick={initializeCamera}
                                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                Ligar Câmera
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Recording Indicator */}
                        {isRecording && (
                          <div className="absolute top-4 left-4 flex items-center bg-red-600 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                            <span className="text-white text-sm font-medium">REC</span>
                          </div>
                        )}

                        {/* Recording Time */}
                        {isRecording && (
                          <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                            <span className="text-white font-mono text-sm">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {formatTime(recordingTime)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Camera Controls */}
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={toggleMic}
                          className={`p-3 rounded-full transition-colors ${micEnabled
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          disabled={!cameraEnabled}
                        >
                          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </button>

                        <button
                          onClick={cameraEnabled ? stopCamera : initializeCamera}
                          className={`p-3 rounded-full transition-colors ${cameraEnabled
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                        >
                          {cameraEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Recording Controls and Playback */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Controles de Gravação</h4>
                        <p className="text-gray-400 text-sm">
                          {isRecording ? 'Gravando sua resposta...' : 'Clique para começar a gravar'}
                        </p>
                      </div>

                      {/* Main Recording Button */}
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={!cameraEnabled}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                              : cameraEnabled
                                ? 'bg-purple-500 hover:bg-purple-600'
                                : 'bg-gray-600 cursor-not-allowed'
                            }`}
                        >
                          {isRecording ? (
                            <Square className="h-8 w-8 text-white" />
                          ) : (
                            <Play className="h-8 w-8 text-white ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Recording Status */}
                      {isRecording && (
                        <div className="text-center mb-4">
                          <div className="text-2xl font-mono text-red-400 mb-2">
                            {formatTime(recordingTime)}
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Máximo: 2 minutos</p>
                        </div>
                      )}

                      {/* Video Playback */}
                      {videoUrl && !isRecording && (
                        <div className="mb-4">
                          <div className="aspect-video bg-gray-900 rounded-lg mb-3">
                            <video
                              src={videoUrl}
                              controls
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={downloadVideo}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </button>
                            <button
                              onClick={() => {
                                setVideoUrl(null);
                                setRecordedChunks([]);
                              }}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                              Nova Gravação
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Answer Alternative */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ou digite sua resposta (opcional):
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
                      placeholder="Digite sua resposta aqui se preferir..."
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
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Entrevista Concluída!</h2>
                  <p className="text-gray-400">
                    Parabéns! Você completou sua entrevista simulada.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">📊 Resumo</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Área:</span>
                        <span>{areas.find(a => a.id === selectedArea)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nível:</span>
                        <span>{levels.find(l => l.id === selectedLevel)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Perguntas:</span>
                        <span>{currentQuestions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Respostas:</span>
                        <span>{answers.filter(a => a && a.trim()).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">💡 Dicas</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Revise suas gravações para identificar pontos de melhoria</li>
                      <li>• Pratique regularmente para ganhar confiança</li>
                      <li>• Prepare exemplos específicos de suas experiências</li>
                      <li>• Mantenha contato visual com a câmera</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={restartInterview}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    🎬 Nova Entrevista
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


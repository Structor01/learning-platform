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
        audio: true
      });
      
      setStream(mediaStream);
      setCameraEnabled(true);
      
      // Aguardar um pouco para garantir que o elemento video esteja renderizado
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões.');
    } finally {
      setIsPreparingCamera(false);
    }
  };

  // Função para parar a câmera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraEnabled(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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

    // Iniciar cronômetro
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 120) { // 2 minutos máximo
          stopRecording();
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  // Função para download do vídeo
  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `entrevista-pergunta-${currentQuestion + 1}-${Date.now()}.webm`;
      a.click();
    }
  };

  // Função para formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para iniciar entrevista
  const startInterview = () => {
    if (!selectedArea || !selectedLevel) {
      alert('Por favor, selecione uma área e nível de experiência.');
      return;
    }
    setCurrentStep('interview');
    setCurrentQuestion(0);
    setAnswers([]);
  };

  // Verificar se deve inicializar câmera automaticamente
  useEffect(() => {
    if (currentStep === 'interview' && !cameraEnabled) {
      initializeCamera();
    }
  }, [currentStep]);

  // Garantir que o stream seja atribuído ao elemento video
  useEffect(() => {
    if (stream && videoRef.current && cameraEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, cameraEnabled]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [stream]);

  const nextQuestion = () => {
    const currentQuestions = questions[selectedArea]?.[selectedLevel] || [];
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setVideoUrl(null); // Reset video for next question
      setRecordingTime(0);
    } else {
      setCurrentStep('feedback');
    }
  };

  const saveTextAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const restartInterview = () => {
    setCurrentStep('setup');
    setCurrentQuestion(0);
    setAnswers([]);
    stopCamera();
  };

  const currentQuestions = questions[selectedArea]?.[selectedLevel] || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Entrevista Simulada</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pratique suas habilidades de entrevista com gravação de vídeo e feedback personalizado
          </p>
        </div>

        {/* Setup */}
        {currentStep === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-900 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-8 text-center">Configure sua Entrevista</h2>
              
              {/* Area Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Selecione a Área</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(area.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedArea === area.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{area.icon}</div>
                      <div className="font-medium">{area.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Nível de Experiência</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedLevel === level.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium mb-1">{level.name}</div>
                      <div className="text-sm text-gray-400">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={startInterview}
                  disabled={!selectedArea || !selectedLevel}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
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

              {/* Question Card with Integrated Video */}
              <div className="mb-8">
                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  {/* Video Section - Full Width */}
                  <div className="relative">
                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                      {isPreparingCamera ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-300 text-lg">Preparando câmera...</p>
                            <div className="mt-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            </div>
                          </div>
                        </div>
                      ) : cameraEnabled ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(console.error);
                              }
                            }}
                            onCanPlay={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(console.error);
                              }
                            }}
                          />
                          
                          {/* Question Overlay - Always visible during interview */}
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-6">
                            <h3 className="text-white text-xl font-semibold text-center leading-relaxed">
                              {currentQuestions[currentQuestion]}
                            </h3>
                          </div>
                          
                          {/* Recording Status Overlay */}
                          {isRecording && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                              <div className="flex items-center justify-center space-x-4">
                                <div className="flex items-center bg-red-600 px-4 py-2 rounded-full shadow-lg">
                                  <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                                  <span className="text-white text-sm font-bold">GRAVANDO</span>
                                </div>
                                <div className="bg-black/75 px-4 py-2 rounded-full">
                                  <span className="text-white font-mono text-sm flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {formatTime(recordingTime)} / 2:00
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <VideoOff className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-white text-2xl font-semibold mb-4">
                              {currentQuestions[currentQuestion]}
                            </h3>
                            <p className="text-gray-300 text-lg mb-6">Ative sua câmera para começar a gravação</p>
                            <button
                              onClick={initializeCamera}
                              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-semibold text-lg shadow-lg"
                            >
                              <Camera className="h-6 w-6 inline mr-3" />
                              Ligar Câmera
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Bar when Recording */}
                      {isRecording && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000 shadow-lg"
                            style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Controls Section */}
                  <div className="p-6 bg-gray-800">
                    <div className="flex justify-center items-center space-x-6">
                      {/* Mic Control */}
                      <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                          micEnabled 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105' 
                            : 'bg-red-600 hover:bg-red-700 text-white scale-105'
                        }`}
                        disabled={!cameraEnabled}
                        title={micEnabled ? 'Desligar microfone' : 'Ligar microfone'}
                      >
                        {micEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                      </button>
                      
                      {/* Main Recording Button */}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!cameraEnabled}
                        className={`px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 flex items-center shadow-xl ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-700 text-white scale-105 animate-pulse'
                            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="h-7 w-7 mr-3" />
                            Parar Gravação
                          </>
                        ) : (
                          <>
                            <Play className="h-7 w-7 mr-3" />
                            Iniciar Gravação
                          </>
                        )}
                      </button>
                      
                      {/* Camera Control */}
                      <button
                        onClick={cameraEnabled ? stopCamera : initializeCamera}
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                          cameraEnabled 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
                        }`}
                        title={cameraEnabled ? 'Desligar câmera' : 'Ligar câmera'}
                      >
                        {cameraEnabled ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                      </button>
                    </div>
                    
                    {/* Instructions */}
                    <div className="mt-6 text-center">
                      <p className="text-gray-400">
                        {!cameraEnabled ? 'Ative sua câmera para começar a gravação da entrevista' :
                         !isRecording ? 'Clique em "Iniciar Gravação" quando estiver pronto para responder' :
                         'Responda à pergunta olhando diretamente para a câmera. Você tem até 2 minutos.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Playback */}
              {videoUrl && !isRecording && (
                <div className="mb-6">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h4 className="text-lg font-medium mb-4">Sua Resposta Gravada:</h4>
                    <div className="aspect-video bg-gray-900 rounded-lg mb-4">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={downloadVideo}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setVideoUrl(null);
                          setRecordingTime(0);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Nova Gravação
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={restartInterview}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  ← Recomeçar
                </button>
                
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
            <div className="bg-gray-900 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Entrevista Concluída!</h2>
              <p className="text-gray-400 mb-8">
                Parabéns! Você completou sua entrevista simulada.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span>Área:</span>
                      <span>{areas.find(a => a.id === selectedArea)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nível:</span>
                      <span>{levels.find(l => l.id === selectedLevel)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perguntas:</span>
                      <span>{currentQuestions.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Próximos Passos</h3>
                  <ul className="text-left space-y-2 text-gray-300">
                    <li>• Revise suas gravações</li>
                    <li>• Pratique pontos de melhoria</li>
                    <li>• Tente outros níveis</li>
                    <li>• Explore outras áreas</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={restartInterview}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
              >
                Nova Entrevista
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EntrevistaSimuladaPage;


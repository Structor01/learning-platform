import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  SkipForward,
  CheckCircle,
  Clock,
  Loader,
  BarChart3
} from 'lucide-react';
import * as faceapi from 'face-api.js';

const InterviewModal = ({ 
  isOpen, 
  onClose, 
  job, 
  questions = [], 
  onVideoResponse, 
  onFinishInterview,
  generatingQuestions = false 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Face API states (silenciosos - não visíveis ao usuário)
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceAnalysisData, setFaceAnalysisData] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const faceIntervalRef = useRef(null);

  // Carregar modelos Face API silenciosamente
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.ageGenderNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar modelos Face API:', error);
        // Falha silenciosa - não interromper experiência do usuário
      }
    };

    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  // Inicializar câmera automaticamente
  useEffect(() => {
    if (isOpen && !cameraEnabled) {
      initializeCamera();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Inicializar câmera
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: micEnabled
      });
      
      setStream(mediaStream);
      setCameraEnabled(true);
      
      // Aguardar renderização do elemento video
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
          
          // Iniciar análise facial silenciosa
          if (modelsLoaded) {
            startFaceAnalysis();
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  // Garantir atribuição do stream sempre que disponível
  useEffect(() => {
    if (stream && videoRef.current && cameraEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, cameraEnabled]);

  // Iniciar análise facial (silenciosa - não visível ao usuário)
  const startFaceAnalysis = () => {
    if (!modelsLoaded || !videoRef.current) return;

    // Análise facial em background - dados coletados silenciosamente
    faceIntervalRef.current = setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withAgeAndGender()
          .withFaceExpressions();

        if (detections.length > 0) {
          const detection = detections[0];
          const faceData = {
            timestamp: Date.now(),
            age: Math.round(detection.age),
            gender: detection.gender,
            genderProbability: detection.genderProbability,
            emotions: detection.expressions,
            dominantEmotion: getDominantEmotion(detection.expressions),
            confidence: detection.detection.score
          };

          // Armazenar dados silenciosamente para análise posterior
          setFaceAnalysisData(prev => [...prev.slice(-19), faceData]); // Manter últimos 20 registros
        }
      } catch (error) {
        // Falha silenciosa - não interromper experiência do usuário
        console.error('Erro na análise facial (background):', error);
      }
    }, 1000); // Análise a cada segundo (invisível ao usuário)
  };

  // Obter emoção dominante
  const getDominantEmotion = (expressions) => {
    return Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!stream) return;

    try {
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
        handleVideoComplete(blob);
      };

      setRecordedChunks(chunks);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setFaceAnalysisData([]); // Reset dados faciais para esta pergunta

      recorder.start();

      // Timer de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // 2 minutos máximo
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao iniciar gravação.');
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Processar vídeo completo
  const handleVideoComplete = async (videoBlob) => {
    setIsAnalyzing(true);
    
    try {
      // Enviar vídeo e dados faciais para análise
      await onVideoResponse(videoBlob, currentQuestion, faceAnalysisData);
      
      // Marcar pergunta como respondida
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        answered: true
      };
      
      // Avançar para próxima pergunta ou finalizar
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setFaceAnalysisData([]); // Reset para próxima pergunta
      } else {
        // Todas as perguntas respondidas
        alert('✅ Todas as perguntas foram respondidas!\n\nClique em "Finalizar Entrevista" para gerar o relatório final.');
      }
      
    } catch (error) {
      console.error('Erro ao processar vídeo:', error);
      alert('❌ Erro ao processar resposta.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Pular pergunta
  const skipQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setFaceAnalysisData([]); // Reset dados faciais
    }
  };

  // Cleanup
  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (faceIntervalRef.current) {
      clearInterval(faceIntervalRef.current);
    }
    setStream(null);
    setCameraEnabled(false);
    setIsRecording(false);
    setFaceAnalysisData([]);
  };

  // Formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Entrevista Simulada com IA
              </h2>
              <p className="text-gray-400">
                {job?.nome || job?.title} - {job?.empresa || job?.company}
              </p>
              {generatingQuestions && (
                <div className="flex items-center gap-2 mt-2 text-blue-400">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Gerando perguntas com ChatGPT...</span>
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Pergunta Atual */}
          {questions.length > 0 && (
            <Card className="bg-gray-700 border-gray-600 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">
                  Pergunta {currentQuestion + 1} de {questions.length}
                  {questions[currentQuestion]?.isStandard && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Trajetória Profissional
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 text-base leading-relaxed">
                  {questions[currentQuestion]?.question}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vídeo */}
          <div className="w-full">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {cameraEnabled ? (
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
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0"
                      />
                      
                      {/* Overlay da pergunta */}
                      <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-70 rounded-lg p-3">
                        <p className="text-white text-sm font-medium">
                          {questions[currentQuestion]?.question}
                        </p>
                      </div>

                      {/* Status de gravação */}
                      {isRecording && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                          <span className="font-medium">GRAVANDO</span>
                          <span>{formatTime(recordingTime)}</span>
                          <div className="w-20 bg-red-800 rounded-full h-1">
                            <div 
                              className="bg-white h-1 rounded-full transition-all duration-1000"
                              style={{ width: `${(recordingTime / 120) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <VideoOff className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Câmera desabilitada</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    variant={cameraEnabled ? "default" : "secondary"}
                    size="sm"
                  >
                    {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={() => setMicEnabled(!micEnabled)}
                    variant={micEnabled ? "default" : "secondary"}
                    size="sm"
                  >
                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>

                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={!cameraEnabled || isAnalyzing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Parar Gravação
                    </Button>
                  )}

                  <Button
                    onClick={skipQuestion}
                    variant="outline"
                    size="sm"
                    disabled={isRecording || isAnalyzing}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Pular
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status das Perguntas */}
            <Card className="bg-gray-700 border-gray-600 mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Progresso da Entrevista
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : question.answered
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {question.answered ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : index === currentQuestion ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-current" />
                    )}
                    <span className="flex-1 truncate">
                      Pergunta {index + 1}
                      {question.isStandard && ' (Trajetória Profissional)'}
                    </span>
                    {question.answered && (
                      <Badge variant="secondary" className="text-xs">
                        Respondida
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Processamento */}
          {isAnalyzing && (
            <Card className="bg-blue-900 border-blue-700 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader className="h-5 w-5 animate-spin text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Processando resposta com IA...</p>
                    <p className="text-blue-300 text-sm">
                      Transcrevendo áudio e analisando comportamento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            
            <div className="flex gap-3">
              {questions.filter(q => q.answered).length > 0 && (
                <Button
                  onClick={onFinishInterview}
                  disabled={isRecording || isAnalyzing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar Entrevista
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;


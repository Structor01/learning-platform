import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  VideoOff, 
  Play, 
  Send, 
  SkipForward,
  CheckCircle,
  Clock,
  Loader,
  BarChart3,
  Pause
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [processingQuestions, setProcessingQuestions] = useState(new Set());
  
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
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.ageGenderNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.warn('Modelos Face API não carregados:', error);
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

  // Timer de gravação
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // 2 minutos máximo
            handleSendResponse();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Análise facial silenciosa
  useEffect(() => {
    if (isRecording && modelsLoaded && videoRef.current && canvasRef.current) {
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
              confidence: detection.detection.score,
              gender: detection.gender,
              age: detection.age,
              expressions: detection.expressions,
              dominantEmotion: Object.keys(detection.expressions).reduce((a, b) => 
                detection.expressions[a] > detection.expressions[b] ? a : b
              )
            };
            
            setFaceAnalysisData(prev => [...prev, faceData]);
          }
        } catch (error) {
          // Silencioso - não mostrar erros ao usuário
        }
      }, 1000);
    } else {
      if (faceIntervalRef.current) {
        clearInterval(faceIntervalRef.current);
      }
    }

    return () => {
      if (faceIntervalRef.current) {
        clearInterval(faceIntervalRef.current);
      }
    };
  }, [isRecording, modelsLoaded]);

  // Inicializar câmera
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setStream(mediaStream);
      setCameraEnabled(true);
      
      // Aguardar renderização do elemento video
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      console.error('Erro ao acessar câmera. Verifique as permissões.', error);
    }
  };

  // Iniciar entrevista
  const startInterview = () => {
    if (!cameraEnabled) {
      console.warn('Por favor, habilite a câmera antes de iniciar a entrevista.');
      return;
    }
    
    setInterviewStarted(true);
    startRecording();
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
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        handleVideoComplete(videoBlob);
        setRecordedChunks([]);
      };
      
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setFaceAnalysisData([]); // Reset dados faciais
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  // Enviar resposta (parar gravação e processar)
  const handleSendResponse = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Processar vídeo em background
  const handleVideoComplete = async (videoBlob) => {
    const questionIndex = currentQuestion;
    
    // Adicionar à lista de processamento
    setProcessingQuestions(prev => new Set([...prev, questionIndex]));
    
    // Avançar para próxima pergunta imediatamente
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      // Iniciar gravação da próxima pergunta automaticamente
      setTimeout(() => {
        startRecording();
      }, 500);
    } else {
      // Última pergunta - não iniciar nova gravação
      setInterviewStarted(false);
    }
    
    try {
      // Processar em background
      await onVideoResponse(videoBlob, questionIndex, faceAnalysisData);
      
      // Remover da lista de processamento
      setProcessingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
      
    } catch (error) {
      console.error('Erro ao processar vídeo:', error);
      // Remover da lista mesmo com erro
      setProcessingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
    }
  };

  // Pular pergunta
  const skipQuestion = () => {
    if (isRecording) {
      handleSendResponse();
    } else if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setFaceAnalysisData([]); // Reset dados faciais
      if (interviewStarted) {
        setTimeout(() => {
          startRecording();
        }, 500);
      }
    }
  };

  // Pausar/Retomar entrevista
  const togglePause = () => {
    if (isRecording) {
      handleSendResponse();
    } else if (interviewStarted) {
      startRecording();
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
    setInterviewStarted(false);
    setFaceAnalysisData([]);
    setProcessingQuestions(new Set());
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

          {/* Progresso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-gray-400">
                {processingQuestions.size > 0 && (
                  <span className="text-blue-400">
                    {processingQuestions.size} processando...
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pergunta Atual */}
          {questions.length > 0 && (
            <Card className="bg-gray-700 border-gray-600 mb-6">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-2">
                  Pergunta {currentQuestion + 1}:
                </h3>
                <p className="text-gray-300">
                  {questions[currentQuestion]?.question}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vídeo */}
          <Card className="bg-gray-700 border-gray-600 mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {cameraEnabled ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
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
                    <div className="absolute top-4 left-4 right-32 bg-black bg-opacity-70 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">
                        {questions[currentQuestion]?.question}
                      </p>
                    </div>

                    {/* Indicador de câmera e microfone ativos */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>CAM</span>
                      </div>
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>MIC</span>
                      </div>
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

                    {/* Status de entrevista */}
                    {!interviewStarted && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full">
                        <span className="font-medium">Pronto para iniciar</span>
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
              <div className="flex justify-center gap-4 mt-4 p-4">
                {!interviewStarted ? (
                  <Button
                    onClick={startInterview}
                    disabled={!cameraEnabled || generatingQuestions}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Entrevista
                  </Button>
                ) : (
                  <>
                    {isRecording ? (
                      <Button
                        onClick={handleSendResponse}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Resposta
                      </Button>
                    ) : (
                      <Button
                        onClick={togglePause}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </Button>
                    )}
                    
                    <Button
                      onClick={togglePause}
                      variant="outline"
                      size="sm"
                      disabled={!interviewStarted}
                    >
                      {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </>
                )}

                <Button
                  onClick={skipQuestion}
                  variant="outline"
                  size="sm"
                  disabled={!interviewStarted || currentQuestion >= questions.length - 1}
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
                Status das Perguntas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-center text-xs ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : question.answered
                        ? 'bg-green-600 text-white'
                        : processingQuestions.has(index)
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {question.answered ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : processingQuestions.has(index) ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : index === currentQuestion ? (
                        <Clock className="h-3 w-3" />
                      ) : null}
                      <span>P{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legenda */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Atual</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  <span>Processando</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Concluída</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-600 rounded"></div>
                  <span>Pendente</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Finalizar */}
          {currentQuestion >= questions.length - 1 && !isRecording && (
            <div className="mt-6 text-center">
              <Button
                onClick={onFinishInterview}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={processingQuestions.size > 0}
              >
                {processingQuestions.size > 0 ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Aguardando processamento...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Entrevista
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default InterviewModal;


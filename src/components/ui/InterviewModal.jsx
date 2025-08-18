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
  const [testMode, setTestMode] = useState(false);

  // Face API states (silenciosos - não visíveis ao usuário)
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceAnalysisData, setFaceAnalysisData] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const faceIntervalRef = useRef(null);

  // ✅ CORREÇÃO 1: Adicionar refs para contador independente
  const questionCounterRef = useRef(0); // Contador independente do React state
  const isProcessingRef = useRef(false); // Flag para evitar múltiplas execuções

  // ✅ LOGS DE DEBUG MELHORADOS
  console.log(`🔍 ESTADO: Q${currentQuestion}/${questions.length}, Counter:${questionCounterRef.current}, Recording:${isRecording}, Started:${interviewStarted}, Processing:${isProcessingRef.current}, TestMode:${testMode}`);

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

  useEffect(() => {
    if (isOpen && !cameraEnabled) {
      checkCameraPermissions().then(canAccess => {
        if (canAccess) {
          initializeCamera();
        }
      });
    }

    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Timer de gravação
  useEffect(() => {
    if (isRecording && !testMode) {
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
  }, [isRecording, testMode]);

  // Análise facial silenciosa
  useEffect(() => {
    if (isRecording && modelsLoaded && videoRef.current && canvasRef.current && !testMode) {
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
  }, [isRecording, modelsLoaded, testMode]);

  // ✅ CORREÇÃO 2: Função para resetar contador
  const resetQuestionCounter = () => {
    questionCounterRef.current = 0;
    isProcessingRef.current = false;
    console.log('🔄 Contador resetado para 0');
  };

  const initializeCamera = async () => {
    console.log('📹 Tentando inicializar câmera real...');

    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const streamPromise = navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout câmera real')), 5000)
      );

      const mediaStream = await Promise.race([streamPromise, timeoutPromise]);

      console.log('✅ Câmera real funcionando!');
      setStream(mediaStream);
      setCameraEnabled(true);
      setTestMode(false);

      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => console.log('✅ Vídeo real reproduzindo'))
              .catch(err => console.warn('⚠️ Erro ao reproduzir:', err));
          };
        }
      }, 100);

    } catch (error) {
      console.warn('⚠️ Câmera real falhou, ativando MODO TESTE:', error.message);
      initializeTestMode();
    }
  };

  const initializeTestMode = async () => {
    console.log('🧪 Iniciando MODO TESTE...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      const animate = () => {
        ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100 + 50)}, 50, 50)`;
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('🧪 MODO TESTE - SEM CÂMERA', 160, 220);
        ctx.fillText(`Pergunta ${questionCounterRef.current + 1} de ${questions.length}`, 200, 260);
        requestAnimationFrame(animate);
      };
      animate();

      const fakeStream = canvas.captureStream(30);

      setStream(fakeStream);
      setCameraEnabled(true);
      setTestMode(true);

      console.log('✅ MODO TESTE ativado!');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = fakeStream;
          videoRef.current.play().catch(console.warn);
        }
      }, 100);

    } catch (error) {
      console.error('❌ Erro no modo teste:', error);
      setCameraEnabled(true);
      setTestMode(true);
    }
  };

  const checkCameraPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      console.log(`📹 Permissão da câmera: ${result.state}`);
      return result.state !== 'denied';
    } catch (error) {
      console.warn('⚠️ Não foi possível verificar permissões:', error);
      return true;
    }
  };

  // ✅ CORREÇÃO 3: Iniciar entrevista com contador resetado
  const startInterview = () => {
    if (!cameraEnabled) {
      console.warn('Câmera não habilitada, tentando modo teste...');
      initializeTestMode();
      return;
    }

    console.log(`🎬 INICIANDO ENTREVISTA - Resetando contador`);
    resetQuestionCounter();
    setInterviewStarted(true);
    setCurrentQuestion(0);
    startRecordingWithCounter(0); // ✅ Começar explicitamente na pergunta 0
  };

  // ✅ CORREÇÃO 4: Gravação com contador independente
  const startRecordingWithCounter = (questionIndex) => {
    if (!stream) {
      console.warn('Stream não disponível para gravação');
      return;
    }

    // ✅ VERIFICAÇÕES DE SEGURANÇA
    if (questionIndex >= questions.length) {
      console.log(`🛑 SEGURANÇA: Tentativa de gravar pergunta ${questionIndex + 1}, mas só temos ${questions.length}`);
      return;
    }

    if (isProcessingRef.current) {
      console.log(`🛑 SEGURANÇA: Já processando, ignorando nova gravação`);
      return;
    }

    isProcessingRef.current = true;
    questionCounterRef.current = questionIndex;
    setCurrentQuestion(questionIndex);

    console.log(`🔴 INICIANDO ${testMode ? 'TESTE' : 'REAL'} - Pergunta ${questionIndex + 1}/${questions.length}`);

    if (testMode) {
      // ✅ MODO TESTE - Versão limpa
      setIsRecording(true);
      setRecordingTime(0);
      setFaceAnalysisData([]);

      const fakeTimer = setTimeout(() => {
        console.log(`⏹️ TESTE - Finalizando pergunta ${questionIndex + 1}`);
        const fakeBlob = new Blob(['fake video data'], { type: 'video/webm' });
        setIsRecording(false);
        handleVideoCompleteWithCounter(fakeBlob, questionIndex);
      }, 2000);

      setMediaRecorder({
        stop: () => {
          clearTimeout(fakeTimer);
          isProcessingRef.current = false;
        }
      });
    } else {
      // ✅ MODO REAL - MediaRecorder
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
          console.log(`⏹️ REAL - Gravação parada para pergunta ${questionIndex + 1}`);
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          handleVideoCompleteWithCounter(videoBlob, questionIndex);
          setRecordedChunks([]);
        };

        setMediaRecorder(recorder);
        setRecordedChunks(chunks);
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setFaceAnalysisData([]);

      } catch (error) {
        console.error('Erro ao iniciar gravação real:', error);
        isProcessingRef.current = false;
      }
    }
  };

  // ✅ CORREÇÃO 5: Handle video complete com contador
  const handleVideoCompleteWithCounter = async (videoBlob, questionIndex) => {
    const isLastQuestion = questionIndex >= questions.length - 1;

    console.log(`🎬 VIDEO COMPLETE - CONTADOR:`);
    console.log(`- questionIndex: ${questionIndex}`);
    console.log(`- questionCounterRef: ${questionCounterRef.current}`);
    console.log(`- currentQuestion: ${currentQuestion}`);
    console.log(`- questions.length: ${questions.length}`);
    console.log(`- isLastQuestion: ${isLastQuestion}`);

    setProcessingQuestions(prev => new Set([...prev, questionIndex]));
    setIsRecording(false);

    if (isLastQuestion) {
      console.log(`🏁 ÚLTIMA PERGUNTA - CONTADOR FINALIZADO!`);
      setInterviewStarted(false);
      setCurrentQuestion(questions.length - 1);
      isProcessingRef.current = false;
      // ✅ NÃO INICIAR NOVA GRAVAÇÃO - PARAR AQUI!
    } else {
      const nextQuestionIndex = questionIndex + 1;
      console.log(`➡️ AVANÇANDO COM CONTADOR: ${questionIndex + 1} → ${nextQuestionIndex + 1}`);

      setTimeout(() => {
        isProcessingRef.current = false;

        if (nextQuestionIndex < questions.length) {
          console.log(`🔴 PRÓXIMA GRAVAÇÃO: Q${nextQuestionIndex + 1}`);
          startRecordingWithCounter(nextQuestionIndex);
        } else {
          console.log(`🛑 CONTADOR - Não iniciar, fora do range`);
        }
      }, 300);
    }

    try {
      if (testMode) {
        console.log(`📤 TESTE - Simulando envio Q${questionIndex + 1}...`);

        setTimeout(() => {
          console.log(`✅ TESTE - Q${questionIndex + 1} processada`);
          setProcessingQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionIndex);
            return newSet;
          });
        }, 500);
      } else {
        await onVideoResponse(videoBlob, questionIndex, faceAnalysisData);
        console.log(`✅ REAL - Q${questionIndex + 1} processada`);

        setProcessingQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionIndex);
          return newSet;
        });
      }

    } catch (error) {
      console.error(`❌ Erro Q${questionIndex + 1}:`, error);
      setProcessingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });
    }
  };

  // ✅ CORREÇÃO 6: Manter função original para compatibilidade
  const startRecording = () => {
    startRecordingWithCounter(questionCounterRef.current);
  };

  const handleVideoComplete = async (videoBlob, questionIndex) => {
    return handleVideoCompleteWithCounter(videoBlob, questionIndex);
  };

  const handleSendResponse = () => {
    if (mediaRecorder && isRecording) {
      console.log(`📤 Enviando resposta da pergunta ${questionCounterRef.current + 1}`);
      if (typeof mediaRecorder.stop === 'function') {
        mediaRecorder.stop();
      }
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // ✅ CORREÇÃO 7: Funções de teste melhoradas
  const resetCamera = async () => {
    console.log('🔄 Resetando...');
    cleanup();
    setTimeout(initializeCamera, 1000);
  };

  const forceTestMode = () => {
    console.log('🧪 Forçando modo teste...');
    cleanup();
    setTimeout(initializeTestMode, 500);
  };

  const resetToQuestion = (questionNum) => {
    console.log(`🧪 TESTE - Resetando para pergunta ${questionNum + 1}`);
    cleanup();
    setTimeout(() => {
      questionCounterRef.current = questionNum;
      setCurrentQuestion(questionNum);
      setCameraEnabled(true);
      setTestMode(true);
      setInterviewStarted(true);
      startRecordingWithCounter(questionNum);
    }, 500);
  };

  const skipQuestion = () => {
    if (isRecording) {
      handleSendResponse();
    } else if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setFaceAnalysisData([]);
      if (interviewStarted) {
        setTimeout(() => startRecording(), 500);
      }
    }
  };

  const togglePause = () => {
    if (isRecording) {
      handleSendResponse();
    } else if (interviewStarted) {
      startRecording();
    }
  };

  // ✅ CORREÇÃO 8: Cleanup melhorado
  const cleanup = () => {
    console.log('🧹 Limpando recursos...');

    // ✅ Parar flags e contadores
    isProcessingRef.current = false;
    questionCounterRef.current = 0;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (faceIntervalRef.current) clearInterval(faceIntervalRef.current);

    if (mediaRecorder && typeof mediaRecorder.stop === 'function') {
      try {
        mediaRecorder.stop();
      } catch (e) {
        console.warn('Erro ao parar mediaRecorder:', e);
      }
    }

    setStream(null);
    setCameraEnabled(false);
    setIsRecording(false);
    setInterviewStarted(false);
    setCurrentQuestion(0);
    setRecordingTime(0);
    setFaceAnalysisData([]);
    setProcessingQuestions(new Set());
    setMediaRecorder(null);
    setRecordedChunks([]);
    setTestMode(false);

    console.log('✅ Limpeza concluída');
  };

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
                Entrevista Simulada com IA {testMode && '🧪'}
              </h2>
              <p className="text-gray-400">
                {job?.nome || job?.title} - {job?.empresa || job?.company}
              </p>
              {generatingQuestions && (
                <div className="flex items-center gap-2 mt-2 text-blue-400">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Gerando perguntas...</span>
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

          {/* ✅ PAINEL DE TESTE MELHORADO */}
          {testMode && (
            <div className="mb-4 p-3 bg-yellow-600 rounded-lg">
              <h3 className="text-white font-bold mb-2">
                🧪 MODO TESTE - Q{questionCounterRef.current + 1}/{questions.length}
              </h3>
              <div className="flex gap-2 text-sm flex-wrap">
                <Button onClick={() => resetToQuestion(0)} variant="outline" size="sm">
                  Q1
                </Button>
                <Button onClick={() => resetToQuestion(3)} variant="outline" size="sm">
                  Q4
                </Button>
                <Button onClick={() => resetToQuestion(4)} variant="outline" size="sm">
                  Q5 (última)
                </Button>
                <Button onClick={resetCamera} variant="outline" size="sm">
                  🔄 Reset
                </Button>
                <Button
                  onClick={() => {
                    console.log('🔍 DEBUG:', {
                      counter: questionCounterRef.current,
                      processing: isProcessingRef.current,
                      currentQ: currentQuestion,
                      recording: isRecording,
                      started: interviewStarted
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  🔍 Debug
                </Button>
              </div>
            </div>
          )}

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

                    {/* Indicador de modo */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className={`${testMode ? 'bg-yellow-600' : 'bg-green-600'} text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>{testMode ? 'TESTE' : 'CAM'}</span>
                      </div>
                      <div className={`${testMode ? 'bg-yellow-600' : 'bg-green-600'} text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>MIC</span>
                      </div>
                    </div>

                    {/* Status de gravação */}
                    {isRecording && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="font-medium">{testMode ? 'TESTE' : 'GRAVANDO'}</span>
                        <span>{formatTime(recordingTime)}</span>
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
                      <p className="text-gray-400 mb-4">Câmera não disponível</p>
                      <Button onClick={forceTestMode} variant="outline">
                        🧪 Usar Modo Teste
                      </Button>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-center text-xs ${index === currentQuestion
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

          {/* ✅ BOTÃO FINALIZAR - CONDIÇÃO CORRIGIDA */}
          {currentQuestion >= questions.length - 1 && !isRecording && !interviewStarted && (
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
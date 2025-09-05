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
  Pause,
  Camera,
  Mic,
  Settings
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { API_URL } from '../utils/api';

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
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [processingQuestions, setProcessingQuestions] = useState(new Set());
  const [cameraError, setCameraError] = useState(null);
  const [interviewStatus, setInterviewStatus] = useState(null);

  // Face API states
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceAnalysisData, setFaceAnalysisData] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const faceIntervalRef = useRef(null);

  // ✅ Contador independente para controle preciso
  const questionCounterRef = useRef(0);
  const isProcessingRef = useRef(false);

  // Carregar modelos Face API e verificar compatibilidade
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.ageGenderNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('✅ Modelos Face API carregados');
      } catch (error) {
        console.warn('⚠️ Modelos Face API não carregados:', error);
      }
    };

    const checkCompatibility = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Navigator.mediaDevices.getUserMedia não suportado');
        setCameraError('Seu navegador não suporta captura de mídia. Use Chrome, Firefox ou Safari.');
        return;
      }

      if (!window.MediaRecorder) {
        console.error('❌ MediaRecorder não suportado');
        setCameraError('Seu navegador não suporta gravação de vídeo. Use Chrome, Firefox ou Safari.');
        return;
      }

      // Verificar dispositivos disponíveis
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');

        console.log('📱 Dispositivos encontrados:', {
          cameras: videoDevices.length,
          microphones: audioDevices.length
        });

        if (videoDevices.length === 0) {
          console.warn('⚠️ Nenhuma câmera encontrada');
          setCameraError('Nenhuma câmera encontrada no sistema');
          return;
        }

        if (audioDevices.length === 0) {
          console.warn('⚠️ Nenhum microfone encontrado');
          setCameraError('Nenhum microfone encontrado no sistema');
          return;
        }

      } catch (error) {
        console.warn('⚠️ Não foi possível enumerar dispositivos:', error);
      }

      const supportedMimeType = getSupportedMimeType();
      console.log('🎬 Compatibilidade verificada:', {
        getUserMedia: !!navigator.mediaDevices.getUserMedia,
        MediaRecorder: !!window.MediaRecorder,
        supportedCodec: supportedMimeType || 'padrão do navegador'
      });
    };

    if (isOpen) {
      checkCompatibility();
      loadModels();
    }
  }, [isOpen]);

  // Inicializar câmera ao abrir modal
  useEffect(() => {
    if (isOpen) {
      console.log('🎬 Modal aberto, tentando inicializar câmera...');
      console.log('📊 Estados atuais:', { cameraEnabled, cameraError });

      if (!cameraEnabled && !cameraError) {
        console.log('🚀 Iniciando câmera...');
        initializeCamera();
      }
    }

    return () => {
      if (isOpen) {
        console.log('🧹 Modal fechando, limpando recursos...');
        cleanup();
      }
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

  // Análise facial durante gravação
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
          // Análise facial é opcional
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

  const resetQuestionCounter = () => {
    questionCounterRef.current = 0;
    isProcessingRef.current = false;
    console.log('🔄 Contador resetado para início da entrevista');
  };

  // Função para buscar status da entrevista do banco de dados
  const fetchInterviewStatus = async (jobId) => {
    if (!jobId) return;

    try {
      const response = await fetch(`${API_URL}/interviews/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Status da entrevista:', data.status);
        setInterviewStatus(data.status);
      }
    } catch (error) {
      console.error('Erro ao buscar status da entrevista:', error);
    }
  };

  // ✅ Inicializar câmera com estratégias robustas
  const initializeCamera = async () => {
    console.log('📹 Inicializando câmera...');
    setCameraError(null);

    try {
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia não suportado neste navegador');
      }

      // Limpar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Aguardar um pouco para limpar recursos
      await new Promise(resolve => setTimeout(resolve, 300));

      // Tentar diferentes configurações de vídeo (simplificadas)
      const constraints = [
        // Configuração básica primeiro
        {
          video: true,
          audio: true
        },
        // Configuração com especificações mínimas
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: true
        },
        // Configuração mais avançada
        {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        }
      ];

      let mediaStream = null;
      let lastError = null;

      for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i];
        try {
          console.log(`🔍 Tentativa ${i + 1}/${constraints.length} - Configuração:`,
            typeof constraint.video === 'boolean' ? 'básica' : constraint.video);

          // Timeout mais longo para dar tempo da permissão
          const streamPromise = navigator.mediaDevices.getUserMedia(constraint);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout aguardando permissão')), 15000)
          );

          console.log(`⏳ Aguardando permissão de câmera/microfone...`);
          mediaStream = await Promise.race([streamPromise, timeoutPromise]);

          console.log(`✅ Câmera inicializada com sucesso!`);
          console.log(`📊 Video tracks: ${mediaStream.getVideoTracks().length}`);
          console.log(`🎵 Audio tracks: ${mediaStream.getAudioTracks().length}`);

          // Verificar se as tracks estão funcionando
          const videoTrack = mediaStream.getVideoTracks()[0];
          const audioTrack = mediaStream.getAudioTracks()[0];

          console.log(`📹 Video track status: ${videoTrack ? videoTrack.readyState : 'não encontrado'}`);
          console.log(`🎤 Audio track status: ${audioTrack ? audioTrack.readyState : 'não encontrado'}`);

          break;

        } catch (error) {
          console.warn(`⚠️ Tentativa ${i + 1} falhou:`, error.message);
          lastError = error;

          // Se for erro de permissão, não tentar outras configurações
          if (error.name === 'NotAllowedError') {
            console.error('❌ Permissão negada pelo usuário');
            break;
          }

          continue;
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('Não foi possível acessar câmera e microfone');
      }

      setStream(mediaStream);
      setCameraEnabled(true);

      // Aguardar elemento de vídeo estar disponível
      console.log('🎬 Configurando elemento de vídeo...');

      const configureVideo = () => {
        if (videoRef.current && mediaStream) {
          const videoElement = videoRef.current;

          console.log('📹 Elemento de vídeo encontrado, configurando...');

          // Configurar stream
          videoElement.srcObject = mediaStream;

          // Configurar propriedades
          videoElement.muted = true;
          videoElement.playsInline = true;
          videoElement.autoplay = true;

          // Event listeners
          videoElement.onloadedmetadata = () => {
            console.log('📹 Metadata carregada, iniciando reprodução...');
            videoElement.play()
              .then(() => {
                console.log('✅ Vídeo reproduzindo com sucesso');
                console.log(`📐 Dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
              })
              .catch(err => {
                console.warn('⚠️ Erro ao reproduzir vídeo:', err);
                setCameraError(`Erro ao reproduzir vídeo: ${err.message}`);
              });
          };

          videoElement.oncanplay = () => {
            console.log('▶️ Vídeo pronto para reproduzir');
          };

          videoElement.onerror = (error) => {
            console.error('❌ Erro no elemento video:', error);
            setCameraError('Erro na reprodução do vídeo');
          };

          return true;
        }
        return false;
      };

      // Tentar configurar imediatamente
      if (!configureVideo()) {
        // Se não conseguir, aguardar um pouco e tentar novamente
        console.log('⏳ Elemento de vídeo não disponível, aguardando...');
        setTimeout(() => {
          if (!configureVideo()) {
            console.warn('⚠️ Elemento videoRef não está disponível após timeout');
          }
        }, 500);
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar câmera:', error);

      let errorMessage = 'Erro ao acessar câmera e microfone. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permissão negada. Clique no ícone da câmera na barra de endereço e permita o acesso.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Câmera ou microfone não encontrados.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Câmera está sendo usada por outro aplicativo.';
      } else if (error.message.includes('Timeout')) {
        errorMessage += 'Timeout ao inicializar. Recarregue a página e tente novamente.';
      } else {
        errorMessage += error.message;
      }

      setCameraError(errorMessage);
    }
  };

  // ✅ Iniciar entrevista
  const startInterview = async () => {
    if (!cameraEnabled) {
      setCameraError('Câmera deve estar funcionando para iniciar a entrevista');
      return;
    }

    // Verificar se o stream ainda está ativo antes de iniciar
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0 || !videoTracks[0] || videoTracks[0].readyState !== 'live') {
        console.log('🔄 Stream inativo, reinicializando câmera...');
        await initializeCamera();
      }
    }

    console.log(`🎬 Iniciando entrevista com ${questions.length} perguntas`);
    resetQuestionCounter();
    setInterviewStarted(true);
    setCurrentQuestion(0);
    startRecordingWithCounter(0);
  };

  // ✅ Detecção de codec suportado
  const getSupportedMimeType = () => {
    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ];

    for (const type of possibleTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`✅ Usando codec: ${type}`);
        return type;
      }
    }

    console.warn('⚠️ Nenhum codec preferido suportado, usando padrão');
    return '';
  };

  // ✅ Gravação com contador independente
  const startRecordingWithCounter = (questionIndex) => {
    if (!stream) {
      console.error('❌ Stream não disponível para gravação');
      return;
    }

    // Verificar se o stream está ativo
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    if (videoTracks.length === 0 || !videoTracks[0] || videoTracks[0].readyState !== 'live') {
      console.error('❌ Stream de vídeo inativo ou indisponível');
      setCameraError('Stream de vídeo está inativo. Tente reinicializar a câmera.');
      return;
    }

    if (audioTracks.length === 0 || !audioTracks[0] || audioTracks[0].readyState !== 'live') {
      console.error('❌ Stream de áudio inativo ou indisponível');
      setCameraError('Stream de áudio está inativo. Tente reinicializar a câmera.');
      return;
    }

    if (questionIndex >= questions.length) {
      console.log(`🛑 Tentativa de gravar pergunta ${questionIndex + 1}, mas só temos ${questions.length}`);
      return;
    }

    if (isProcessingRef.current) {
      console.log(`🛑 Já processando, ignorando nova gravação`);
      return;
    }

    isProcessingRef.current = true;
    questionCounterRef.current = questionIndex;
    setCurrentQuestion(questionIndex);

    console.log(`🔴 Iniciando gravação - Pergunta ${questionIndex + 1}/${questions.length}`);

    try {
      const supportedMimeType = getSupportedMimeType();
      const recorderOptions = supportedMimeType ? { mimeType: supportedMimeType } : {};

      const recorder = new MediaRecorder(stream, recorderOptions);

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log(`⏹️ Gravação finalizada - Pergunta ${questionIndex + 1}`);
        const mimeType = supportedMimeType || 'video/webm';
        const videoBlob = new Blob(chunks, { type: mimeType });
        console.log(`📦 Blob criado com tipo: ${mimeType}, tamanho: ${videoBlob.size} bytes`);
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
      console.error('❌ Erro ao iniciar gravação:', error);
      console.error('Detalhes do erro:', error.message);

      // Tentar fallback sem especificar mimeType
      try {
        console.log('🔄 Tentando gravação sem codec específico...');
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          console.log(`⏹️ Gravação finalizada (fallback) - Pergunta ${questionIndex + 1}`);
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          console.log(`📦 Blob fallback criado, tamanho: ${videoBlob.size} bytes`);
          handleVideoCompleteWithCounter(videoBlob, questionIndex);
          setRecordedChunks([]);
        };

        setMediaRecorder(recorder);
        setRecordedChunks(chunks);
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setFaceAnalysisData([]);

        console.log('✅ Gravação iniciada com fallback');

      } catch (fallbackError) {
        console.error('❌ Erro também no fallback:', fallbackError);
        alert('Erro ao iniciar gravação. Verifique se seu navegador suporta gravação de vídeo.');
        isProcessingRef.current = false;
      }
    }
  };

  // ✅ Handle video complete com contador
  const handleVideoCompleteWithCounter = async (videoBlob, questionIndex) => {
    const isLastQuestion = questionIndex >= questions.length - 1;

    console.log(`🎬 Processando pergunta ${questionIndex + 1}/${questions.length}`);
    setProcessingQuestions(prev => new Set([...prev, questionIndex]));
    setIsRecording(false);

    try {
      await onVideoResponse(videoBlob, questionIndex, faceAnalysisData);

      console.log(`✅ Pergunta ${questionIndex + 1} processada com sucesso`);
      questions[questionIndex].answered = true;

      setProcessingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });

      // 🔑 Libera o processamento
      isProcessingRef.current = false;

      if (!isLastQuestion) {
        // Vai para a próxima pergunta
        const nextQuestionIndex = questionIndex + 1;
        setTimeout(() => {
          startRecordingWithCounter(nextQuestionIndex);
        }, 500);
      } else {
        console.log(`🏁 Última pergunta finalizada!`);
        setInterviewStarted(false);
        setCurrentQuestion(questions.length - 1);
      }

    } catch (error) {
      console.error(`❌ Erro ao processar pergunta ${questionIndex + 1}:`, error);

      setProcessingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionIndex);
        return newSet;
      });

      // 🔑 Mesmo em erro, liberar processamento
      isProcessingRef.current = false;

      if (!isLastQuestion) {
        const nextQuestionIndex = questionIndex + 1;
        setTimeout(() => {
          startRecordingWithCounter(nextQuestionIndex);
        }, 500);
      } else {
        setInterviewStarted(false);
      }
    }
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

  const skipQuestion = () => {
    if (isRecording) {
      console.log(`⏭️ Pulando pergunta ${currentQuestion + 1}`);
      handleSendResponse();
    }
  };

  const togglePause = async () => {
    if (isRecording) {
      handleSendResponse();
    } else if (interviewStarted && currentQuestion < questions.length) {
      // Verificar se o stream ainda está ativo
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0 || !videoTracks[0] || videoTracks[0].readyState !== 'live') {
          console.log('🔄 Stream inativo, reinicializando câmera antes de continuar...');
          await initializeCamera();
        }
      }
      startRecordingWithCounter(currentQuestion);
    }
  };

  const handleFinishInterview = () => {
    if (onFinishInterview) {
      onFinishInterview();
    }
  };

  // ✅ Cleanup completo
  const cleanup = () => {
    console.log('🧹 Limpando recursos da entrevista...');

    isProcessingRef.current = false;
    questionCounterRef.current = 0;

    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`🛑 Parando track: ${track.kind}`);
        track.stop();
      });
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
    setCameraError(null);

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
                Entrevista com IA
              </h2>
              <p className="text-gray-400">
                {job?.nome || job?.title} - {job?.empresa || job?.company}
              </p>
              {generatingQuestions && (
                <div className="flex items-center gap-2 mt-2 text-blue-400">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Preparando perguntas...</span>
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
                    <Loader className="h-3 w-3 inline animate-spin mr-1" />
                    {processingQuestions.size} processando...
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
                    <div className="absolute top-4 left-4 right-32 bg-black bg-opacity-80 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-white text-sm font-medium leading-relaxed">
                        {questions[currentQuestion]?.question}
                      </p>
                    </div>

                    {/* Indicadores de status */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                        <Camera className="w-3 h-3" />
                        <span>CÂMERA</span>
                      </div>
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                        <Mic className="w-3 h-3" />
                        <span>ÁUDIO</span>
                      </div>
                    </div>

                    {/* Status de gravação */}
                    {isRecording && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="font-medium">GRAVANDO</span>
                        <span className="font-mono">{formatTime(recordingTime)}</span>
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
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="font-medium">Pronto para iniciar</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-white text-lg font-medium mb-2">Câmera não disponível</p>
                      {cameraError && (
                        <p className="text-red-400 text-sm mb-4 max-w-md mx-auto">
                          {cameraError}
                        </p>
                      )}
                      <div className="space-y-3">
                        <Button
                          onClick={() => {
                            console.log('🔄 Botão "Tentar Novamente" clicado');
                            setCameraError(null);
                            setCameraEnabled(false);
                            initializeCamera();
                          }}
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Tentar Novamente
                        </Button>

                        <div className="text-xs text-gray-500 max-w-sm text-center">
                          <p>Dicas:</p>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Clique em "Permitir" quando o navegador solicitar</li>
                            <li>Verifique se sua câmera não está sendo usada</li>
                            <li>Tente recarregar a página se persistir</li>
                          </ul>
                        </div>
                      </div>
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
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-2 text-lg font-medium"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar Entrevista
                  </Button>
                ) : (
                  <>
                    {isRecording ? (
                      <Button
                        onClick={handleSendResponse}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-2"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Resposta
                      </Button>
                    ) : (
                      <Button
                        onClick={togglePause}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-2"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </Button>
                    )}

                    <Button
                      onClick={skipQuestion}
                      variant="outline"
                      disabled={!isRecording || currentQuestion >= questions.length - 1}
                      className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Pular
                    </Button>
                  </>
                )}
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
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center text-xs transition-all duration-200 ${index === currentQuestion
                      ? 'bg-blue-600 text-white shadow-lg'
                      : question.answered
                        ? 'bg-green-600 text-white'
                        : processingQuestions.has(index)
                          ? 'bg-yellow-600 text-white animate-pulse'
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
                      <span className="font-medium">Q{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Em andamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  <span>Processando</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-600 rounded"></div>
                  <span>Pendente</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Finalizar */}
          {currentQuestion >= questions.length - 1 && !isRecording && !interviewStarted && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleFinishInterview}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-3 text-lg font-medium"
                disabled={processingQuestions.size > 0 || interviewStatus === 'completed'}
              >
                {processingQuestions.size > 0 ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Processando respostas...
                  </>
                ) : interviewStatus === 'completed' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Entrevista Concluída
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Finalizar Entrevista
                  </>
                )}
              </Button>

              {processingQuestions.size === 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  Todas as respostas foram processadas com sucesso
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
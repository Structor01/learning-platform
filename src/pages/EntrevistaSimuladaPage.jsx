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
import Navbar from '../components/ui/Navbar';
import FaceAnalysis from '../components/ui/FaceAnalysis';
import mockInterviewService from '../services/mockInterviewService';
import { API_URL } from '../components/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import PremiumFeature from '@/components/ui/PremiumFeature';

// Componente de Notificação Toast
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-800';
      case 'error':
        return 'bg-red-50 border-brand-status-error/30 text-brand-status-error';
      case 'warning':
        return 'bg-brand-status-warning/10 border-brand-status-warning/30 text-brand-status-warning';
      case 'info':
        return 'bg-brand-status-info/10 border-brand-status-info/30 text-brand-status-info';
      default:
        return 'bg-brand-neutral-100 border-brand-neutral-300 text-brand-neutral-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-500 ease-out transform translate-x-0 opacity-100">
      <div className={`max-w-md p-4 rounded-lg border shadow-2xl backdrop-blur-sm ${getToastStyles()} transform transition-all duration-300 hover:scale-105`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl flex-shrink-0 animate-pulse">{getIcon()}</span>
          <div className="flex-1">
            <p className="text-sm font-medium whitespace-pre-line leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-neutral-600 hover:text-brand-neutral-800 flex-shrink-0 text-lg font-bold transition-colors hover:bg-brand-neutral-200 rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal do Relatório
const RelatorioModal = ({ isOpen, onClose, relatorioData, carregando }) => {
  if (!isOpen) return null;

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600 mx-auto mb-4"></div>
          <p className="text-brand-text text-lg">Gerando relatório com IA...</p>
          <p className="text-brand-neutral-600 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (!relatorioData) return null;

  const { report, vaga } = relatorioData;

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'contratar': return 'bg-brand-primary-500';
      case 'avaliar': return 'bg-brand-status-warning';
      case 'não contratar': return 'bg-brand-status-error';
      default: return 'bg-brand-neutral-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-brand-primary-600';
    if (score >= 6) return 'text-brand-status-warning';
    return 'text-brand-status-error';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-black flex items-center">
              📊 Relatório da Mock Interview
            </h2>
            <p className="text-gray-600 mt-1">
              Gerado em {new Date(report.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
              📋 Informações Gerais
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><strong className="text-green-600">Vaga:</strong> {vaga?.nome}</p>
                <p><strong className="text-green-600">Empresa:</strong> {vaga?.empresa}</p>
              </div>
              <div>
                <p><strong className="text-green-600">Candidato:</strong> {report.candidateName}</p>
                <p><strong className="text-green-600">Perguntas:</strong> {report.completedQuestions}</p>
              </div>
            </div>
          </div>

          {/* Pontuação */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
              🎯 Performance
            </h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <p className="text-gray-600 mt-2">Nota Geral</p>
              </div>
              <div className="text-center">
                <div className={`${getRecommendationColor(report.recommendation)} text-white px-6 py-3 rounded-full font-bold text-lg`}>
                  {report.recommendation}
                </div>
                <p className="text-gray-600 mt-2">Recomendação</p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
              📝 Resumo Executivo
            </h3>
            <p className="text-gray-700 leading-relaxed">{report.summary}</p>
          </div>

          {/* Análise por Pergunta */}
          {report.questions && report.questions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-6 flex items-center">
                🔍 Análise Detalhada por Pergunta
              </h3>
              <div className="space-y-6">
                {report.questions.map((q, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    {/* Pergunta */}
                    <div className="mb-4 pb-4 border-b border-gray-300">
                      <h4 className="text-lg font-semibold text-green-700">
                        Pergunta {index + 1}
                      </h4>
                      <p className="text-gray-800 mt-2 italic">{q.question}</p>
                    </div>

                    {/* Grid com Resposta e Análise */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Coluna Esquerda: Resposta */}
                      <div>
                        <h5 className="text-sm font-semibold text-green-600 mb-2">📝 Resposta do Candidato</h5>
                        <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded border border-gray-300">
                          {q.transcription}
                        </p>
                      </div>

                      {/* Coluna Direita: Análise */}
                      <div>
                        <h5 className="text-sm font-semibold text-blue-600 mb-2">🧠 Análise da IA</h5>
                        <div className="space-y-3 text-sm">
                          {/* Score */}
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <p className="text-gray-600">Score:</p>
                            <p className={`text-2xl font-bold ${q.analysis?.score >= 8 ? 'text-green-600' : q.analysis?.score >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {q.analysis?.score || 0}/10
                            </p>
                          </div>

                          {/* Recomendação */}
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <p className="text-gray-600 text-xs">Recomendação:</p>
                            <p className="text-black font-semibold">{q.analysis?.recommendation || 'N/A'}</p>
                          </div>

                          {/* Job Fit */}
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <p className="text-gray-600 text-xs">Adequação à Vaga:</p>
                            <p className="text-black font-semibold">{q.analysis?.jobFit || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Análise Completa */}
                    {q.analysis?.fullAnalysis && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h5 className="text-sm font-semibold text-blue-700 mb-2">📊 Análise Completa</h5>
                        <div className="bg-white p-3 rounded border border-gray-300 max-h-64 overflow-y-auto">
                          <pre className="text-gray-700 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                            {q.analysis.fullAnalysis}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análise Detalhada Geral */}
          {report.detailedAnalysis && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
                📋 Parecer Geral
              </h3>
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {report.detailedAnalysis}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};


const EntrevistaSimuladaPage = () => {
  const { PREMIUM_FEATURES } = useAuth();
  const [currentStep, setCurrentStep] = useState('vagas'); // vagas, interview, feedback
  const [selectedVaga, setSelectedVaga] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [vagasTeste, setVagasTeste] = useState([]);
  const [minhasEntrevistas, setMinhasEntrevistas] = useState([]); // Entrevistas já realizadas
  const [currentVagaId, setCurrentVagaId] = useState(null); // Rastrear qual vaga está sendo feita
  const [loading, setLoading] = useState(false);
  const [user] = useState({ id: 1, name: 'João Silva' }); // Mock user - substituir pela autenticação real
  const [isRecording, setIsRecording] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [relatorioData, setRelatorioData] = useState(null);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [modalRelatorioOpen, setModalRelatorioOpen] = useState(false);

  // Estados para captura de dados da análise facial
  const [currentFaceData, setCurrentFaceData] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isUploadingResponse, setIsUploadingResponse] = useState(false);

  // Estado para transcrição ao vivo
  const [liveTranscription, setLiveTranscription] = useState('');

  // Estado para rastrear entrevistas concluídas (persistido no localStorage)
  const [completedInterviews, setCompletedInterviews] = useState(() => {
    try {
      const saved = localStorage.getItem('completedInterviews');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Estado para armazenar relatórios salvos por vaga (persistido no localStorage)
  const [savedReports, setSavedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('savedReports');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Estados para Toast
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  // Função para mostrar toast
  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type, isVisible: true });
    // Auto-fechar após tempo especificado
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, duration);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Estados para gravação de vídeo
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPreparingCamera, setIsPreparingCamera] = useState(false);

  const videoRef = useRef(null);
  const recordingInterval = useRef(null);

  // API Functions
  const fetchVagasTeste = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/vagas-teste`);
      const data = await response.json();
      if (data.data) {
        setVagasTeste(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      showToast('Erro ao carregar vagas de teste. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMinhasEntrevistas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/user/${user.id}`);
      const data = await response.json();
      if (data.data) {
        setMinhasEntrevistas(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar entrevistas:', error);
      showToast('Erro ao carregar suas entrevistas. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função simplificada para criar entrevista diretamente de uma vaga
  const iniciarEntrevistaVaga = async (vaga) => {
    try {
      setLoading(true);

      // Gerar ID da entrevista usando timestamp
      const novoInterviewId = Date.now();

      setInterviewId(novoInterviewId);
      setSelectedVaga(vaga);
      setCurrentVagaId(vaga.id); // Salvar o ID da vaga
      setCurrentStep('interview');
      setCurrentQuestion(0);
      setAnswers([]);
      setVideoUrl(null);
      setRecordingTime(0);
      setRecordedChunks([]);
      setLiveTranscription('');

      showToast('Entrevista iniciada com sucesso!', 'success');
      return { id: novoInterviewId };
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEntrevista = async () => {
    if (!interviewId) return;
    try {
      await fetch(`${API_URL}/api/mock-interviews/${interviewId}/start`, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
    }
  };

  const finalizarEntrevista = async () => {
    if (!interviewId) return;
    try {
      await fetch(`${API_URL}/api/mock-interviews/${interviewId}/complete`, { method: 'POST' });

      showToast('Entrevista finalizada com sucesso!\n\nGerando seu relatório personalizado...', 'success', 6000);

      // Gerar relatório automaticamente após finalizar
      await gerarRelatorio(interviewId);

      // Marcar como concluída usando o ID salvo
      if (currentVagaId) {
        console.log('✅ Marcando vaga como concluída:', currentVagaId);
        setCompletedInterviews(prev => ({
          ...prev,
          [currentVagaId]: true
        }));

        // Salvar o relatório para essa vaga
        if (relatorioData) {
          setSavedReports(prev => ({
            ...prev,
            [currentVagaId]: relatorioData
          }));
        }
      }

      // Atualizar lista de entrevistas para refletir a conclusão
      await fetchMinhasEntrevistas();

      // Após gerar o relatório, mostrar toast de conclusão
      showToast('🎉 Entrevista concluída!\n\nSeu relatório está disponível na seção "Suas Entrevistas".', 'success', 8000);

    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
      showToast('Erro ao finalizar entrevista. Tente novamente.', 'error');
    }
  };

  // Função para buscar relatório da entrevista
  const gerarRelatorio = async (interviewId) => {
    try {
      setCarregandoRelatorio(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/${interviewId}/report`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao gerar relatório');
      }

      // Abrir modal com o relatório
      setRelatorioData(data.data);
      setModalRelatorioOpen(true);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showToast('Erro ao gerar relatório: ' + error.message, 'error');
    } finally {
      setCarregandoRelatorio(false);
    }
  };

  // Perguntas baseadas na vaga selecionada
  const getQuestionsForVaga = (vaga) => {
    if (!vaga) return [];

    // Perguntas genéricas que podem ser personalizadas baseadas na vaga
    return [
      `Fale sobre sua experiência e motivação para trabalhar como ${vaga.nome} na ${vaga.empresa}.`,
      `Como você aplicaria seus conhecimentos na função de ${vaga.nome}? Dê exemplos práticos.`,
      `Descreva uma situação desafiadora que você enfrentou e como a resolveu.`,
      `Por que você se interessou por esta vaga na ${vaga.empresa} especificamente?`,
      `Quais são suas expectativas para os próximos anos na carreira?`
    ];
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
      showToast('Erro ao acessar câmera. Verifique as permissões do navegador.', 'error');
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

    // Limpar gravação anterior
    setVideoUrl(null);
    setRecordedChunks([]);

    let mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }
    } else {
      mimeType = 'video/webm;codecs=vp9';
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setRecordedChunks([blob]);

        // Enviar automaticamente para o backend
        if (interviewId) {
          await uploadResponseNow(blob);
        }
      }
    };

    recorder.start(1000); // Capturar dados a cada 1 segundo
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
  const stopRecording = async () => {
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
  const startInterview = async () => {
    if (!selectedVaga) {
      showToast('Dados da vaga não encontrados.', 'error');
      return;
    }
    setCurrentQuestion(0);
    setAnswers([]);
    await iniciarEntrevista();
  };

  // Verificar se deve inicializar câmera automaticamente
  useEffect(() => {
    if (currentStep === 'vagas') {
      fetchVagasTeste();
      fetchMinhasEntrevistas(); // Carregar entrevistas já realizadas
    } else if (currentStep === 'interview' && !cameraEnabled) {
      initializeCamera();
      startInterview();
    }
  }, [currentStep]);

  // Garantir que o stream seja atribuído ao elemento video
  useEffect(() => {
    if (stream && videoRef.current && cameraEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, cameraEnabled]);

  // Salvar completedInterviews no localStorage
  useEffect(() => {
    localStorage.setItem('completedInterviews', JSON.stringify(completedInterviews));
  }, [completedInterviews]);

  // Salvar savedReports no localStorage
  useEffect(() => {
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
  }, [savedReports]);

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

  const nextQuestion = async () => {
    // Se está gravando, parar a gravação e aguardar upload
    if (isRecording) {
      await stopRecording();
      // Aguardar um pouco para o upload processar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Verificar se o usuário gravou alguma resposta
    if (!answers[currentQuestion] || !answers[currentQuestion].videoUploaded) {
      const skipAnyway = window.confirm(
        'Você não gravou uma resposta para esta pergunta.\n\n' +
        'Deseja pular mesmo assim?'
      );
      if (!skipAnyway) {
        return; // Não avançar
      }
    }

    const currentQuestions = getQuestionsForVaga(selectedVaga);
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setVideoUrl(null);
      setRecordingTime(0);
      setRecordedChunks([]);
      setCurrentFaceData(null);
    } else {
      // Última pergunta - vai para tela de feedback
      setCurrentStep('feedback');
    }
  };

  const saveTextAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  // Função para enviar resposta imediatamente após gravação
  const uploadResponseNow = async (videoBlob) => {
    if (!videoBlob || !interviewId) {
      showToast('Erro: dados da gravação inválidos.', 'error');
      return false;
    }

    try {
      setIsUploadingResponse(true);

      const questionText = getQuestionsForVaga(selectedVaga)[currentQuestion];

      // Preparar dados da análise facial
      const faceAnalysisData = currentFaceData ? {
        gender: currentFaceData.gender,
        genderProbability: currentFaceData.genderProbability,
        age: currentFaceData.age,
        expression: currentFaceData.expression,
        confidence: currentFaceData.confidence,
        expressions: currentFaceData.expressions
      } : null;

      const result = await mockInterviewService.uploadVideoResponse(
        interviewId,
        currentQuestion + 1,
        videoBlob,
        faceAnalysisData ? [faceAnalysisData] : []
      );

      if (result.success) {
        showToast('Resposta enviada com sucesso! ✅', 'success');

        // Salvar informação da resposta enviada
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = {
          questionText,
          videoUploaded: true,
          responseId: result.responseId,
          // faceAnalysis: faceAnalysisData
        };
        setAnswers(newAnswers);

        return true;
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload');
      }
    } catch (error) {
      showToast(`Erro ao enviar resposta: ${error.message}`, 'error');
      return false;
    } finally {
      setIsUploadingResponse(false);
    }
  };

  // Função para enviar resposta de vídeo para o backend
  const uploadCurrentResponse = async () => {
    if (!recordedChunks || recordedChunks.length === 0 || !interviewId) {
      showToast('Nenhuma gravação encontrada para enviar.', 'warning');
      return false;
    }

    try {
      setIsUploadingResponse(true);

      const videoBlob = recordedChunks[0];
      const questionText = getQuestionsForVaga(selectedVaga)[currentQuestion];

      // Preparar dados da análise facial
      const faceAnalysisData = currentFaceData ? {
        gender: currentFaceData.gender,
        genderProbability: currentFaceData.genderProbability,
        age: currentFaceData.age,
        expression: currentFaceData.expression,
        confidence: currentFaceData.confidence,
        expressions: currentFaceData.expressions
      } : null;

      console.log('📤 Enviando resposta:', {
        interviewId,
        questionNumber: currentQuestion + 1,
        questionText,
        videoSize: videoBlob.size,
        faceData: faceAnalysisData
      });

      const result = await mockInterviewService.uploadVideoResponse(
        interviewId,
        currentQuestion + 1,
        videoBlob,
        faceAnalysisData ? [faceAnalysisData] : []
      );

      if (result.success) {
        showToast('Resposta enviada com sucesso! ✅', 'success');

        // Salvar informação da resposta enviada
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = {
          questionText,
          videoUploaded: true,
          responseId: result.responseId,
          faceAnalysis: faceAnalysisData
        };
        setAnswers(newAnswers);

        return true;
      } else {
        throw new Error(result.error || 'Erro desconhecido no upload');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      showToast(`Erro ao enviar resposta: ${error.message}`, 'error');
      return false;
    } finally {
      setIsUploadingResponse(false);
    }
  };

  const restartInterview = () => {
    // Apenas reinicia a entrevista atual, mantendo a vaga e candidatura
    setCurrentStep('interview');
    setCurrentQuestion(0);
    setAnswers([]);
    setVideoUrl(null);
    setRecordingTime(0);
    stopCamera();
  };

  const voltarParaInicio = () => {
    // Volta para a tela principal e limpa tudo
    setCurrentStep('vagas');
    setSelectedVaga(null);
    setInterviewId(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setVideoUrl(null);
    setRecordingTime(0);
    stopCamera();
  };

  const currentQuestions = getQuestionsForVaga(selectedVaga);

  // Função para verificar se existe uma entrevista completa para uma vaga
  const hasCompletedInterview = (vagaId) => {
    return completedInterviews[vagaId] === true;
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      {/* <PremiumFeature
        feature={PREMIUM_FEATURES.ENTREVISTA_SIMULADA}
        upgradeMessage="Faça upgrade para Premium e tenha acesso ilimitado a entrevistas simuladas"
        mode="block"
      > */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Toast de Notificação */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        {/* Modal do Relatório - Global */}
        <RelatorioModal
          isOpen={modalRelatorioOpen}
          onClose={() => {
            setModalRelatorioOpen(false);
            setCarregandoRelatorio(false);
            setRelatorioData(null);
            setCurrentStep('vagas');
            // Recarregar a página inteira para garantir atualização
            window.location.reload();
          }}
          relatorioData={relatorioData}
          carregando={carregandoRelatorio}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-14">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Entrevista Simulada</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4 mb-4">
              Pratique suas habilidades de entrevista com gravação de vídeo e feedback personalizado
            </p>

          </div>

          {/* Vagas de Teste */}
          {currentStep === 'vagas' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Entrevistas Realizadas */}
              {minhasEntrevistas.length > 0 ? (
                <div className="mb-12">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2">Suas Entrevistas</h2>
                      <p className="text-gray-400 text-sm sm:text-base">Acesse os relatórios das suas entrevistas concluídas</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-purple-400">{minhasEntrevistas.length}</div>
                      <div className="text-xs sm:text-sm text-gray-400">Total</div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2">Vagas Disponíveis para Entrevista</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Escolha uma vaga e comece sua entrevista simulada agora mesmo</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Carregando vagas...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vagasTeste.map((vaga) => (
                    <div key={vaga.id} className="bg-white rounded-xl p-6 border border-gray-300 hover:border-gray-200 transition-colors">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">{vaga.nome}</h3>
                        <p className="text-green-900 font-black mb-1">{vaga.empresa}</p>
                        <p className="text-gray-700 text-sm">{vaga.cidade}/{vaga.uf}</p>
                      </div>

                      <div className="mb-6">
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{vaga.descricao}</p>

                        <div className="space-y-2">
                          {vaga.remuneracao && (
                            <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                              <span className="text-sm text-gray-900">Remuneração:</span>
                              <span className="text-green-700 font-bold text-sm">{vaga.remuneracao}</span>
                            </div>
                          )}

                          {vaga.beneficios && (
                            <div className="py-2 px-3 bg-white rounded-lg">
                              <span className="text-sm text-black">Benefícios:</span>
                              <p className="text-gray-600 text-sm mt-1">{vaga.beneficios}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (hasCompletedInterview(vaga.id)) {
                            // Ver relatório da entrevista concluída
                            console.log('Abrindo relatório para vaga:', vaga.id);
                            if (savedReports[vaga.id]) {
                              setRelatorioData(savedReports[vaga.id]);
                              setModalRelatorioOpen(true);
                              showToast('Relatório carregado!', 'success');
                            } else {
                              showToast('Relatório não encontrado. Tente novamente.', 'error');
                            }
                          } else {
                            // Iniciar nova entrevista
                            iniciarEntrevistaVaga(vaga);
                          }
                        }}
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${hasCompletedInterview(vaga.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-800 disabled:bg-gray-600 text-white cursor-pointer'
                          }`}
                      >
                        {hasCompletedInterview(vaga.id)
                          ? '✅ Entrevista Realizada - Ver Relatório'
                          : loading
                            ? 'Iniciando...'
                            : 'Fazer Entrevista'
                        }
                      </button>
                      {hasCompletedInterview(vaga.id) && (
                        <button
                          onClick={() => {
                            if (savedReports[vaga.id]) {
                              setRelatorioData(savedReports[vaga.id]);
                              setModalRelatorioOpen(true);
                            }
                          }}
                          className="mt-2 w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          📊 Ver Relatório
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!loading && vagasTeste.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Nenhuma vaga de teste disponível no momento.</p>
                  <button
                    onClick={fetchVagasTeste}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                  >
                    Recarregar
                  </button>
                </div>
              )}
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
                      {selectedVaga?.empresa} - {selectedVaga?.nome}
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
                          className={`p-4 rounded-full transition-all duration-300 shadow-lg ${micEnabled
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
                          className={`px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 flex items-center shadow-xl ${isRecording
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
                          className={`p-4 rounded-full transition-all duration-300 shadow-lg ${cameraEnabled
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

                {/* Face Analysis */}
                {cameraEnabled && (
                  <div className="mb-6">
                    <FaceAnalysis
                      videoRef={videoRef}
                      isActive={cameraEnabled && !isRecording}
                      onFaceDataChange={setCurrentFaceData}
                    />
                  </div>
                )}

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
                    disabled={carregandoRelatorio || isUploadingResponse}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    {isUploadingResponse ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando Resposta...
                      </>
                    ) : carregandoRelatorio ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gerando Relatório...
                      </>
                    ) : (
                      <>
                        {currentQuestion < currentQuestions.length - 1 ? 'Próxima Pergunta' : 'Concluir Perguntas'} →
                      </>
                    )}
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
                <h2 className="text-3xl font-bold mb-4">Todas as Perguntas Respondidas!</h2>
                <p className="text-gray-400 mb-8">
                  Você respondeu todas as perguntas da entrevista simulada. Agora você pode finalizar para gerar seu relatório ou recomeçar se quiser refazer.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between">
                        <span>Vaga:</span>
                        <span>{selectedVaga?.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Empresa:</span>
                        <span>{selectedVaga?.empresa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perguntas:</span>
                        <span>{currentQuestions.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">O que acontece agora?</h3>
                    <ul className="text-left space-y-2 text-gray-300 text-sm">
                      <li>• <strong>Finalizar:</strong> Gera relatório com feedback de IA</li>
                      <li>• <strong>Recomeçar:</strong> Refaz a entrevista do início</li>
                      <li>• O relatório ficará disponível em "Suas Entrevistas"</li>
                      <li>• Você pode fazer outras entrevistas depois</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={restartInterview}
                    className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    🔄 Recomeçar Entrevista
                  </button>
                  <button
                    onClick={async () => {
                      await finalizarEntrevista();
                      // Não volta para início - deixa o modal aberto para ver o relatório
                    }}
                    disabled={carregandoRelatorio}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
                  >
                    {carregandoRelatorio ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Finalizando...
                      </>
                    ) : (
                      '✅ Finalizar e Gerar Relatório'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* </PremiumFeature> */}
    </div >
  );
};

export default EntrevistaSimuladaPage;


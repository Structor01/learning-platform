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

// Componente de Notificação Toast
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-700 text-green-100';
      case 'error':
        return 'bg-red-900 border-red-700 text-red-100';
      case 'warning':
        return 'bg-yellow-900 border-yellow-700 text-yellow-100';
      case 'info':
        return 'bg-blue-900 border-blue-700 text-blue-100';
      default:
        return 'bg-gray-900 border-gray-700 text-gray-100';
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
            className="text-gray-400 hover:text-gray-200 flex-shrink-0 text-lg font-bold transition-colors hover:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center"
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
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Gerando relatório com IA...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (!relatorioData) return null;

  const { report, vaga } = relatorioData;

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'contratar': return 'bg-green-500';
      case 'avaliar': return 'bg-yellow-500';
      case 'não contratar': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              📊 Relatório da Mock Interview
            </h2>
            <p className="text-gray-400 mt-1">
              Gerado em {new Date(report.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              📋 Informações Gerais
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <p><strong className="text-purple-400">Vaga:</strong> {vaga?.nome}</p>
                <p><strong className="text-purple-400">Empresa:</strong> {vaga?.empresa}</p>
              </div>
              <div>
                <p><strong className="text-purple-400">Candidato:</strong> {report.candidateName}</p>
                <p><strong className="text-purple-400">Perguntas:</strong> {report.completedQuestions}</p>
              </div>
            </div>
          </div>

          {/* Pontuação */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🎯 Performance
            </h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <p className="text-gray-400 mt-2">Nota Geral</p>
              </div>
              <div className="text-center">
                <div className={`${getRecommendationColor(report.recommendation)} text-white px-6 py-3 rounded-full font-bold text-lg`}>
                  {report.recommendation}
                </div>
                <p className="text-gray-400 mt-2">Recomendação</p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              📝 Resumo Executivo
            </h3>
            <p className="text-gray-300 leading-relaxed">{report.summary}</p>
          </div>

          {/* Análise Detalhada */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🔍 Análise Detalhada
            </h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <pre className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {report.detailedAnalysis}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para exibir cada candidatura
const CandidaturaCard = ({ candidatura, onIniciarEntrevista, loading }) => {
  const [statusCheck, setStatusCheck] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const checkStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch(`${API_URL}/api/mock-interviews/candidatura/${candidatura.id}/check`);
      const data = await response.json();
      setStatusCheck(data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [candidatura.id]);

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'pendente': return 'text-yellow-400';
  //     case 'aprovada': return 'text-green-400';
  //     case 'em_analise': return 'text-blue-400';
  //     case 'em_entrevista': return 'text-purple-400';
  //     case 'entrevista_concluida': return 'text-green-500';
  //     default: return 'text-gray-400';
  //   }
  // };

  // const getStatusText = (status) => {
  //   switch (status) {
  //     case 'pendente': return 'Pendente';
  //     case 'aprovada': return 'Aprovada';
  //     case 'em_analise': return 'Em Análise';
  //     case 'em_entrevista': return 'Em Entrevista';
  //     case 'entrevista_concluida': return 'Entrevista Concluída';
  //     default: return status;
  //   }
  // };

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{candidatura.vaga_teste?.nome || 'Vaga não encontrada'}</h3>
          <p className="text-purple-400 font-medium mb-1">{candidatura.vaga_teste?.empresa}</p>
          <p className="text-gray-400 text-sm mb-2">{candidatura.vaga_teste?.cidade}/{candidatura.vaga_teste?.uf}</p>

          <div className="flex items-center space-x-4 text-sm">
            {/* <span className={`font-medium ${getStatusColor(candidatura.status)}`}>
              Status: {getStatusText(candidatura.status)}
            </span> */}
            <span className="text-gray-400">
              Data: {new Date(candidatura.data_candidatura).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {loadingStatus ? (
            <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm rounded-lg text-center">
              Verificando status...
            </div>
          ) : statusCheck?.canStartInterview && !statusCheck?.hasInterview ? (
            <button
              onClick={() => onIniciarEntrevista(candidatura.id)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors font-medium"
            >
              {loading ? 'Criando...' : 'Fazer Entrevista'}
            </button>
          ) : statusCheck?.hasInterview ? (
            <div className="px-4 py-2 bg-green-600/20 text-green-400 text-sm rounded-lg text-center">
              Entrevista Concluída
            </div>
          ) : statusCheck ? (
            <div className="px-4 py-2 bg-yellow-600/20 text-yellow-400 text-sm rounded-lg text-center">
              Aguardando Aprovação
            </div>
          ) : null}
        </div>
      </div>

      {candidatura.vaga_teste?.descricao && (
        <p className="text-gray-300 text-sm mb-3">{candidatura.vaga_teste.descricao}</p>
      )}

      {statusCheck && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          {/* <p className="text-xs text-gray-400 mb-1">Status da Candidatura:</p> */}
          <div className="flex justify-between items-center text-sm">
            <span>Pode iniciar entrevista:</span>
            <span className={statusCheck.canStartInterview ? 'text-green-400' : 'text-red-400'}>
              {statusCheck.canStartInterview ? 'Sim' : 'Não'}
            </span>
          </div>
          {statusCheck.hasInterview && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span>ID da Entrevista:</span>
              <span className="text-purple-400">{statusCheck.interviewId}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EntrevistaSimuladaPage = () => {
  const [currentStep, setCurrentStep] = useState('vagas'); // vagas, candidaturas, interview, feedback
  const [selectedVaga, setSelectedVaga] = useState(null);
  const [candidaturaId, setCandidaturaId] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [vagasTeste, setVagasTeste] = useState([]);
  const [minhasCandidaturas, setMinhasCandidaturas] = useState([]);
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

  const fetchMinhasCandidaturas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/user/${user.id}`);
      const data = await response.json();
      if (data.data) {
        setMinhasCandidaturas(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      showToast('Erro ao carregar suas candidaturas. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const candidatarVaga = async (vagaId, mensagem = '') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/candidatura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: user.id,
          vagaTesteId: vagaId,
          mensagem
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao se candidatar');
      }

      showToast('Candidatura realizada com sucesso!\n\nAgora você pode acessar "Minhas Candidaturas" para iniciar sua entrevista simulada.', 'success', 7000);
      await fetchMinhasCandidaturas();
      await fetchVagasTeste(); // Recarregar vagas para atualizar botões
      setCurrentStep('candidaturas');
      return data.data;
    } catch (error) {
      console.error('Erro ao candidatar:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar se usuário já se candidatou para uma vaga
  const jaSeCandidatou = (vagaId) => {
    return minhasCandidaturas.some(candidatura =>
      candidatura.vaga_teste_id === vagaId ||
      candidatura.vaga_teste?.id === vagaId
    );
  };

  // Obter candidatura por ID da vaga
  const getCandidaturaPorVaga = (vagaId) => {
    return minhasCandidaturas.find(candidatura =>
      candidatura.vaga_teste_id === vagaId ||
      candidatura.vaga_teste?.id === vagaId
    );
  };

  // Sempre permitir tentativa de cancelamento - backend decide
  const podeCancelarCandidatura = (candidatura) => {
    return candidatura ? true : false;
  };

  // Obter texto do status da candidatura
  const getStatusTexto = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'aprovada': 'Aprovada',
      'em_analise': 'Em Análise',
      'em_entrevista': 'Em Entrevista',
      'entrevista_em_andamento': 'Entrevista em Andamento',
      'entrevista_concluida': 'Entrevista Concluída',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  // Cancelar candidatura
  const cancelarCandidatura = async (candidaturaId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/candidatura/${candidaturaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao cancelar candidatura');
      }

      showToast('Candidatura cancelada com sucesso!', 'success');
      await fetchMinhasCandidaturas();
      await fetchVagasTeste(); // Recarregar vagas para atualizar botões
    } catch (error) {
      console.error('Erro ao cancelar candidatura:', error);
      // Mostrar mensagem mais amigável baseada no erro do backend
      let mensagem = error.message;
      if (mensagem.includes('Status atual:')) {
        mensagem = 'Esta candidatura não pode ser cancelada no momento devido ao seu status atual.';
      } else if (mensagem.includes('entrevista associada')) {
        mensagem = 'Não é possível cancelar candidatura que já possui entrevista.';
      }
      showToast(mensagem, 'error');
    } finally {
      setLoading(false);
    }
  };

  const criarEntrevista = async (candidaturaId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/mock-interviews/candidatura/${candidaturaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: user.name,
          user_id: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar entrevista');
      }

      setInterviewId(data.data.id);
      setSelectedVaga(data.data.vaga);
      setCandidaturaId(candidaturaId);
      setCurrentStep('interview');
      return data.data;
    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
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
    if (!selectedVaga || !candidaturaId) {
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
      fetchMinhasCandidaturas(); // Carregar candidaturas para verificar botões
    } else if (currentStep === 'candidaturas') {
      fetchMinhasCandidaturas();
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
          faceAnalysis: faceAnalysisData
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
    setCandidaturaId(null);
    setInterviewId(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setVideoUrl(null);
    setRecordingTime(0);
    stopCamera();
  };

  const currentQuestions = getQuestionsForVaga(selectedVaga);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

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
        }}
        relatorioData={relatorioData}
        carregando={carregandoRelatorio}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-14">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
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
            {minhasCandidaturas.filter(c => c.vaga_teste).length > 0 ? (
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2">Suas Entrevistas</h2>
                    <p className="text-gray-400 text-sm sm:text-base">Acesse os relatórios das suas entrevistas concluídas</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-purple-400">{minhasCandidaturas.filter(c => c.vaga_teste).length}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Total</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {minhasCandidaturas.filter(c => c.vaga_teste && c.interview_id).map((candidatura) => (
                    <div key={candidatura.id} className="bg-gray-900 rounded-xl p-4 sm:p-6 hover:bg-gray-800 transition-colors">
                      <div className="mb-4">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{candidatura.vaga_teste.nome}</h3>
                        <p className="text-purple-400 font-medium mb-1 text-sm sm:text-base">{candidatura.vaga_teste.empresa}</p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          {new Date(candidatura.data_candidatura).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCarregandoRelatorio(true);

                          fetch(`${API_URL}/api/mock-interviews/candidatura/${candidatura.id}/check`)
                            .then(res => res.json())
                            .then(data => {
                              if (data.hasInterview) {
                                gerarRelatorio(data.interviewId);
                              } else {
                                setCarregandoRelatorio(false);
                                showToast('Esta candidatura ainda não possui entrevista concluída.', 'warning');
                              }
                            })
                            .catch(error => {
                              console.error('Erro na requisição:', error);
                              setCarregandoRelatorio(false);
                              showToast('Erro ao verificar entrevista. Tente novamente.', 'error');
                            });
                        }}
                        disabled={carregandoRelatorio}
                        className="w-full px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600
  text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                      >
                        {carregandoRelatorio ? 'Carregando...' : 'Ver Relatório'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-12 bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nenhuma candidatura encontrada</h3>
                  <p className="text-gray-400 mb-4">
                    Para realizar entrevistas simuladas, você precisa primeiro se candidatar a uma das vagas disponíveis abaixo.
                  </p>
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-yellow-200 text-sm">
                    <strong>Próximo passo:</strong> Escolha uma vaga abaixo e clique em "Candidatar-se"
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Vagas de Teste Disponíveis</h2>
                  <p className="text-gray-400 text-sm sm:text-base">Candidate-se a uma vaga para começar sua jornada de entrevistas simuladas</p>
                </div>
                <button
                  onClick={() => setCurrentStep('candidaturas')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Minhas Candidaturas
                </button>
              </div>

              {minhasCandidaturas.length === 0 && (
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-purple-400 text-xl">🎯</div>
                    <div>
                      <h4 className="text-purple-300 font-medium mb-1">Primeiro acesso?</h4>
                      <p className="text-purple-200 text-sm">
                        Clique em "Candidatar-se" em qualquer vaga abaixo para começar. Após a candidatura, você terá acesso às entrevistas simuladas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando vagas...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vagasTeste.map((vaga) => (
                  <div key={vaga.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">{vaga.nome}</h3>
                      <p className="text-purple-400 font-medium mb-1">{vaga.empresa}</p>
                      <p className="text-gray-400 text-sm">{vaga.cidade}/{vaga.uf}</p>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{vaga.descricao}</p>

                      <div className="space-y-2">
                        {vaga.remuneracao && (
                          <div className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-400">Remuneração:</span>
                            <span className="text-green-400 font-medium text-sm">{vaga.remuneracao}</span>
                          </div>
                        )}

                        {vaga.beneficios && (
                          <div className="py-2 px-3 bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-400">Benefícios:</span>
                            <p className="text-gray-300 text-sm mt-1">{vaga.beneficios}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {jaSeCandidatou(vaga.id) ? (() => {
                      const candidatura = getCandidaturaPorVaga(vaga.id);
                      const podeCancel = podeCancelarCandidatura(candidatura);
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center py-3 bg-green-600 text-white rounded-lg font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Candidatura Realizada
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentStep('candidaturas')}
                              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                            >
                              Ver Detalhes
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja cancelar sua candidatura?')) {
                                  cancelarCandidatura(candidatura.id);
                                }
                              }}
                              disabled={loading}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                            >
                              {loading ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          </div>
                        </div>
                      );
                    })() : (
                      <button
                        onClick={() => candidatarVaga(vaga.id, 'Interesse em participar da entrevista simulada.')}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                      >
                        {loading ? 'Processando...' : 'Candidatar-se'}
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

        {/* Minhas Candidaturas */}
        {currentStep === 'candidaturas' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Minhas Candidaturas</h2>
                  <p className="text-gray-400">Acompanhe o status das suas candidaturas e inicie entrevistas quando disponíveis</p>
                </div>
                <button
                  onClick={() => setCurrentStep('vagas')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  ← Voltar para Vagas
                </button>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-400 text-lg">ℹ️</div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-1">Como iniciar uma entrevista:</h4>
                    <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                      <li>Suas candidaturas precisam ser aprovadas primeiro</li>
                      <li>Quando aprovadas, o botão "Fazer Entrevista" ficará disponível</li>
                      <li>Clique no botão para iniciar a entrevista simulada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando candidaturas...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {minhasCandidaturas.filter(candidatura => candidatura.vaga_teste).map((candidatura) => (
                  <CandidaturaCard
                    key={candidatura.id}
                    candidatura={candidatura}
                    onIniciarEntrevista={() => criarEntrevista(candidatura.id)}
                    loading={loading}
                  />
                ))}
              </div>
            )}

            {!loading && minhasCandidaturas.filter(candidatura => candidatura.vaga_teste).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Você ainda não possui candidaturas válidas.</p>
                <button
                  onClick={() => setCurrentStep('vagas')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                >
                  Ver Vagas Disponíveis
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
                    voltarParaInicio(); // Volta para a tela principal após finalizar
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
  );
};

export default EntrevistaSimuladaPage;


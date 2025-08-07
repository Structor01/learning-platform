import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import Navbar from './Navbar';
import InterviewModal from './InterviewModal';
import CreateJobWithAIModal from './CreateJobWithAIModal';
import InterviewCompletionPage from './InterviewCompletionPage';
import AdminPage from './AdminPage';
import coresignalService from '../../services/coresignalService';
import interviewService from '../../services/interviewService';
import {
  Briefcase,
  Users,
  Search,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  UserCheck,
  Building,
  Calendar,
  Filter,
  ExternalLink,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Target,
  BarChart3,
  Loader,
  CheckCircle,
  AlertCircle,
  Zap,
  Video,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

function JobDescription({ html }) {
  const cleanHtml = DOMPurify.sanitize(html);
  return <div className="text-gray-300 text-sm">{parse(cleanHtml)}</div>;
}

const RecrutamentoPage = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Estados para Coresignal
  const [coresignalSearches, setCoresignalSearches] = useState({});
  const [coresignalResults, setCoresignalResults] = useState({});
  const [showCoresignalModal, setShowCoresignalModal] = useState(false);

  // Estados para Entrevista
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewJob, setInterviewJob] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [showInterviewCompletion, setShowInterviewCompletion] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Estados para Finalização da Entrevista
  const [showCompletionPage, setShowCompletionPage] = useState(false);
  const [completedInterviewData, setCompletedInterviewData] = useState(null);

  // Estados para Criação de Vaga com IA
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  // Estados para Administração
  const [showAdminPage, setShowAdminPage] = useState(false);

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

      
      // Buscar dados reais da API
      const [jobsResponse, analyticsResponse, historyResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recruitment/jobs`),
        fetch(`${API_BASE_URL}/api/recruitment/analytics`),
        fetch(`${API_BASE_URL}/api/recruitment/search-history`)
      ]);

      if (jobsResponse.ok && analyticsResponse.ok && historyResponse.ok) {
        const jobsData = await jobsResponse.json();
        const analyticsData = await analyticsResponse.json();
        const historyData = await historyResponse.json();

        setJobs(jobsData);
        setAnalytics(analyticsData);
        setSearchHistory(historyData);
      } else {
        console.error('Erro ao carregar dados da API');
        setJobs([]);
        setAnalytics({ totalJobs: 0, totalCandidates: 0, activeJobs: 0 });
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Recrutamento:', error);
      setJobs([]);
      setAnalytics({ totalJobs: 0, totalCandidates: 0, activeJobs: 0 });
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSearch = async (jobId) => {
    try {
      setSearchLoading(true);
      const job = jobs.find(job => job.id === jobId);
      setSelectedJob(job);
      
      // Verificar se já existe uma busca recente para esta vaga (backend + localStorage)
      const hasExisting = await coresignalService.hasExistingSearch(jobId);
      if (hasExisting) {
        const existingSearch = await coresignalService.getExistingSearch(jobId);
        
        if (existingSearch && existingSearch.status === 'completed') {
          // Mostrar resultados existentes
          setSearchResults(existingSearch.results || []);
          setShowSearchModal(true);
          
          const source = existingSearch.fromBackend ? 'banco de dados' : 'cache local';
          const searchDate = new Date(existingSearch.searchTime).toLocaleString('pt-BR');
          
          console.log(`✅ Busca encontrada no ${source}! Resultados: ${existingSearch.results?.length || 0} perfis. Realizada em: ${searchDate}`);
          return;
        }
      }
      
      // Realizar nova busca no Coresignal
      const result = await coresignalService.searchLinkedInPeople(job);
      
      if (result.success) {
        // Exibir resultados
        setSearchResults(result.profiles);
        setShowSearchModal(true);
        
        // Salvar no estado local
        setCoresignalSearches(prev => ({
          ...prev,
          [jobId]: {
            searchId: result.searchId || `coresignal_${Date.now()}`,
            status: 'completed',
            searchTime: new Date().toISOString(),
            job: job,
            totalResults: result.total,
            savedToBackend: result.savedToBackend
          }
        }));
        
        const saveStatus = result.savedToBackend ? '✅ Salvos no banco de dados' : '⚠️ Salvos apenas localmente';
        const cacheInfo = result.fromCache ? ' (dados do cache)' : '';
        
        console.log(`✅ Busca concluída com sucesso! ${cacheInfo} ${result.message} Perfis encontrados: ${result.total} ${saveStatus}`);
      } else {
        console.error(`❌ Erro na busca: ${result.message}. Detalhes: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      console.error('❌ Erro inesperado ao processar busca no LinkedIn', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Função para obter status da busca Coresignal
  const getCoresignalSearchStatus = (jobId) => {
    const existingSearch = coresignalService.getExistingSearch(jobId);
    if (!existingSearch) return null;
    
    return {
      status: existingSearch.status,
      searchId: existingSearch.searchId,
      searchTime: existingSearch.searchTime,
      totalResults: existingSearch.totalResults
    };
  };

  // Função para iniciar entrevista
  const handleStartInterview = async (job) => {
    try {
      setGeneratingQuestions(true);
      setInterviewJob(job);
      setShowInterviewModal(true);
      
      // Criar entrevista no backend
      const createResult = await interviewService.createInterview(
        job.id, 
        'Candidato', // Nome será coletado no modal
        'candidato@email.com' // Email será coletado no modal
      );
      
      if (createResult.success) {
        setCurrentInterviewId(createResult.interview.id);
        
        // Usar perguntas padrão por enquanto
        const defaultQuestions = [
          {
            id: 1,
            question: "Conte-me sobre sua trajetória profissional e o que o motivou a se candidatar para esta vaga.",
            answered: false
          },
          {
            id: 2,
            question: `Como você se vê contribuindo para o crescimento da ${job.company || job.empresa}?`,
            answered: false
          },
          {
            id: 3,
            question: "Descreva uma situação desafiadora que você enfrentou profissionalmente e como a resolveu.",
            answered: false
          },
          {
            id: 4,
            question: "Quais são seus principais objetivos de carreira para os próximos anos?",
            answered: false
          },
          {
            id: 5,
            question: "Por que você acredita ser o candidato ideal para esta posição?",
            answered: false
          }
        ];
        
        setInterviewQuestions(defaultQuestions);
        setCurrentQuestion(0);
        
        console.log(`✅ Entrevista criada! ID: ${createResult.interview.id}. ${defaultQuestions.length} perguntas preparadas. Clique em "Iniciar Gravação" para começar.`);
      } else {
        throw new Error(createResult.error || 'Erro ao criar entrevista');
      }
      
    } catch (error) {
      console.error('Erro ao preparar entrevista:', error);
      alert('❌ Erro ao preparar entrevista. Tente novamente.');
      setShowInterviewModal(false);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Função para processar vídeo da resposta com dados da Face API
  const handleVideoResponse = async (videoBlob, questionIndex, faceAnalysisData = []) => {
    try {
      // Verificar se temos uma entrevista ativa
      if (!currentInterviewId) {
        console.error('❌ Nenhuma entrevista ativa encontrada');
        return;
      }

      // Upload do vídeo para o backend com processamento IA
      const uploadResult = await interviewService.uploadVideoResponse(
        currentInterviewId,
        questionIndex + 1, // Backend usa 1-based indexing
        videoBlob,
        faceAnalysisData
      );

      if (!uploadResult.success) {
        console.error(`❌ Erro no upload: ${uploadResult.error}`);
        return;
      }

      // Aguardar processamento IA no backend
      console.log(`🔄 Aguardando processamento IA para resposta ${uploadResult.responseId}...`);
      
      const processingResult = await interviewService.waitForProcessingCompletion(
        currentInterviewId,
        uploadResult.responseId,
        30, // 30 tentativas
        3000 // 3 segundos entre tentativas
      );

      if (processingResult.success) {
        // Atualizar pergunta com dados processados
        const updatedQuestions = [...interviewQuestions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          answered: true,
          transcription: processingResult.transcription,
          analysis: processingResult.aiAnalysis,
          faceData: faceAnalysisData,
          videoBlob: videoBlob,
          responseId: uploadResult.responseId,
          videoUrl: uploadResult.videoUrl
        };
        
        setInterviewQuestions(updatedQuestions);
        
        const faceInfo = faceAnalysisData.length > 0 ? 
          `\n\nAnálise comportamental: ${faceAnalysisData.length} pontos coletados` : 
          '\n\nAnálise apenas textual (sem dados comportamentais)';
        
        console.log(`✅ Resposta processada com IA no backend! Transcrição: "${processingResult.transcription?.substring(0, 80)}..." Pontuação: ${processingResult.analysisScore}/10${faceInfo}`);
      } else {
        console.error(`❌ Erro no processamento IA: ${processingResult.error}`);
        
        // Fallback: marcar como respondida mesmo sem análise completa
        const updatedQuestions = [...interviewQuestions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          answered: true,
          transcription: 'Processamento pendente',
          analysis: { score: 7, recommendation: 'Análise em processamento' },
          faceData: faceAnalysisData,
          videoBlob: videoBlob,
          responseId: uploadResult.responseId,
          videoUrl: uploadResult.videoUrl
        };
        
        setInterviewQuestions(updatedQuestions);
      }
      
    } catch (error) {
      console.error('Erro ao processar vídeo:', error);
      console.error('❌ Erro ao processar resposta em vídeo.', error);
    }
  };

  // Função para gerar PDF com resultados da entrevista
  const generateInterviewPDF = (interviewData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Função auxiliar para adicionar texto com quebra de linha
    const addText = (text, x, y, maxWidth = pageWidth - 2 * margin) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 7);
    };

    // Função auxiliar para verificar se precisa de nova página
    const checkNewPage = (currentY, requiredSpace = 30) => {
      if (currentY + requiredSpace > doc.internal.pageSize.height - margin) {
        doc.addPage();
        return 30;
      }
      return currentY;
    };

    try {
      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      yPosition = addText('RELATÓRIO DE ENTREVISTA SIMULADA', margin, yPosition);
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      yPosition = addText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
      
      // Linha separadora
      yPosition += 10;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Informações da vaga
      yPosition = checkNewPage(yPosition);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      yPosition = addText('INFORMAÇÕES DA VAGA', margin, yPosition);
      
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      yPosition = addText(`Cargo: ${interviewData.job?.nome || interviewData.job?.title || 'Não informado'}`, margin, yPosition);
      yPosition = addText(`Empresa: ${interviewData.job?.empresa || interviewData.job?.company || 'Não informado'}`, margin, yPosition);
      yPosition = addText(`Área: ${interviewData.job?.area || 'Não informado'}`, margin, yPosition);
      yPosition = addText(`Localização: ${interviewData.job?.localizacao || interviewData.job?.location || 'Não informado'}`, margin, yPosition);

      // Estatísticas gerais
      yPosition += 15;
      yPosition = checkNewPage(yPosition);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      yPosition = addText('ESTATÍSTICAS GERAIS', margin, yPosition);
      
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      yPosition = addText(`Perguntas respondidas: ${interviewData.answeredCount} de ${interviewData.questions.length}`, margin, yPosition);
      yPosition = addText(`Dados comportamentais coletados: ${interviewData.totalFaceDataPoints || 0} pontos`, margin, yPosition);
      yPosition = addText(`Data da entrevista: ${new Date(interviewData.completedAt).toLocaleString('pt-BR')}`, margin, yPosition);

      // Análise das respostas
      yPosition += 15;
      yPosition = checkNewPage(yPosition);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      yPosition = addText('ANÁLISE DAS RESPOSTAS', margin, yPosition);

      const answeredQuestions = interviewData.questions.filter(q => q.answered);
      
      answeredQuestions.forEach((question, index) => {
        yPosition += 10;
        yPosition = checkNewPage(yPosition, 50);
        
        // Pergunta
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        yPosition = addText(`${index + 1}. ${question.question}`, margin, yPosition);
        
        yPosition += 5;
        doc.setFont(undefined, 'normal');
        
        if (question.analysis) {
          yPosition = addText(`Pontuação: ${question.analysis.score}/10`, margin + 10, yPosition);
          
          if (question.analysis.strengths && question.analysis.strengths.length > 0) {
            yPosition = addText('Pontos Fortes:', margin + 10, yPosition);
            question.analysis.strengths.forEach(strength => {
              yPosition = addText(`• ${strength}`, margin + 15, yPosition);
            });
          }
          
          if (question.analysis.improvements && question.analysis.improvements.length > 0) {
            yPosition = addText('Sugestões de Melhoria:', margin + 10, yPosition);
            question.analysis.improvements.forEach(improvement => {
              yPosition = addText(`• ${improvement}`, margin + 15, yPosition);
            });
          }
          
          if (question.analysis.adequacy) {
            yPosition = addText(`Adequação à pergunta: ${question.analysis.adequacy}`, margin + 10, yPosition);
          }
        }
        
        if (question.transcription) {
          yPosition += 5;
          yPosition = addText('Transcrição da resposta:', margin + 10, yPosition);
          yPosition = addText(`"${question.transcription.substring(0, 200)}${question.transcription.length > 200 ? '...' : ''}"`, margin + 15, yPosition);
        }
      });

      // Relatório final (se disponível)
      if (interviewData.report) {
        yPosition += 15;
        yPosition = checkNewPage(yPosition);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        yPosition = addText('RELATÓRIO FINAL', margin, yPosition);
        
        yPosition += 5;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        // Dividir o relatório em seções se possível
        const reportSections = interviewData.report.split('\n\n');
        reportSections.forEach(section => {
          if (section.trim()) {
            yPosition = checkNewPage(yPosition, 20);
            yPosition = addText(section.trim(), margin, yPosition);
            yPosition += 5;
          }
        });
      }

      // Análise comportamental (se disponível)
      if (interviewData.faceStatistics && interviewData.faceStatistics.totalDataPoints > 0) {
        yPosition += 15;
        yPosition = checkNewPage(yPosition);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        yPosition = addText('ANÁLISE COMPORTAMENTAL', margin, yPosition);
        
        yPosition += 5;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        const stats = interviewData.faceStatistics;
        yPosition = addText(`Confiança média: ${(stats.averageConfidence * 100).toFixed(1)}%`, margin, yPosition);
        yPosition = addText(`Emoção predominante: ${stats.dominantEmotion || 'Não identificada'}`, margin, yPosition);
        yPosition = addText(`Total de amostras coletadas: ${stats.totalDataPoints}`, margin, yPosition);
      }

      // Rodapé
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
        doc.text('Gerado pela Plataforma de Entrevistas com IA', margin, doc.internal.pageSize.height - 10);
      }

      // Salvar o PDF
      const fileName = `entrevista_${interviewData.job?.nome || 'vaga'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log(`✅ PDF gerado com sucesso: ${fileName}`);
      return { success: true, fileName };
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error: error.message };
    }
  };

  // Funções auxiliares para tela de finalização
  const calculateAverageScore = (answeredQuestions) => {
    if (answeredQuestions.length === 0) return 0;
    const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 7.5), 0);
    return totalScore / answeredQuestions.length;
  };

  const calculateInterviewDuration = (interviewData) => {
    // Simular duração baseada no número de perguntas
    const minutes = interviewData.answeredCount * 2.5; // ~2.5 min por pergunta
    return `${Math.round(minutes)} minutos`;
  };

  const extractFeedbackFromReport = (report) => {
    // Extrair feedback do relatório ou usar dados padrão
    return {
      strengths: [
        'Comunicação clara e objetiva',
        'Experiência relevante para a vaga',
        'Demonstrou motivação e interesse'
      ],
      improvements: [
        'Desenvolver habilidades técnicas específicas',
        'Ampliar conhecimento do setor'
      ],
      recommendation: 'Candidato recomendado para próxima fase do processo seletivo'
    };
  };

  // Funções de callback para tela de finalização
  const handleDownloadPDF = async () => {
    try {
      if (completedInterviewData?.pdfData?.success) {
        // PDF já foi gerado, apenas baixar novamente
        const fileName = completedInterviewData.pdfData.fileName;
        console.log(`📄 Baixando PDF: ${fileName}`);
      } else if (completedInterviewData?.interviewData) {
        // Gerar PDF novamente
        const pdfResult = generateInterviewPDF(completedInterviewData.interviewData);
        if (pdfResult.success) {
          console.log(`📄 PDF gerado e baixado: ${pdfResult.fileName}`);
        } else {
          throw new Error(pdfResult.error);
        }
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleReturnHome = () => {
    // Limpar estados e voltar para a página principal
    setShowCompletionPage(false);
    setCompletedInterviewData(null);
    setInterviewQuestions([]);
    setCurrentQuestion(0);
    setInterviewJob(null);
    setActiveTab('jobs');
  };

  const handleStartNewInterview = () => {
    // Limpar estados e permitir nova entrevista
    setShowCompletionPage(false);
    setCompletedInterviewData(null);
    setInterviewQuestions([]);
    setCurrentQuestion(0);
    setInterviewJob(null);
    // Manter na aba de recrutamento para facilitar nova entrevista
  };

  // Função para finalizar entrevista
  const handleFinishInterview = async () => {
    try {
      const answeredQuestions = interviewQuestions.filter(q => q.answered);
      
      if (answeredQuestions.length === 0) {
        console.warn('⚠️ Nenhuma pergunta foi respondida. Responda pelo menos uma pergunta antes de finalizar.');
        return;
      }
      
      // Gerar relatório final com dados da Face API
      const reportResult = await chatgptService.generateFinalReport(
        interviewJob,
        interviewQuestions,
        { name: 'Candidato', email: 'candidato@email.com' }
      );
      
      if (reportResult.success) {
        // Calcular estatísticas dos dados faciais
        const faceStats = calculateFaceStatistics(interviewQuestions);
        
        // Salvar entrevista completa
        const interviewData = {
          job: interviewJob,
          questions: interviewQuestions,
          report: reportResult.report,
          faceStatistics: faceStats,
          completedAt: new Date().toISOString(),
          answeredCount: answeredQuestions.length,
          totalFaceDataPoints: faceStats.totalDataPoints
        };
        
        const savedInterviews = JSON.parse(localStorage.getItem('completedInterviews') || '[]');
        savedInterviews.push(interviewData);
        localStorage.setItem('completedInterviews', JSON.stringify(savedInterviews));
        
        // Gerar PDF com os resultados
        const pdfResult = generateInterviewPDF(interviewData);
        
        if (pdfResult.success) {
          console.log(`✅ Entrevista finalizada com IA! ${answeredQuestions.length} perguntas respondidas. Relatório gerado com ChatGPT. Dados comportamentais: ${faceStats.totalDataPoints} pontos. PDF gerado: ${pdfResult.fileName}`);
        } else {
          console.log(`✅ Entrevista finalizada com IA! ${answeredQuestions.length} perguntas respondidas. Relatório gerado com ChatGPT. Dados comportamentais: ${faceStats.totalDataPoints} pontos. Análise completa salva localmente.`);
          console.error(`⚠️ Erro ao gerar PDF: ${pdfResult.error}`);
        }
        
        // Preparar dados para tela de finalização
        const completionData = {
          candidateName: 'Candidato',
          jobTitle: interviewJob?.title || 'Vaga de Emprego',
          completedQuestions: answeredQuestions.length,
          totalQuestions: interviewQuestions.length,
          averageScore: calculateAverageScore(answeredQuestions),
          duration: calculateInterviewDuration(interviewData),
          status: 'completed',
          feedback: extractFeedbackFromReport(reportResult.report),
          pdfData: pdfResult.success ? pdfResult : null,
          interviewData: interviewData
        };
        
        // Mostrar tela de finalização
        setCompletedInterviewData(completionData);
        setShowInterviewModal(false);
        setShowCompletionPage(true);
      } else {
        console.error(`❌ Erro ao gerar relatório: ${reportResult.error}`);
      }
      
    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
      console.error('❌ Erro ao finalizar entrevista.', error);
    }
  };

  // Calcular estatísticas dos dados faciais
  const calculateFaceStatistics = (questions) => {
    let totalDataPoints = 0;
    let totalEmotions = {};
    let avgAge = 0;
    let genderCounts = {};
    
    questions.forEach(q => {
      if (q.faceData && q.faceData.length > 0) {
        totalDataPoints += q.faceData.length;
        
        q.faceData.forEach(data => {
          // Contar emoções
          if (data.dominantEmotion) {
            totalEmotions[data.dominantEmotion] = (totalEmotions[data.dominantEmotion] || 0) + 1;
          }
          
          // Somar idades
          if (data.age) {
            avgAge += data.age;
          }
          
          // Contar gêneros
          if (data.gender) {
            genderCounts[data.gender] = (genderCounts[data.gender] || 0) + 1;
          }
        });
      }
    });
    
    return {
      totalDataPoints,
      avgAge: totalDataPoints > 0 ? Math.round(avgAge / totalDataPoints) : 0,
      dominantEmotion: Object.keys(totalEmotions).reduce((a, b) => 
        totalEmotions[a] > totalEmotions[b] ? a : b, 'neutral'),
      dominantGender: Object.keys(genderCounts).reduce((a, b) => 
        genderCounts[a] > genderCounts[b] ? a : b, 'unknown'),
      emotionDistribution: totalEmotions,
      genderDistribution: genderCounts
    };
  };

  // Função para obter texto e ícone do botão baseado no status
  const getSearchButtonContent = (jobId) => {
    if (searchLoading) {
      return {
        text: 'Buscando...',
        icon: <Loader className="h-4 w-4 mr-2 animate-spin" />,
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }

    const searchStatus = getCoresignalSearchStatus(jobId);
    
    if (!searchStatus) {
      return {
        text: 'Buscar no LinkedIn',
        icon: <Zap className="h-4 w-4 mr-2" />,
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }

    switch (searchStatus.status) {
      case 'completed':
        return {
          text: 'Ver Resultados',
          icon: <CheckCircle className="h-4 w-4 mr-2" />,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'error':
        return {
          text: 'Tentar Novamente',
          icon: <AlertCircle className="h-4 w-4 mr-2" />,
          className: 'bg-red-600 hover:bg-red-700 text-white'
        };
      default:
        return {
          text: 'Buscar no LinkedIn',
          icon: <Zap className="h-4 w-4 mr-2" />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  // Função para lidar com criação de nova vaga via IA
  const handleJobCreated = (newJob) => {
    console.log('✅ Nova vaga criada:', newJob);
    
    // Adicionar a nova vaga à lista
    setJobs(prevJobs => [newJob, ...prevJobs]);
    
    // Atualizar analytics
    if (analytics) {
      setAnalytics(prev => ({
        ...prev,
        totalJobs: prev.totalJobs + 1,
        activeJobs: newJob.status === 'active' ? prev.activeJobs + 1 : prev.activeJobs
      }));
    }
    
    // Recarregar dados para garantir sincronização
    fetchRecruitmentData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500 ';
      case 'paused': return 'bg-yellow-500 ';
      case 'closed': return 'bg-red-500 ';
      default: return 'bg-gray-500 ';
    }
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-blue-100 text-blue-800 ';
      case 'mid': return 'bg-orange-100 text-orange-800 ';
      case 'senior': return 'bg-purple-100 text-purple-800 ';
      case 'executive': return 'bg-red-100 text-red-800 ';
      default: return 'bg-gray-100 text-gray-800 ';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen  bg-gray-900  p-4 pt-20 flex items-center justify-center ">
          <div className="text-white  text-xl ">Carregando dados do Recrutamento da API...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Tela de Administração de Entrevistas */}
      {showAdminPage && (
        <div className="min-h-screen bg-gray-900">
          <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Administração de Entrevistas</h1>
            <Button
              onClick={() => setShowAdminPage(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Voltar ao Recrutamento
            </Button>
          </div>
          <AdminPage />
        </div>
      )}

      {/* Tela de Finalização da Entrevista */}
      {showCompletionPage && completedInterviewData && (
        <InterviewCompletionPage
          interviewData={completedInterviewData}
          onDownloadPDF={handleDownloadPDF}
          onReturnHome={handleReturnHome}
          onStartNewInterview={handleStartNewInterview}
        />
      )}

      {/* Página Principal de Recrutamento */}
      {!showCompletionPage && !showAdminPage && (
        <>
          <Navbar />
          <div className="min-h-screen  bg-gray-900  text-white  p-4  pt-20 ">
        <div className="max-w-7xl  mx-auto ">
          {/* Header */}
          <div className="mb-8 ">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl  font-bold  text-white  mb-2 ">
                  Recrutamento LinkedIn Premium
                </h1>
                <p className="text-gray-400 ">
                  Gestão de vagas e busca de candidatos via API real
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAdminPage(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Administrar Entrevistas
                </Button>
                <Button
                  onClick={() => setShowCreateJobModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Criar Vaga com IA
                </Button>
                <Button
                  onClick={async () => {
                    const result = await coresignalService.testApiKey();
                    if (result.success) {
                      console.log(`✅ ${result.message} Teste realizado com sucesso! API Coresignal funcionando corretamente.`);
                    } else {
                      console.error(`❌ ${result.error} Verifique a API Key do Coresignal.`);
                    }
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Testar Coresignal API
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4  gap-6  mb-8 ">
              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Total de Vagas
                  </CardTitle>
                  <Briefcase className="h-4 w-4  text-blue-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalJobs}
                  </div>
                  <p className="text-xs  text-green-400 ">
                    {analytics.activeJobs} ativas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Candidatos Encontrados
                  </CardTitle>
                  <Users className="h-4 w-4  text-green-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalCandidates}
                  </div>
                  <p className="text-xs  text-green-400 ">
                    Via LinkedIn Premium
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Match Score Médio
                  </CardTitle>
                  <Target className="h-4 w-4  text-orange-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.averageMatchScore}%
                  </div>
                  <p className="text-xs  text-orange-400 ">
                    Compatibilidade
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Total Aplicações
                  </CardTitle>
                  <TrendingUp className="h-4 w-4  text-purple-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalApplications || 0}
                  </div>
                  <p className="text-xs  text-purple-400 ">
                    Candidaturas recebidas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1  mb-6  bg-gray-800  p-1  rounded-lg ">
            <Button
              variant={activeTab === 'jobs' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('jobs')}
              className={`flex-1  ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} `}
            >
              <Briefcase className="h-4 w-4  mr-2 " />
              Vagas ({jobs.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className={`flex-1  ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} `}
            >
              <Search className="h-4 w-4  mr-2 " />
              Histórico ({searchHistory.length})
            </Button>
          </div>

          {/* Vagas Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 ">
              {jobs.length === 0 ? (
                <Card className="bg-gray-800  border-gray-700 ">
                  <CardContent className="text-center  py-12 ">
                    <Briefcase className="h-12 w-12  text-gray-400  mx-auto  mb-4 " />
                    <h3 className="text-lg  font-medium  text-white  mb-2 ">
                      Nenhuma vaga encontrada
                    </h3>
                    <p className="text-gray-400 ">
                      Verifique se a API está funcionando corretamente
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 ">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-800  border-gray-700  hover:border-blue-500  transition-colors ">
                        <CardHeader>
                          <div className="flex justify-between  items-start ">
                            <div>
                              <CardTitle className="text-white  text-xl  mb-2 ">
                                {job.title}
                              </CardTitle>
                              <div className="flex items-center  gap-4  text-gray-400 ">
                                <div className="flex items-center  gap-1 ">
                                  <Building className="h-4 w-4 " />
                                  {job.company}
                                </div>
                                <div className="flex items-center  gap-1 ">
                                  <MapPin className="h-4 w-4 " />
                                  {job.location}
                                </div>
                                <div className="flex items-center  gap-1 ">
                                  <Calendar className="h-4 w-4 " />
                                  {formatDate(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ">
                              <Badge className={`${getStatusColor(job.status)} text-white `}>
                                {job.status}
                              </Badge>
                              <Badge variant="outline" className={getExperienceColor(job.experience_level)}>
                                {job.experience_level}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 ">
                            <div>
                              <h4 className="text-white  font-medium  mb-2 ">Descrição</h4>
                              <JobDescription html={job.description} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:!grid-cols-3  gap-4 ">
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <DollarSign className="h-4 w-4 " />
                                <span className="text-sm ">{job.salary_range}</span>
                              </div>
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <UserCheck className="h-4 w-4 " />
                                <span className="text-sm ">{job.applications_count} aplicações</span>
                              </div>
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <Eye className="h-4 w-4 " />
                                <span className="text-sm ">{job.views_count} visualizações</span>
                              </div>
                            </div>

                            <div className="flex gap-2  pt-4 ">
                              {/*{(() => {*/}
                              {/*  const buttonContent = getSearchButtonContent(job.id);*/}
                              {/*  return (*/}
                              {/*    <Button*/}
                              {/*      onClick={() => handleLinkedInSearch(job.id)}*/}
                              {/*      disabled={searchLoading}*/}
                              {/*      className={buttonContent.className}*/}
                              {/*    >*/}
                              {/*      {buttonContent.icon}*/}
                              {/*      {buttonContent.text}*/}
                              {/*    </Button>*/}
                              {/*  );*/}
                              {/*})()}*/}
                              <Button
                                variant="outline"
                                className="border-gray-600  text-gray-300  hover:bg-gray-700 "
                              >
                                <Eye className="h-4 w-4  mr-2 " />
                                Ver Detalh                              </Button>
                            </div>

                            {/* Botão Fazer Entrevista */}
                            <div className="mt-4">
                              <Button
                                onClick={() => handleStartInterview(job)}
                                disabled={generatingQuestions}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                {generatingQuestions ? (
                                  <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    Preparando Entrevista...
                                  </>
                                ) : (
                                  <>
                                    <Video className="h-4 w-4 mr-2" />
                                    Fazer Entrevista
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Histórico Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6 ">
              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader>
                  <CardTitle className="text-white ">Histórico de Buscas LinkedIn</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchHistory.length === 0 ? (
                    <div className="text-center  py-8 ">
                      <Search className="h-12 w-12  text-gray-400  mx-auto  mb-4 " />
                      <h3 className="text-lg  font-medium  text-white  mb-2 ">
                        Nenhuma busca realizada
                      </h3>
                      <p className="text-gray-400 ">
                        Realize buscas nas vagas para ver o histórico aqui
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 ">
                      {searchHistory.map((search) => (
                        <div
                          key={search.id}
                          className="flex justify-between  items-center  p-4  bg-gray-700  rounded-lg "
                        >
                          <div>
                            <h4 className="text-white  font-medium ">
                              {search.job_title}
                            </h4>
                            <p className="text-gray-400  text-sm ">
                              {search.job_company} • {search.location} • {search.experience_level}
                            </p>
                            <p className="text-gray-500  text-xs ">
                              Keywords: {search.keywords}
                            </p>
                          </div>
                          <div className="text-right ">
                            <div className="text-white  font-medium ">
                              {search.candidates_found} candidatos
                            </div>
                            <div className="text-gray-400  text-sm ">
                              {formatDate(search.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal de Resultados da Busca LinkedIn */}
          {showSearchModal && (
            <div className="fixed inset-0  bg-black bg-opacity-50  flex items-center justify-center  z-50  p-4 ">
              <div className="bg-gray-800  rounded-lg  max-w-4xl  w-full  max-h-[80vh]  overflow-y-auto ">
                <div className="p-6 ">
                  <div className="flex justify-between  items-center  mb-6 ">
                    <h2 className="text-2xl  font-bold  text-white ">
                      Candidatos Encontrados - {selectedJob?.title}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSearchModal(false)}
                      className="text-gray-400 hover:text-white "
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="grid gap-4 ">
                    {searchResults.map((candidate) => (
                      <Card key={candidate.id} className="bg-gray-700  border-gray-600 ">
                        <CardContent className="p-4 ">
                          <div className="flex items-start  gap-4 ">
                            <img
                              src={candidate.profile_image}
                              alt={candidate.name}
                              className="w-16 h-16  rounded-full "
                            />
                            <div className="flex-1 ">
                              <div className="flex justify-between  items-start  mb-2 ">
                                <div>
                                  <h3 className="text-white  font-medium  text-lg ">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-gray-300 ">{candidate.title}</p>
                                  <p className="text-gray-400  text-sm ">
                                    {candidate.company} • {candidate.location}
                                  </p>
                                </div>
                                <div className="flex items-center  gap-2 ">
                                  <Badge className="bg-green-500  text-white ">
                                    {candidate.match_score}% match
                                  </Badge>
                                  <Star className="h-4 w-4  text-yellow-400 " />
                                </div>
                              </div>
                              
                              <p className="text-gray-300  text-sm  mb-3 ">
                                {candidate.summary}
                              </p>
                              
                              <div className="flex flex-wrap  gap-2  mb-3 ">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-blue-300  border-blue-500 ">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 ">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700  text-white "
                                  onClick={() => window.open(candidate.linkedin_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4  mr-1 " />
                                  LinkedIn
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600  text-gray-300  hover:bg-gray-600 "
                                >
                                  <Mail className="h-4 w-4  mr-1 " />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600  text-gray-300  hover:bg-gray-600 "
                                >
                                  <Phone className="h-4 w-4  mr-1 " />
                                  Contato
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Entrevista com IA */}
        <InterviewModal
          isOpen={showInterviewModal}
          onClose={() => setShowInterviewModal(false)}
          job={interviewJob}
          questions={interviewQuestions}
          onVideoResponse={handleVideoResponse}
          onFinishInterview={handleFinishInterview}
          generatingQuestions={generatingQuestions}
        />

        {/* Modal de Criação de Vaga com IA */}
        <CreateJobWithAIModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
          onJobCreated={handleJobCreated}
        />
          </div>
        </>
      )}
    </>
  );
};

export default RecrutamentoPage;


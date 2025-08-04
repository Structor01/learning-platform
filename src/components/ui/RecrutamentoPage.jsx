import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import Navbar from './Navbar';
import InterviewModal from './InterviewModal';
import coresignalService from '../../services/coresignalService';
import chatgptService from '../../services/chatgptService';
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
  MessageSquare
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
  
  // Estados para Coresignal
  const [coresignalSearches, setCoresignalSearches] = useState({});
  const [coresignalResults, setCoresignalResults] = useState({});
  const [showCoresignalModal, setShowCoresignalModal] = useState(false);

  // Estados para Entrevista
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewJob, setInterviewJob] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      

      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";

      
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
      
      // Gerar perguntas usando ChatGPT
      const result = await chatgptService.generateInterviewQuestions(job);
      
      if (result) {
        setInterviewQuestions(result);
        setCurrentQuestion(0);
        
        console.log(`✅ Entrevista preparada! ${result.length} perguntas geradas: 1. Trajetória profissional (padrão), 2-4. Perguntas específicas da vaga. Clique em "Iniciar Gravação" para começar.`);
      } else {
        // Usar perguntas de fallback
        setInterviewQuestions(result);
        setCurrentQuestion(0);
        
        console.warn(`⚠️ Usando perguntas padrão. Motivo: ${result.error}. ${result.length} perguntas disponíveis.`);
      }
      
    } catch (error) {
      console.error('Erro ao preparar entrevista:', error);
      console.error('❌ Erro ao preparar entrevista. Tente novamente.', error);
      setShowInterviewModal(false);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Função para processar vídeo da resposta com dados da Face API
  const handleVideoResponse = async (videoBlob, questionIndex, faceAnalysisData = []) => {
    try {
      // Transcrever vídeo usando Whisper API
      const transcriptionResult = await chatgptService.transcribeVideo(videoBlob);
      
      if (transcriptionResult) {
        let analysisResult;
        
        // Se temos dados da Face API, usar análise aprimorada
        if (faceAnalysisData.length > 0) {
          analysisResult = await chatgptService.analyzeResponseWithFaceData(
            interviewQuestions[questionIndex].question,
            transcriptionResult,
            faceAnalysisData,
            interviewJob
          );
        } else {
          // Fallback para análise simples
          analysisResult = await chatgptService.analyzeResponse(
            interviewQuestions[questionIndex].question,
            transcriptionResult,
            interviewJob
          );
        }
        
        // Atualizar pergunta com transcrição e análise
        const updatedQuestions = [...interviewQuestions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          answered: true,
          transcription: transcriptionResult,
          analysis: analysisResult.success ? analysisResult.analysis : null,
          faceData: faceAnalysisData, // Armazenar dados faciais para relatório final
          videoBlob: videoBlob
        };
        
        setInterviewQuestions(updatedQuestions);
        
        if (analysisResult.success) {
          const faceInfo = faceAnalysisData.length > 0 ? 
            `\n\nAnálise comportamental: ${faceAnalysisData.length} pontos coletados` : 
            '\n\nAnálise apenas textual (sem dados comportamentais)';
          
          console.log(`✅ Resposta processada com IA! Transcrição: "${transcriptionResult.transcription.substring(0, 80)}..." Pontuação: ${analysisResult.analysis.score}/10${faceInfo}`);
        } else {
          console.warn(`⚠️ Resposta transcrita mas não analisada. Transcrição: "${transcriptionResult.transcription.substring(0, 80)}..."`);
        }
      } else {
        console.error(`❌ Erro na transcrição: ${transcriptionResult.error}`);
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
        
        // Fechar modal
        setShowInterviewModal(false);
        setInterviewQuestions([]);
        setCurrentQuestion(0);
        setInterviewJob(null);
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
              <Button
                onClick={async () => {
                  const result = await coresignalService.testApiKey();
                  if (result.success) {
                    console.log(`✅ ${result.message} Teste realizado com sucesso! API Coresignal funcionando corretamente.`);
                  } else {
                    console.error(`❌ ${result.error} Verifique a API Key do Coresignal.`);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Testar Coresignal API
              </Button>
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
                              {(() => {
                                const buttonContent = getSearchButtonContent(job.id);
                                return (
                                  <Button
                                    onClick={() => handleLinkedInSearch(job.id)}
                                    disabled={searchLoading}
                                    className={buttonContent.className}
                                  >
                                    {buttonContent.icon}
                                    {buttonContent.text}
                                  </Button>
                                );
                              })()}
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
      </div>
    </>
  );
};

export default RecrutamentoPage;


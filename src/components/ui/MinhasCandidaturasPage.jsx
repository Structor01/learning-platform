// src/components/ui/MinhasCandidaturasPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Calendar,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText, Loader, Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "../utils/api";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button.jsx";
import interviewService from "@/services/interviewService.js";
import InterviewModal from "@/components/ui/InterviewModal";
import InterviewButton from "@/components/ui/InterviewButton";

const MinhasCandidaturasPage = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();

  // Estados para Entrevista
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewJob, setInterviewJob] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Buscar candidaturas quando usuário carregado
  useEffect(() => {
    if (isAuthenticated && user?.id && !isLoading) {
      fetchCandidaturas();
    }
  }, [isAuthenticated, user, isLoading]);

  // ✅ FUNÇÃO ASYNC CORRIGIDA
  const fetchCandidaturas = async () => {
    if (!user?.id) {
      setError("Usuário não encontrado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Buscando candidaturas para usuário ID:", user.id);

      const response = await axios.get(
        `${API_URL}/api/candidaturas/usuario/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("📋 Candidaturas recebidas:", response.data);
      console.log("📊 Primeira candidatura (exemplo):", response.data[0]);

      setCandidaturas(response.data);
    } catch (err) {
      console.error("Erro ao buscar candidaturas:", err);
      console.error(
        "URL tentada:",
        `${API_URL}/api/candidaturas/usuario/${user.id}`
      );
      setError("Erro ao carregar suas candidaturas. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
        user.name, // Nome será coletado no modal
        user.email, // Email será coletado no modal
        user.id // user_id fictício - será substituído por sistema de login real
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

  // ✅ FUNÇÃO ASYNC PARA BUSCAR EMPRESA
  const buscarEmpresa = async (candidatura) => {
    try {
      console.log(
        "🔍 Iniciando busca da empresa para candidatura:",
        candidatura
      );

      // Primeira tentativa: buscar dados completos da vaga
      try {
        console.log("📄 Buscando dados da vaga ID:", candidatura.vaga_id);
        const vagaResponse = await axios.get(
          `${API_URL}/api/vagas/${candidatura.vaga_id}`
        );
        console.log("✅ Dados da vaga:", vagaResponse.data);

        const empresaId = vagaResponse.data.company_id;
        if (empresaId) {
          console.log("🏢 Empresa ID encontrado na vaga:", empresaId);
          navigate(`/empresa/${empresaId}`);
          return;
        }
      } catch (vagaError) {
        console.log(
          "⚠️ Não foi possível buscar vaga, tentando por nome da empresa..."
        );
      }

      // Segunda tentativa: buscar empresa por nome
      const nomeEmpresa = candidatura.vaga?.empresa;
      if (nomeEmpresa) {
        console.log("🔎 Buscando empresa por nome:", nomeEmpresa);

        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        console.log("📋 Empresas disponíveis:", empresasResponse.data);

        // Buscar empresa com nome exato ou similar
        const empresa = empresasResponse.data.find((emp) => {
          const nomeEmpresaLower = nomeEmpresa.toLowerCase().trim();
          const nomeEmpBusca = emp.name?.toLowerCase().trim();

          // Busca exata
          if (nomeEmpBusca === nomeEmpresaLower) return true;

          // Busca parcial (contém)
          if (
            nomeEmpBusca?.includes(nomeEmpresaLower) ||
            nomeEmpresaLower.includes(nomeEmpBusca)
          )
            return true;

          return false;
        });

        if (empresa) {
          console.log("✅ Empresa encontrada por nome:", empresa);
          navigate(`/empresa/${empresa.id}`);
        } else {
          console.log("❌ Empresa não encontrada na lista");
          alert(`❌ Empresa "${nomeEmpresa}" não encontrada na base de dados.`);
        }
      } else {
        alert("❌ Nome da empresa não disponível nos dados da candidatura.");
      }
    } catch (error) {
      console.error("❌ Erro geral ao buscar empresa:", error);
      alert("❌ Erro ao buscar dados da empresa. Tente novamente.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "aprovado":
      case "aprovada":
        return "bg-green-100 text-green-800 border-green-200";
      case "reprovado":
      case "reprovada":
        return "bg-red-100 text-red-800 border-red-200";
      case "em_analise":
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "aprovado":
      case "aprovada":
        return <CheckCircle className="w-4 h-4" />;
      case "reprovado":
      case "reprovada":
        return <XCircle className="w-4 h-4" />;
      case "em_analise":
      case "pendente":
        return <Hourglass className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Mostrar loading durante verificação de autenticação
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          currentView="candidaturas"
          onViewChange={(view) => console.log("View changed:", view)}
          onAddTrilha={() => console.log("Add trilha")}
        />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-8 w-16 h-16">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Carregando candidaturas
            </h3>
            <p className="text-gray-400">Buscando suas candidaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar
        currentView="candidaturas"
        onViewChange={(view) => console.log("View changed:", view)}
        onAddTrilha={() => console.log("Add trilha")}
      />

      {/* Content */}
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur border-gray-800 shadow-lg border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/vagas")}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                      Minhas Candidaturas
                    </h1>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Acompanhe o status das suas candidaturas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {user?.name || "Usuário"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {candidaturas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Nenhuma candidatura encontrada
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Você ainda não se candidatou a nenhuma vaga. Explore as
                oportunidades disponíveis e encontre a vaga ideal para você!
              </p>
              <button
                onClick={() => navigate("/vagas")}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Ver Vagas Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {candidaturas.length} candidatura
                  {candidaturas.length !== 1 ? "s" : ""} encontrada
                  {candidaturas.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="grid gap-6">
                {candidaturas.map((candidatura) => (
                  <div
                    key={candidatura.id}
                    className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-gray-700 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header da candidatura */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex-shrink-0">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1">
                                {candidatura.vaga?.title}
                              </h3>
                              <p className="text-lg text-orange-400 font-semibold mb-2">
                                {candidatura.vaga?.company}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-orange-500" />
                                  <span>
                                    {candidatura.vaga?.location}-{candidatura.vaga?.state}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {candidatura.vaga?.modalidade || "CLT"}
                                  </span>
                                </div>
                                {/* Remuneração */}
                                {candidatura.vaga?.salary_range && (
                                  <div className="flex items-center gap-2">
                                    <div className="inline-block bg-green-900/30 border border-green-700/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                                      💰 {candidatura.vaga.salary_range}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descrição da vaga */}
                      {candidatura.vaga?.description && (
                        <div className="m-3">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {candidatura.vaga.description.length > 200
                              ? `${candidatura.vaga.description.substring(
                                0,
                                200
                              )}...`
                              : candidatura.vaga.description}
                          </p>
                        </div>
                      )}

                      {/* Footer com ações */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">
                            ID da candidatura: #{candidatura.id}
                          </div>
                          
                          <button
                            onClick={() => buscarEmpresa(candidatura)}
                            className="flex items-center gap-2 px-4 py-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            Ver empresa
                          </button>
                        </div>

                        {/* Botão Fazer Entrevista */}
                        <div className="flex-shrink-0">
                          <InterviewButton
                            job={candidatura.vaga}
                            variant="default"
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            buttonText="Fazer Entrevista"
                            onInterviewStart={(jobData) => {
                              console.log('🎬 Entrevista iniciada para candidatura:', candidatura.id, 'vaga:', jobData.title);
                            }}
                            onInterviewComplete={(interviewId, jobData) => {
                              console.log('✅ Entrevista concluída:', interviewId, 'para candidatura:', candidatura.id);
                              // Opcional: atualizar status da candidatura
                              fetchCandidaturas(); // Recarregar candidaturas
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      </div>
    </div>


  );
};

export default MinhasCandidaturasPage;

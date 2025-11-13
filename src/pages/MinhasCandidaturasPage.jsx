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
  FileText,
  Loader,
  Video,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "../components/utils/api";
import Navbar from "../components/ui/Navbar";
import { Button } from "@/components/ui/button.jsx";
import interviewService from "@/services/interviewService.js";
import InterviewModal from "@/components/ui/InterviewModal";
import InterviewRequirementsModal from "@/components/ui/InterviewRequirementsModal";
import { useInterviewValidation } from "@/hooks/useInterviewValidation";

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

  // Estado para card de confirmação
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para validação de requisitos
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [pendingCandidatura, setPendingCandidatura] = useState(null);

  // Hook de validação dos requisitos
  const {
    validateInterviewRequirements,
    isValidating,
    validationResult,
    setValidationResult
  } = useInterviewValidation();

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
      ("🔍 Buscando candidaturas para usuário ID:", user.id);

      const response = await axios.get(
        `${API_URL}/api/candidaturas/usuario/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      ("📋 Candidaturas recebidas:", response.data);
      ("📊 Primeira candidatura (exemplo):", response.data[0]);

      let candidaturas = response.data;

      // Buscar entrevistas para cada candidatura
      for (const candidatura of candidaturas) {
        try {
          // Primeiro tentar buscar por candidatura_id
          let interviewData = await interviewService.getCandidaturaInterviews(candidatura.id);

          // Se não encontrar por candidatura_id, buscar por user_id + vaga_id
          if (!interviewData.success || !interviewData.interviews || interviewData.interviews.length === 0) {
            (`🔍 Buscando entrevistas por user_id para candidatura ${candidatura.id}...`);
            const userInterviews = await interviewService.getUserInterviews(user.id);

            if (userInterviews.success && userInterviews.interviews) {
              // Filtrar entrevistas pela vaga da candidatura
              const filteredInterviews = userInterviews.interviews.filter(interview =>
                interview.job_id && candidatura.vaga_id &&
                parseInt(interview.job_id) === parseInt(candidatura.vaga_id)
              );

              interviewData = {
                success: true,
                interviews: filteredInterviews
              };

              (`📊 Encontradas ${filteredInterviews.length} entrevistas por user_id para candidatura ${candidatura.id}`);
            }
          }

          if (interviewData.success && interviewData.interviews && Array.isArray(interviewData.interviews)) {
            // Ordenar por data (mais recente primeiro)
            const entrevistasOrdenadas = interviewData.interviews.sort((a, b) =>
              new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );

            candidatura.entrevistas = entrevistasOrdenadas;
            candidatura.temEntrevista = entrevistasOrdenadas.length > 0;
            candidatura.entrevistaCompleta = entrevistasOrdenadas.some(e => e.status === 'completed');

            (`📊 Candidatura ${candidatura.id}: ${entrevistasOrdenadas.length} entrevistas encontradas`);
          } else {
            candidatura.entrevistas = [];
            candidatura.temEntrevista = false;
            candidatura.entrevistaCompleta = false;
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar entrevistas para candidatura ${candidatura.id}:`, error);
          candidatura.entrevistas = [];
          candidatura.temEntrevista = false;
          candidatura.entrevistaCompleta = false;
        }
      }

      setCandidaturas(candidaturas);
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

  // Função para validar requisitos antes de iniciar entrevista
  const handleInterviewValidation = async (candidatura) => {
    ('🔍 MinhasCandidaturasPage - Validando requisitos para entrevista...');

    try {
      const validation = await validateInterviewRequirements();

      if (!validation.isValid) {
        ('❌ Requisitos não atendidos:', validation.missingRequirements);
        setPendingCandidatura(candidatura);
        setShowRequirementsModal(true);
        return false;
      }

      ('✅ Todos os requisitos atendidos, iniciando entrevista...');
      return true;
    } catch (error) {
      console.error('❌ Erro na validação dos requisitos:', error);
      return false;
    }
  };

  // Função para revalidar requisitos
  const handleRetryValidation = async () => {
    try {
      ('🔄 Revalidando requisitos...');
      const validation = await validateInterviewRequirements();

      if (validation.isValid) {
        ('✅ Requisitos agora estão completos!');
        setShowRequirementsModal(false);

        // Iniciar entrevista com a candidatura pendente
        if (pendingCandidatura) {
          handleStartInterview(pendingCandidatura);
          setPendingCandidatura(null);
        }
      }
    } catch (error) {
      console.error('❌ Erro na revalidação:', error);
    }
  };

  // Função para iniciar entrevista (chamada após validação bem-sucedida)
  const handleStartInterview = async (candidatura) => {
    try {
      setGeneratingQuestions(true);
      setInterviewJob(candidatura.vaga || candidatura);
      setShowInterviewModal(true);

      // Verificar se backend está disponível
      const backendHealth = await interviewService.checkBackendHealth();
      if (!backendHealth) {
        console.error('❌ Backend não está disponível');
        alert('❌ Servidor não está disponível. Verifique se o backend está rodando.');
        return;
      }

      ('✅ Backend disponível, criando entrevista...');

      // Criar entrevista no backend COM candidatura_id
      const createResult = await interviewService.createInterview(
        candidatura.vaga_id || candidatura.id,
        user.name, // Nome do usuário
        user.email, // Email do usuário
        user.id, // user_id
        candidatura.id // candidatura_id - IMPORTANTE!
      );

      if (createResult.success) {
        const interviewId = createResult.interview.id;
        setCurrentInterviewId(interviewId);

        (`✅ Entrevista criada com sucesso! ID: ${interviewId}`);
        (`📋 Dados da entrevista:`, createResult.interview);

        // Usar perguntas do backend da entrevista criada
        const backendQuestions = createResult.interview.questions || [];

        (`📝 Perguntas do backend: ${backendQuestions.length}`);

        // Converter perguntas do backend para formato do frontend
        const formattedQuestions = backendQuestions.map((q, index) => ({
          id: q.id,
          question: q.title,
          answered: false,
          order: q.order || (index + 1)
        }));

        // Ordenar por order para garantir sequência correta
        formattedQuestions.sort((a, b) => a.order - b.order);

        (`📝 Perguntas formatadas:`, formattedQuestions.map(q => `${q.order}: ${q.question.substring(0, 50)}...`));

        setInterviewQuestions(formattedQuestions);
        setCurrentQuestion(0);

        (`✅ Entrevista criada! ID: ${createResult.interview.id}. ${formattedQuestions.length} perguntas preparadas. Clique em "Iniciar Gravação" para começar.`);
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
      if (!currentInterviewId) {
        console.error('❌ Nenhuma entrevista ativa para finalizar');
        return;
      }

      const answeredQuestions = interviewQuestions.filter(q => q.answered);

      if (answeredQuestions.length === 0) {
        console.warn('⚠️ Nenhuma pergunta foi respondida. Responda pelo menos uma pergunta antes de finalizar.');
        return;
      }

      (`🏁 Finalizando entrevista ${currentInterviewId}...`);

      // Finalizar entrevista no backend
      const finishResult = await interviewService.finishInterview(currentInterviewId);

      if (finishResult.success) {
        (`✅ Entrevista ${currentInterviewId} finalizada com sucesso!`);

        // Reset states
        setCurrentInterviewId(null);
        setInterviewJob(null);
        setInterviewQuestions([]);
        setCurrentQuestion(0);

        // Fechar modal
        setShowInterviewModal(false);

        // Recarregar mais rapidamente
        setTimeout(async () => {
          ('🔄 Recarregando candidaturas após entrevista...');
          // Recarregar candidaturas para mostrar status atualizado
          await fetchCandidaturas();
        }, 1000);

        // Mostrar card de sucesso
        setSuccessMessage(`Entrevista finalizada com sucesso! ${answeredQuestions.length} perguntas respondidas.`);
        setShowSuccessCard(true);

        // Auto-fechar o card após 5 segundos
        setTimeout(() => {
          setShowSuccessCard(false);
          setSuccessMessage("");
        }, 5000);

      } else {
        console.error(`❌ Erro ao finalizar entrevista: ${finishResult.error}`);
        setSuccessMessage(`Erro ao finalizar entrevista: ${finishResult.error}`);
        setShowSuccessCard(true);

        setTimeout(() => {
          setShowSuccessCard(false);
          setSuccessMessage("");
        }, 5000);
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
        console.error('❌ currentInterviewId:', currentInterviewId);
        throw new Error('Nenhuma entrevista ativa encontrada');
      }

      (`🎬 Processando resposta da pergunta ${questionIndex + 1}`);
      (`📋 Entrevista ID: ${currentInterviewId}`);
      (`📦 Video blob - Tamanho: ${videoBlob?.size} bytes, Tipo: ${videoBlob?.type}`);
      (`🧠 Dados faciais: ${faceAnalysisData?.length} pontos`);

      // Verificar se o blob é válido
      if (!videoBlob || videoBlob.size === 0) {
        console.error('❌ VideoBlob inválido:', videoBlob);
        throw new Error('Vídeo gravado está vazio ou inválido');
      }

      // Obter order da pergunta atual (backend usa order, não index)
      const currentQuestionData = interviewQuestions[questionIndex];
      const questionOrder = currentQuestionData?.order || (questionIndex + 1);

      (`📊 Pergunta ${questionIndex + 1}: ID=${currentQuestionData?.id}, Order=${questionOrder}`);

      // Upload do vídeo para o backend com processamento IA
      const uploadResult = await interviewService.uploadVideoResponse(
        currentInterviewId,
        questionOrder, // Usar order correto do backend
        videoBlob,
        faceAnalysisData
      );

      if (!uploadResult.success) {
        console.error(`❌ Erro no upload: ${uploadResult.error}`);
        return;
      }

      // Aguardar processamento IA no backend
      (`🔄 Aguardando processamento IA para resposta ${uploadResult.responseId}...`);

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

        (`✅ Resposta processada com IA no backend! Transcrição: "${processingResult.transcription?.substring(0, 80)}..." Pontuação: ${processingResult.analysisScore}/10${faceInfo}`);
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

      (`✅ PDF gerado com sucesso: ${fileName}`);
      return { success: true, fileName };

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ FUNÇÃO ASYNC PARA BUSCAR EMPRESA
  const buscarEmpresa = async (candidatura) => {
    try {
      (
        "🔍 Iniciando busca da empresa para candidatura:",
        candidatura
      );

      // Primeira tentativa: buscar dados completos da vaga
      try {
        ("📄 Buscando dados da vaga ID:", candidatura.vaga_id);
        const vagaResponse = await axios.get(
          `${API_URL}/api/vagas/${candidatura.vaga_id}`
        );
        ("✅ Dados da vaga:", vagaResponse.data);

        const empresaId = vagaResponse.data.company_id;
        if (empresaId) {
          ("🏢 Empresa ID encontrado na vaga:", empresaId);
          navigate(`/empresa/${empresaId}`);
          return;
        }
      } catch (vagaError) {
        (
          "⚠️ Não foi possível buscar vaga, tentando por nome da empresa..."
        );
      }

      // Segunda tentativa: buscar empresa por nome
      const nomeEmpresa = candidatura.vaga?.empresa;
      if (nomeEmpresa) {
        ("🔎 Buscando empresa por nome:", nomeEmpresa);

        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        ("📋 Empresas disponíveis:", empresasResponse.data);

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
          ("✅ Empresa encontrada por nome:", empresa);
          navigate(`/empresa/${empresa.id}`);
        } else {
          ("❌ Empresa não encontrada na lista");
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
      <div className="min-h-screen bg-white">
        <Navbar
          currentView="candidaturas"
          onViewChange={(view) => ("View changed:", view)}
          onAddTrilha={() => ("Add trilha")}
        />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-8 w-16 h-16">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Carregando candidaturas
            </h3>
            <p className="text-gray-600">Buscando suas candidaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar
        currentView="candidaturas"
        onViewChange={(view) => ("View changed:", view)}
        onAddTrilha={() => ("Add trilha")}
      />

      {/* Content */}
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gray-50/80 backdrop-blur border-gray-200 shadow-lg border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/vagas")}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black transition-colors bg-gray-100 backdrop-blur-sm rounded-xl border border-gray-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-black">
                      Minhas Candidaturas
                    </h1>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Acompanhe o status das suas candidaturas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-100 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-black font-medium">
                  {user?.name || "Usuário"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {candidaturas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">
                Nenhuma candidatura encontrada
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Você ainda não se candidatou a nenhuma vaga. Explore as
                oportunidades disponíveis e encontre a vaga ideal para você!
              </p>
              <button
                onClick={() => navigate("/vagas")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Ver Vagas Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">
                  {candidaturas.length} candidatura
                  {candidaturas.length !== 1 ? "s" : ""} encontrada
                  {candidaturas.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="grid gap-6">
                {candidaturas.map((candidatura) => (
                  <div
                    key={candidatura.id}
                    className="bg-white border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-gray-300 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header da candidatura */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-xl flex-shrink-0">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-black mb-1">
                                {candidatura.vaga?.title}
                              </h3>
                              <p className="text-lg text-green-600 font-semibold mb-2">
                                {candidatura.vaga?.company}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                  <span>
                                    {candidatura.vaga?.location}-{candidatura.vaga?.state}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  <span>
                                    {candidatura.vaga?.modalidade || "CLT"}
                                  </span>
                                </div>
                                {/* Remuneração */}
                                {candidatura.vaga?.salary_range && (
                                  <div className="flex items-center gap-2">
                                    <div className="inline-block bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
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
                          <p className="text-gray-700 text-sm leading-relaxed">
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
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">
                            ID da candidatura: #{candidatura.id}
                          </div>

                          <button
                            onClick={() => buscarEmpresa(candidatura)}
                            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            Ver empresa
                          </button>
                        </div>

                        {/* Botão Fazer Entrevista */}
                        <div className="flex-shrink-0">
                          {candidatura.entrevistaCompleta ? (
                            <Button
                              disabled
                              size="sm"
                              className="bg-green-600 text-white cursor-not-allowed"
                            >
                              ✅ Entrevista Realizada
                            </Button>
                          ) : (
                            <Button
                              onClick={async () => {
                                const isValid = await handleInterviewValidation(candidatura);
                                if (isValid) {
                                  handleStartInterview(candidatura);
                                }
                              }}
                              size="sm"
                              disabled={isValidating}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {isValidating ? (
                                <>
                                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                                  Validando...
                                </>
                              ) : (
                                "🎥 Fazer Entrevista"
                              )}
                            </Button>
                          )}
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
            currentInterviewId={currentInterviewId}
          />

          {/* Modal de Requisitos para Entrevista */}
          <InterviewRequirementsModal
            isOpen={showRequirementsModal}
            onClose={() => {
              setShowRequirementsModal(false);
              setValidationResult(null);
              setPendingCandidatura(null);
            }}
            validationResult={validationResult}
            onRetry={handleRetryValidation}
          />
        </div>
      </div>

      {/* Card de Confirmação de Entrevista Finalizada */}
      {showSuccessCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${successMessage.includes('Erro') ? 'bg-red-100' : 'bg-green-100'}`}>
                  {successMessage.includes('Erro') ? (
                    <XCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">
                    {successMessage.includes('Erro') ? 'Erro na Entrevista' : 'Entrevista Finalizada'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {successMessage.includes('Erro') ? 'Ocorreu um problema' : 'Processo concluído com sucesso'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSuccessCard(false);
                  setSuccessMessage("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <div className={`p-4 rounded-lg border ${successMessage.includes('Erro')
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
                }`}>
                <p className={`text-sm ${successMessage.includes('Erro') ? 'text-red-700' : 'text-green-700'
                  }`}>
                  {successMessage}
                </p>
              </div>

              {!successMessage.includes('Erro') && (
                <div className="mt-4 text-center">
                  <div className="text-gray-600 text-sm mb-3">
                    Suas respostas estão sendo processadas e analisadas por IA.
                    O status da sua candidatura será atualizado em breve.
                  </div>
                  <div className="flex items-center justify-center gap-2 text-blue-600 text-xs">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>Processando análise...</span>
                  </div>
                </div>
              )}

              {/* Botão de fechamento */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowSuccessCard(false);
                    setSuccessMessage("");
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${successMessage.includes('Erro')
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {successMessage.includes('Erro') ? 'Entendi' : 'Perfeito!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default MinhasCandidaturasPage;

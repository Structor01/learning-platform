import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Download,
  Star,
  Clock,
  User,
  FileText,
  TrendingUp,
  Award,
  MessageSquare,
  ArrowRight,
  Home,
  RefreshCw
} from 'lucide-react';

const InterviewCompletionPage = ({
  interviewData,
  onDownloadPDF,
  onReturnHome,
  onStartNewInterview
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Dados mock se não fornecidos
  const defaultData = {
    candidateName: 'Candidato',
    jobTitle: 'Vaga de Emprego',
    completedQuestions: 5,
    totalQuestions: 5,
    averageScore: 7.8,
    duration: '12 minutos',
    status: 'completed',
    feedback: {
      strengths: ['Comunicação clara', 'Experiência relevante', 'Motivação evidente'],
      improvements: ['Desenvolver habilidades técnicas', 'Ampliar conhecimento do setor'],
      recommendation: 'Candidato recomendado para próxima fase'
    }
  };

  const data = { ...defaultData, ...interviewData };

  // Calcular porcentagem de conclusão
  const completionPercentage = (data.completedQuestions / data.totalQuestions) * 100;

  // Determinar cor do score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Determinar cor de fundo do score
  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Gerar PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      if (onDownloadPDF) {
        await onDownloadPDF();
      } else {
        // Simular geração de PDF
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('PDF gerado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Animações
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header de Sucesso */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Entrevista Concluída com Sucesso!
          </h1>
          <p className="text-lg text-gray-600">
            Obrigado por participar, {data.candidateName}. Sua entrevista foi processada e analisada.
          </p>
        </motion.div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Geral */}
          <motion.div
            className={`${getScoreBgColor(data.averageScore)} rounded-xl p-6 text-center`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center mb-3">
              <Star className={`w-8 h-8 ${getScoreColor(data.averageScore)}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {data.averageScore.toFixed(1)}/10
            </h3>
            <p className="text-sm text-gray-600">Score Médio</p>
          </motion.div>

          {/* Progresso */}
          <motion.div
            className="bg-blue-100 rounded-xl p-6 text-center"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {completionPercentage.toFixed(0)}%
            </h3>
            <p className="text-sm text-gray-600">
              {data.completedQuestions}/{data.totalQuestions} Perguntas
            </p>
          </motion.div>

          {/* Duração */}
          <motion.div
            className="bg-purple-100 rounded-xl p-6 text-center"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {data.duration}
            </h3>
            <p className="text-sm text-gray-600">Duração Total</p>
          </motion.div>
        </div>

        {/* Feedback Resumido */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Feedback da Entrevista
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Pontos Fortes
              </h3>
              <ul className="space-y-2">
                {data.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Áreas de Melhoria */}
            <div>
              <h3 className="text-lg font-medium text-orange-700 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Oportunidades de Melhoria
              </h3>
              <ul className="space-y-2">
                {data.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recomendação */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Recomendação Final
            </h3>
            <p className="text-blue-800">{data.feedback.recommendation}</p>
          </div>

          {/* Botão para Ver Detalhes */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {showDetails ? 'Ocultar Detalhes' : 'Ver Análise Detalhada'}
            </button>
          </div>

          {/* Detalhes Expandidos */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <h4 className="font-medium text-gray-900 mb-2">Análise por Pergunta:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Pergunta 1: Experiência profissional - Score: 8.2/10</p>
                <p>• Pergunta 2: Motivação para a vaga - Score: 7.8/10</p>
                <p>• Pergunta 3: Habilidades técnicas - Score: 7.5/10</p>
                <p>• Pergunta 4: Trabalho em equipe - Score: 8.0/10</p>
                <p>• Pergunta 5: Objetivos de carreira - Score: 7.5/10</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Ações Principais */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          {/* Botão Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
          >
            {isGeneratingPDF ? (
              <>
                <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-3" />
                Baixar Relatório Completo (PDF)
              </>
            )}
          </button>

          {/* Botão Nova Entrevista */}
          <button
            onClick={onStartNewInterview}
            className="flex items-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-3" />
            Nova Entrevista
          </button>

          {/* Botão Voltar ao Início */}
          <button
            onClick={onReturnHome}
            className="flex items-center px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-3" />
            Voltar ao Início
          </button>
        </motion.div>

        {/* Informações Adicionais */}
        <motion.div
          className="mt-8 text-center text-gray-500 text-sm"
          variants={itemVariants}
        >
          <p>
            Sua entrevista foi salva e será analisada pela equipe de recrutamento.
            <br />
            Você receberá um retorno em até 5 dias úteis.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InterviewCompletionPage;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader } from 'lucide-react';
import InterviewModal from './InterviewModal';
import interviewService from '@/services/interviewService';
import { useAuth } from '@/contexts/AuthContext';

const InterviewButton = ({ 
  job, 
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
  buttonText = "Fazer Entrevista",
  onInterviewStart,
  onInterviewComplete
}) => {
  const { user } = useAuth();
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewJob, setInterviewJob] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Função para iniciar entrevista
  const handleStartInterview = async (jobData) => {
    try {
      setGeneratingQuestions(true);
      setInterviewJob(jobData);
      setShowInterviewModal(true);
      
      // Callback opcional quando entrevista inicia
      if (onInterviewStart) {
        onInterviewStart(jobData);
      }
      
      // Criar entrevista no backend
      const createResult = await interviewService.createInterview(
        jobData.id, 
        user?.name || 'Candidato', 
        user?.email || 'candidato@email.com',
        user?.id || 1
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
            question: `Como você se vê contribuindo para o crescimento da ${jobData.company || jobData.empresa}?`,
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
        
        console.log(`✅ Entrevista criada! ID: ${createResult.interview.id}. ${defaultQuestions.length} perguntas preparadas.`);
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

  // Função para processar vídeo da resposta
  const handleVideoResponse = async (videoBlob, questionIndex, faceAnalysisData = []) => {
    if (!currentInterviewId) {
      console.error('❌ ID da entrevista não encontrado');
      return;
    }

    try {
      console.log(`📹 Processando resposta da pergunta ${questionIndex + 1}...`);
      
      const result = await interviewService.submitVideoResponse(
        currentInterviewId,
        questionIndex,
        videoBlob,
        faceAnalysisData
      );

      if (result.success) {
        console.log(`✅ Resposta ${questionIndex + 1} enviada com sucesso!`);
        
        // Marcar pergunta como respondida
        setInterviewQuestions(prev => 
          prev.map((q, idx) => 
            idx === questionIndex ? { ...q, answered: true } : q
          )
        );
      } else {
        throw new Error(result.error || 'Erro ao enviar resposta');
      }

    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      alert('❌ Erro ao enviar resposta. Tente novamente.');
    }
  };

  // Função para finalizar entrevista
  const handleFinishInterview = async () => {
    if (!currentInterviewId) {
      console.error('❌ ID da entrevista não encontrado');
      return;
    }

    try {
      console.log('🏁 Finalizando entrevista...');
      
      const result = await interviewService.completeInterview(currentInterviewId);
      
      if (result.success) {
        console.log('✅ Entrevista finalizada com sucesso!');
        alert('🎉 Entrevista concluída! Obrigado pela participação.');
        
        // Callback opcional quando entrevista completa
        if (onInterviewComplete) {
          onInterviewComplete(currentInterviewId, interviewJob);
        }
        
        setShowInterviewModal(false);
        
        // Reset states
        setInterviewJob(null);
        setInterviewQuestions([]);
        setCurrentInterviewId(null);
        setCurrentQuestion(0);
      } else {
        throw new Error(result.error || 'Erro ao finalizar entrevista');
      }

    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
      alert('❌ Erro ao finalizar entrevista. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowInterviewModal(false);
    setInterviewJob(null);
    setInterviewQuestions([]);
    setCurrentInterviewId(null);
    setCurrentQuestion(0);
    setGeneratingQuestions(false);
  };

  return (
    <>
      <Button
        onClick={() => handleStartInterview(job)}
        disabled={generatingQuestions}
        variant={variant}
        size={size}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {generatingQuestions ? (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Video className="h-4 w-4 mr-2" />
        )}
        {generatingQuestions ? 'Preparando...' : buttonText}
      </Button>

      <InterviewModal
        isOpen={showInterviewModal}
        onClose={handleCloseModal}
        job={interviewJob}
        questions={interviewQuestions}
        onVideoResponse={handleVideoResponse}
        onFinishInterview={handleFinishInterview}
        generatingQuestions={generatingQuestions}
      />
    </>
  );
};

export default InterviewButton;


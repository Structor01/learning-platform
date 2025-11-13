import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader, ExternalLink, Shield } from 'lucide-react';
import { useInterviewValidation } from '@/hooks/useInterviewValidation';
import InterviewRequirementsModal from './InterviewRequirementsModal';

const InterviewButton = ({
  job,
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
  buttonText = "Fazer Entrevista",
  candidaturaId = null,
  onInterviewStart,
  onInterviewComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  // Hook de validação dos requisitos
  const {
    validateInterviewRequirements,
    isValidating,
    validationResult,
    setValidationResult
  } = useInterviewValidation();

  // Função para validar requisitos e iniciar entrevista
  const handleStartInterview = async () => {
    ('🚀 InterviewButton - handleStartInterview chamado');

    if (!job) {
      console.error('❌ Dados da vaga não encontrados');
      return;
    }

    try {
      setLoading(true);
      ('⏳ Loading definido como true');

      ('🔍 Iniciando validação de requisitos para entrevista...');

      // Validar requisitos antes de prosseguir
      const validation = await validateInterviewRequirements();

      if (!validation.isValid) {
        ('❌ Requisitos não atendidos:', validation.missingRequirements);
        setShowRequirementsModal(true);
        return;
      }

      ('✅ Todos os requisitos atendidos, iniciando entrevista...');

      // Callback opcional quando entrevista inicia
      if (onInterviewStart) {
        onInterviewStart(job);
      }

      // Preparar dados para passar via URL
      const jobData = encodeURIComponent(JSON.stringify(job));
      let interviewUrl = `/entrevista?job=${jobData}`;

      // Adicionar ID da candidatura se disponível
      if (candidaturaId) {
        interviewUrl += `&candidatura=${candidaturaId}`;
      }

      // Abrir em nova aba
      const newWindow = window.open(interviewUrl, '_blank');

      if (!newWindow) {
        // Fallback se popup foi bloqueado
        console.warn('⚠️ Popup bloqueado, redirecionando na mesma aba');
        window.location.href = interviewUrl;
      } else {

        // Opcional: escutar quando a aba é fechada
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);

            // Callback opcional quando entrevista é fechada/completa
            if (onInterviewComplete) {
              onInterviewComplete(null, job);
            }
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao abrir entrevista:', error);
      alert('❌ Erro ao abrir entrevista. Tente novamente.');
    } finally {
      setLoading(false);
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
        // Opcional: iniciar entrevista automaticamente
        // handleStartInterview();
      }
    } catch (error) {
      console.error('❌ Erro na revalidação:', error);
    }
  };

  const isProcessing = loading || isValidating;

  return (
    <>
      <Button
        onClick={handleStartInterview}
        disabled={isProcessing}
        variant={variant}
        size={size}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {isProcessing ? (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Video className="h-4 w-4 mr-2" />
        )}
        {isProcessing
          ? isValidating ? 'Validando...' : 'Abrindo...'
          : buttonText
        }
        {!isProcessing && <ExternalLink className="h-3 w-3 ml-2 opacity-70" />}
      </Button>

      {/* Modal de Requisitos */}
      <InterviewRequirementsModal
        isOpen={showRequirementsModal}
        onClose={() => {
          setShowRequirementsModal(false);
          setValidationResult(null);
        }}
        validationResult={validationResult}
        onRetry={handleRetryValidation}
      />
    </>
  );
};

export default InterviewButton;


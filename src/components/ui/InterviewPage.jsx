import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Video, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  Building,
  MapPin,
  Briefcase,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InterviewModal from './InterviewModal';
import interviewService from '@/services/interviewService';
import { useAuth } from '@/contexts/AuthContext';

const InterviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Estados da página
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [candidaturaId, setCandidaturaId] = useState(null);

  // Estados da entrevista
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Carregar dados da vaga ao montar componente
  useEffect(() => {
    loadJobData();
  }, []);

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter dados dos parâmetros da URL
      const jobDataParam = searchParams.get('job');
      const candidaturaIdParam = searchParams.get('candidatura');

      if (!jobDataParam) {
        throw new Error('Dados da vaga não encontrados');
      }

      // Decodificar dados da vaga
      const decodedJobData = JSON.parse(decodeURIComponent(jobDataParam));
      setJobData(decodedJobData);
      
      if (candidaturaIdParam) {
        setCandidaturaId(candidaturaIdParam);
      }

      console.log('📋 Dados da vaga carregados:', decodedJobData);
      console.log('🎯 ID da candidatura:', candidaturaIdParam);

    } catch (error) {
      console.error('Erro ao carregar dados da vaga:', error);
      setError('Erro ao carregar dados da entrevista. Verifique se o link está correto.');
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar entrevista
  const handleStartInterview = async () => {
    if (!jobData || !user) {
      setError('Dados insuficientes para iniciar a entrevista');
      return;
    }

    try {
      setGeneratingQuestions(true);
      setShowInterviewModal(true);
      
      console.log('🎬 Iniciando entrevista para:', jobData.title);
      
      // Criar entrevista no backend
      const createResult = await interviewService.createInterview(
        jobData.id, 
        user?.name || 'Candidato', 
        user?.email || 'candidato@email.com',
        user?.id || 1
      );
      
      if (createResult.success) {
        setCurrentInterviewId(createResult.interview.id);
        
        // Usar perguntas padrão personalizadas para a vaga
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
        
        console.log(`✅ Entrevista criada! ID: ${createResult.interview.id}. ${defaultQuestions.length} perguntas preparadas.`);
      } else {
        throw new Error(createResult.error || 'Erro ao criar entrevista');
      }
      
    } catch (error) {
      console.error('Erro ao preparar entrevista:', error);
      setError('Erro ao preparar entrevista. Tente novamente.');
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
      
      // Usar uploadVideoResponse em vez de submitVideoResponse
      const result = await interviewService.uploadVideoResponse(
        currentInterviewId,
        questionIndex + 1, // Backend usa 1-based indexing
        videoBlob,
        faceAnalysisData
      );

      if (result.success) {
        console.log(`✅ Resposta ${questionIndex + 1} enviada com sucesso!`);
        
        // Aguardar processamento IA
        try {
          const processingResult = await interviewService.waitForProcessingCompletion(
            currentInterviewId,
            result.responseId,
            30, // 30 tentativas
            2000 // 2 segundos entre tentativas
          );

          if (processingResult.success) {
            console.log(`🤖 IA processou resposta ${questionIndex + 1}: Score ${processingResult.analysisScore}/10`);
          }
        } catch (processingError) {
          console.warn('⚠️ Processamento IA demorou mais que esperado:', processingError.message);
        }
        
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
      setError('Erro ao enviar resposta. Tente novamente.');
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
      
      // Usar finishInterview em vez de completeInterview
      const result = await interviewService.finishInterview(currentInterviewId);
      
      if (result.success) {
        console.log('✅ Entrevista finalizada com sucesso!');
        
        setInterviewCompleted(true);
        setCompletionData({
          interviewId: currentInterviewId,
          jobTitle: jobData.title,
          company: jobData.company || jobData.empresa,
          candidaturaId: candidaturaId,
          completedAt: new Date().toISOString()
        });
        
        setShowInterviewModal(false);
        
        // Reset states
        setCurrentInterviewId(null);
        setInterviewQuestions([]);
      } else {
        throw new Error(result.error || 'Erro ao finalizar entrevista');
      }

    } catch (error) {
      console.error('Erro ao finalizar entrevista:', error);
      setError('Erro ao finalizar entrevista. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setShowInterviewModal(false);
    setCurrentInterviewId(null);
    setInterviewQuestions([]);
    setGeneratingQuestions(false);
  };

  const handleGoBack = () => {
    // Fechar a aba atual
    window.close();
    
    // Fallback: se não conseguir fechar, navegar de volta
    setTimeout(() => {
      if (candidaturaId) {
        navigate('/minhas-candidaturas');
      } else {
        navigate('/recrutamento');
      }
    }, 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-400" />
          <h2 className="text-xl font-semibold text-white mb-2">Carregando entrevista...</h2>
          <p className="text-gray-400">Preparando ambiente para sua entrevista</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Erro ao carregar</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (entrevista concluída)
  if (interviewCompleted && completionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Entrevista Concluída!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Parabéns! Você concluiu com sucesso a entrevista para a vaga:
                </p>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-white">{completionData.jobTitle}</h3>
                  <p className="text-purple-400">{completionData.company}</p>
                </div>
                <p className="text-sm text-gray-400">
                  Sua entrevista foi processada e enviada para análise. 
                  Você receberá um retorno em breve.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleGoBack} className="flex-1" variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Nova Entrevista
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main interview page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={handleGoBack} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Entrevista</span>
            </div>
            
            <Button 
              onClick={handleGoBack} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Job Info Card */}
          <Card className="bg-gray-800/80 backdrop-blur border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex-shrink-0">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {jobData?.title || jobData?.nome}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-4 w-4 text-purple-400" />
                    <span className="text-lg text-purple-400 font-medium">
                      {jobData?.company || jobData?.empresa}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {(jobData?.location || jobData?.cidade) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>
                          {jobData?.location || jobData?.cidade}
                          {(jobData?.state || jobData?.uf) && ` - ${jobData?.state || jobData?.uf}`}
                        </span>
                      </div>
                    )}
                    
                    {(jobData?.job_type || jobData?.modalidade) && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{jobData?.job_type || jobData?.modalidade}</span>
                      </div>
                    )}
                    
                    {candidaturaId && (
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        Candidatura #{candidaturaId}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {(jobData?.description || jobData?.descricao) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {(jobData?.description || jobData?.descricao).length > 300
                      ? `${(jobData?.description || jobData?.descricao).substring(0, 300)}...`
                      : (jobData?.description || jobData?.descricao)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Instructions */}
          <Card className="bg-gray-800/80 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                Instruções da Entrevista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Antes de começar:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      Certifique-se de estar em um ambiente silencioso
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      Verifique se sua câmera e microfone estão funcionando
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      Tenha uma boa iluminação no rosto
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Durante a entrevista:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      Responda de forma clara e objetiva
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      Olhe diretamente para a câmera
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      Seja autêntico e natural
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-300 text-sm">
                  <strong>Duração estimada:</strong> 10-15 minutos • <strong>Perguntas:</strong> 5 questões • <strong>Análise:</strong> IA + Comportamental
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Start Interview Button */}
          <div className="text-center">
            <Button
              onClick={handleStartInterview}
              disabled={generatingQuestions}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-medium"
            >
              {generatingQuestions ? (
                <>
                  <Loader className="h-5 w-5 mr-3 animate-spin" />
                  Preparando Entrevista...
                </>
              ) : (
                <>
                  <Video className="h-5 w-5 mr-3" />
                  Iniciar Entrevista
                </>
              )}
            </Button>
            
            {!generatingQuestions && (
              <p className="text-gray-400 text-sm mt-3">
                Clique para começar sua entrevista com inteligência artificial
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Interview Modal */}
      <InterviewModal
        isOpen={showInterviewModal}
        onClose={handleCloseModal}
        job={jobData}
        questions={interviewQuestions}
        onVideoResponse={handleVideoResponse}
        onFinishInterview={handleFinishInterview}
        generatingQuestions={generatingQuestions}
      />
    </div>
  );
};

export default InterviewPage;


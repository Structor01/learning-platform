import React, { useState } from 'react';
import {
    X,
    User,
    Calendar,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    MessageSquare,
    Play,
    Brain,
    Award,
    Target,
    Info
} from 'lucide-react';

const InterviewDetailsModal = ({ 
    isOpen, 
    interview, 
    onClose 
}) => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    if (!isOpen || !interview) return null;

    const questions = interview.questions || [];
    const answeredQuestions = questions.filter(q => q.answers && q.answers.length > 0).length;
    const totalQuestions = questions.length;
    const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    // Função para formatar data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Função para formatar score
    const formatScore = (score) => {
        if (score === null || score === undefined) return 'N/A';
        return parseFloat(score).toFixed(1);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Detalhes da Entrevista #{interview.id}
                            </h2>
                            <p className="text-gray-400">
                                {interview.user?.name || interview.candidate_name || 'Candidato'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Informações do Candidato e Estatísticas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Informações do Candidato */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" />
                                Informações do Candidato
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="text-gray-400 text-sm">Nome:</span>
                                        <div className="text-white">
                                            {interview.user?.name || interview.candidate_name || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="text-gray-400 text-sm">Email:</span>
                                        <div className="text-white">
                                            {interview.user?.email || interview.candidate_email || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {interview.user?.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="text-gray-400 text-sm">Telefone:</span>
                                            <div className="text-white">{interview.user.phone}</div>
                                        </div>
                                    </div>
                                )}

                                {interview.user?.educational_background && (
                                    <div className="flex items-start gap-3">
                                        <Info className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="text-gray-400 text-sm">Formação:</span>
                                            <div className="text-white">{interview.user.educational_background}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <span className="text-gray-400 text-sm">Criada em:</span>
                                        <div className="text-white">{formatDate(interview.created_at)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-green-400" />
                                Estatísticas da Entrevista
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center bg-white/5 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-400">{totalQuestions}</div>
                                    <div className="text-gray-400 text-sm">Total de Perguntas</div>
                                </div>
                                <div className="text-center bg-white/5 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-400">{answeredQuestions}</div>
                                    <div className="text-gray-400 text-sm">Respondidas</div>
                                </div>
                                <div className="text-center bg-white/5 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-400">{completionRate}%</div>
                                    <div className="text-gray-400 text-sm">Conclusão</div>
                                </div>
                                <div className="text-center bg-white/5 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-orange-400">
                                        {interview.status === 'completed' ? 'Completa' : 'Em Progresso'}
                                    </div>
                                    <div className="text-gray-400 text-sm">Status</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progresso Visual */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                            <span>Progresso da Entrevista</span>
                            <span>{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Perguntas e Respostas */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            Perguntas e Respostas ({totalQuestions})
                        </h3>
                        
                        {questions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhuma pergunta encontrada para esta entrevista</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {questions.map((question, index) => {
                                    const hasAnswers = question.answers && question.answers.length > 0;
                                    const firstAnswer = hasAnswers ? question.answers[0] : null;

                                    return (
                                        <div key={question.id || index} className="bg-white/5 rounded-lg p-6 border border-white/5">
                                            {/* Cabeçalho da Pergunta */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                                                            Pergunta {question.order || index + 1}
                                                        </span>
                                                        {hasAnswers ? (
                                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Respondida
                                                            </span>
                                                        ) : (
                                                            <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                                <XCircle className="w-3 h-3" />
                                                                Não Respondida
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-white text-lg font-medium leading-relaxed">
                                                        {question.title || question.question}
                                                    </p>
                                                </div>
                                            </div>

                                            {hasAnswers && firstAnswer && (
                                                <div className="space-y-4">
                                                    {/* Transcrição */}
                                                    {firstAnswer.answers && (
                                                        <div className="bg-white/5 rounded-lg p-4">
                                                            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                                                                <MessageSquare className="w-4 h-4" />
                                                                Transcrição:
                                                            </h5>
                                                            <p className="text-gray-300">{firstAnswer.answers}</p>
                                                        </div>
                                                    )}

                                                    {/* Vídeo */}
                                                    {firstAnswer.bunny_video_id && firstAnswer.bunny_library_id && (
                                                        <div>
                                                            <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                                                                <Play className="w-4 h-4" />
                                                                Resposta em Vídeo:
                                                            </h5>
                                                            <div className="rounded-lg overflow-hidden" style={{ position: 'relative', paddingTop: '56.25%' }}>
                                                                <iframe
                                                                    src={`https://iframe.mediadelivery.net/embed/${firstAnswer.bunny_library_id}/${firstAnswer.bunny_video_id}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                                                                    loading="lazy"
                                                                    style={{
                                                                        border: 0,
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        borderRadius: '8px'
                                                                    }}
                                                                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                                                                    allowFullScreen
                                                                    title={`Resposta da pergunta ${question.order || index + 1}`}
                                                                ></iframe>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Análise de IA */}
                                                    {firstAnswer.analysis && (
                                                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                                                            <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                                                                <Brain className="w-4 h-4 text-blue-400" />
                                                                Análise de IA:
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Award className="w-5 h-5 text-yellow-400" />
                                                                    <div>
                                                                        <span className="text-gray-400 text-sm">Pontuação:</span>
                                                                        <div className="text-yellow-400 font-bold text-lg">
                                                                            {formatScore(firstAnswer.analysis.score)}/10
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-3">
                                                                    <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                                                    <div>
                                                                        <span className="text-gray-400 text-sm">Recomendação:</span>
                                                                        <div className="text-green-400 text-sm">
                                                                            {firstAnswer.analysis.recommendation || 'Sem recomendação'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Metadados */}
                                                    <div className="text-xs text-gray-500 flex items-center gap-4 pt-2 border-t border-white/10">
                                                        <span>Status: {firstAnswer.processing_status || 'N/A'}</span>
                                                        <span>Tamanho: {Math.round(parseInt(firstAnswer.video_size_bytes || 0) / 1024)}KB</span>
                                                        {firstAnswer.created_at && (
                                                            <span>Gravado: {formatDate(firstAnswer.created_at)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Estado não respondida */}
                                            {!hasAnswers && (
                                                <div className="text-center py-6 text-gray-500 bg-white/5 rounded-lg">
                                                    <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Esta pergunta não foi respondida</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailsModal;